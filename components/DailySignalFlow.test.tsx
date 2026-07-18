import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailySignalEntry, DailySignalReview } from "@/components/DailySignalFlow";
import { fixtureForText, dailySignalFixtures } from "@/domain/daily-signal/fixtures";
import { questionCatalogue } from "@/domain/daily-signal/questions";
import { buildDailySignalEvidenceGraph } from "@/domain/daily-signal/evidence-graph";
import { evaluateDailySignalDisposition } from "@/domain/daily-signal/disposition";

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
    expect(screen.getByLabelText("Your update")).toBeVisible();
  });

  it("reports an unsupported MediaRecorder and keeps typed input available", async () => {
    vi.stubGlobal("MediaRecorder", undefined);
    render(<DailySignalEntry prompt="How are you?" />);
    fireEvent.click(screen.getByRole("button", { name: /Speak/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
    expect(screen.getByRole("alert")).toHaveTextContent("not supported");
    expect(screen.getByLabelText("Your update")).toBeVisible();
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
    expect(screen.getByRole("status")).toHaveTextContent("Demo transcript used because fixture mode is on");
    fireEvent.change(screen.getByLabelText("Your update"), { target: { value: "Edited transcript" } });
    expect(screen.getByLabelText("Your update")).toHaveValue("Edited transcript");
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
    expect(screen.getByLabelText("Your update")).toBeVisible();
  });
});

const reviewBase = {
  id: "signal-review",
  rawText: "very bad, upset tummy",
  extraction: fixtureForText("very bad, upset tummy"),
  questions: questionCatalogue.filter((item) => ["BOWEL_DURATION", "DAILY_ACTIVITY_IMPACT"].includes(item.id)),
  answers: {},
  urgent: false,
  trendSummary: null,
  status: "QUESTIONS",
  shareSuggested: false,
  shareReason: null,
  fixtureAnswersApplied: false,
  analysisMode: "FIXTURE" as const,
  evidenceGraph: null,
};

function graphFor(data = reviewBase, answers: Record<string, string> = { BOWEL_DURATION: "3–5 days", DAILY_ACTIVITY_IMPACT: "Yes" }) {
  const disposition = evaluateDailySignalDisposition(data.extraction, answers);
  return {
    disposition,
    evidenceGraph: buildDailySignalEvidenceGraph({ rawText: data.rawText, extraction: data.extraction, questions: [...data.questions], answers, trendSummary: data.trendSummary, disposition }),
  };
}

describe("DailySignalReview disposition branches", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the share-suggested actions returned after answers are saved", async () => {
    const result = graphFor();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ answers: {} }) })
      .mockResolvedValueOnce({ ok: true, json: async () => result }));
    render(<DailySignalReview data={reviewBase} />);
    fireEvent.change(screen.getByLabelText(/How long has your stomach felt upset/), { target: { value: "3–5 days" } });
    fireEvent.change(screen.getByLabelText(/Is this affecting your usual daily activities/), { target: { value: "Yes" } });
    fireEvent.click(screen.getByRole("button", { name: /Review your answers/ }));
    fireEvent.click(screen.getByRole("button", { name: /Yes, that’s right/ }));
    expect(await screen.findByText("CareLoad suggests sharing this update")).toBeVisible();
    expect(screen.getByRole("button", { name: /Send update/ })).toBeVisible();
  });

  it("renders Return to Today, Send anyway, and Edit for record-only", async () => {
    const recordData = { ...reviewBase, extraction: dailySignalFixtures.FATIGUE_AND_BUSY_DAY, questions: questionCatalogue.filter((item) => ["DAILY_ACTIVITY_IMPACT", "SUPPORT_NEEDED"].includes(item.id)) };
    const result = graphFor(recordData, { DAILY_ACTIVITY_IMPACT: "No", SUPPORT_NEEDED: "No" });
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ answers: {} }) })
      .mockResolvedValueOnce({ ok: true, json: async () => result }));
    render(<DailySignalReview data={recordData} />);
    fireEvent.change(screen.getByLabelText(/Is this affecting your usual daily activities/), { target: { value: "No" } });
    fireEvent.change(screen.getByLabelText(/Would practical support help today/), { target: { value: "No" } });
    fireEvent.click(screen.getByRole("button", { name: /Review your answers/ }));
    fireEvent.click(screen.getByRole("button", { name: /Yes, that’s right/ }));
    expect(await screen.findByText("Saved to your Daily Signals")).toBeVisible();
    expect(screen.getByRole("button", { name: /Return to Today/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Send anyway/ })).toBeVisible();
    expect(screen.getByRole("link", { name: "Edit" })).toBeVisible();
  });

  it("keeps fixture answers preselected and editable without a demo notice", () => {
    render(<DailySignalReview data={{ ...reviewBase, answers: { BOWEL_DURATION: "3–5 days", DAILY_ACTIVITY_IMPACT: "Yes" }, fixtureAnswersApplied: true }} />);
    expect(screen.queryByText("Demo answers preselected")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/How long has your stomach felt upset/)).toHaveValue("3–5 days");
    expect(screen.getByLabelText(/Is this affecting your usual daily activities/)).toHaveValue("Yes");
    expect(screen.getByRole("button", { name: "Review your answers" })).toBeEnabled();
    fireEvent.change(screen.getByLabelText(/Is this affecting your usual daily activities/), { target: { value: "No" } });
    expect(screen.getByLabelText(/Is this affecting your usual daily activities/)).toHaveValue("No");
  });

  it.each([
    ["SHARE_SUGGESTED", true, "CareLoad suggests sharing this update"],
    ["RECORD_ONLY", false, "No need to send right now"],
  ] as const)("opens and closes the evidence panel without fetching for %s", (outcome, shareSuggested, banner) => {
    const result = graphFor(
      outcome === "SHARE_SUGGESTED" ? reviewBase : { ...reviewBase, extraction: dailySignalFixtures.FATIGUE_AND_BUSY_DAY, questions: questionCatalogue.filter((item) => ["DAILY_ACTIVITY_IMPACT", "SUPPORT_NEEDED"].includes(item.id)) },
      outcome === "SHARE_SUGGESTED" ? { BOWEL_DURATION: "3–5 days", DAILY_ACTIVITY_IMPACT: "Yes" } : { DAILY_ACTIVITY_IMPACT: "No", SUPPORT_NEEDED: "No" },
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<DailySignalReview data={{ ...reviewBase, status: "CONFIRMED", shareSuggested, shareReason: result.disposition.reason, evidenceGraph: result.evidenceGraph, answers: outcome === "SHARE_SUGGESTED" ? { BOWEL_DURATION: "3–5 days", DAILY_ACTIVITY_IMPACT: "Yes" } : { DAILY_ACTIVITY_IMPACT: "No", SUPPORT_NEEDED: "No" } }} />);
    expect(screen.getByText(banner)).toBeVisible();
    const toggle = screen.getByRole("button", { name: "Why this result?" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("How CareLoad reached this result")).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("How CareLoad reached this result")).toBeVisible();
    expect(screen.queryByText(/Demo method:/)).not.toBeInTheDocument();
    if (outcome === "SHARE_SUGGESTED") {
      expect(screen.getAllByText("3–5 days").length).toBeGreaterThan(0);
      expect(screen.getByText("Sharing suggested")).toBeVisible();
    }
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
