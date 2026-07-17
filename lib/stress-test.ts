import type { PrismaClient } from "@/generated/prisma6";
import { generatePersistedPlan } from "@/lib/plan-service";

export const updateFixture = {
  key: "TWICE_DAILY_BP_14_DAYS", source: "Cardiology",
  title: "Twice-daily blood-pressure monitoring added for 14 days",
  originalText: "Measure blood pressure twice daily for 14 days. Morning 07:00–10:00 and evening 17:00–20:00. Each measurement takes 5 minutes and requires the home blood-pressure cuff.",
};

export async function ensureDemoActivePlan(db: PrismaClient) {
  let active = await db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "ACTIVE" } });
  if (active) return active;
  await db.verifiedCareTask.updateMany({ where: { patientId: "eleanor-reed" }, data: { active: true } });
  active = await db.carePlanVersion.create({ data: { id: `plan-demo-active-${Date.now()}`, patientId: "eleanor-reed", version: 1, status: "ACTIVE", rangeStart: "2026-07-17", rangeEnd: "2026-07-30", metricsJson: "{}" } });
  await generatePersistedPlan(db, active.id);
  return active;
}

export async function triggerAndSimulateCareUpdate(db: PrismaClient) {
  const baseline = await ensureDemoActivePlan(db);
  await db.verifiedCareTask.upsert({
    where: { templateKey: updateFixture.key },
    create: {
      id: "bp-twice-daily-14-days", patientId: "eleanor-reed", title: "Twice-daily blood-pressure measurement",
      source: "Cardiology", supportingText: updateFixture.originalText, ownerService: "Cardiology",
      criticality: "IMPORTANT", timingType: "WINDOW", windowStart: "07:00", windowEnd: "10:00",
      secondWindowStart: "17:00", secondWindowEnd: "20:00", frequency: "TWICE_DAILY",
      startDate: "2026-07-17", endDate: "2026-07-30", durationMinutes: 5, mayMove: true,
      mayDelegate: false, requiredLocation: "home", requiredEquipment: "home blood-pressure cuff",
      bundleGroup: "morning", templateKey: updateFixture.key, active: false,
    },
    update: {},
  });
  const change = await db.carePlanChange.upsert({
    where: { id: "demo-update" },
    create: { id: "demo-update", patientId: "eleanor-reed", fixtureKey: updateFixture.key, source: updateFixture.source, title: updateFixture.title, originalText: updateFixture.originalText },
    update: {},
  });
  await db.carePlanVersion.deleteMany({ where: { patientId: "eleanor-reed", status: "PROPOSED" } });
  const proposed = await db.carePlanVersion.create({ data: { id: `plan-update-${Date.now()}`, patientId: "eleanor-reed", version: baseline.version + 1, status: "PROPOSED", rangeStart: "2026-07-17", rangeEnd: "2026-07-30", metricsJson: "{}" } });
  const result = await generatePersistedPlan(db, proposed.id, {
    includeInactiveTaskIds: ["bp-twice-daily-14-days"],
    extraAnchors: [{ id: "stress-thursday-childcare", title: "Thursday childcare commitment", date: "2026-07-23", weekdays: ["THU"], startTime: "17:00", endTime: "20:00", protected: true, location: "home" }],
  });
  const bpItems = [...result.scheduled.filter((item) => item.taskId === "bp-twice-daily-14-days"), ...result.unplaced.filter((item) => item.taskId === "bp-twice-daily-14-days")];
  const metrics = {
    actionsAdded: bpItems.length,
    minutesAdded: bpItems.length * 5,
    interruptionsBeforeOptimisation: bpItems.length,
    interruptionsAfterOptimisation: new Set(result.scheduled.filter((item) => item.taskId === "bp-twice-daily-14-days").map((item) => item.momentId)).size,
    workConflicts: result.conflicts.filter((item) => item.type === "PROTECTED_ANCHOR_OVERLAP").length,
    familyConflicts: result.unplaced.filter((item) => item.occurrenceDate === "2026-07-23").length,
    locationOrEquipmentConflicts: result.unplaced.filter((item) => item.violatedConstraints.includes("REQUIRED_LOCATION")).length,
    bundledTasks: result.metrics.bundledTaskCount, movedTasks: result.scheduled.filter((item) => item.taskId === "questionnaire").length,
    delegatedTasks: result.metrics.delegatedTaskCount, unplacedTasks: result.metrics.unplacedTaskCount,
  };
  await db.simulationResult.upsert({ where: { changeId: change.id }, create: { id: `simulation-${change.id}`, changeId: change.id, baselinePlanId: baseline.id, proposedPlanId: proposed.id, metricsJson: JSON.stringify(metrics), resolvedJson: JSON.stringify(["Morning readings bundled with compatible home routines", "Flexible tasks moved only inside verified windows", "Prescription collection delegated to Maya where permitted"]), unresolvedJson: JSON.stringify(result.unplaced) }, update: { proposedPlanId: proposed.id, metricsJson: JSON.stringify(metrics), unresolvedJson: JSON.stringify(result.unplaced) } });
  await db.carePlanChange.update({ where: { id: change.id }, data: { status: "SIMULATED", proposedPlanId: proposed.id } });
  await db.auditEvent.create({ data: { id: `audit-stress-${Date.now()}`, patientId: "eleanor-reed", type: "CARE_PLAN_STRESS_TEST", summary: "Synthetic cardiology update simulated without changing the active plan" } });
  return { changeId: change.id, proposedPlanId: proposed.id, metrics };
}

export async function acceptCarePlanChange(db: PrismaClient, changeId: string) {
  return db.$transaction(async (tx) => {
    const change = await tx.carePlanChange.findUniqueOrThrow({ where: { id: changeId } });
    if (!change.proposedPlanId || change.status !== "SIMULATED") throw new Error("Only a simulated proposed update can be accepted.");
    await tx.carePlanVersion.updateMany({ where: { patientId: change.patientId, status: "ACTIVE" }, data: { status: "SUPERSEDED" } });
    const plan = await tx.carePlanVersion.update({ where: { id: change.proposedPlanId }, data: { status: "ACTIVE", acceptedAt: new Date() } });
    await tx.verifiedCareTask.update({ where: { id: "bp-twice-daily-14-days" }, data: { active: true } });
    await tx.carePlanChange.update({ where: { id: changeId }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
    await tx.auditEvent.create({ data: { id: `audit-update-accepted-${Date.now()}`, patientId: change.patientId, type: "CARE_PLAN_CHANGE_ACCEPTED", summary: "Patient accepted the synthetic cardiology update" } });
    return plan;
  });
}
