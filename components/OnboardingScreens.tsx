"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mic, ShieldCheck, Upload, Users, X } from "lucide-react";
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
  document: { originalName: string; issuingService: string | null };
};
type FactRow = { key: string; label: string; answer: string };
type PreviewPlan = {
  id: string;
  metricsJson: string;
  items: Array<{
    id: string;
    occurrenceDate: string;
    startTime: string | null;
    momentTitle: string | null;
    status: string;
    task: { title: string };
  }>;
};

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
      <PageHeader
        title="Welcome to CareLoad ☀"
        subtitle="Organise a verified synthetic care workload around everyday life."
      />
      <div className="benefits">
        <div>
          <FileText />
          <strong>Stay organised</strong>
          <p>Care tasks, routines, and appointments in one place.</p>
        </div>
        <div>
          <ShieldCheck />
          <strong>Plan with confidence</strong>
          <p>Only pre-verified synthetic constraints are scheduled.</p>
        </div>
        <div>
          <Users />
          <strong>Care that fits your life</strong>
          <p>Protect work, family, rest, and what matters.</p>
        </div>
      </div>
      <RoundedCard>
        <SectionTitle>Prototype boundary</SectionTitle>
        <p>
          This hackathon app uses synthetic information only and does not
          connect to real healthcare services.
        </p>
      </RoundedCard>
      <label className="consent">
        <input
          type="checkbox"
          checked={planning}
          onChange={(event) => setPlanning(event.target.checked)}
        />{" "}
        CareLoad supports planning and does not replace clinical care.
      </label>
      <label className="consent">
        <input
          type="checkbox"
          checked={synthetic}
          onChange={(event) => setSynthetic(event.target.checked)}
        />{" "}
        I understand this prototype uses synthetic data only.
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
            <h2 id="how-title">How CareLoad works</h2>
            <p>
              Synthetic documents become source-grounded candidate tasks. You
              confirm facts, verified templates supply constraints, and the
              deterministic planner fits the confirmed work around the Life Map.
            </p>
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
  initialTalk = "",
}: {
  selected?: string[];
  initialTalk?: string;
}) {
  const [sources, setSources] = useState(selected),
    [talkText, setTalkText] = useState(initialTalk),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  function toggle(source: string) {
    setSources(
      sources.includes(source)
        ? sources.filter((item) => item !== source)
        : [...sources, source],
    );
  }
  async function continueFlow() {
    setBusy(true);
    const response = await fetch("/api/onboarding/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sources,
        talkText: sources.includes("TALK") ? talkText : undefined,
      }),
    });
    if (!response.ok) {
      setBusy(false);
      return;
    }
    if (sources.includes("SIMULATED_RECORD")) {
      await fetch("/api/documents/sample", {
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
    }
    router.push("/onboarding/upload");
  }
  return (
    <MobileShell onboarding>
      <div className="progress">
        ● ○ ○ ○ <span>Step 1 of 4</span>
      </div>
      <PageHeader
        title="Build your care plan"
        subtitle="Select one or more sources."
      />
      <div className="option-list">
        {[
          [
            "UPLOAD",
            "Upload documents",
            "Synthetic discharge letters and medication lists",
            Upload,
          ],
          [
            "SIMULATED_RECORD",
            "Connect health record",
            "Simulated for demo",
            ShieldCheck,
          ],
          [
            "TALK",
            "Talk it through",
            "Type your routine and life constraints",
            Mic,
          ],
        ].map(([key, title, text, Icon]) => (
          <button
            key={key as string}
            className={`source-option ${sources.includes(key as string) ? "selected" : ""}`}
            onClick={() => toggle(key as string)}
          >
            <Icon />
            <span>
              <strong>{title as string}</strong>
              <small>{text as string}</small>
            </span>
          </button>
        ))}
      </div>
      {sources.includes("TALK") && (
        <label className="field">
          Tell us about your life
          <textarea
            value={talkText}
            onChange={(event) => setTalkText(event.target.value)}
            placeholder="I work weekday mornings, look after my granddaughter on Tuesdays and Thursdays, prefer fewer reminders, and usually walk in the evening."
          />
        </label>
      )}
      <StatusBanner title="Use more than one option">
        CareLoad brings the selected synthetic sources together.
      </StatusBanner>
      <button
        className="primary-button"
        disabled={!sources.length || busy}
        onClick={continueFlow}
      >
        {busy ? "Saving…" : "Continue"}
      </button>
    </MobileShell>
  );
}

