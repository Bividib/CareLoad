import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DailySignalReview } from "@/components/DailySignalFlow";
import { dailySignalExtractionSchema } from "@/domain/daily-signal/schema";
import type { QuestionDefinition } from "@/domain/daily-signal/questions";
import { evaluateDailySignalDisposition } from "@/domain/daily-signal/disposition";
import { buildDailySignalEvidenceGraph } from "@/domain/daily-signal/evidence-graph";
import { resolveDailySignalAnalysisMode, type DailySignalAnalysisMode } from "@/lib/daily-signal";

export const dynamic = "force-dynamic";

export default async function DailySignalReviewPage({ searchParams }: { searchParams: Promise<{ id?: string; fixtureAnswers?: string; analysisMode?: string }> }) {
  const { id, fixtureAnswers, analysisMode: requestedMode } = await searchParams;
  const signal = id
    ? await db.dailySignal.findUnique({ where: { id } })
    : await db.dailySignal.findFirst({ where: { patientId: "eleanor-reed" }, orderBy: { createdAt: "desc" } });
  if (!signal?.extractionJson) notFound();
  const extraction = dailySignalExtractionSchema.parse(JSON.parse(signal.extractionJson));
  const questions = JSON.parse(signal.questionsJson) as QuestionDefinition[];
  const answers = JSON.parse(signal.answersJson) as Record<string, string>;
  const finalStatus = ["CONFIRMED", "RECORDED_ONLY", "SENT", "URGENT_DEMO"].includes(signal.status);
  const disposition = finalStatus ? evaluateDailySignalDisposition(extraction, answers) : null;
  const evidenceGraph = disposition ? buildDailySignalEvidenceGraph({ rawText: signal.rawText, extraction, questions, answers, trendSummary: signal.trendSummary, disposition }) : null;
  const analysisMode: DailySignalAnalysisMode = requestedMode === "FIXTURE" || requestedMode === "OPENAI"
    ? requestedMode
    : resolveDailySignalAnalysisMode(false);
  return <DailySignalReview data={{
    id: signal.id, rawText: signal.rawText,
    extraction, questions, answers,
    urgent: signal.urgentRuleTriggered, trendSummary: signal.trendSummary,
    status: signal.status, shareSuggested: signal.shareSuggested, shareReason: signal.shareReason,
    fixtureAnswersApplied: fixtureAnswers === "1", analysisMode, evidenceGraph,
  }} />;
}
