import type { PrismaClient } from "@/generated/prisma6";
import { classifyResponse, responseTemplates, simulatedResponseSchema } from "@/domain/messages/responses";
import { triggerAndSimulateCareUpdate } from "@/lib/stress-test";

export const responseDelayMs = () => Number(process.env.DEMO_RESPONSE_DELAY_MS ?? 10_000);

export async function processDueSimulatedResponses(db: PrismaClient, now = new Date()) {
  const jobs = await db.simulatedResponseJob.findMany({ where: { state: "PENDING", dueAt: { lte: now } }, orderBy: { dueAt: "asc" } });
  const processed: string[] = [];
  let shouldCreatePlanUpdate = false;
  for (const job of jobs) {
    await db.$transaction(async (tx) => {
      const claimed = await tx.simulatedResponseJob.updateMany({ where: { id: job.id, state: "PENDING" }, data: { state: "PROCESSED", processedAt: now } });
      if (claimed.count !== 1) return;
      const thread = await tx.messageThread.findUniqueOrThrow({ where: { id: job.threadId }, include: { dailySignal: true } });
      const scenario = job.family === "CLARIFICATION"
        ? classifyResponse({ urgent: false, clarification: true, shareSuggested: false })
        : classifyResponse({ urgent: Boolean(thread.dailySignal?.urgentRuleTriggered), clarification: false, shareSuggested: Boolean(thread.dailySignal?.shareSuggested) });
      const response = simulatedResponseSchema.parse(responseTemplates[scenario]);
      if (response.reviewSuggested) shouldCreatePlanUpdate = true;
      await tx.message.create({ data: { id: `message-response-${job.id}`, threadId: job.threadId, patientId: job.patientId, author: "SIMULATED_CARE_TEAM", body: response.message, metadataJson: JSON.stringify(response) } });
      await tx.messageThread.update({ where: { id: job.threadId }, data: { unread: true } });
      await tx.auditEvent.create({ data: { id: `audit-response-${job.id}`, patientId: job.patientId, type: "SIMULATED_RESPONSE_CREATED", summary: `Delayed fictional response created using ${scenario}` } });
      processed.push(job.id);
    });
  }
  if (shouldCreatePlanUpdate) {
    const existing = await db.carePlanChange.findFirst({ where: { patientId: "eleanor-reed", status: { in: ["RECEIVED", "SIMULATED"] } } });
    if (!existing) await triggerAndSimulateCareUpdate(db);
  }
  return processed;
}

export async function createResponseJob(db: PrismaClient, input: { threadId: string; messageId: string; patientId: string; family: "DAILY_SIGNAL" | "CLARIFICATION"; now?: Date }) {
  const now = input.now ?? new Date();
  return db.simulatedResponseJob.create({ data: {
    id: `response-job-${input.messageId}`, patientId: input.patientId, threadId: input.threadId,
    triggeringMessageId: input.messageId, family: input.family, dueAt: new Date(now.getTime() + responseDelayMs()),
  } });
}
