import { describe, expect, it } from "vitest";
import { expandRecurrence, planCare, type PlannerInput, type PlannerTask } from "@/domain/care-plan";

const baseTask: PlannerTask = { id: "task", title: "Home check", frequency: "DAILY", windowStart: "07:00", windowEnd: "09:00", durationMinutes: 10, mayMove: true, mayDelegate: false, requiredLocation: "home", bundleGroup: "morning" };
const base: PlannerInput = { rangeStart: "2026-07-13", rangeEnd: "2026-07-13", tasks: [baseTask], anchors: [], preferences: ["bundle"], frictions: [], supportPeople: [] };

describe("deterministic care planner", () => {
  it("keeps a fixed task fixed and surfaces an anchor conflict", () => {
    const result = planCare({ ...base, tasks: [{ ...baseTask, mayMove: false, fixedTime: "08:00" }], anchors: [{ id: "school", title: "School run", weekdays: ["MON"], startTime: "07:30", endTime: "08:15", protected: true }] });
    expect(result.scheduled[0].startTime).toBe("08:00"); expect(result.conflicts).toHaveLength(1);
  });
  it("keeps a flexible task inside its window", () => expect(planCare(base).scheduled[0].startTime).toMatch(/^0[7-8]:/));
  it("avoids work when another slot exists", () => {
    const result = planCare({ ...base, tasks: [{ ...baseTask, windowStart: "08:00", windowEnd: "15:00" }], anchors: [{ id: "work", title: "Work", weekdays: ["MON"], startTime: "08:00", endTime: "14:00", protected: true, location: "work" }] });
    expect(result.scheduled[0].startTime).toBe("14:00");
  });
  it("respects the school run", () => {
    const result = planCare({ ...base, anchors: [{ id: "school", title: "School run", weekdays: ["MON"], startTime: "07:30", endTime: "08:15", protected: true }] });
    expect(result.scheduled[0].startTime).toBe("07:00");
  });
  it("moves flexible medicine to the next deterministic slot when yoga blocks its old time", () => {
    const result = planCare({
      ...base,
      tasks: [{ ...baseTask, title: "Morning medicine", windowStart: "06:30", windowEnd: "07:30", durationMinutes: 5 }],
      anchors: [{ id: "yoga", title: "Yoga", weekdays: ["MON"], startTime: "07:00", endTime: "07:30", protected: true }],
    });
    expect(result.scheduled[0].startTime).toBe("06:30");
    expect(result.unplaced).toHaveLength(0);
  });
  it("does not place home equipment during work", () => {
    const result = planCare({ ...base, tasks: [{ ...baseTask, requiredEquipment: "Cuff", windowStart: "08:00", windowEnd: "15:00" }], anchors: [{ id: "work", title: "Work", weekdays: ["MON"], startTime: "08:00", endTime: "14:00", protected: true, location: "work" }] });
    expect(result.scheduled[0].startTime).toBe("14:00");
  });
  it("bundles compatible tasks", () => {
    const result = planCare({ ...base, tasks: [baseTask, { ...baseTask, id: "task-2", title: "Weight" }] });
    expect(new Set(result.scheduled.map((item) => item.momentId)).size).toBe(1); expect(result.metrics.bundledTaskCount).toBe(1);
  });
  it("does not bundle incompatible locations", () => {
    const result = planCare({ ...base, tasks: [baseTask, { ...baseTask, id: "task-2", requiredLocation: "clinic" }] });
    expect(new Set(result.scheduled.map((item) => item.momentId)).size).toBe(2);
  });
  it("delegates only when explicitly permitted", () => {
    const blocked: PlannerInput["anchors"][number] = { id: "work", title: "Work", weekdays: ["MON"], startTime: "07:00", endTime: "09:00", protected: true };
    const result = planCare({ ...base, tasks: [{ ...baseTask, title: "Collect prescription", mayDelegate: true }], anchors: [blocked], supportPeople: [{ id: "maya", name: "Maya", mayCollectPrescription: true, availability: "MON" }] });
    expect(result.scheduled[0].delegatedTo).toBe("Maya");
    expect(planCare({ ...base, anchors: [blocked] }).scheduled).toHaveLength(0);
  });
  it("retains impossible work as NEEDS_CLARIFICATION", () => {
    const result = planCare({ ...base, anchors: [{ id: "block", title: "Family", weekdays: ["MON"], startTime: "07:00", endTime: "09:00", protected: true }] });
    expect(result.unplaced[0].status).toBe("NEEDS_CLARIFICATION");
  });
  it("never silently drops an occurrence", () => {
    const result = planCare({ ...base, tasks: [baseTask, { ...baseTask, id: "two" }] });
    expect(result.scheduled.length + result.unplaced.length).toBe(2);
  });
  it("expands weekly recurrence", () => {
    const values = expandRecurrence({ ...baseTask, frequency: "WEEKLY", weekdays: ["FRI"] }, "2026-07-13", "2026-07-26");
    expect(values.map((item) => item.date)).toEqual(["2026-07-17", "2026-07-24"]);
  });
  it("expands twice daily recurrence", () => expect(expandRecurrence({ ...baseTask, frequency: "TWICE_DAILY" }, "2026-07-13", "2026-07-13")).toHaveLength(2));
  it("calculates action and moment metrics", () => {
    const result = planCare({ ...base, tasks: [baseTask, { ...baseTask, id: "two" }] });
    expect(result.metrics).toMatchObject({ totalActions: 2, totalCareMoments: 1, totalCareMinutes: 20 });
  });
  it("is deterministic", () => expect(planCare(base)).toEqual(planCare(base)));
  it("does not mutate its input", () => { const frozen = structuredClone(base); planCare(base); expect(base).toEqual(frozen); });
});
