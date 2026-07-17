"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, Mic, Square, X } from "lucide-react";
import type { DailySignalExtraction } from "@/domain/daily-signal/schema";
import type { QuestionDefinition } from "@/domain/daily-signal/questions";
import { MobileShell, PageHeader, PrimaryButton, RoundedCard, SecondaryButton, SectionTitle, StatusBanner } from "@/components/ui/CareLoadUI";

type ReviewData = { id: string; rawText: string; extraction: DailySignalExtraction; questions: QuestionDefinition[]; answers: Record<string, string>; urgent: boolean; trendSummary: string | null };

export function DailySignalEntry({ prompt }: { prompt: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"CHOICE" | "TYPE" | "VOICE">("CHOICE");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function analyse(forceFixture = false) {
    setBusy(true); setError("");
    const response = await fetch("/api/daily-signals/extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, inputMode: mode === "VOICE" ? "VOICE" : "TYPED", forceFixture }) });
    const body = await response.json() as { id?: string; error?: string };
    setBusy(false);
    if (!response.ok || !body.id) return setError(body.error ?? "Analysis failed.");
    router.push(`/patient/daily-signal/review?id=${body.id}`);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return setError("Voice recording is not supported in this browser. You can type your check-in instead.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const next = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      recorder.current = next; chunks.current = []; setSeconds(0); setRecording(true);
      next.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      next.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timer.current) clearInterval(timer.current);
        if (!chunks.current.length) return;
        setBusy(true);
        const form = new FormData();
        form.append("audio", new File(chunks.current, "daily-signal.webm", { type: chunks.current[0].type || "audio/webm" }));
        const response = await fetch("/api/audio/transcribe", { method: "POST", body: form });
        const body = await response.json() as { transcript?: string; error?: string };
        setBusy(false); setRecording(false);
        if (!response.ok) return setError(body.error ?? "Transcription failed.");
        setText(body.transcript ?? "");
      };
      next.start(); timer.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    } catch {
      setError("Microphone access was not available. Nothing was recorded; you can type your check-in instead.");
      setMode("TYPE");
    }
  }

  async function quick(path: "same" | "dismiss") {
    await fetch(`/api/daily-signals/${path}`, { method: "POST" });
    router.push("/patient/today"); router.refresh();
  }

  return <MobileShell active="/patient/today"><PageHeader title="Daily Signal" subtitle="Optional — skip whenever you want." />
    <StatusBanner title="A short check-in">{prompt}</StatusBanner>
    {mode === "CHOICE" ? <RoundedCard className="signal-choice">
      <SectionTitle>How would you like to check in?</SectionTitle>
      <PrimaryButton><span onClick={() => setMode("VOICE")}><Mic /> Speak</span></PrimaryButton>
      <SecondaryButton><span onClick={() => setMode("TYPE")}><Keyboard /> Type</span></SecondaryButton>
      <SecondaryButton><span onClick={() => void quick("same")}>I feel about the same</span></SecondaryButton>
      <button className="text-button full-button" onClick={() => void quick("dismiss")}>Skip for today</button>
    </RoundedCard> : <RoundedCard className="signal-input">
      {mode === "VOICE" && <><button className={`microphone ${recording ? "recording" : ""}`} aria-label={recording ? "Stop recording" : "Start recording"} onClick={() => recording ? recorder.current?.stop() : void startRecording()}>{recording ? <Square /> : <Mic />}</button><p aria-live="polite">{recording ? `Recording ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "Tap to record"}</p>{recording && <button className="text-button" onClick={() => { chunks.current = []; recorder.current?.stop(); setRecording(false); }}><X /> Cancel recording</button>}</>}
      <label className="field">Your check-in<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Tell CareLoad how today feels…" /></label>
      {error && <div className="error-message" role="alert">{error}</div>}
      <PrimaryButton><span onClick={() => void analyse()}>{busy ? "Analysing…" : "Review what CareLoad understood"}</span></PrimaryButton>
      {error && <SecondaryButton><span onClick={() => void analyse(true)}>Use demo extraction</span></SecondaryButton>}
      <button className="text-button full-button" onClick={() => setMode("CHOICE")}>Back</button>
    </RoundedCard>}
  </MobileShell>;
}

export function DailySignalReview({ data }: { data: ReviewData }) {
  const router = useRouter();
  const [answers, setAnswers] = useState(data.answers);
  const [confirmed, setConfirmed] = useState(false);
  const [urgent, setUrgent] = useState(data.urgent);
  const [busy, setBusy] = useState(false);
  async function saveAnswers() {
    const response = await fetch(`/api/daily-signals/${data.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "ANSWER", answers }) });
    const body = await response.json() as { urgent?: boolean };
    setUrgent(Boolean(body.urgent));
  }
  async function finish(action: "CONFIRM" | "RECORD_ONLY") {
    setBusy(true);
    await saveAnswers();
    await fetch(`/api/daily-signals/${data.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, observations: data.extraction.observations }) });
    setBusy(false);
    if (action === "RECORD_ONLY") router.push("/patient/today"); else setConfirmed(true);
  }
  if (urgent) return <MobileShell active="/patient/today"><PageHeader title="Configured demonstration rule" /><StatusBanner tone="amber" title="Synthetic prototype urgent behaviour">The information you confirmed matched the predefined demonstration rule for severe persistent abdominal pain that spreads to the back. This prototype cannot provide clinical guidance; a routine delayed simulated message is not presented as sufficient.</StatusBanner><p className="notice">This is predefined synthetic prototype behaviour, not deployable clinical guidance.</p></MobileShell>;
  return <MobileShell active="/patient/today"><PageHeader title="Review your Daily Signal" subtitle="You decide what is recorded or shared." />
    <RoundedCard><SectionTitle>CareLoad understood</SectionTitle>{data.extraction.observations.map((item, index) => <article className="observation-card" key={`${item.domain}-${index}`}><strong>{item.domain}: {item.value}</strong><span>Trend: {item.trend.toLowerCase()} · Certainty: {item.certainty.toLowerCase().replaceAll("_", " ")}</span><blockquote>“{item.sourcePhrase}”</blockquote></article>)}<p className="muted">{data.trendSummary}</p></RoundedCard>
    {data.questions.length > 0 && <><SectionTitle>Up to two quick questions</SectionTitle>{data.questions.map((question) => <RoundedCard key={question.id}><label className="field">{question.text}<select value={answers[question.id] ?? ""} onChange={(event) => setAnswers((old) => ({ ...old, [question.id]: event.target.value }))}><option value="">Choose an answer</option>{(question.options ?? ["Yes", "No", "Not sure"]).map((option) => <option key={option}>{option}</option>)}</select></label></RoundedCard>)}</>}
    {data.extraction.shareSuggested && <StatusBanner tone="blue" title="Why sharing is suggested">{data.extraction.shareReason}</StatusBanner>}
    <p className="notice">This does not diagnose a condition.</p>
    {!confirmed ? <><PrimaryButton><span onClick={() => void finish("CONFIRM")}>{busy ? "Saving…" : "Yes, that is right"}</span></PrimaryButton><SecondaryButton href="/patient/daily-signal">Edit</SecondaryButton><SecondaryButton><span onClick={() => void finish("RECORD_ONLY")}>Keep monitoring</span></SecondaryButton></> : <><StatusBanner title="Confirmed">Only these patient-confirmed observations can be included in an update.</StatusBanner><PrimaryButton href={`/patient/messages?send=${data.id}`}>Send update</PrimaryButton><SecondaryButton><span onClick={() => router.push("/patient/today")}>Keep monitoring</span></SecondaryButton></>}
  </MobileShell>;
}
