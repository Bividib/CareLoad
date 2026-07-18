import type { DailySignalExtraction } from "./schema";

export type DailySignalDisposition = {
  outcome: "SHARE_SUGGESTED" | "RECORD_ONLY" | "URGENT_DEMO";
  reason: string;
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
    };
  }

  const meaningfulReasons: string[] = [];
  if (extraction.observations.some((item) => item.trend === "WORSE" || (item.trend === "NEW" && extraction.differentFromRecentPattern))) meaningfulReasons.push("a new or worsening change was confirmed");
  if (["3–5 days", "More than 5 days"].includes(answers.BOWEL_DURATION ?? "")) meaningfulReasons.push("it has continued for several days");
  if (yes(answers.DAILY_ACTIVITY_IMPACT)) meaningfulReasons.push("it is affecting usual activities");
  if (answers.EATING_MAINTAINED && no(answers.EATING_MAINTAINED)) meaningfulReasons.push("eating is more difficult");
  if (answers.DRINKING_MAINTAINED && no(answers.DRINKING_MAINTAINED)) meaningfulReasons.push("drinking is more difficult");
  if (yes(answers.SUPPORT_NEEDED)) meaningfulReasons.push("practical support may be helpful");
  if (extraction.observations.some((item) => ["breathing", "swelling"].includes(item.domain) && item.trend !== "SAME")) meaningfulReasons.push("a relevant breathing or swelling change was confirmed");
  if (extraction.differentFromRecentPattern && meaningfulReasons.length > 0) meaningfulReasons.push("it differs from recent check-ins");

  return meaningfulReasons.length > 0
    ? { outcome: "SHARE_SUGGESTED", reason: `CareLoad suggests sharing because ${meaningfulReasons.slice(0, 2).join(" and ")}.` }
    : { outcome: "RECORD_ONLY", reason: "CareLoad does not currently suggest sharing this update. You can keep monitoring it or send it anyway." };
}
