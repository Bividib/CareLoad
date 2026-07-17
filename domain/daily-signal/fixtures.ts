import type { DailySignalExtraction } from "./schema";

const observation = (domain: string, value: string, sourcePhrase: string, trend: "NEW" | "WORSE" | "SAME" | "BETTER" | "UNCLEAR" = "NEW"): DailySignalExtraction["observations"][number] => ({
  domain, value, trend, durationText: null, certainty: "CONFIRMED", sourcePhrase,
});

export const dailySignalFixtures: Record<string, DailySignalExtraction> = {
  NORMAL_SAME: { observations: [], missingInformation: [], suggestedQuestionIds: [], differentFromRecentPattern: false, shareSuggested: false, shareReason: null, requiresDeterministicRuleCheck: false },
  GI_CHANGE_NON_URGENT: { observations: [observation("stomach", "uncomfortable", "stomach has felt uncomfortable"), observation("energy", "more tired than usual", "more tired than usual")], missingInformation: ["impact on usual activities"], suggestedQuestionIds: ["ABDOMINAL_PAIN_PERSISTENCE", "DAILY_ACTIVITY_IMPACT"], differentFromRecentPattern: true, shareSuggested: true, shareReason: "This differs from recent check-ins and has lasted for a few days.", requiresDeterministicRuleCheck: true },
  FATIGUE_AND_BUSY_DAY: { observations: [observation("energy", "tired on a busy day", "tired today")], missingInformation: [], suggestedQuestionIds: ["DAILY_ACTIVITY_IMPACT", "SUPPORT_NEEDED"], differentFromRecentPattern: false, shareSuggested: false, shareReason: null, requiresDeterministicRuleCheck: false },
  BREATHLESSNESS_CHANGE: { observations: [observation("breathing", "more breathless", "more breathless than usual", "WORSE")], missingInformation: [], suggestedQuestionIds: ["BREATHLESSNESS_CHANGE", "DAILY_ACTIVITY_IMPACT"], differentFromRecentPattern: true, shareSuggested: true, shareReason: "Breathing was described as different from usual.", requiresDeterministicRuleCheck: false },
  URGENT_SYNTHETIC_RULE: { observations: [observation("stomach", "severe persistent pain spreading to back", "severe pain that has not stopped and spreads to my back")], missingInformation: [], suggestedQuestionIds: ["ABDOMINAL_PAIN_SEVERITY", "ABDOMINAL_PAIN_PERSISTENCE"], differentFromRecentPattern: true, shareSuggested: true, shareReason: "A configured synthetic demonstration rule needs confirmed answers.", requiresDeterministicRuleCheck: true },
};

export function fixtureForText(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("about the same")) return dailySignalFixtures.NORMAL_SAME;
  if (lower.includes("breath")) return dailySignalFixtures.BREATHLESSNESS_CHANGE;
  if (lower.includes("severe") && lower.includes("back")) return dailySignalFixtures.URGENT_SYNTHETIC_RULE;
  if (lower.includes("stomach") || lower.includes("uncomfortable")) return dailySignalFixtures.GI_CHANGE_NON_URGENT;
  return dailySignalFixtures.FATIGUE_AND_BUSY_DAY;
}

