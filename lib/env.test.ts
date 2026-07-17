import { describe, expect, it } from "vitest";

import { parseServerEnvironment } from "@/lib/env";

describe("parseServerEnvironment", () => {
  it("provides safe local demo defaults without requiring an API key", () => {
    expect(parseServerEnvironment({})).toMatchObject({
      DATABASE_URL: "file:./dev.db",
      DEMO_AI_FALLBACK: "true",
      DEMO_AI_TIMEOUT_MS: 25_000,
      DEMO_RESPONSE_DELAY_MS: 10_000,
    });
  });

  it("rejects a negative simulated response delay", () => {
    expect(() =>
      parseServerEnvironment({ DEMO_RESPONSE_DELAY_MS: "-1" }),
    ).toThrow();
  });

  it("validates the bounded live AI timeout", () => {
    expect(parseServerEnvironment({ DEMO_AI_TIMEOUT_MS: "15000" }).DEMO_AI_TIMEOUT_MS).toBe(15_000);
    expect(() => parseServerEnvironment({ DEMO_AI_TIMEOUT_MS: "999" })).toThrow();
    expect(() => parseServerEnvironment({ DEMO_AI_TIMEOUT_MS: "120001" })).toThrow();
  });
});
