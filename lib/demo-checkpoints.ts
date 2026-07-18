import type { PrismaClient } from "@/generated/prisma6";
import { resetSyntheticData } from "@/prisma/seed-data";
import { ensureDemoActivePlan, triggerAndSimulateCareUpdate, acceptCarePlanChange } from "@/lib/stress-test";
import { processDueSimulatedResponses } from "@/lib/simulated-responses";
import { currentDemoDate } from "@/lib/demo-date";

export const checkpointNames = ["ONBOARDING_START","INITIAL_PLAN_READY","DAILY_SIGNAL_READY","DAILY_SIGNAL_SENT","RESPONSE_RECEIVED","CARE_UPDATE_RECEIVED","SIMULATION_READY","UPDATED_PLAN_ACCEPTED"] as const;
export type DemoCheckpoint = typeof checkpointNames[number];

async function seedSentSignal(db: PrismaClient) {
  await ensureDemoActivePlan(db);
  const extraction = { observations: [{ domain: "stomach", value: "uncomfortable", trend: "NEW", durationText: "a few days", certainty: "CONFIRMED", sourcePhrase: "stomach has felt uncomfortable" }], missingInformation: [], suggestedQuestionIds: [], differentFromRecentPattern: true, shareSuggested: true, shareReason: "This differs from recent check-ins.", requiresDeterministicRuleCheck: false };
  const signal = await db.dailySignal.create({ data: { id: "checkpoint-signal", patientId: "eleanor-reed", signalDate: currentDemoDate(), inputMode: "TYPED", rawText: "My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.", status: "SENT", extractionJson: JSON.stringify(extraction), confirmedJson: JSON.stringify(extraction.observations), shareSuggested: true, shareReason: extraction.shareReason } });
  const thread = await db.messageThread.create({ data: { id: "checkpoint-thread", patientId: "eleanor-reed", dailySignalId: signal.id, subject: "Daily Signal update" } });
  const message = await db.message.create({ data: { id: "checkpoint-message", threadId: thread.id, patientId: "eleanor-reed", author: "PATIENT", body: signal.rawText, metadataJson: signal.confirmedJson ?? "[]" } });
  await db.simulatedResponseJob.create({ data: { id: "checkpoint-job", patientId: "eleanor-reed", threadId: thread.id, triggeringMessageId: message.id, family: "DAILY_SIGNAL", dueAt: new Date(Date.now() + 10_000) } });
}

export async function seedCheckpoint(db: PrismaClient, checkpoint: DemoCheckpoint) {
  const fixtureMode = (await db.demoSetting.findUnique({ where: { id: "demo" } }))?.fixtureMode;
  await resetSyntheticData(db);
  if (fixtureMode === false) {
    await db.demoSetting.update({ where: { id: "demo" }, data: { fixtureMode: false } });
  }
  if (checkpoint === "ONBOARDING_START") return;
  const active = await ensureDemoActivePlan(db);
  const itemCount = await db.scheduledPlanItem.count({ where: { planVersionId: active.id } });
  if (itemCount === 0) throw new Error("The checkpoint active plan has no scheduled items.");
  if (checkpoint === "INITIAL_PLAN_READY" || checkpoint === "DAILY_SIGNAL_READY") return;
  await seedSentSignal(db);
  if (checkpoint === "DAILY_SIGNAL_SENT") return;
  await processDueSimulatedResponses(db, new Date(Date.now() + 60_000));
  if (checkpoint === "RESPONSE_RECEIVED") return;
  const update = await triggerAndSimulateCareUpdate(db);
  if (checkpoint === "CARE_UPDATE_RECEIVED" || checkpoint === "SIMULATION_READY") return;
  await acceptCarePlanChange(db, update.changeId);
}
