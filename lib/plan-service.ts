import type { PrismaClient, PlanVersionStatus } from "@/generated/prisma6";
import { planCare, type Frequency, type PlannerInput, type Weekday } from "@/domain/care-plan";
import { demoDateRange } from "@/lib/demo-date";

const asFrequency = (value: string): Frequency => {
  if (value === "DAILY" || value === "TWICE_DAILY" || value === "SELECTED_WEEKDAYS" || value === "WEEKLY" || value === "ONE_OFF" || value === "DATE_LIMITED") return value;
  throw new Error(`Unsupported verified recurrence: ${value}`);
};
const asWeekdays = (value: string | null): Weekday[] => (value?.split(",") ?? []).filter((day): day is Weekday => ["MON","TUE","WED","THU","FRI","SAT","SUN"].includes(day));

export async function generatePersistedPlan(db: PrismaClient, planId: string, options: { includeInactiveTaskIds?: string[]; extraAnchors?: PlannerInput["anchors"] } = {}) {
  const plan = await db.carePlanVersion.findUniqueOrThrow({ where: { id: planId } });
  const patient = await db.patient.findUniqueOrThrow({
    where: { id: plan.patientId },
    include: { tasks: true, anchors: true, preferences: true, frictions: true, supportPeople: true },
  });
  const input: PlannerInput = {
    rangeStart: plan.rangeStart, rangeEnd: plan.rangeEnd,
    tasks: patient.tasks.filter((task) => task.verified && (task.active || options.includeInactiveTaskIds?.includes(task.id))).map((task) => ({
      id: task.id, title: task.title, frequency: asFrequency(task.frequency),
      weekdays: asWeekdays(task.weekdays), startDate: task.startDate ?? undefined,
      endDate: task.endDate ?? undefined, windowStart: task.windowStart,
      windowEnd: task.windowEnd, secondWindowStart: task.secondWindowStart ?? undefined,
      secondWindowEnd: task.secondWindowEnd ?? undefined, fixedTime: task.fixedTime ?? undefined,
      durationMinutes: task.durationMinutes, mayMove: task.mayMove,
      mayDelegate: task.mayDelegate, requiredLocation: task.requiredLocation ?? undefined,
      requiredEquipment: task.requiredEquipment ?? undefined, bundleGroup: task.bundleGroup ?? undefined,
    })),
    anchors: [...patient.anchors.map((anchor) => ({
      id: anchor.id, title: anchor.title, weekdays: asWeekdays(anchor.weekdays),
      startTime: anchor.startTime, endTime: anchor.endTime, protected: anchor.protected,
      location: anchor.location ?? undefined,
    })), ...(options.extraAnchors ?? [])],
    preferences: patient.preferences.filter((item) => item.enabled).map((item) => item.key),
    frictions: patient.frictions.filter((item) => item.enabled).map((item) => item.description),
    supportPeople: patient.supportPeople.map((person) => ({ id: person.id, name: person.name, mayCollectPrescription: person.mayCollectPrescription, availability: person.availability })),
  };
  const result = planCare(input);
  await db.scheduledPlanItem.deleteMany({ where: { planVersionId: planId } });
  await db.scheduledPlanItem.createMany({ data: [
    ...result.scheduled.map((item) => ({
    id: `${planId}:${item.id}`, planVersionId: planId, taskId: item.taskId,
    occurrenceDate: item.date, startTime: item.startTime, endTime: item.endTime,
    momentId: item.momentId, momentTitle: item.momentTitle,
    status: (item.delegatedTo ? "DELEGATED" : "SCHEDULED") as "DELEGATED" | "SCHEDULED", explanation: item.explanation,
    constraintsJson: "[]", delegatedTo: item.delegatedTo,
  })),
    ...result.unplaced.map((item) => ({
    id: `${planId}:unplaced:${item.taskId}:${item.occurrenceDate}`, planVersionId: planId,
    taskId: item.taskId, occurrenceDate: item.occurrenceDate, startTime: null, endTime: null,
    momentId: null, momentTitle: null, status: "NEEDS_CLARIFICATION" as const,
    explanation: `${item.reason} ${item.suggestedClarification}`,
    constraintsJson: JSON.stringify(item.violatedConstraints), delegatedTo: null,
  })),
  ] });
  await db.carePlanVersion.update({ where: { id: planId }, data: { metricsJson: JSON.stringify(result.metrics) } });
  return result;
}

export async function createProposedPlan(db: PrismaClient, patientId: string) {
  const active = await db.carePlanVersion.findFirstOrThrow({ where: { patientId, status: "ACTIVE" }, orderBy: { version: "desc" } });
  await db.carePlanVersion.deleteMany({ where: { patientId, status: "PROPOSED" } });
  const proposed = await db.carePlanVersion.create({ data: {
    id: `plan-proposed-${Date.now()}`, patientId, version: active.version + 1,
    status: "PROPOSED" satisfies PlanVersionStatus, rangeStart: active.rangeStart,
    rangeEnd: active.rangeEnd, metricsJson: "{}",
  } });
  await generatePersistedPlan(db, proposed.id);
  return proposed;
}

export async function createInitialProposedPlan(db: PrismaClient, patientId: string) {
  await db.carePlanVersion.deleteMany({ where: { patientId, status: "PROPOSED" } });
  const proposed = await db.carePlanVersion.create({ data: {
    id: `plan-initial-proposed-${Date.now()}`, patientId, version: 1, status: "PROPOSED",
    ...demoDateRange(new Date(), 7), metricsJson: "{}",
  } });
  await generatePersistedPlan(db, proposed.id);
  return proposed;
}

export async function acceptProposedPlan(db: PrismaClient, planId: string) {
  return db.$transaction(async (tx) => {
    const proposed = await tx.carePlanVersion.findUniqueOrThrow({ where: { id: planId } });
    if (proposed.status !== "PROPOSED") throw new Error("Only a proposed plan can be accepted.");
    await tx.carePlanVersion.updateMany({ where: { patientId: proposed.patientId, status: "ACTIVE" }, data: { status: "SUPERSEDED" } });
    const active = await tx.carePlanVersion.update({ where: { id: planId }, data: { status: "ACTIVE", acceptedAt: new Date() } });
    await tx.patient.update({ where: { id: proposed.patientId }, data: { onboardingCompleted: true } });
    await tx.auditEvent.create({ data: { id: `audit-plan-accepted-${Date.now()}`, patientId: proposed.patientId, type: "PLAN_ACCEPTED", summary: `Patient accepted synthetic plan version ${proposed.version}` } });
    return active;
  });
}
