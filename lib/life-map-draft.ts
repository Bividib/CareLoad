import { z } from "zod";

const weekdays = "MON,TUE,WED,THU,FRI";
const everyDay = "MON,TUE,WED,THU,FRI,SAT,SUN";

const defaultTimes = {
  morning: { startTime: "08:00", endTime: "12:00" },
  evening: { startTime: "18:00", endTime: "20:00" },
  work: { startTime: "09:00", endTime: "17:00" },
  familyCare: { startTime: "15:00", endTime: "18:00" },
  walk: { startTime: "18:30", endTime: "19:00" },
} as const;

export const talkThroughDraftSchema = z.object({
  sourceText: z.string(),
  anchors: z.array(z.object({
    id: z.string(),
    title: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    weekdays: z.string(),
  })),
});

export type TalkThroughDraft = z.infer<typeof talkThroughDraftSchema>;

export function buildTalkThroughDraft(sourceText: string): TalkThroughDraft {
  const text = sourceText.trim();
  const anchors: TalkThroughDraft["anchors"] = [];

  if (/\b(work|working|job|shift)\b/i.test(text)) {
    const weekday = /\bweekday|monday\s*(?:to|-|through)\s*friday\b/i.test(text);
    const morning = /\bmorning/i.test(text);
    const evening = /\bevening/i.test(text);
    const times = morning ? defaultTimes.morning : evening ? defaultTimes.evening : defaultTimes.work;
    anchors.push({
      id: "talk-work",
      title: [weekday ? "Weekday" : "", morning ? "morning" : evening ? "evening" : "", "work"]
        .filter(Boolean)
        .join(" ")
        .replace(/^./, (letter) => letter.toUpperCase()),
      ...times,
      weekdays: weekday ? weekdays : everyDay,
    });
  }

  if (/\b(granddaughter|grandson|childcare|school run)\b/i.test(text)) {
    anchors.push({
      id: "talk-family-care",
      title: /\bschool run\b/i.test(text) ? "School run" : "Family care",
      ...defaultTimes.familyCare,
      weekdays: /\b(weekdays?|mondays?|tuesdays?|wednesdays?|thursdays?|fridays?)\b/i.test(text)
        ? weekdays
        : everyDay,
    });
  }

  if (/\b(walk|walking)\b/i.test(text)) {
    anchors.push({
      id: "talk-walk",
      title: /\bevening\b/i.test(text) ? "Evening walk" : "Walk",
      ...defaultTimes.walk,
      weekdays: everyDay,
    });
  }

  return talkThroughDraftSchema.parse({ sourceText: text, anchors });
}
