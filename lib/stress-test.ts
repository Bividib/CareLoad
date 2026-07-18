import type { PrismaClient } from "@/generated/prisma6";
import { z } from "zod";
import { generatePersistedPlan } from "@/lib/plan-service";
import { demoDateRange } from "@/lib/demo-date";

export const updateFixture = {
  key: "TWICE_DAILY_BP_14_DAYS",
  source: "Cardiology care-plan update",
  title: "Twice-daily blood-pressure monitoring added for 14 days",
  originalText: "Measure blood pressure twice daily for 14 days. Morning 07:00–10:00 and evening 17:00–20:00. Each measurement takes 5 minutes, requires the home blood-pressure cuff, and cannot be delegated.",
};

export const stressTestMetricsSchema = z.object({
  actionsAdded: z.number().int().nonnegative(),
  minutesAdded: z.number().int().nonnegative(),
  interruptionsBeforeOptimisation: z.number().int().nonnegative(),
  interruptionsAfterOptimisation: z.number().int().nonnegative(),
  workConflicts: z.number().int().nonnegative(),
  familyConflicts: z.number().int().nonnegative(),
  locationOrEquipmentConflicts: z.number().int().nonnegative(),
  bundledTasks: z.number().int().nonnegative(),
  movedTasks: z.number().int().nonnegative(),
  delegatedTasks: z.number().int().nonnegative(),
  unplacedTasks: z.number().int().nonnegative(),
});

export async function ensureDemoActivePlan(db: PrismaClient, now = new Date()) {
  let active = await db.carePlanVersion.findFirst({
    where: { patientId: "eleanor-reed", status: "ACTIVE" },
  });
  if (active) {
    const itemCount = await db.scheduledPlanItem.count({
      where: { planVersionId: active.id },
    });
    if (itemCount > 0) return active;
    await db.verifiedCareTask.updateMany({
      where: { patientId: "eleanor-reed" },
      data: { active: true },
    });
    await generatePersistedPlan(db, active.id);
    return active;
  }
  await db.verifiedCareTask.updateMany({
    where: { patientId: "eleanor-reed" },
    data: { active: true },
  });
  active = await db.carePlanVersion.create({
    data: {
      id: `plan-demo-active-${Date.now()}`,
      patientId: "eleanor-reed",
      version: 1,
      status: "ACTIVE",
      ...demoDateRange(now),
      metricsJson: "{}",
    },
  });
  await generatePersistedPlan(db, active.id);
  return active;
}

