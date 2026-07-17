export type CandidateForMatch = { title: string; explicitFrequency?: string | null; explicitTiming?: string | null; issuingService?: string | null; templateKey?: string | null };
export type TemplateForMatch = { id: string; templateKey: string | null; title: string; ownerService: string; frequency: string; windowStart: string; windowEnd: string };

const aliases: Record<string, string> = {
  "take levothyroxine before breakfast": "levothyroxine",
  "take metformin with breakfast": "metformin",
  "take atorvastatin in the evening": "atorvastatin",
  "morning blood pressure check": "blood-pressure",
  "morning weight check": "weight",
  "evening foot check": "foot-check",
  "weekly wellbeing questionnaire": "questionnaire",
  "cardiology appointment": "cardiology-appointment",
  "diabetes review appointment": "diabetes-appointment",
  "collect repeat prescription": "prescription",
  "symptom log": "symptom-log",
  "read heart health education": "education",
};
export const normaliseTaskTitle = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function matchVerifiedTemplate(candidate: CandidateForMatch, templates: TemplateForMatch[]) {
  if (candidate.templateKey) {
    const exact = templates.find((template) => template.templateKey === candidate.templateKey);
    if (exact) return exact;
  }
  const normal = normaliseTaskTitle(candidate.title);
  const alias = aliases[normal];
  if (alias) {
    const matched = templates.find((template) => template.templateKey === alias);
    if (matched) return matched;
  }
  const medication = templates.find((template) => ["levothyroxine","metformin","atorvastatin"].some((name) => normal.includes(name) && normaliseTaskTitle(template.title).includes(name)));
  if (medication) return medication;
  const exactTitle = templates.find((template) => normaliseTaskTitle(template.title) === normal);
  if (exactTitle) return exactTitle;
  return null;
}
