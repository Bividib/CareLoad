import type { DailySignalExtraction } from "./schema";

const observation = (domain: string, value: string, sourcePhrase: string, trend: "NEW" | "WORSE" | "SAME" | "BETTER" | "UNCLEAR" = "NEW"): DailySignalExtraction["observations"][number] => ({
  domain, value, trend, durationText: null, certainty: "CONFIRMED", sourcePhrase,
});

export const dailySignalFixtures: Record<string, DailySignalExtraction> = {
  NORMAL_SAME: { observations: [], missingInformation: [], suggestedQuestionIds: [], differentFromRecentPattern: false, shareSuggested: false, shareReason: null, requiresDeterministicRuleCheck: false },
  GI_CHANGE_NON_URGENT: { observations: [observation("stomach", "upset stomach", "upset tummy", "UNCLEAR")], missingInformation: ["duration", "impact on usual activities"], suggestedQuestionIds: ["BOWEL_DURATION", "DAILY_ACTIVITY_IMPACT"], differentFromRecentPattern: true, shareSuggested: false, shareReason: null, requiresDeterministicRuleCheck: true },
  FATIGUE_AND_BUSY_DAY: { observations: [observation("energy", "tired on a busy day", "tired today")], missingInformation: [], suggestedQuestionIds: ["DAILY_ACTIVITY_IMPACT", "SUPPORT_NEEDED"], differentFromRecentPattern: false, shareSuggested: false, shareReason: null, requiresDeterministicRuleCheck: false },
  BREATHLESSNESS_CHANGE: { observations: [observation("breathing", "more breathless", "more breathless than usual", "WORSE")], missingInformation: [], suggestedQuestionIds: ["BREATHLESSNESS_CHANGE", "DAILY_ACTIVITY_IMPACT"], differentFromRecentPattern: true, shareSuggested: true, shareReason: "Breathing was described as different from usual.", requiresDeterministicRuleCheck: false },
  URGENT_SYNTHETIC_RULE: { observations: [observation("stomach", "severe persistent pain described as spreading to back", "severe pain that has not stopped and spreads to my back", "WORSE")], missingInformation: [], suggestedQuestionIds: ["ABDOMINAL_PAIN_PERSISTENCE", "PAIN_SPREADS_TO_BACK"], differentFromRecentPattern: true, shareSuggested: false, shareReason: null, requiresDeterministicRuleCheck: true },
};

function normalize(text: string) {
  return text.toLocaleLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^[\s.,!?;:'"()[\]{}-]+|[\s.,!?;:'"()[\]{}-]+$/g, "")
    .replace(/\s+/g, " ");
}

const giPhrases = [
  "upset tummy", "tummy", "stomach upset", "stomach", "belly",
  "abdominal", "nausea", "nauseous", "sick to my stomach",
];

export function fixtureForText(text: string): DailySignalExtraction {
  const lower = normalize(text);
  if (lower.includes("about the same")) return dailySignalFixtures.NORMAL_SAME;
  if (lower.includes("breath")) return dailySignalFixtures.BREATHLESSNESS_CHANGE;
  if (lower.includes("severe") && lower.includes("back")) return dailySignalFixtures.URGENT_SYNTHETIC_RULE;
  if (giPhrases.some((phrase) => lower.includes(phrase)) || lower.includes("uncomfortable")) {
    return {
      ...dailySignalFixtures.GI_CHANGE_NON_URGENT,
      observations: [{
        domain: "stomach",
        value: lower.includes("very bad") ? "upset stomach described as very bad" : "stomach discomfort reported",
        trend: lower.includes("worse") ? "WORSE" : "UNCLEAR",
        durationText: null,
        certainty: "CONFIRMED",
        sourcePhrase: text.trim(),
      }],
    };
  }
  return dailySignalFixtures.FATIGUE_AND_BUSY_DAY;
}
