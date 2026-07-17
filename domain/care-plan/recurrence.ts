import type { Occurrence, PlannerTask, Weekday } from "./types";

const days: Weekday[] = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const iso = (date: Date) => date.toISOString().slice(0, 10);

export function expandRecurrence(task: PlannerTask, rangeStart: string, rangeEnd: string): Occurrence[] {
  const result: Occurrence[] = [];
  for (let cursor = new Date(`${rangeStart}T12:00:00Z`); cursor <= new Date(`${rangeEnd}T12:00:00Z`); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = iso(cursor);
    if ((task.startDate && date < task.startDate) || (task.endDate && date > task.endDate)) continue;
    const weekday = days[cursor.getUTCDay()];
    const selected = task.weekdays?.includes(weekday) ?? false;
    const occurs = task.frequency === "DAILY" || task.frequency === "TWICE_DAILY" || task.frequency === "DATE_LIMITED" ||
      (task.frequency === "SELECTED_WEEKDAYS" && selected) || (task.frequency === "WEEKLY" && selected) ||
      (task.frequency === "ONE_OFF" && (task.startDate === date || (!task.startDate && selected)));
    if (!occurs) continue;
    const count = task.frequency === "TWICE_DAILY" ? 2 : 1;
    for (let ordinal = 0; ordinal < count; ordinal++) result.push({ id: `${task.id}:${date}:${ordinal + 1}`, task, date, ordinal });
    if (task.frequency === "ONE_OFF") break;
  }
  return result;
}
