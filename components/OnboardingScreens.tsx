"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Check, ChevronRight, FileText, Heart, LockKeyhole, MessageSquare, Mic, Pill, ShieldCheck, Square, Upload, Users, X } from "lucide-react";
import {
  MobileShell,
  PageHeader,
  RoundedCard,
  SecondaryButton,
  SectionTitle,
  StatusBanner,
} from "@/components/ui/CareLoadUI";

type DocumentRow = {
  id: string;
  originalName: string;
  status: string;
  errorMessage?: string | null;
  extractionMode?: string | null;
};
type CandidateRow = {
  id: string;
  title: string;
  sourceQuote: string;
  explicitTiming: string | null;
  explicitFrequency: string | null;
  confidence: number;
  status: string;
  requiresClinicalVerification: boolean;
  document: { originalName: string; issuingService: string | null; extractionMode: string | null };
};
type FactRow = { key: string; label: string; answer: string };
type PreviewPlan = {
  id: string;
  rangeStart: string;
  rangeEnd: string;
  metricsJson: string;
  items: Array<{
    id: string;
    occurrenceDate: string;
    startTime: string | null;
    momentTitle: string | null;
    status: string;
    explanation: string;
    task: { id: string; title: string };
  }>;
};
type BaselinePlanItem = {
  taskId: string;
  occurrenceDate: string;
  startTime: string | null;
  status: string;
};

const onboardingSteps = [
  "Getting started",
  "Read documents",
  "Review tasks",
  "Personalise",
] as const;

export function OnboardingStepper({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <div className="onboarding-stepper" aria-label={`Onboarding step ${currentStep} of 4`}>
      {onboardingSteps.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4;
        const state = step < currentStep ? "done" : step === currentStep ? "current" : "upcoming";
        return (
          <span className={state} key={label} aria-current={state === "current" ? "step" : undefined}>
            {state === "done" ? <Check aria-hidden="true" /> : <b aria-hidden="true">{step}</b>}
            <small>{label}</small>
          </span>
        );
      })}
    </div>
  );
}

export function displaySourceName(source: string) {
  return source.replace(/\s*\(fictional\)\s*$/i, "");
}

export function WelcomeScreen({
  initialConsent = false,
}: {
  initialConsent?: boolean;
}) {
  const [planning, setPlanning] = useState(initialConsent),
    [synthetic, setSynthetic] = useState(initialConsent),
    [info, setInfo] = useState(false),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function start() {
    setBusy(true);
    const response = await fetch("/api/onboarding/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planningConsent: planning,
        syntheticDataConsent: synthetic,
      }),
    });
    if (response.ok) router.push("/onboarding/build");
    else setBusy(false);
  }
  return (
    <MobileShell onboarding>
      <section className="welcome-hero">
        <div>
          <h1>Welcome to<br />CareLoad <span aria-hidden="true">☀</span></h1>
          <p>CareLoad helps you organise your care plan around everyday life — so you can feel more prepared, informed, and in control.</p>
        </div>
        <div className="welcome-illustration" aria-hidden="true">
          <span className="sun-disc" />
          <div className="clipboard-sheet"><span><Check /></span><i /><i /><i /></div>
        </div>
      </section>
      <div className="benefits welcome-benefits">
        <div>
          <CalendarCheck />
          <strong>Stay organised</strong>
          <p>All your care tasks, routines, and appointments in one place.</p>
        </div>
        <div>
          <ShieldCheck />
          <strong>Plan with confidence</strong>
          <p>Review a plan built from verified synthetic care instructions.</p>
        </div>
        <div>
          <Users />
          <strong>Care that fits your life</strong>
          <p>Personalise your plan around work, family, rest, and what matters.</p>
        </div>
      </div>
      <RoundedCard className="welcome-info-card">
        <div className="welcome-info-heading"><span><LockKeyhole /></span><div><strong>Your information in this demo</strong><p>CareLoad uses fictional information only.</p></div></div>
        <div className="welcome-info-row"><ShieldCheck /><div><strong>Synthetic health information</strong><p>This prototype does not connect to real healthcare services.</p></div></div>
        <div className="welcome-info-row"><FileText /><div><strong>Import demo documents</strong><p>Add the supplied fictional records and care instructions.</p></div></div>
        <div className="welcome-info-row"><MessageSquare /><div><strong>Optional daily check-ins</strong><p>Share a short fictional update only when you choose.</p></div></div>
      </RoundedCard>
      <label className="consent">
        <input
          type="checkbox"
          checked={planning}
          onChange={(event) => {
            setPlanning(event.target.checked);
            setSynthetic(event.target.checked);
          }}
        />{" "}
        <span>I understand CareLoad supports planning and <strong>does not replace clinical care</strong>. This demo uses synthetic data only.</span>
      </label>
      <button
        className="primary-button"
        disabled={!planning || !synthetic || busy}
        onClick={start}
      >
        {busy ? "Saving…" : "Get started"}
      </button>
      <button className="secondary-button" onClick={() => setInfo(true)}>
        Learn how it works
      </button>
      {info && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="info-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-title"
          >
            <button
              className="icon-button"
              onClick={() => setInfo(false)}
              aria-label="Close information"
            >
              <X />
            </button>
            <h2 id="how-title">What happens next</h2>
            <ol className="how-list">
              <li><strong>Add your demo information.</strong><span>Upload fictional documents or describe the routines that matter to you.</span></li>
              <li><strong>Check what CareLoad found.</strong><span>You confirm the care tasks before anything is planned.</span></li>
              <li><strong>Make it fit your life.</strong><span>Add work, family, rest, and other times the plan should protect.</span></li>
              <li><strong>Review before accepting.</strong><span>Your active plan changes only after you approve it.</span></li>
            </ol>
            <button className="primary-button" onClick={() => setInfo(false)}>
              Got it
            </button>
          </section>
        </div>
      )}
    </MobileShell>
  );
}

