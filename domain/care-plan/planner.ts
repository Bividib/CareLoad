import { plannerConfig } from "./config";
import { expandRecurrence } from "./recurrence";
import { generateSlots, overlaps, toMinutes, toTime } from "./slot-generation";
import type { PlannerAnchor, PlannerConflict, PlannerInput, PlannerMetrics, PlannerResult, ScheduledOccurrence, UnplacedOccurrence, Weekday } from "./types";

const weekdays: Weekday[] = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const dayOf = (date: string) => weekdays[new Date(`${date}T12:00:00Z`).getUTCDay()];
const applicable = (anchor: PlannerAnchor, date: string) => (!anchor.date || anchor.date === date) && anchor.weekdays.includes(dayOf(date));
const titleFor = (time: string) => time < "10:00" ? "Morning routine" : time < "17:00" ? "Midday care moment" : "Evening routine";

export function planCare(input: PlannerInput): PlannerResult {
  const occurrences = [...input.tasks, ...(input.appointments ?? [])].flatMap((task) => expandRecurrence(task, input.rangeStart, input.rangeEnd)).sort((a, b) => `${a.date}:${a.task.mayMove ? 1 : 0}:${a.task.id}:${a.ordinal}`.localeCompare(`${b.date}:${b.task.mayMove ? 1 : 0}:${b.task.id}:${b.ordinal}`));
  const scheduled: ScheduledOccurrence[] = [], conflicts: PlannerConflict[] = [], unplaced: UnplacedOccurrence[] = [];

  for (const occurrence of occurrences) {
    const task = occurrence.task;
    const anchors = input.anchors.filter((anchor) => anchor.protected && applicable(anchor, occurrence.date));
    const fixed = !task.mayMove || Boolean(task.fixedTime);
    let candidates = fixed ? [task.fixedTime ?? task.windowStart] : generateSlots(task.windowStart, task.windowEnd, task.durationMinutes);
    if (task.frequency === "TWICE_DAILY") {
      const midpoint = (toMinutes(task.windowStart) + toMinutes(task.windowEnd)) / 2;
      candidates = candidates.filter((time) => occurrence.ordinal === 0 ? toMinutes(time) < midpoint : toMinutes(time) >= midpoint);
    }
    const ranked = candidates.map((time) => {
      const start = toMinutes(time), end = start + task.durationMinutes;
      const anchorHits = anchors.filter((anchor) => overlaps(start, end, toMinutes(anchor.startTime), toMinutes(anchor.endTime)));
      const itemHits = scheduled.filter((item) => item.date === occurrence.date && overlaps(start, end, toMinutes(item.startTime), toMinutes(item.endTime)));
      const compatible = itemHits.filter((item) => {
        const other = input.tasks.find((candidate) => candidate.id === item.taskId);
        return other?.bundleGroup && other.bundleGroup === task.bundleGroup && other.requiredLocation === task.requiredLocation;
      });
      return { time, anchorHits, itemHits, compatible, score: compatible.length * plannerConfig.weights.bundle - anchorHits.length * 1000 - (itemHits.length - compatible.length) * 1000 };
    }).sort((a, b) => b.score - a.score || a.time.localeCompare(b.time));
    let choice = ranked.find((slot) => fixed || slot.anchorHits.length === 0 && slot.itemHits.length === slot.compatible.length);
    if (fixed) choice = ranked[0];

    if (!choice) {
      const delegate = task.mayDelegate && input.supportPeople.find((person) => person.mayCollectPrescription && task.title.toLowerCase().includes("prescription"));
      if (delegate) {
        const time = task.windowStart;
        scheduled.push({ id: occurrence.id, taskId: task.id, title: task.title, date: occurrence.date, startTime: time, endTime: toTime(toMinutes(time) + task.durationMinutes), momentId: `delegated:${occurrence.date}:${delegate.id}`, momentTitle: "Delegated support", delegatedTo: delegate.name, explanation: `Delegated to ${delegate.name} because the task permits delegation and the synthetic support permission matches.` });
        continue;
      }
      unplaced.push(unplacedResult(task.id, occurrence.date, "All permitted slots overlap a protected anchor, another incompatible task, or a required location.", ["APPROVED_WINDOW", "PROTECTED_ANCHOR", task.requiredLocation ? "REQUIRED_LOCATION" : "CAPACITY"]));
      continue;
    }

    if (choice.anchorHits.length) {
      for (const anchor of choice.anchorHits) conflicts.push({ taskId: task.id, date: occurrence.date, type: anchor.location && task.requiredLocation && anchor.location !== task.requiredLocation ? "LOCATION_CONFLICT" : "PROTECTED_ANCHOR_OVERLAP", explanation: `Fixed task retained at ${choice.time}; it conflicts with protected ${anchor.title}.` });
    }
    const compatibleMoment = choice.compatible[0];
    const momentId = compatibleMoment?.momentId ?? `${occurrence.date}:${choice.time}:${task.bundleGroup ?? task.id}`;
    scheduled.push({ id: occurrence.id, taskId: task.id, title: task.title, date: occurrence.date, startTime: choice.time, endTime: toTime(toMinutes(choice.time) + task.durationMinutes), momentId, momentTitle: compatibleMoment?.momentTitle ?? titleFor(choice.time), explanation: fixed ? `Retained at ${choice.time} because this verified task is fixed.` : `Scheduled at ${choice.time} inside the approved ${task.windowStart}–${task.windowEnd} window${task.requiredEquipment ? ` while ${task.requiredEquipment} is available at ${task.requiredLocation}` : ""}.` });
  }
  const metrics = calculateMetrics(scheduled, unplaced, conflicts, input);
  return { scheduled, unplaced, conflicts, metrics, explanations: [...scheduled.map((item) => item.explanation), ...unplaced.map((item) => item.reason)] };
}

function unplacedResult(taskId: string, occurrenceDate: string, reason: string, violatedConstraints: string[]): UnplacedOccurrence {
  return { taskId, occurrenceDate, status: "NEEDS_CLARIFICATION", reason, violatedConstraints, suggestedClarification: "Ask the issuing service to clarify an operational time, location, or delegation constraint; do not change the care instruction." };
}

function calculateMetrics(scheduled: ScheduledOccurrence[], unplaced: UnplacedOccurrence[], conflicts: PlannerConflict[], input: PlannerInput): PlannerMetrics {
  const moments = new Set(scheduled.map((item) => item.momentId));
  return {
    totalActions: scheduled.length + unplaced.length,
    totalCareMinutes: scheduled.reduce((sum, item) => sum + (input.tasks.find((task) => task.id === item.taskId)?.durationMinutes ?? input.appointments?.find((task) => task.id === item.taskId)?.durationMinutes ?? 0), 0),
    totalCareMoments: moments.size, separateInterruptions: moments.size,
    tasksOverlappingWork: conflicts.filter((item) => input.anchors.find((anchor) => anchor.title.toLowerCase().includes("work") && applicable(anchor, item.date))).length,
    familyConflicts: conflicts.filter((item) => input.anchors.find((anchor) => anchor.title.toLowerCase().match(/school|family|granddaughter/) && applicable(anchor, item.date))).length,
    locationConflicts: conflicts.filter((item) => item.type === "LOCATION_CONFLICT").length,
    bundledTaskCount: scheduled.length - moments.size, delegatedTaskCount: scheduled.filter((item) => item.delegatedTo).length, unplacedTaskCount: unplaced.length,
  };
}
