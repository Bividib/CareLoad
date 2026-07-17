import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { PrismaClient } from "@/generated/prisma6";
import { dailySignalExtractionSchema, type DailySignalExtraction } from "@/domain/daily-signal/schema";
import { fixtureForText } from "@/domain/daily-signal/fixtures";

export async function buildDailySignalContext(db: PrismaClient, patientId: string) {
  const [patient, signals, audits] = await Promise.all([
    db.patient.findUniqueOrThrow({ where: { id: patientId }, include: { conditions: true, tasks: { where: { active: true } }, preferences: true } }),
    db.dailySignal.findMany({ where: { patientId }, orderBy: { createdAt: "desc" }, take: 7 }),
    db.auditEvent.findMany({ where: { patientId, type: { in: ["PLAN_ACCEPTED", "SIMULATED_RESPONSE_CREATED"] } }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const domains = ["energy", "breathing", "stomach", "usual activities"];
  return {
    greetingPrompt: `How are your ${domains.slice(0, -1).join(", ")}, and ${domains.at(-1)} today?`,
    monitoringDomains: domains,
    recentChanges: audits.map((item) => item.summary),
    recentObservations: signals.flatMap((item) => item.confirmedJson ? JSON.parse(item.confirmedJson) as unknown[] : []),
    allowedQuestionIds: ["BOWEL_DURATION","ABDOMINAL_PAIN_SEVERITY","ABDOMINAL_PAIN_PERSISTENCE","PAIN_SPREADS_TO_BACK","EATING_MAINTAINED","DRINKING_MAINTAINED","BREATHLESSNESS_CHANGE","SWELLING_CHANGE","DAILY_ACTIVITY_IMPACT","SUPPORT_NEEDED"],
    maxQuestions: 2 as const,
    conditions: patient.conditions.map((item) => item.name),
    preferredInputMode: patient.preferences.some((item) => item.key === "voice" && item.enabled) ? "VOICE" : "TYPED",
  };
}

const rules = `Do not diagnose. Do not attribute an observation to a medicine. Do not recommend medication changes. Preserve uncertainty. Every observation must include the patient's exact supporting phrase. Choose no more than two IDs from the supplied approved catalogue. Do not invent questions. Use observational language only. Do not provide clinical advice.`;

export async function extractDailySignal(text: string, context: Awaited<ReturnType<typeof buildDailySignalContext>>, forceFixture = false): Promise<DailySignalExtraction> {
  if (forceFixture || process.env.DEMO_AI_FALLBACK === "true" || !process.env.OPENAI_API_KEY) return dailySignalExtractionSchema.parse(fixtureForText(text));
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.parse({
    model: process.env.OPENAI_TEXT_MODEL ?? "gpt-5", store: false,
    input: [{ role: "system", content: rules }, { role: "user", content: JSON.stringify({ text, context }) }],
    text: { format: zodTextFormat(dailySignalExtractionSchema, "daily_signal_extraction") },
  });
  if (!response.output_parsed) throw new Error("No validated Daily Signal extraction was returned.");
  return dailySignalExtractionSchema.parse(response.output_parsed);
}

export function trendSummary(current: DailySignalExtraction, previous: Array<{ confirmedJson: string | null }>) {
  const domains = new Set(current.observations.map((item) => item.domain));
  const consecutive = previous.filter((signal) => {
    const observations = signal.confirmedJson ? JSON.parse(signal.confirmedJson) as Array<{ domain?: string }> : [];
    return observations.some((item) => item.domain && domains.has(item.domain));
  }).length + 1;
  if (!current.observations.length) return "No new observations were recorded.";
  return `${current.observations.map((item) => item.domain).join(" and ")} reported in ${consecutive} consecutive check-in${consecutive === 1 ? "" : "s"}.`;
}