export function BuildScreen({
  selected = [],
  completedSources = [],
}: {
  selected?: string[];
  completedSources?: string[];
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function continueFlow() {
    setBusy(true);
    router.push("/onboarding/processing");
  }
  const sourceCards = [
    ["UPLOAD", "Upload documents", "Discharge letters, medication lists, appointment letters", FileText, "/onboarding/upload"],
    ["TALK", "Talk it through", "Speak or type your routine and care needs", Mic, "/onboarding/talk"],
  ] as const;
  const done = new Set([...selected, ...completedSources]);
  return (
    <MobileShell onboarding>
      <OnboardingStepper currentStep={1} />
      <PageHeader
        title="Build your care plan"
        subtitle="Choose how to get started"
      />
      <div className="option-list">
        {sourceCards.map(([key, title, text, Icon, href], index) => (
          <button
            key={key}
            className={`source-option source-tone-${index + 1} ${done.has(key) ? "complete" : ""}`}
            onClick={() => router.push(href)}
          >
            <Icon />
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
            {done.has(key) ? <Check className="source-state" aria-label="Complete" /> : <ChevronRight className="source-state" />}
          </button>
        ))}
      </div>
      <StatusBanner title="You can use more than one option">
        We’ll bring everything together into your care plan.
      </StatusBanner>
      <button
        className="primary-button"
        disabled={!done.size || busy}
        onClick={continueFlow}
      >
        {busy ? "Preparing…" : "Continue"}
      </button>
    </MobileShell>
  );
}

async function saveOnboardingSources(sources: string[], talkText?: string) {
  return fetch("/api/onboarding/sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources, talkText }),
  });
}

