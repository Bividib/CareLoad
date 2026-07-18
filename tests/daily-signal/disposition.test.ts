import { describe, expect, it } from "vitest";
import { evaluateDailySignalDisposition } from "@/domain/daily-signal/disposition";
import { dailySignalFixtures, fixtureForText } from "@/domain/daily-signal/fixtures";
import { questionIdsForExtraction, selectQuestions } from "@/domain/daily-signal/questions";

describe("Daily Signal fixture classification", () => {
  it.each([
    "very bad, upset tummy",
    "my stomach is uncomfortable",
    "my belly feels odd",
    "I feel nauseous",
    "I am sick to my stomach",
  ])("maps %s to a grounded stomach observation", (text) => {
    const fixture = fixtureForText(text);
    expect(fixture.observations[0]).toMatchObject({ domain: "stomach", sourcePhrase: text });
    expect(fixture.observations[0].durationText).toBeNull();
    expect(fixture.observations[0].value).not.toMatch(/diagnos|infection|medicine/i);
  });

  it("maps the original regression to the exact requested evidence", () => {
    expect(fixtureForText("very bad, upset tummy").observations[0]).toEqual({
      domain: "stomach",
      value: "upset stomach described as very bad",
      trend: "UNCLEAR",
      durationText: null,
      certainty: "CONFIRMED",
      sourcePhrase: "very bad, upset tummy",
    });
  });

  it("keeps fatigue as the fallback after GI synonyms have priority", () => {
    expect(fixtureForText("tired after a busy day").observations[0].domain).toBe("energy");
    expect(fixtureForText("tired with an upset tummy").observations[0].domain).toBe("stomach");
  });

  it("selects at most two relevant non-duplicate GI questions", () => {
    const fixture = fixtureForText("very bad, upset tummy");
    const questions = selectQuestions(questionIdsForExtraction(fixture), []);
    expect(questions.map((item) => item.id)).toEqual(["BOWEL_DURATION", "DAILY_ACTIVITY_IMPACT"]);
    expect(new Set(questions.map((item) => item.id)).size).toBe(questions.length);
    expect(questions).toHaveLength(2);
  });

  it("retains urgent-rule question priority", () => {
    expect(questionIdsForExtraction(dailySignalFixtures.URGENT_SYNTHETIC_RULE)).toEqual([
      "ABDOMINAL_PAIN_PERSISTENCE",
      "PAIN_SPREADS_TO_BACK",
    ]);
  });
});

describe("deterministic post-answer disposition", () => {
  it("suggests sharing persistent GI symptoms affecting usual activities", () => {
    expect(evaluateDailySignalDisposition(fixtureForText("very bad, upset tummy"), {
      BOWEL_DURATION: "3–5 days",
      DAILY_ACTIVITY_IMPACT: "Yes",
    }).outcome).toBe("SHARE_SUGGESTED");
  });

  it("records a minor busy-day observation without support needs", () => {
    expect(evaluateDailySignalDisposition(dailySignalFixtures.FATIGUE_AND_BUSY_DAY, {
      DAILY_ACTIVITY_IMPACT: "No",
      SUPPORT_NEEDED: "No",
    }).outcome).toBe("RECORD_ONLY");
  });

  it("preserves the configured urgent demonstration outcome", () => {
    expect(evaluateDailySignalDisposition(dailySignalFixtures.URGENT_SYNTHETIC_RULE, {
      ABDOMINAL_PAIN_PERSISTENCE: "Yes",
      PAIN_SPREADS_TO_BACK: "Yes",
    }).outcome).toBe("URGENT_DEMO");
  });
});
