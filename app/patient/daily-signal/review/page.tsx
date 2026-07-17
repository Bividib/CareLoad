import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DailySignalReview } from "@/components/DailySignalFlow";
import { dailySignalExtractionSchema } from "@/domain/daily-signal/schema";
import type { QuestionDefinition } from "@/domain/daily-signal/questions";

export const dynamic = "force-dynamic";

export default async function DailySignalReviewPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const signal = id
    ? await db.dailySignal.findUnique({ where: { id } })
    : await db.dailySignal.findFirst({ where: { patientId: "eleanor-reed" }, orderBy: { createdAt: "desc" } });
  if (!signal?.extractionJson) notFound();
  return <DailySignalReview data={{
    id: signal.id, rawText: signal.rawText,
    extraction: dailySignalExtractionSchema.parse(JSON.parse(signal.extractionJson)),
    questions: JSON.parse(signal.questionsJson) as QuestionDefinition[],
    answers: JSON.parse(signal.answersJson) as Record<string, string>,
    urgent: signal.urgentRuleTriggered, trendSummary: signal.trendSummary,
  }} />;
}