export function TalkThroughScreen({ selected, initialTalk = "" }: { selected: string[]; initialTalk?: string }) {
  const router = useRouter();
  const [text, setText] = useState(initialTalk);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [transcriptionMode, setTranscriptionMode] = useState<"LIVE" | "FIXTURE" | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunks = useRef<Blob[]>([]);
  async function startRecording() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported in this browser. You can type instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined;
      const next = new MediaRecorder(stream, { mimeType });
      recorder.current = next;
      chunks.current = [];
      setSeconds(0);
      setRecording(true);
      next.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      next.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setRecording(false);
        if (!chunks.current.length) {
          setError("No audio was captured. Please try again or type instead.");
          return;
        }
        setBusy(true);
        const form = new FormData();
        form.append("audio", new File(chunks.current, "care-plan-routines.webm", { type: chunks.current[0].type || "audio/webm" }));
        form.append("context", "ONBOARDING");
        const response = await fetch("/api/audio/transcribe", { method: "POST", body: form });
        const body = await response.json() as { transcript?: string; error?: string; mode?: "LIVE" | "FIXTURE" };
        setBusy(false);
        if (!response.ok || !body.transcript) {
          setError(body.error ?? "The recording could not be transcribed. Please retry or type instead.");
          return;
        }
        setText(body.transcript);
        setTranscriptionMode(body.mode ?? null);
      };
      next.start();
      timer.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    } catch {
      setError("Microphone access was not available. Nothing was recorded; you can type instead.");
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    const response = await saveOnboardingSources(Array.from(new Set([...selected, "TALK"])), text);
    if (response.ok) router.push("/onboarding/build");
    else {
      setBusy(false);
      setError("Your notes could not be saved. Please try again.");
    }
  }
  return <MobileShell onboarding>
    <OnboardingStepper currentStep={1} />
    <button className="back-link" onClick={() => router.push("/onboarding/build")}>← Back to your options</button>
    <PageHeader title="Talk it through" subtitle="Speak or type what a normal week looks like, in your own words." />
    <RoundedCard className="talk-card">
      <div className="talk-recorder">
        <button className={`microphone ${recording ? "recording" : ""}`} disabled={busy} aria-label={recording ? "Stop recording" : "Start voice recording"} onClick={() => recording ? recorder.current?.stop() : void startRecording()}>
          {recording ? <Square /> : <Mic />}
        </button>
        <strong aria-live="polite">{recording ? `Recording ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} — tap to stop` : busy ? "Transcribing your recording…" : "Tap the microphone to speak"}</strong>
        <small>Your words will appear below so you can edit them before saving.</small>
      </div>
      <label className="field">What should your plan fit around?
        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="I work weekday mornings, look after my granddaughter on Tuesdays and Thursdays, prefer fewer reminders, and usually walk in the evening." />
      </label>
      <p className="muted">Include routines, work, family time, travel, or times you prefer not to be interrupted.</p>
      {transcriptionMode && <p className="transcription-mode" role="status">
        {transcriptionMode === "LIVE" ? "Transcribed live with ElevenLabs Scribe v2." : "Demo transcript used because fixture mode is on."}
      </p>}
    </RoundedCard>
    {error && <div className="error-message" role="alert">{error}</div>}
    <button className="primary-button" disabled={!text.trim() || busy || recording} onClick={() => void save()}>{busy ? "Working…" : "Save and return"}</button>
  </MobileShell>;
}

export function UploadScreen({
  initialDocuments,
  selected = [],
}: {
  initialDocuments: DocumentRow[];
  selected?: string[];
}) {
  const [documents, setDocuments] = useState(initialDocuments),
    [files, setFiles] = useState<File[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState("");
  const router = useRouter();
  function choose(next: FileList | null) {
    if (next) setFiles(Array.from(next).slice(0, 3));
  }
  async function addSamples() {
    setBusy(true);
    setProgress("Adding synthetic sample documents…");
    const response = await fetch("/api/documents/sample", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        names: [
          "cardiology-discharge-summary.pdf",
          "diabetes-medication-list.pdf",
          "gp-care-notes.pdf",
        ],
      }),
    });
    const data = await response.json();
    setBusy(false);
    if (response.ok) setDocuments(data.documents);
    else setError(data.error);
  }
  async function process() {
    setBusy(true);
    setError("");
    let ids = documents.map((document) => document.id);
    if (files.length) {
      setProgress("Uploading documents");
      const body = new FormData();
      files.forEach((file) => body.append("files", file));
      const uploaded = await fetch("/api/documents/upload", {
        method: "POST",
        body,
      });
      const data = await uploaded.json();
      if (!uploaded.ok) {
        setError(data.error);
        setBusy(false);
        return;
      }
      ids = data.documents.map((document: DocumentRow) => document.id);
      setDocuments(data.documents);
    }
    setProgress("Saving your selected documents");
    sessionStorage.setItem("careloadDocumentIds", JSON.stringify(ids));
    const sourceResponse = await saveOnboardingSources(Array.from(new Set([...selected, "UPLOAD"])));
    setBusy(false);
    if (sourceResponse.ok) router.push("/onboarding/build");
    else setError("Your documents were saved, but this step could not be completed. Please retry.");
  }
  async function removeDocument(id: string) {
    const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (response.ok)
      setDocuments(documents.filter((document) => document.id !== id));
    else setError("The document could not be removed. Please retry.");
  }
  return (
    <MobileShell onboarding>
      <OnboardingStepper currentStep={1} />
      <button className="back-link" onClick={() => router.push("/onboarding/build")}>← Back to your options</button>
      <PageHeader
        title="Upload documents"
        subtitle="Synthetic PDF, TXT, or Markdown only."
      />
      <div className="synthetic-warning">
        Never upload real patient information. Maximum 3 files, 5 MB each.
      </div>
      <label
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setFiles(Array.from(event.dataTransfer.files).slice(0, 3));
        }}
      >
        <Upload />
        <h2>Drop synthetic documents here</h2>
        <span>or browse files</span>
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          onChange={(event) => choose(event.target.files)}
        />
      </label>
      {documents.map((document) => (
        <div className="selected-file" key={document.id}>
          <FileText /> {document.originalName}
          <button
            aria-label={`Remove ${document.originalName}`}
            onClick={() => removeDocument(document.id)}
          >
            <X />
          </button>
        </div>
      ))}
      {files.map((file) => (
        <div className="selected-file" key={file.name}>
          <FileText /> {file.name}
          <button
            aria-label={`Remove ${file.name}`}
            onClick={() =>
              setFiles(files.filter((item) => item.name !== file.name))
            }
          >
            <X />
          </button>
        </div>
      ))}
      <button className="secondary-button" onClick={addSamples} disabled={busy}>
        Use all three sample documents
      </button>
      {progress && <p role="status">{progress}</p>}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <button
        className="primary-button"
        disabled={busy || (!files.length && !documents.length)}
        onClick={process}
      >
        {busy ? "Saving…" : "Save documents and return"}
      </button>
    </MobileShell>
  );
}

