import { describe, expect, it } from "vitest";
import { z } from "zod";
import { safeAiError } from "@/lib/ai-errors";

describe("safeAiError", () => {
  it("maps configuration validation without exposing raw values", () => {
    const parsed = z.object({ model: z.string().min(1) }).safeParse({ model: "" });
    if (parsed.success) throw new Error("Expected validation to fail.");
    expect(safeAiError(parsed.error)).toEqual({
      code: "CONFIGURATION",
      message: "Live AI configuration is invalid. Check the server settings on the demo controls page.",
    });
  });

  it("maps model access, rate limit, timeout, and generic failures", () => {
    expect(safeAiError({ status: 404 })).toMatchObject({ code: "MODEL_ACCESS" });
    expect(safeAiError({ status: 429 })).toMatchObject({ code: "RATE_LIMITED" });
    expect(safeAiError({ name: "APIConnectionTimeoutError" })).toMatchObject({ code: "TIMEOUT" });
    expect(safeAiError(new Error("network failed"))).toMatchObject({ code: "REQUEST_FAILED" });
  });

  it("uses the selected provider name without exposing raw errors", () => {
    expect(safeAiError({ status: 401, message: "secret upstream detail" }, "ElevenLabs")).toEqual({
      code: "MODEL_ACCESS",
      message: "The configured ElevenLabs model or API key is not available to this project.",
    });
  });
});
