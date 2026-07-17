import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailySignalEntry } from "@/components/DailySignalFlow";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

type RecorderHandlers = {
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstop: (() => void | Promise<void>) | null;
};

class MockMediaRecorder implements RecorderHandlers {
  static isTypeSupported = vi.fn(() => true);
  static latest: MockMediaRecorder | null = null;
  ondataavailable: RecorderHandlers["ondataavailable"] = null;
  onstop: RecorderHandlers["onstop"] = null;

  constructor() {
    MockMediaRecorder.latest = this;
  }

  start() {}
  stop() {
    void this.onstop?.();
  }
}

const stream = {
  getTracks: () => [{ stop: vi.fn() }],
};

function setMediaDevices(getUserMedia: () => Promise<unknown>) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
}

describe("DailySignalEntry microphone path", () => {
  beforeEach(() => {
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    MockMediaRecorder.latest = null;
    setMediaDevices(async () => stream);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("falls back to typing when microphone permission is denied", async () => {
    setMediaDevices(async () => {
      throw new DOMException("Denied", "NotAllowedError");
    });
    render(<DailySignalEntry prompt="How are you?" />);
    fireEvent.click(screen.getByRole("button", { name: /Speak/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Microphone access was not available");
    expect(screen.getByLabelText("Your check-in")).toBeVisible();
  });

  it("reports an unsupported MediaRecorder and keeps typed input available", async () => {
    vi.stubGlobal("MediaRecorder", undefined);
    render(<DailySignalEntry prompt="How are you?" />);
    fireEvent.click(screen.getByRole("button", { name: /Speak/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
    expect(screen.getByRole("alert")).toHaveTextContent("not supported");
    expect(screen.getByLabelText("Your check-in")).toBeVisible();
  });

  it("shows an empty-audio error and returns the recorder to idle", async () => {
    render(<DailySignalEntry prompt="How are you?" />);
    fireEvent.click(screen.getByRole("button", { name: /Speak/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop recording" })).toBeVisible());
    fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No audio was captured");
    expect(screen.getByRole("button", { name: "Start recording" })).toBeVisible();
  });

  it("uploads audio, displays a transcript, and preserves transcript edits", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ transcript: "Fixture transcript", mode: "FIXTURE" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<DailySignalEntry prompt="How are you?" />);
    fireEvent.click(screen.getByRole("button", { name: /Speak/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
    await waitFor(() => expect(MockMediaRecorder.latest).not.toBeNull());
    MockMediaRecorder.latest?.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) });
    fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));
    expect(await screen.findByDisplayValue("Fixture transcript")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Your check-in"), { target: { value: "Edited transcript" } });
    expect(screen.getByLabelText("Your check-in")).toHaveValue("Edited transcript");
    expect(fetchMock).toHaveBeenCalledWith("/api/audio/transcribe", expect.objectContaining({ method: "POST" }));
  });

  it("keeps the typed fallback available when transcription fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Transcription failed. Type instead." }),
    }));
    render(<DailySignalEntry prompt="How are you?" />);
    fireEvent.click(screen.getByRole("button", { name: /Speak/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
    await waitFor(() => expect(MockMediaRecorder.latest).not.toBeNull());
    MockMediaRecorder.latest?.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) });
    fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Transcription failed");
    expect(screen.getByLabelText("Your check-in")).toBeVisible();
  });
});
