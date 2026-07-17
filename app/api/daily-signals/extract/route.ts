import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { buildDailySignalContext, extractDailySignal, trendSummary } from "@/lib/daily-signal";
import { selectQuestions } from "@/domain/daily-signal/questions";

const requestSchema = z.object({
  text: z.string().min(1).max(5000),
  inputMode: z.enum(["TYPED", "VOICE"]).default("TYPED"),
  forceFixture: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a short Daily Signal before continuing." }, { status: 400 });
  const patientId = "eleanor-reed";
  const context = await buildDailySignalContext(db, patientId);
  const setting = await db.demoSetting.findUnique({ where: { id: "demo" } });
  try {
    const extraction = await extractDailySignal(parsed.data.text, context, parsed.data.forceFixture || setting?.fixtureMode);
    const questions = selectQuestions(extraction.suggestedQuestionIds, context.conditions);
    const recent = await db.dailySignal.findMany({ where: { patientId }, orderBy: { createdAt: "desc" }, take: 7 });
    const id = `signal-${Date.now()}`;
    const signal = await db.dailySignal.create({ data: {
      id, patientId, signalDate: "2026-07-17", inputMode: parsed.data.inputMode,
      rawText: parsed.data.text, transcript: parsed.data.inputMode === "VOICE" ? parsed.data.text : null,
      status: questions.length ? "QUESTIONS" : "CONFIRMED",
      extractionJson: JSON.stringify(extraction), questionsJson: JSON.stringify(questions),
      confirmedJson: questions.length ? null : JSON.stringify(extraction.observations),
      shareSuggested: extraction.shareSuggested, shareReason: extraction.shareReason,
      trendSummary: trendSummary(extraction, recent),
    } });
    return NextResponse.json({ id: signal.id, extraction, questions });
  } catch {
    return NextResponse.json({ error: "Daily Signal analysis failed. Your text is still in this browser; retry or use demo extraction." }, { status: 502 });
  }
}
