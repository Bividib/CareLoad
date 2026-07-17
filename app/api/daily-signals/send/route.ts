import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { responseDelayMs } from "@/lib/simulated-responses";

const schema = z.object({ signalId: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Daily Signal ID is required." }, { status: 400 });
  try {
    const result = await db.$transaction(async (tx) => {
      const signal = await tx.dailySignal.findUniqueOrThrow({ where: { id: parsed.data.signalId } });
      if (signal.status !== "CONFIRMED" || !signal.confirmedJson) throw new Error("Confirm the Daily Signal before sending.");
      const threadId = `thread-signal-${signal.id}`;
      const messageId = `message-patient-${signal.id}`;
      const thread = await tx.messageThread.upsert({ where: { dailySignalId: signal.id }, create: { id: threadId, patientId: signal.patientId, dailySignalId: signal.id, subject: "Daily Signal update" }, update: {} });
      const message = await tx.message.upsert({ where: { id: messageId }, create: { id: messageId, threadId: thread.id, patientId: signal.patientId, author: "PATIENT", body: signal.rawText, metadataJson: signal.confirmedJson }, update: {} });
      const dueAt = new Date(Date.now() + responseDelayMs());
      await tx.simulatedResponseJob.upsert({ where: { id: `response-job-${message.id}` }, create: { id: `response-job-${message.id}`, patientId: signal.patientId, threadId: thread.id, triggeringMessageId: message.id, family: "DAILY_SIGNAL", dueAt }, update: {} });
      await tx.dailySignal.update({ where: { id: signal.id }, data: { status: "SENT" } });
      await tx.auditEvent.create({ data: { id: `audit-signal-sent-${signal.id}`, patientId: signal.patientId, type: "DAILY_SIGNAL_SENT", summary: "Patient approved and sent a synthetic Daily Signal update" } });
      return { threadId: thread.id, dueAt };
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send update." }, { status: 409 });
  }
}