export function ProcessingScreen({
  existingDocuments,
}: {
  existingDocuments: DocumentRow[];
}) {
  const router = useRouter();
  const initialFailedNames = existingDocuments
    .filter((document) => document.status === "FAILED")
    .map((document) => document.originalName);
  const [stage, setStage] = useState(0),
    [error, setError] = useState(
      initialFailedNames.length
        ? `${initialFailedNames.join(", ")} could not be extracted. Retry when ready.`
        : "",
    ),
    [busy, setBusy] = useState(false);
  const stages = [
    "Uploading documents",
    "Reading instructions",
    "Finding candidate care tasks",
    "Linking tasks to sources",
    "Preparing review",
  ];
  async function run(forceFixture = false) {
    setBusy(true);
    setError("");
    setStage(1);
    const stored = sessionStorage.getItem("careloadDocumentIds");
    const ids: string[] = stored
      ? JSON.parse(stored)
      : existingDocuments.map((document) => document.id);
    setStage(2);
    const response = await fetch("/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentIds: ids, forceFixture }),
    });
    const data = await response.json() as {
      error?: string;
      hasFailures?: boolean;
      results?: Array<{ id: string; status: string }>;
    };
    setStage(4);
    setBusy(false);
    if (!response.ok || data.hasFailures) {
      const failedIds = new Set<string>(
        (data.results ?? [])
          .filter((result: { status: string }) => result.status === "FAILED")
          .map((result: { id: string }) => result.id),
      );
      const failedNames = existingDocuments
        .filter((document) => failedIds.has(document.id))
        .map((document) => document.originalName);
      setError(
        `${failedNames.length ? failedNames.join(", ") : "One or more documents"} could not be extracted. ${data.error ?? "Retry when ready."}`,
      );
    }
    else router.push("/onboarding/review");
  }
  return (
    <MobileShell onboarding>
      <OnboardingStepper currentStep={2} />
      <PageHeader
        title="Reading synthetic documents"
        subtitle="These are real persisted processing stages, not a random percentage."
      />
      <RoundedCard>
        {stages.map((label, index) => (
          <div
            className={`processing-stage ${index < stage ? "complete" : index === stage ? "current" : ""}`}
            key={label}
          >
            <span>{index < stage ? "✓" : index + 1}</span>
            {label}
          </div>
        ))}
      </RoundedCard>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <button
        className="primary-button"
        disabled={busy}
        onClick={() => run(false)}
      >
        {busy ? "Processing…" : error ? "Retry extraction" : "Start extraction"}
      </button>
      {error && (
        <button className="secondary-button" onClick={() => run(true)}>
          Use demo extraction
        </button>
      )}
    </MobileShell>
  );
}