export async function triggerAndSimulateCareUpdate(db: PrismaClient, now = new Date()) {
  const range = demoDateRange(now);
  const baseline = await ensureDemoActivePlan(db, now);
  await db.verifiedCareTask.upsert({
    where: { templateKey: updateFixture.key },
    create: {
      id: "bp-twice-daily-14-days",
      patientId: "eleanor-reed",
      title: "Twice-daily blood-pressure measurement",
      source: updateFixture.source,
      supportingText: updateFixture.originalText,
      ownerService: "Cardiology",
      criticality: "IMPORTANT",
      timingType: "WINDOW",
      windowStart: "07:00",
      windowEnd: "10:00",
      secondWindowStart: "17:00",
      secondWindowEnd: "20:00",
      frequency: "TWICE_DAILY",
      startDate: range.rangeStart,
      endDate: range.rangeEnd,
      durationMinutes: 5,
      mayMove: true,
      mayDelegate: false,
      requiredLocation: "home",
      requiredEquipment: "home blood-pressure cuff",
      bundleGroup: "morning",
      templateKey: updateFixture.key,
      active: false,
    },
    update: {
      title: "Twice-daily blood-pressure measurement",
      source: updateFixture.source,
      supportingText: updateFixture.originalText,
      ownerService: updateFixture.source,
      startDate: range.rangeStart,
      endDate: range.rangeEnd,
      mayDelegate: false,
      requiredLocation: "home",
      requiredEquipment: "home blood-pressure cuff",
    },
  });
  const change = await db.carePlanChange.upsert({
    where: { id: "demo-update" },
    create: {
      id: "demo-update",
      patientId: "eleanor-reed",
      fixtureKey: updateFixture.key,
      source: updateFixture.source,
      title: updateFixture.title,
      originalText: updateFixture.originalText,
    },
    update: {
      source: updateFixture.source,
      title: updateFixture.title,
      originalText: updateFixture.originalText,
    },
  });
  await db.carePlanVersion.deleteMany({
    where: { patientId: "eleanor-reed", status: "PROPOSED" },
  });
  const proposed = await db.carePlanVersion.create({
    data: {
      id: `plan-update-${Date.now()}`,
      patientId: "eleanor-reed",
      version: baseline.version + 1,
      status: "PROPOSED",
      rangeStart: range.rangeStart,
      rangeEnd: range.rangeEnd,
      metricsJson: "{}",
    },
  });
  const result = await generatePersistedPlan(db, proposed.id, {
    includeInactiveTaskIds: ["bp-twice-daily-14-days"],
  });
  const bpScheduled = result.scheduled.filter(
    (item) => item.taskId === "bp-twice-daily-14-days",
  );
  const bpUnplaced = result.unplaced.filter(
    (item) => item.taskId === "bp-twice-daily-14-days",
  );
  const baselineItems = await db.scheduledPlanItem.findMany({
    where: { planVersionId: baseline.id, status: { not: "NEEDS_CLARIFICATION" } },
  });
  const baselineTimes = new Map(
    baselineItems.map((item) => [`${item.taskId}:${item.occurrenceDate}`, item.startTime]),
  );
  const movedExisting = result.scheduled.filter((item) => {
    if (item.taskId === "bp-twice-daily-14-days") return false;
    const baselineTime = baselineTimes.get(`${item.taskId}:${item.date}`);
    return baselineTime !== undefined && baselineTime !== item.startTime;
  });
  const momentSizes = new Map<string, number>();
  for (const item of result.scheduled) {
    momentSizes.set(item.momentId, (momentSizes.get(item.momentId) ?? 0) + 1);
  }
  const metrics = stressTestMetricsSchema.parse({
    actionsAdded: bpScheduled.length + bpUnplaced.length,
    minutesAdded: (bpScheduled.length + bpUnplaced.length) * 5,
    interruptionsBeforeOptimisation: bpScheduled.length + bpUnplaced.length,
    interruptionsAfterOptimisation: new Set(bpScheduled.map((item) => item.momentId)).size,
    workConflicts: result.conflicts.filter((item) => item.type === "PROTECTED_ANCHOR_OVERLAP").length,
    familyConflicts: result.metrics.familyConflicts,
    locationOrEquipmentConflicts: bpUnplaced.filter((item) => item.violatedConstraints.includes("REQUIRED_LOCATION")).length,
    bundledTasks: bpScheduled.filter((item) => (momentSizes.get(item.momentId) ?? 0) > 1).length,
    movedTasks: movedExisting.length,
    delegatedTasks: result.metrics.delegatedTaskCount,
    unplacedTasks: bpUnplaced.length,
  });
  const resolved = [
    metrics.bundledTasks > 0
      ? `${metrics.bundledTasks} new readings bundle with compatible home care`
      : "New readings remain separate where bundling is not compatible",
    metrics.movedTasks > 0
      ? `${metrics.movedTasks} existing flexible occurrences move within verified windows`
      : "No existing task needs to move outside its current time",
    metrics.delegatedTasks > 0
      ? `${metrics.delegatedTasks} explicitly delegable existing occurrences remain delegated`
      : "The new blood-pressure readings are not delegated",
  ];
  await db.simulationResult.upsert({
    where: { changeId: change.id },
    create: {
      id: `simulation-${change.id}`,
      changeId: change.id,
      baselinePlanId: baseline.id,
      proposedPlanId: proposed.id,
      metricsJson: JSON.stringify(metrics),
      resolvedJson: JSON.stringify(resolved),
      unresolvedJson: JSON.stringify(result.unplaced),
    },
    update: {
      baselinePlanId: baseline.id,
      proposedPlanId: proposed.id,
      metricsJson: JSON.stringify(metrics),
      resolvedJson: JSON.stringify(resolved),
      unresolvedJson: JSON.stringify(result.unplaced),
    },
  });
  await db.carePlanChange.update({
    where: { id: change.id },
    data: { status: "SIMULATED", proposedPlanId: proposed.id },
  });
  await db.auditEvent.create({
    data: {
      id: `audit-stress-${Date.now()}`,
      patientId: "eleanor-reed",
      type: "CARE_PLAN_STRESS_TEST",
      summary: "Synthetic cardiology update simulated without changing the active plan",
    },
  });
  return { changeId: change.id, proposedPlanId: proposed.id, metrics };
}

export async function acceptCarePlanChange(db: PrismaClient, changeId: string) {
  return db.$transaction(async (tx) => {
    const change = await tx.carePlanChange.findUniqueOrThrow({ where: { id: changeId } });
    if (!change.proposedPlanId || change.status !== "SIMULATED") {
      throw new Error("Only a simulated proposed update can be accepted.");
    }
    await tx.carePlanVersion.updateMany({
      where: { patientId: change.patientId, status: "ACTIVE" },
      data: { status: "SUPERSEDED" },
    });
    const plan = await tx.carePlanVersion.update({
      where: { id: change.proposedPlanId },
      data: { status: "ACTIVE", acceptedAt: new Date() },
    });
    await tx.verifiedCareTask.update({
      where: { id: "bp-twice-daily-14-days" },
      data: { active: true },
    });
    await tx.carePlanChange.update({
      where: { id: changeId },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    await tx.auditEvent.create({
      data: {
        id: `audit-update-accepted-${Date.now()}`,
        patientId: change.patientId,
        type: "CARE_PLAN_CHANGE_ACCEPTED",
        summary: "Patient accepted the synthetic cardiology update",
      },
    });
    return plan;
  });
}
