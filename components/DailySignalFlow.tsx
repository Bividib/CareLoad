"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CircleEqual, Keyboard, Mic, Pencil, Square, X } from "lucide-react";
import type { DailySignalExtraction } from "@/domain/daily-signal/schema";
import type { QuestionDefinition } from "@/domain/daily-signal/questions";
import { MobileShell, PageHeader, PrimaryButton, RoundedCard, SecondaryButton, SectionTitle, StatusBanner } from "@/components/ui/CareLoadUI";
import { SendUpdateButton } from "@/components/MessagingClient";

type ReviewData = { id: string; rawText: string; extraction: DailySignalExtraction; questions: QuestionDefinition[]; answers: Record<string, string>; urgent: boolean; trendSummary: string | null; status: string; shareSuggested: boolean; shareReason: string | null };

export function DailySignalEntry({ prompt, initialText = "" }: { prompt: string; initialText?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"CHOICE" | "TYPE" | "VOICE">(initialText ? "TYPE" : "CHOICE");
  const [text, setText] = useState(initialText);
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
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported in this browser. You can type your check-in instead.");
      setMode("TYPE");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const next = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      recorder.current = next; chunks.current = []; setSeconds(0); setRecording(true);
      next.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      next.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timer.current) clearInterval(timer.current);
        setRecording(false);
        if (!chunks.current.length) {
          setError("No audio was captured. You can retry or type your check-in instead.");
          return;
        }
        setBusy(true);
        const form = new FormData();
        form.append("audio", new File(chunks.current, "daily-signal.webm", { type: chunks.current[0].type || "audio/webm" }));
        const response = await fetch("/api/audio/transcribe", { method: "POST", body: form });
        const body = await response.json() as { transcript?: string; error?: string };
        setBusy(false);
        if (!response.ok) {
          setError(body.error ?? "Transcription failed.");
          setMode("TYPE");
          return;
        }
        setText(body.transcript ?? "");
        setMode("TYPE");
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
      <button className="signal-choice-row" onClick={() => setMode("VOICE")}><span className="round-icon blue"><Mic /></span><span><strong>Speak</strong><small>Use your voice</small></span><b>›</b></button>
      <button className="signal-choice-row" onClick={() => setMode("TYPE")}><span className="round-icon blue"><Keyboard /></span><span><strong>Type</strong><small>Write your update</small></span><b>›</b></button>
      <button className="signal-choice-row" onClick={() => void quick("same")}><span className="round-icon mint"><CircleEqual /></span><span><strong>I feel about the same</strong><small>Everything feels about the same</small></span><b>›</b></button>
      <button className="text-button full-button" onClick={() => void quick("dismiss")}>Skip for today</button>
    </RoundedCard> : <RoundedCard className="signal-input">
      <div className="signal-input-heading"><h2>{mode === "VOICE" ? "Record your update" : "Tell us in your own words"}</h2><p>{mode === "VOICE" ? "Tap stop when you’re done." : "Edit your words before CareLoad reviews them."}</p></div>
      {mode === "VOICE" && <><button className={`microphone ${recording ? "recording" : ""}`} aria-label={recording ? "Stop recording" : "Start recording"} onClick={() => recording ? recorder.current?.stop() : void startRecording()}>{recording ? <Square /> : <Mic />}</button><p aria-live="polite">{recording ? `Recording ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "Tap to record"}</p>{recording && <button className="text-button" onClick={() => { chunks.current = []; recorder.current?.stop(); setRecording(false); }}><X /> Cancel recording</button>}</>}
      {mode === "TYPE" && <label className="field">Your update<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Tell CareLoad how today feels…" /></label>}
      {error && <div className="error-message" role="alert">{error}</div>}
      {mode === "TYPE" && <PrimaryButton onClick={() => void analyse()}>{busy ? "Analysing…" : "Review what CareLoad understood"}</PrimaryButton>}
      {error && <SecondaryButton onClick={() => void analyse(true)}>Use demo extraction</SecondaryButton>}
      <button className="text-button full-button" onClick={() => setMode("CHOICE")}>Back</button>
    </RoundedCard>}
  </MobileShell>;
}

export function DailySignalReview({ data }: { data: ReviewData }) {
  const router = useRouter();
  const [answers, setAnswers] = useState(data.answers);
  const [phase, setPhase] = useState<"QUESTIONS" | "CONFIRM">(
    data.questions.length && !data.questions.every((question) => data.answers[question.id]) ? "QUESTIONS" : "CONFIRM",
  );
  const initialOutcome = data.status === "CONFIRMED" ? (data.shareSuggested ? "SHARE_SUGGESTED" : "RECORD_ONLY") : null;
  const [outcome, setOutcome] = useState<"SHARE_SUGGESTED" | "RECORD_ONLY" | null>(initialOutcome);
  const [reason, setReason] = useState(data.shareReason);
  const [urgent, setUrgent] = useState(data.urgent);
  const [busy, setBusy] = useState(false);
  async function saveAnswers() {
    const response = await fetch(`/api/daily-signals/${data.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "ANSWER", answers }) });
    if (!response.ok) throw new Error("Answers could not be saved.");
  }
  async function confirm() {
    setBusy(true);
    try {
      await saveAnswers();
      const response = await fetch(`/api/daily-signals/${data.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "CONFIRM", observations: data.extraction.observations }) });
      const body = await response.json() as { disposition?: { outcome: "SHARE_SUGGESTED" | "RECORD_ONLY" | "URGENT_DEMO"; reason: string } };
      if (!response.ok || !body.disposition) throw new Error("Confirmation failed.");
      setReason(body.disposition.reason);
      if (body.disposition.outcome === "URGENT_DEMO") setUrgent(true);
      else setOutcome(body.disposition.outcome);
    } finally {
      setBusy(false);
    }
  }
  async function recordOnly() {
    setBusy(true);
    const response = await fetch(`/api/daily-signals/${data.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "RECORD_ONLY", observations: data.extraction.observations }) });
    setBusy(false);
    if (response.ok) router.push("/patient/today");
  }
  if (urgent) return <MobileShell active="/patient/today"><PageHeader title="Configured demonstration rule" /><StatusBanner tone="amber" title="Synthetic prototype urgent behaviour">The information you confirmed matched the predefined demonstration rule for severe persistent abdominal pain that spreads to the back. This prototype cannot provide clinical guidance; a routine delayed simulated message is not presented as sufficient.</StatusBanner><p className="notice">This is predefined synthetic prototype behaviour, not deployable clinical guidance.</p></MobileShell>;
  if (outcome === "SHARE_SUGGESTED") return <MobileShell active="/patient/today"><PageHeader title="Your update is ready" subtitle="You decide whether it is shared." /><StatusBanner tone="amber" title="CareLoad suggests sharing this update">{reason}</StatusBanner><RoundedCard className="disposition-summary"><h2>What will be shared</h2><p>{data.rawText}</p></RoundedCard><SendUpdateButton signalId={data.id} /><SecondaryButton onClick={() => void recordOnly()}>Keep monitoring</SecondaryButton><Link className="text-button full-button" href={`/patient/daily-signal?edit=${data.id}`}>Edit</Link><p className="notice">This sends to the simulated care-team workflow. This does not diagnose a condition.</p></MobileShell>;
  if (outcome === "RECORD_ONLY") return <MobileShell active="/patient/today"><PageHeader title="Saved to your Daily Signals" subtitle="Your confirmed update has been recorded." /><StatusBanner title="No need to send right now">{reason}</StatusBanner><RoundedCard className="disposition-summary"><h2>Your saved update</h2><p>{data.rawText}</p></RoundedCard><PrimaryButton onClick={() => void recordOnly()}>{busy ? "Saving…" : "Return to Today"}</PrimaryButton><SendUpdateButton signalId={data.id} sendAnyway secondary /><Link className="text-button full-button" href={`/patient/daily-signal?edit=${data.id}`}>Edit</Link><p className="notice">This does not diagnose a condition.</p></MobileShell>;
  return <MobileShell active="/patient/today"><PageHeader title="Review your update" subtitle="Check what CareLoad understood before you choose whether to share it." />
    <RoundedCard className="review-summary-card"><div className="review-card-head"><span className="round-icon mint"><Check /></span><SectionTitle>CareLoad understood</SectionTitle></div><ul className="review-observations">{data.extraction.observations.map((item, index) => <li key={`${item.domain}-${index}`}><strong>{item.domain}:</strong> {item.value}</li>)}</ul></RoundedCard>
    {phase === "QUESTIONS" && data.questions.length > 0 && <><SectionTitle>Up to two quick questions</SectionTitle><RoundedCard className="review-questions">{data.questions.map((question, index) => <label className="field" key={question.id}><span>{index + 1}. {question.text}</span><select value={answers[question.id] ?? ""} onChange={(event) => setAnswers((old) => ({ ...old, [question.id]: event.target.value }))}><option value="">Choose an answer</option>{(question.options ?? ["Yes", "No", "Not sure"]).map((option) => <option key={option}>{option}</option>)}</select></label>)}</RoundedCard><button className="primary-button" disabled={!data.questions.every((question) => answers[question.id])} onClick={() => setPhase("CONFIRM")}>Review your answers</button><Link className="text-button full-button" href={`/patient/daily-signal?edit=${data.id}`}>Back</Link></>}
    {phase === "CONFIRM" && <RoundedCard className="answer-summary"><SectionTitle>Your answers</SectionTitle><ul>{data.questions.map((question) => <li key={question.id}><span>{question.text}</span><strong>{answers[question.id] || "Not answered"}</strong></li>)}</ul></RoundedCard>}
    <p className="notice">This does not diagnose a condition.</p>
    {phase === "CONFIRM" && <><h2 className="choice-heading">Does this look right?</h2><button className="review-choice" disabled={busy} onClick={() => void confirm()}><span className="round-icon mint"><Check /></span><span><strong>{busy ? "Saving…" : "Yes, that’s right"}</strong><small>Confirm before choosing whether to send</small></span>›</button><Link className="review-choice" href={`/patient/daily-signal?edit=${data.id}`}><span className="round-icon blue"><Pencil /></span><span><strong>Edit</strong><small>Make changes before continuing</small></span>›</Link><button className="text-button full-button" onClick={() => setPhase("QUESTIONS")}>Back</button></>}
  </MobileShell>;
}
