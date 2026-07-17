export type QuestionDefinition = {
  id: string;
  text: string;
  answerType: "YES_NO" | "OPTIONS" | "TEXT";
  options?: string[];
  applicableConditions: string[];
  applicableRecentChanges: string[];
  deterministicRule: boolean;
};

const q = (id: string, text: string, applicableConditions: string[] = [], deterministicRule = false, options?: string[]): QuestionDefinition => ({
  id, text, answerType: options ? "OPTIONS" : "YES_NO", options,
  applicableConditions, applicableRecentChanges: [], deterministicRule,
});

export const questionCatalogue = [
  q("BOWEL_DURATION", "How long has the bowel change been present?", [], false, ["1–2 days", "3–5 days", "More than 5 days", "Not sure"]),
  q("BOWEL_LAST_NORMAL", "When was your last usual bowel movement?"),
  q("ABDOMINAL_PAIN_SEVERITY", "Would you describe the stomach pain as severe?", [], true),
  q("ABDOMINAL_PAIN_PERSISTENCE", "Has the severe stomach pain been persistent?", [], true),
  q("PAIN_SPREADS_TO_BACK", "Does the pain spread to your back?", [], true),
  q("EATING_MAINTAINED", "Are you still eating as usual?"),
  q("DRINKING_MAINTAINED", "Are you still drinking as usual?"),
  q("RECENT_MEDICATION_CHANGE", "Has your synthetic medication list changed recently?"),
  q("BREATHLESSNESS_CHANGE", "Has your breathlessness changed?", ["Heart failure"]),
  q("SWELLING_CHANGE", "Has swelling changed?", ["Heart failure"]),
  q("DIZZINESS_IMPACT", "Is dizziness affecting usual activities?"),
  q("SLEEP_CHANGE", "Has sleep changed?"),
  q("DAILY_ACTIVITY_IMPACT", "Is this affecting your usual daily activities?"),
  q("URINATION_CHANGE", "Has urination changed?"),
  q("SUPPORT_NEEDED", "Would practical support help today?"),
] as const satisfies readonly QuestionDefinition[];

export const questionById = new Map(questionCatalogue.map((item) => [item.id, item]));

export function selectQuestions(ids: string[], conditions: string[], answered: string[] = []) {
  const applicable = ids
    .map((id) => questionById.get(id))
    .filter((item): item is QuestionDefinition => Boolean(item))
    .filter((item) => !answered.includes(item.id))
    .filter((item) => !item.applicableConditions.length || item.applicableConditions.some((condition) => conditions.includes(condition)));
  return [...applicable.filter((item) => item.deterministicRule), ...applicable.filter((item) => !item.deterministicRule)].slice(0, 2);
}

export function urgentDemonstrationRule(answers: Record<string, string>) {
  return answers.ABDOMINAL_PAIN_SEVERITY === "Yes"
    && answers.ABDOMINAL_PAIN_PERSISTENCE === "Yes"
    && answers.PAIN_SPREADS_TO_BACK === "Yes";
}