export function ReviewScreen({
  candidates,
  facts,
}: {
  candidates: CandidateRow[];
  facts: FactRow[];
}) {
  const [rows] = useState(candidates),
    [answers] = useState(
      Object.fromEntries(
        facts.map((fact) => [
          fact.key,
          fact.answer === "UNANSWERED" ? "UNSURE" : fact.answer,
        ]),
      ),
    ),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function approveAndContinue() {
    setBusy(true);
    const decisions = await fetch("/api/candidates/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "CONFIRMED" }),
    });
    const factsResponse = await fetch("/api/onboarding/facts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (decisions.ok && factsResponse.ok) router.push("/onboarding/life-map");
    else setBusy(false);
  }
  const unresolved = rows.filter(
    (row) => row.status === "NEEDS_CLINICAL_VERIFICATION",
  );
  const extractionModes = new Set(rows.map((row) => row.document.extractionMode).filter(Boolean));
  const liveExtraction = extractionModes.size === 1 && extractionModes.has("LIVE");
  const preferredTitles = [
    "Morning blood-pressure check",
    "Take Metformin with breakfast",
    "Evening foot check",
  ];
  const reviewRows = preferredTitles
    .map((title) => rows.find((row) => row.title === title))
    .filter((row): row is CandidateRow => Boolean(row));
  const visibleRows = reviewRows.length === 3 ? reviewRows : rows.slice(0, 3);
  const icons = [Heart, Pill, ShieldCheck];
  return (
    <MobileShell onboarding>
      <OnboardingStepper currentStep={3} />
      <PageHeader
        title="We found your care tasks"
        subtitle="We’ve read the demo documents and pulled out the key tasks to review."
      />
      <StatusBanner title={liveExtraction ? "Live OpenAI extraction" : "Demo extraction"}>
        {liveExtraction
          ? "These candidate tasks were extracted live with the configured OpenAI text model, then matched against verified task templates."
          : "These candidate tasks came from deterministic demo fixtures. Turn fixture mode off before extraction to use OpenAI."}
      </StatusBanner>
      <div className="compact-task-list">
        {visibleRows.map((task, index) => {
          const Icon = icons[index] ?? FileText;
          const needsConfirmation = task.requiresClinicalVerification || task.status === "NEEDS_CLINICAL_VERIFICATION";
          return <article key={task.id} className="compact-task"><span className={`task-icon tone-${index + 1}`}><Icon /></span><div><strong>{task.title}</strong><small>Source: {displaySourceName(task.document.issuingService ?? task.document.originalName)}</small></div><span className={needsConfirmation ? "task-state warning" : "task-state"}>{needsConfirmation ? "Needs confirmation" : "Ready"}</span></article>;
        })}
      </div>
      {unresolved.length > 0 && (
        <StatusBanner tone="amber" title="Needs clinical verification">
          {unresolved.length} unmatched task will remain visible and will not be
          scheduled.
        </StatusBanner>
      )}
      <button
        className="primary-button"
        disabled={busy}
        onClick={approveAndContinue}
      >
        {busy ? "Saving…" : "Looks right, continue"} <ChevronRight />
      </button>
    </MobileShell>
  );
}

