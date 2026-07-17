import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { dailySignalExtractionSchema } from "@/domain/daily-signal/schema";
import { urgentDemonstrationRule } from "@/domain/daily-signal/questions";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ANSWER"), answers: z.record(z.string(), z.string()) }),
  z.object({ action: z.literal("CONFIRM"), observations: dailySignalExtractionSchema.shape.observations }),
  z.object({ action: z.literal("RECORD_ONLY"), observations: dailySignalExtractionSchema.shape.observations }),
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ signalId: string }> }) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid Daily Signal update." }, { status: 400 });
  const { signalId } = await params;
  const signal = await db.dailySignal.findUnique({ where: { id: signalId } });
  if (!signal) return NextResponse.json({ error: "Daily Signal not found." }, { status: 404 });
  if (parsed.data.action === "ANSWER") {
    const answers = { ...(JSON.parse(signal.answersJson) as Record<string, string>), ...parsed.data.answers };
    const urgent = urgentDemonstrationRule(answers);
    await db.dailySignal.update({ where: { id: signalId }, data: { answersJson: JSON.stringify(answers), urgentRuleTriggered: urgent, status: urgent ? "URGENT_DEMO" : "QUESTIONS" } });
    return NextResponse.json({ ok: true, urgent });
  }
  const status = parsed.data.action === "RECORD_ONLY" ? "RECORDED_ONLY" : "CONFIRMED";
  await db.dailySignal.update({ where: { id: signalId }, data: { status, confirmedJson: JSON.stringify(parsed.data.observations) } });
  await db.auditEvent.create({ data: { id: `audit-${status.toLowerCase()}-${Date.now()}`, patientId: signal.patientId, type: `DAILY_SIGNAL_${status}`, summary: `Patient ${status === "RECORDED_ONLY" ? "recorded privately" : "confirmed"} a synthetic Daily Signal` } });
  return NextResponse.json({ ok: true, status });
}

