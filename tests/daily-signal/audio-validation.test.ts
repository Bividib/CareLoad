import { describe, expect, it } from "vitest";
import { validateAudio } from "@/domain/daily-signal/audio-validation";

describe("audio upload validation", () => {
  it("accepts supported browser audio MIME types including parameters", () => {
    expect(validateAudio(new File(["audio"], "signal.webm", { type: "audio/webm;codecs=opus" }))).toBeNull();
    expect(validateAudio(new File(["audio"], "signal.m4a", { type: "audio/mp4" }))).toBeNull();
  });

  it("rejects invalid audio types", () => {
    expect(validateAudio(new File(["text"], "signal.txt", { type: "text/plain" }))).toEqual({
      error: "Use WebM, OGG, MP4, or MP3 audio.",
      status: 415,
    });
  });

  it("rejects empty and oversized audio", () => {
    expect(validateAudio(new File([], "empty.webm", { type: "audio/webm" }))?.status).toBe(413);
    expect(validateAudio(new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.webm", { type: "audio/webm" }))?.status).toBe(413);
  });
});
