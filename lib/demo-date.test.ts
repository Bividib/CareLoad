import { describe, expect, it } from "vitest";
import { demoDateRange } from "@/lib/demo-date";

describe("demo date range", () => {
  it("starts on the current London date and spans fourteen days", () => {
    expect(demoDateRange(new Date("2026-07-18T05:00:00Z"))).toEqual({
      rangeStart: "2026-07-18",
      rangeEnd: "2026-07-31",
    });
  });
});