export function PreviewScreen({
  plan,
  baselineItems = [],
  unresolvedCount,
  update = false,
}: {
  plan: PreviewPlan | null;
  baselineItems?: BaselinePlanItem[];
  unresolvedCount: number;
  update?: boolean;
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(false);
  if (!plan)
    return (
      <MobileShell onboarding>
        <OnboardingStepper currentStep={4} />
        <PageHeader title={update ? "Build your updated plan" : "Generate your first plan"} />
        <p>
          The deterministic planner is ready once your Life Map is confirmed.
        </p>
        <button
          className="primary-button"
          onClick={async () => {
            setBusy(true);
            const response = await fetch("/api/onboarding/plan", {
              method: "POST",
            });
            if (response.ok) router.refresh();
            else setBusy(false);
          }}
        >
          {busy ? "Generating…" : "Generate plan"}
        </button>
      </MobileShell>
    );
  const metrics = JSON.parse(plan.metricsJson) as {
    totalActions: number;
    totalCareMinutes: number;
    totalCareMoments: number;
  };
  const days = new Map<string, PreviewPlan["items"]>();
  const rangeStart = new Date(`${plan.rangeStart}T12:00:00`);
  const rangeEnd = new Date(`${plan.rangeEnd}T12:00:00`);
  for (
    const date = new Date(rangeStart);
    date <= rangeEnd;
    date.setDate(date.getDate() + 1)
  ) {
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    days.set(key, []);
  }
  for (const item of plan.items) days.set(item.occurrenceDate, [...(days.get(item.occurrenceDate) ?? []), item]);
  const baselineTimes = new Map(
    baselineItems.map((item) => [`${item.taskId}:${item.occurrenceDate}`, item.startTime]),
  );
  const movedItems = plan.items.filter((item) => {
    const previousTime = baselineTimes.get(`${item.task.id}:${item.occurrenceDate}`);
    return item.startTime && previousTime && previousTime !== item.startTime;
  });
  return (
    <MobileShell onboarding>
      <OnboardingStepper currentStep={4} />
      <PageHeader
        title={update ? "Review your updated plan" : "Your first plan preview"}
        subtitle="See how your care work fits around your full week before accepting it."
      />
      <RoundedCard className="first-plan-summary">
        <span className="round-icon mint"><CalendarCheck /></span><div><strong>Your week is ready</strong><p>{metrics.totalCareMoments} care moments bring {metrics.totalActions} actions into a clearer routine.</p></div>
      </RoundedCard>
      <RoundedCard className="first-plan-week">
        <SectionTitle>Your week at a glance</SectionTitle>
        {movedItems.length > 0 && <p className="plan-change-note"><strong>Deterministic replanning:</strong> {movedItems.length} care {movedItems.length === 1 ? "task has" : "tasks have"} moved to the next available time inside the verified window. Every move is labelled below.</p>}
        {[...days.entries()].map(([date, items], index) => {
          const label = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(new Date(`${date}T12:00:00`));
          const grouped = new Map<string, typeof items>();
          for (const item of items) {
            const key = item.startTime ? `${item.startTime}-${item.momentTitle}` : `unplaced-${item.id}`;
            grouped.set(key, [...(grouped.get(key) ?? []), item]);
          }
          const moments = [...grouped.values()];
          const scheduledCount = moments.filter((moment) => moment[0].startTime).length;
          const needsReviewCount = moments.length - scheduledCount;
          return <section className="preview-day" key={date}><div className={`preview-day-label tone-${index + 1}`}><strong>{label}</strong><span>{scheduledCount} {scheduledCount === 1 ? "moment" : "moments"}{needsReviewCount ? ` · ${needsReviewCount} needs review` : ""}</span></div>{moments.map((moment) => {
            const first = moment[0];
            if (!first.startTime) {
              return <article className="preview-moment needs-review" key={first.id}><strong>Needs review</strong><div><b>No permitted time remains</b><span>{first.task.title}. The deterministic planner will not move it outside its verified window.</span></div></article>;
            }
            const moves = [...new Set(moment.flatMap((item) => {
              const previousTime = baselineTimes.get(`${item.task.id}:${item.occurrenceDate}`);
              return previousTime && previousTime !== item.startTime ? [`Moved from ${previousTime} to ${item.startTime}`] : [];
            }))];
            return <article className="preview-moment" key={first.id}><strong>{first.startTime}</strong><div><b>{first.momentTitle ?? "Care moment"}</b><span>{moment.map((item) => item.task.title).join(" · ")}</span>{moves.map((move) => <small className="moved-time" key={move}>{move}</small>)}</div></article>;
          })}</section>;
        })}
      </RoundedCard>
      <button
        className="primary-button"
        onClick={async () => {
          setBusy(true);
          const response = await fetch(`/api/plans/${plan.id}/accept`, {
            method: "POST",
          });
          if (response.ok) router.push("/patient/today");
          else setBusy(false);
        }}
      >
        {busy ? "Accepting…" : update ? "Accept updated plan" : "Accept plan"}
      </button>
      <SecondaryButton href={update ? "/patient/life-map" : "/onboarding/life-map"}>
        {update ? "Adjust Life Map again" : "Adjust Life Map"}
      </SecondaryButton>
      {unresolvedCount > 0 && (
        <SecondaryButton href="/onboarding/review">
          Review unresolved item
        </SecondaryButton>
      )}
    </MobileShell>
  );
}
