import { describe, expect, it } from "vitest";

import { parseServerEnvironment } from "@/lib/env";

describe("parseServerEnvironment", () => {
  it("provides safe local demo defaults without requiring an API key", () => {
    expect(parseServerEnvironment({})).toMatchObject({
      DATABASE_URL: "file:./prisma/dev.db",
      DEMO_AI_FALLBACK: "true",
      DEMO_RESPONSE_DELAY_MS: 10_000,
    });
  });

  it("rejects a negative simulated response delay", () => {
    expect(() =>
      parseServerEnvironment({ DEMO_RESPONSE_DELAY_MS: "-1" }),
    ).toThrow();
  });
});

