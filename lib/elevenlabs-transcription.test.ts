import { afterEach, describe, expect, it, vi } from "vitest";
import { transcribeWithElevenLabs } from "@/lib/elevenlabs-transcription";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("transcribeWithElevenLabs", () => {
  it("sends validated server-side multipart input to Scribe v2", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const form = init.body;
      expect(form).toBeInstanceOf(FormData);
      expect((form as FormData).get("model_id")).toBe("scribe_v2");
      expect((form as FormData).get("language_code")).toBe("eng");
      expect(new Headers(init.headers).get("xi-api-key")).toBe("test-key");
      return new Response(JSON.stringify({ text: "Synthetic transcript." }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const transcript = await transcribeWithElevenLabs(
      new File(["audio"], "signal.webm", { type: "audio/webm" }),
      {
        ELEVENLABS_API_KEY: "test-key",
        ELEVENLABS_STT_MODEL: "scribe_v2",
        ELEVENLABS_BASE_URL: "https://api.elevenlabs.io/",
        DEMO_AI_TIMEOUT_MS: "25000",
      },
    );

    expect(transcript).toBe("Synthetic transcript.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.elevenlabs.io/v1/speech-to-text",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("rejects empty transcript responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ text: "" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })));

    await expect(transcribeWithElevenLabs(
      new File(["audio"], "signal.webm", { type: "audio/webm" }),
      { ELEVENLABS_API_KEY: "test-key" },
    )).rejects.toThrow();
  });
});
