import { afterEach, describe, expect, it, vi } from "vitest";

const { openAiConstructor } = vi.hoisted(() => ({ openAiConstructor: vi.fn() }));
vi.mock("openai", () => ({ default: openAiConstructor }));

import { buildDailySignalContext, extractDailySignal } from "@/lib/daily-signal";

describe("fixture extraction execution", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns the validated fixture without instantiating OpenAI", async () => {
    const text = "My stomach has felt uncomfortable for three days, it is worse today, and it is affecting my usual activities.";
    const extraction = await extractDailySignal(text, {} as Awaited<ReturnType<typeof buildDailySignalContext>>, "FIXTURE");
    expect(extraction.observations[0]).toMatchObject({ domain: "stomach", sourcePhrase: text, trend: "WORSE" });
    expect(openAiConstructor).not.toHaveBeenCalled();
  });
});
