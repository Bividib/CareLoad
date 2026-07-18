import { afterEach, describe, expect, it } from "vitest";
import { dailySignalExtractionSchema } from "@/domain/daily-signal/schema";
import { dailySignalFixtures, fixtureAnswersForText, fixtureForText } from "@/domain/daily-signal/fixtures";
import { questionIdsForExtraction, selectQuestions, urgentDemonstrationRule } from "@/domain/daily-signal/questions";
import { resolveDailySignalAnalysisMode } from "@/lib/daily-signal";

describe("Daily Signal safety domain", () => {
  it("validates all fallbacks and preserves supporting phrases", () => {
    for (const fixture of Object.values(dailySignalFixtures)) {
      const parsed = dailySignalExtractionSchema.parse(fixture);
      expect(parsed.suggestedQuestionIds.length).toBeLessThanOrEqual(2);
      parsed.observations.forEach((item) => expect(item.sourcePhrase.length).toBeGreaterThan(0));
    }
  });
  it("rejects diagnosis and medication recommendation fields", () => {
    expect(() => dailySignalExtractionSchema.parse({ ...dailySignalFixtures.NORMAL_SAME, diagnosis: "x" })).toThrow();
    expect(() => dailySignalExtractionSchema.parse({ ...dailySignalFixtures.NORMAL_SAME, medicationRecommendation: "x" })).toThrow();
  });
  it("preserves uncertainty", () => {
    const fixture = fixtureForText("I might feel tired");
    const uncertain = { ...fixture, observations: fixture.observations.map((item) => ({ ...item, certainty: "UNCERTAIN" as const })) };
    expect(dailySignalExtractionSchema.parse(uncertain).observations[0].certainty).toBe("UNCERTAIN");
  });
  it("limits, filters, prioritises, and deduplicates approved questions", () => {
    const selected = selectQuestions(["SWELLING_CHANGE", "ABDOMINAL_PAIN_SEVERITY", "DAILY_ACTIVITY_IMPACT"], ["Type 2 diabetes"], ["DAILY_ACTIVITY_IMPACT"]);
    expect(selected.map((item) => item.id)).toEqual(["ABDOMINAL_PAIN_SEVERITY"]);
  });
  it("triggers only the configured synthetic urgent rule", () => {
    expect(urgentDemonstrationRule({ ABDOMINAL_PAIN_SEVERITY: "Yes", ABDOMINAL_PAIN_PERSISTENCE: "Yes", PAIN_SPREADS_TO_BACK: "Yes" })).toBe(true);
    expect(urgentDemonstrationRule({ ABDOMINAL_PAIN_SEVERITY: "Yes", ABDOMINAL_PAIN_PERSISTENCE: "No", PAIN_SPREADS_TO_BACK: "Yes" })).toBe(false);
  });
  it("keeps feel-the-same lightweight", () => {
    const same = fixtureForText("I feel about the same");
    expect(same.observations).toEqual([]);
    expect(same.suggestedQuestionIds).toEqual([]);
    expect(same.shareSuggested).toBe(false);
  });
  it("uses the exact fixture defaults only for the displayed stomach questions", () => {
    const text = "My stomach has felt uncomfortable for three days, it is worse today, and it is affecting my usual activities.";
    const extraction = fixtureForText(text);
    const questions = selectQuestions(questionIdsForExtraction(extraction), []);
    const defaults = fixtureAnswersForText(text);
    expect(extraction.observations[0]).toMatchObject({ domain: "stomach", trend: "WORSE", sourcePhrase: text });
    expect(questions.map((question) => question.id)).toEqual(["BOWEL_DURATION", "DAILY_ACTIVITY_IMPACT"]);
    expect(defaults).toEqual({ BOWEL_DURATION: "3–5 days", DAILY_ACTIVITY_IMPACT: "Yes" });
    expect(Object.keys(defaults)).toEqual(questions.map((question) => question.id));
  });
});

describe("Daily Signal analysis mode", () => {
  const originalFallback = process.env.DEMO_AI_FALLBACK;
  const originalKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (originalFallback === undefined) delete process.env.DEMO_AI_FALLBACK; else process.env.DEMO_AI_FALLBACK = originalFallback;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
  });

  it("resolves explicit, configured, missing-key, and live modes consistently", () => {
    process.env.DEMO_AI_FALLBACK = "false";
    process.env.OPENAI_API_KEY = "test-key";
    expect(resolveDailySignalAnalysisMode(true)).toBe("FIXTURE");
    process.env.DEMO_AI_FALLBACK = "true";
    expect(resolveDailySignalAnalysisMode(false)).toBe("FIXTURE");
    process.env.DEMO_AI_FALLBACK = "false";
    delete process.env.OPENAI_API_KEY;
    expect(resolveDailySignalAnalysisMode(false)).toBe("FIXTURE");
    process.env.OPENAI_API_KEY = "test-key";
    expect(resolveDailySignalAnalysisMode(false)).toBe("OPENAI");
  });
});
