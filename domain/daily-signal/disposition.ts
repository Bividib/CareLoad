import type { DailySignalExtraction } from "./schema";

export type DailySignalEvidenceSource =
  | "PATIENT_REPORT"
  | "STRUCTURED_OBSERVATION"
  | "PATIENT_ANSWER"
  | "LONGITUDINAL_CONTEXT"
  | "CONFIGURED_RULE";

export type DailySignalDecisionFactorCode =
  | "NEW_OR_WORSENING_CHANGE"
  | "MULTI_DAY_DURATION"
  | "ACTIVITY_IMPACT"
  | "EATING_DIFFICULTY"
  | "DRINKING_DIFFICULTY"
  | "SUPPORT_NEEDED"
  | "BREATHING_OR_SWELLING_CHANGE"
  | "DIFFERS_FROM_RECENT_PATTERN"
  | "SEVERE_PERSISTENT_STOMACH"
  | "PAIN_SPREADS_TO_BACK"
  | "NO_SHARE_FACTOR";

export type DailySignalDecisionFactor = {
  id: string;
  code: DailySignalDecisionFactorCode;
  label: string;
  value: string;
  source: DailySignalEvidenceSource;
  observationDomain?: string;
  answerId?: string;
};

export type DailySignalDisposition = {
  outcome: "SHARE_SUGGESTED" | "RECORD_ONLY" | "URGENT_DEMO";
  reason: string;
  factors: DailySignalDecisionFactor[];
};

const yes = (value: string | undefined) => value?.toLocaleLowerCase().startsWith("yes") ?? false;
const no = (value: string | undefined) => value?.toLocaleLowerCase().startsWith("no") ?? false;

export function evaluateDailySignalDisposition(
  extraction: DailySignalExtraction,
  answers: Record<string, string>,
): DailySignalDisposition {
  const stomach = extraction.observations.some((item) => item.domain === "stomach");
  const confirmedSeverePersistent = extraction.observations.some((item) =>
    item.domain === "stomach" &&
    item.value.toLocaleLowerCase().includes("severe") &&
    item.value.toLocaleLowerCase().includes("persistent"),
  );
  if (
    stomach &&
    confirmedSeverePersistent &&
    yes(answers.ABDOMINAL_PAIN_PERSISTENCE) &&
    yes(answers.PAIN_SPREADS_TO_BACK)
  ) {
    return {
      outcome: "URGENT_DEMO",
      reason: "The confirmed answers matched the configured synthetic urgent demonstration rule.",
      factors: [
        { id: "factor-severe-persistent", code: "SEVERE_PERSISTENT_STOMACH", label: "Severe persistent stomach pain was confirmed", value: "Confirmed", source: "STRUCTURED_OBSERVATION", observationDomain: "stomach" },
        { id: "factor-pain-spreads", code: "PAIN_SPREADS_TO_BACK", label: "Pain spreading to the back was confirmed", value: answers.PAIN_SPREADS_TO_BACK, source: "PATIENT_ANSWER", answerId: "PAIN_SPREADS_TO_BACK" },
      ],
    };
  }

  const meaningfulReasons: string[] = [];
  const factors: DailySignalDecisionFactor[] = [];
  const changingObservation = extraction.observations.find((item) => item.trend === "WORSE" || (item.trend === "NEW" && extraction.differentFromRecentPattern));
  if (changingObservation) {
    meaningfulReasons.push("a new or worsening change was confirmed");
    factors.push({ id: "factor-new-or-worse", code: "NEW_OR_WORSENING_CHANGE", label: "A new or worsening change was confirmed", value: changingObservation.trend === "WORSE" ? "Worse today" : "New today", source: "STRUCTURED_OBSERVATION", observationDomain: changingObservation.domain });
  }
  if (["3–5 days", "More than 5 days"].includes(answers.BOWEL_DURATION ?? "")) {
    meaningfulReasons.push("it has continued for several days");
    factors.push({ id: "factor-duration", code: "MULTI_DAY_DURATION", label: "The change has continued for several days", value: answers.BOWEL_DURATION, source: "PATIENT_ANSWER", answerId: "BOWEL_DURATION" });
  }
  if (yes(answers.DAILY_ACTIVITY_IMPACT)) {
    meaningfulReasons.push("it is affecting usual activities");
    factors.push({ id: "factor-activity", code: "ACTIVITY_IMPACT", label: "Usual daily activities are affected", value: answers.DAILY_ACTIVITY_IMPACT, source: "PATIENT_ANSWER", answerId: "DAILY_ACTIVITY_IMPACT" });
  }
  if (answers.EATING_MAINTAINED && no(answers.EATING_MAINTAINED)) {
    meaningfulReasons.push("eating is more difficult");
    factors.push({ id: "factor-eating", code: "EATING_DIFFICULTY", label: "Eating as usual was not confirmed", value: answers.EATING_MAINTAINED, source: "PATIENT_ANSWER", answerId: "EATING_MAINTAINED" });
  }
  if (answers.DRINKING_MAINTAINED && no(answers.DRINKING_MAINTAINED)) {
    meaningfulReasons.push("drinking is more difficult");
    factors.push({ id: "factor-drinking", code: "DRINKING_DIFFICULTY", label: "Drinking as usual was not confirmed", value: answers.DRINKING_MAINTAINED, source: "PATIENT_ANSWER", answerId: "DRINKING_MAINTAINED" });
  }
  if (yes(answers.SUPPORT_NEEDED)) {
    meaningfulReasons.push("practical support may be helpful");
    factors.push({ id: "factor-support", code: "SUPPORT_NEEDED", label: "Practical support was requested", value: answers.SUPPORT_NEEDED, source: "PATIENT_ANSWER", answerId: "SUPPORT_NEEDED" });
  }
  const breathingOrSwelling = extraction.observations.find((item) => ["breathing", "swelling"].includes(item.domain) && item.trend !== "SAME");
  if (breathingOrSwelling) {
    meaningfulReasons.push("a relevant breathing or swelling change was confirmed");
    factors.push({ id: "factor-breathing-swelling", code: "BREATHING_OR_SWELLING_CHANGE", label: "A breathing or swelling change was confirmed", value: breathingOrSwelling.value, source: "STRUCTURED_OBSERVATION", observationDomain: breathingOrSwelling.domain });
  }
  if (extraction.differentFromRecentPattern && meaningfulReasons.length > 0) {
    meaningfulReasons.push("it differs from recent check-ins");
    factors.push({ id: "factor-recent-pattern", code: "DIFFERS_FROM_RECENT_PATTERN", label: "This differs from recent check-ins", value: "Different from recent pattern", source: "LONGITUDINAL_CONTEXT" });
  }

  return meaningfulReasons.length > 0
    ? { outcome: "SHARE_SUGGESTED", reason: `CareLoad suggests sharing because ${meaningfulReasons.slice(0, 2).join(" and ")}.`, factors }
    : {
        outcome: "RECORD_ONLY",
        reason: "CareLoad does not currently suggest sharing this update. You can keep monitoring it or send it anyway.",
        factors: [{ id: "factor-no-share", code: "NO_SHARE_FACTOR", label: "No configured sharing factor was confirmed", value: "The update can remain recorded unless the patient chooses to send it", source: "CONFIGURED_RULE" }],
      };
}
