import { describe, expect, it } from "vitest";
import { expandRecurrence } from "@/domain/care-plan/recurrence";
import { planCare } from "@/domain/care-plan/planner";
import type { PlannerTask } from "@/domain/care-plan/types";

const update: PlannerTask = {
  id: "bp-update", title: "Twice-daily blood-pressure measurement", frequency: "TWICE_DAILY",
  startDate: "2026-07-17", endDate: "2026-07-30", windowStart: "07:00", windowEnd: "10:00",
  secondWindowStart: "17:00", secondWindowEnd: "20:00", durationMinutes: 5, mayMove: true,
  mayDelegate: false, requiredLocation: "home", requiredEquipment: "home blood-pressure cuff", bundleGroup: "morning",
};

describe("Care Plan Stress Test domain", () => {
  it("calculates 28 actions rather than hard-coding the count", () => {
    expect(expandRecurrence(update, "2026-07-17", "2026-07-30")).toHaveLength(28);
  });
  it("uses the separate approved morning and evening windows", () => {
    const result = planCare({ rangeStart: "2026-07-17", rangeEnd: "2026-07-17", tasks: [update], anchors: [], preferences: [], frictions: [], supportPeople: [] });
    expect(result.scheduled.map((item) => item.startTime)).toEqual(["07:00", "17:00"]);
  });
  it("retains an unresolved occurrence when the whole approved window is protected", () => {
    const result = planCare({ rangeStart: "2026-07-17", rangeEnd: "2026-07-17", tasks: [update], anchors: [{ id: "care", title: "Childcare", date: "2026-07-17", weekdays: ["FRI"], startTime: "17:00", endTime: "20:00", protected: true, location: "home" }], preferences: [], frictions: [], supportPeople: [] });
    expect(result.unplaced).toHaveLength(1);
    expect(result.unplaced[0].status).toBe("NEEDS_CLARIFICATION");
  });
});
