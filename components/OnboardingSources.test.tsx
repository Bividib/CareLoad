import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectRecordScreen, displaySourceName, OnboardingStepper, TalkThroughScreen } from "@/components/OnboardingScreens";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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

describe("onboarding source steps", () => {
  beforeEach(() => {
    push.mockReset();
    MockMediaRecorder.latest = null;
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses the same circular progress indicator and clean display source names", () => {
    render(<OnboardingStepper currentStep={3} />);
    expect(screen.getByLabelText("Onboarding step 3 of 4")).toBeVisible();
    expect(screen.getByText("Review tasks").parentElement).toHaveAttribute("aria-current", "step");
    expect(displaySourceName("Riverside Cardiology Service (fictional)")).toBe("Riverside Cardiology Service");
  });

  it("matches the talk-through placeholder to the fixture transcript", () => {
    render(<TalkThroughScreen selected={[]} />);
    expect(screen.getByLabelText("What should your plan fit around?")).toHaveAttribute(
      "placeholder",
      "I work weekday mornings, look after my granddaughter on Tuesdays and Thursdays, prefer fewer reminders, and usually walk in the evening.",
    );
  });

  it("previews the sample record before explicitly saving it", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ id: "record-1", originalName: "diabetes-medication-list.pdf", status: "UPLOADED" }],
        }),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<ConnectRecordScreen selected={[]} />);
    expect(screen.getByRole("button", { name: "Save document and return" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Use sample document/ }));

    expect(await screen.findByText("diabetes-medication-list.pdf")).toBeVisible();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save document and return" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/build"));
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/onboarding/sources",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("records, transcribes, and leaves the transcript editable", async () => {
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] })) },
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ transcript: "I work mornings and walk in the evening.", mode: "LIVE" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TalkThroughScreen selected={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Start voice recording" }));
    await waitFor(() => expect(MockMediaRecorder.latest).not.toBeNull());
    MockMediaRecorder.latest?.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) });
    fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));

    const input = await screen.findByDisplayValue("I work mornings and walk in the evening.");
    expect(screen.getByRole("status")).toHaveTextContent("Transcribed live with ElevenLabs Scribe v2");
    fireEvent.change(input, { target: { value: "I work mornings and prefer an evening walk." } });
    expect(input).toHaveValue("I work mornings and prefer an evening walk.");
    const form = fetchMock.mock.calls[0]?.[1]?.body as FormData;
    expect(form.get("context")).toBe("ONBOARDING");
  });

  it("keeps typing available when microphone permission is denied", async () => {
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn(async () => { throw new DOMException("Denied", "NotAllowedError"); }) },
    });

    render(<TalkThroughScreen selected={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Start voice recording" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Microphone access was not available");
    expect(screen.getByLabelText("What should your plan fit around?")).toBeVisible();
  });
});
