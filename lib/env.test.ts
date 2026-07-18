import { describe, expect, it } from "vitest";

import {
  DEFAULT_ELEVENLABS_BASE_URL,
  DEFAULT_ELEVENLABS_STT_MODEL,
  DEFAULT_OPENAI_TEXT_MODEL,
  elevenLabsBaseUrl,
  elevenLabsSttModel,
  openAiTextModel,
  parseServerEnvironment,
} from "@/lib/env";

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

  it("treats blank optional provider variables as unset", () => {
    expect(parseServerEnvironment({
      OPENAI_API_KEY: "",
      OPENAI_TEXT_MODEL: "  ",
      ELEVENLABS_API_KEY: "",
      ELEVENLABS_STT_MODEL: "",
      ELEVENLABS_BASE_URL: "",
    })).toMatchObject({
      OPENAI_API_KEY: undefined,
      OPENAI_TEXT_MODEL: undefined,
      ELEVENLABS_API_KEY: undefined,
      ELEVENLABS_STT_MODEL: undefined,
      ELEVENLABS_BASE_URL: DEFAULT_ELEVENLABS_BASE_URL,
    });
    expect(openAiTextModel({ OPENAI_TEXT_MODEL: "" })).toBe(DEFAULT_OPENAI_TEXT_MODEL);
    expect(elevenLabsSttModel({ ELEVENLABS_STT_MODEL: "" })).toBe(DEFAULT_ELEVENLABS_STT_MODEL);
    expect(elevenLabsBaseUrl({ ELEVENLABS_BASE_URL: "https://example.com/" })).toBe("https://example.com");
  });
});
