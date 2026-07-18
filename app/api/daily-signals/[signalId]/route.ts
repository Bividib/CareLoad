import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { dailySignalExtractionSchema } from "@/domain/daily-signal/schema";
import { urgentDemonstrationRule, type QuestionDefinition } from "@/domain/daily-signal/questions";
import { evaluateDailySignalDisposition } from "@/domain/daily-signal/disposition";
import { buildDailySignalEvidenceGraph } from "@/domain/daily-signal/evidence-graph";

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
    await db.dailySignal.update({ where: { id: signalId }, data: { answersJson: JSON.stringify(answers), status: "QUESTIONS" } });
    return NextResponse.json({ ok: true, answers });
  }
  const status = parsed.data.action === "RECORD_ONLY" ? "RECORDED_ONLY" : "CONFIRMED";
  const extraction = signal.extractionJson ? dailySignalExtractionSchema.parse(JSON.parse(signal.extractionJson)) : null;
  if (!extraction) return NextResponse.json({ error: "Daily Signal extraction is missing." }, { status: 409 });
  const answers = JSON.parse(signal.answersJson) as Record<string, string>;
  const questions = JSON.parse(signal.questionsJson) as QuestionDefinition[];
  const disposition = evaluateDailySignalDisposition(extraction, answers);
  const evidenceGraph = buildDailySignalEvidenceGraph({ rawText: signal.rawText, extraction, questions, answers, trendSummary: signal.trendSummary, disposition });
  const urgent = disposition.outcome === "URGENT_DEMO" || urgentDemonstrationRule(answers);
  const persistedStatus = urgent ? "URGENT_DEMO" : status;
  await db.dailySignal.update({ where: { id: signalId }, data: {
    status: persistedStatus,
    confirmedJson: JSON.stringify(parsed.data.observations),
    urgentRuleTriggered: urgent,
    shareSuggested: disposition.outcome === "SHARE_SUGGESTED",
    shareReason: disposition.reason,
  } });
  await db.auditEvent.create({ data: { id: `audit-${status.toLowerCase()}-${Date.now()}`, patientId: signal.patientId, type: `DAILY_SIGNAL_${status}`, summary: `Patient ${status === "RECORDED_ONLY" ? "recorded privately" : "confirmed"} a synthetic Daily Signal` } });
  return NextResponse.json({ ok: true, status: persistedStatus, disposition, evidenceGraph });
}
