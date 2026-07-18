import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { buildDailySignalContext, extractDailySignal, resolveDailySignalAnalysisMode, trendSummary } from "@/lib/daily-signal";
import { questionIdsForExtraction, selectQuestions } from "@/domain/daily-signal/questions";
import { fixtureAnswersForText } from "@/domain/daily-signal/fixtures";
import { safeAiError } from "@/lib/ai-errors";
import { currentDemoDate } from "@/lib/demo-date";

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
    const analysisMode = resolveDailySignalAnalysisMode(Boolean(parsed.data.forceFixture || setting?.fixtureMode));
    const extraction = await extractDailySignal(parsed.data.text, context, analysisMode);
    const validatedExtraction = { ...extraction, shareSuggested: false, shareReason: null };
    const questions = selectQuestions(questionIdsForExtraction(validatedExtraction), context.conditions);
    const fixtureDefaults = analysisMode === "FIXTURE" ? fixtureAnswersForText(parsed.data.text) : {};
    const answers = Object.fromEntries(questions.flatMap((question) => fixtureDefaults[question.id] ? [[question.id, fixtureDefaults[question.id]]] : []));
    const fixtureAnswersApplied = Object.keys(answers).length > 0;
    const recent = await db.dailySignal.findMany({ where: { patientId }, orderBy: { createdAt: "desc" }, take: 7 });
    const id = `signal-${Date.now()}`;
    const signal = await db.dailySignal.create({ data: {
      id, patientId, signalDate: currentDemoDate(), inputMode: parsed.data.inputMode,
      rawText: parsed.data.text, transcript: parsed.data.inputMode === "VOICE" ? parsed.data.text : null,
      status: questions.length ? "QUESTIONS" : "CONFIRMED",
      extractionJson: JSON.stringify(validatedExtraction), questionsJson: JSON.stringify(questions),
      answersJson: JSON.stringify(answers),
      confirmedJson: questions.length ? null : JSON.stringify(validatedExtraction.observations),
      shareSuggested: validatedExtraction.shareSuggested, shareReason: validatedExtraction.shareReason,
      trendSummary: trendSummary(validatedExtraction, recent),
    } });
    return NextResponse.json({ id: signal.id, extraction: validatedExtraction, questions, analysisMode, fixtureAnswersApplied });
  } catch (error) {
    const safeError = safeAiError(error);
    return NextResponse.json({
      error: `${safeError.message} You can retry or use the explicitly labelled demo extraction.`,
      errorCode: safeError.code,
    }, { status: 502 });
  }
}
