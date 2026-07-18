import { describe, expect, it } from "vitest";
import { buildTalkThroughDraft } from "@/lib/life-map-draft";

describe("talk-through Life Map draft", () => {
  it("uses only routines supported by the patient's words", () => {
    const draft = buildTalkThroughDraft("i work weekday mornings");
    expect(draft.anchors).toEqual([{
      id: "talk-work",
      title: "Weekday morning work",
      startTime: "08:00",
      endTime: "12:00",
      weekdays: "MON,TUE,WED,THU,FRI",
    }]);
    expect(JSON.stringify(draft)).not.toContain("School run");
  });

  it("does not invent a routine when none was stated", () => {
    expect(buildTalkThroughDraft("I prefer fewer reminders").anchors).toEqual([]);
  });

  it("adds editable fixture times for common routines", () => {
    const draft = buildTalkThroughDraft("I look after my granddaughter on Tuesdays and Thursdays and walk in the evening");
    expect(draft.anchors).toEqual([
      {
        id: "talk-family-care",
        title: "Family care",
        startTime: "15:00",
        endTime: "18:00",
        weekdays: "MON,TUE,WED,THU,FRI",
      },
      {
        id: "talk-walk",
        title: "Evening walk",
        startTime: "18:30",
        endTime: "19:00",
        weekdays: "MON,TUE,WED,THU,FRI,SAT,SUN",
      },
    ]);
  });
});