export function UploadScreen({
  initialDocuments,
}: {
  initialDocuments: DocumentRow[];
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
    setProgress("Reading instructions and linking candidate tasks to sources");
    sessionStorage.setItem("careloadDocumentIds", JSON.stringify(ids));
    router.push("/onboarding/processing");
  }
  async function removeDocument(id: string) {
    const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (response.ok)
      setDocuments(documents.filter((document) => document.id !== id));
    else setError("The document could not be removed. Please retry.");
  }
  return (
    <MobileShell onboarding>
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
        {busy ? "Working…" : "Process documents"}
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
  const [stage, setStage] = useState(0),
    [error, setError] = useState(""),
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
    const data = await response.json();
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
        `${failedNames.length ? failedNames.join(", ") : "One or more documents"} could not be extracted. Retry or use demo extraction.`,
      );
    }
    else router.push("/onboarding/review");
  }
  return (
    <MobileShell onboarding>
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
  const [rows, setRows] = useState(candidates),
    [answers, setAnswers] = useState(
      Object.fromEntries(
        facts.map((fact) => [
          fact.key,
          fact.answer === "UNANSWERED" ? "UNSURE" : fact.answer,
        ]),
      ),
    ),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function decide(id: string, decision: string) {
    const response = await fetch(`/api/candidates/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const data = await response.json();
    if (response.ok)
      setRows(
        rows.map((row) =>
          row.id === id ? { ...row, status: data.status } : row,
        ),
      );
  }
  async function continueFlow() {
    setBusy(true);
    if (rows.some((row) => row.status === "PENDING")) {
      setBusy(false);
      return;
    }
    await fetch("/api/onboarding/facts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    router.push("/onboarding/life-map");
  }
  async function confirmAll() {
    setBusy(true);
    const response = await fetch("/api/candidates/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "CONFIRMED" }),
    });
    const data = await response.json();
    if (response.ok) {
      const statuses = new Map<string, string>(
        data.candidates.map((candidate: { id: string; status: string }) => [
          candidate.id,
          candidate.status,
        ]),
      );
      setRows(
        rows.map((row) => ({
          ...row,
          status: statuses.get(row.id) ?? row.status,
        })),
      );
    }
    setBusy(false);
  }
  const unresolved = rows.filter(
    (row) => row.status === "NEEDS_CLINICAL_VERIFICATION",
  );
  return (
    <MobileShell onboarding>
      <div className="progress">
        ✓ ✓ ● ○ <span>Review tasks</span>
      </div>
      <PageHeader
        title="We found your care tasks"
        subtitle="Confirm whether each source-grounded candidate appears current."
      />
      {rows.some((row) => row.status === "PENDING") && (
        <button className="secondary-button" disabled={busy} onClick={confirmAll}>
          {busy ? "Confirming…" : "Confirm all current tasks"}
        </button>
      )}
      {rows.map((task) => (
        <RoundedCard key={task.id} className="candidate-card">
          <div className="candidate-head">
            <h2>{task.title}</h2>
            <span>{Math.round(task.confidence * 100)}% confidence</span>
          </div>
          <p>
            <strong>Source:</strong> {task.document.originalName} ·{" "}
            {task.document.issuingService ?? "Service not stated"}
          </p>
          <blockquote>“{task.sourceQuote}”</blockquote>
          <p>
            <strong>Timing:</strong> {task.explicitTiming ?? "Not explicit"} ·{" "}
            <strong>Frequency:</strong>{" "}
            {task.explicitFrequency ?? "Not explicit"}
          </p>
          {task.status === "PENDING" ? (
            <div className="decision-row">
              <button onClick={() => decide(task.id, "CONFIRMED")}>
                Confirm
              </button>
              <button onClick={() => decide(task.id, "OUTDATED")}>
                Outdated
              </button>
              <button onClick={() => decide(task.id, "UNSURE")}>
                Not sure
              </button>
              <a href={`/api/documents/source?id=${task.id}`} target="_blank">
                View source
              </a>
            </div>
          ) : (
            <button
              className="text-button"
              onClick={() =>
                setRows(
                  rows.map((row) =>
                    row.id === task.id ? { ...row, status: "PENDING" } : row,
                  ),
                )
              }
            >
              Change decision
            </button>
          )}
          <span className={`decision-status ${task.status.toLowerCase()}`}>
            {task.status.replaceAll("_", " ")}
          </span>
        </RoundedCard>
      ))}
      {unresolved.length > 0 && (
        <StatusBanner tone="amber" title="Needs clinical verification">
          {unresolved.length} unmatched task will remain visible and will not be
          scheduled.
        </StatusBanner>
      )}
      <RoundedCard>
        <SectionTitle>Confirm factual details</SectionTitle>
        <p>These answers are operational facts, not clinical validation.</p>
        {facts.map((fact) => (
          <label className="fact-row" key={fact.key}>
            {fact.label}
            <select
              value={answers[fact.key]}
              onChange={(event) =>
                setAnswers({ ...answers, [fact.key]: event.target.value })
              }
            >
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="UNSURE">Not sure</option>
            </select>
          </label>
        ))}
      </RoundedCard>
      <button
        className="primary-button"
        disabled={busy || rows.some((row) => row.status === "PENDING")}
        onClick={continueFlow}
      >
        Continue to Life Map
      </button>
    </MobileShell>
  );
}

export function PreviewScreen({
  plan,
  unresolvedCount,
}: {
  plan: PreviewPlan | null;
  unresolvedCount: number;
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(false);
  if (!plan)
    return (
      <MobileShell onboarding>
        <PageHeader title="Generate your first plan" />
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
    tasksOverlappingWork: number;
  };
  return (
    <MobileShell onboarding>
      <PageHeader
        title="Your first plan preview"
        subtitle="Generated by the deterministic CareLoad planner."
      />
      <div className="metric-grid">
        <span>
          <strong>{metrics.totalActions}</strong>actions
        </span>
        <span>
          <strong>{metrics.totalCareMinutes}</strong>minutes
        </span>
        <span>
          <strong>{metrics.totalCareMoments}</strong>moments
        </span>
      </div>
      <RoundedCard>
        <SectionTitle>Generated week</SectionTitle>
        {plan.items.slice(0, 12).map((item) => (
          <div className="preview-item" key={item.id}>
            <strong>
              {item.occurrenceDate} {item.startTime ?? "Unplaced"}
            </strong>
            <span>{item.task.title}</span>
          </div>
        ))}
      </RoundedCard>
      <StatusBanner title="Protected anchors retained">
        Work conflicts after planning: {metrics.tasksOverlappingWork}.
        Unresolved tasks: {unresolvedCount}.
      </StatusBanner>
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
        {busy ? "Accepting…" : "Accept plan"}
      </button>
      <SecondaryButton href="/onboarding/life-map">
        Adjust Life Map
      </SecondaryButton>
      {unresolvedCount > 0 && (
        <SecondaryButton href="/onboarding/review">
          Review unresolved item
        </SecondaryButton>
      )}
    </MobileShell>
  );
}
