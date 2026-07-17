import { describe, expect, it } from "vitest";
import { dailySignalExtractionSchema } from "@/domain/daily-signal/schema";
import { dailySignalFixtures, fixtureForText } from "@/domain/daily-signal/fixtures";
import { selectQuestions, urgentDemonstrationRule } from "@/domain/daily-signal/questions";

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
});
