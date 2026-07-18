"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TriggerUpdateButton() {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <button className="primary-button" disabled={busy} onClick={async () => { setBusy(true); await fetch("/api/care-plan-changes/trigger", { method: "POST" }); router.refresh(); }}>{busy ? "Preparing update…" : "Load care-plan update"}</button>;
}
export function AcceptUpdateButton({ changeId }: { changeId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <button className="primary-button" disabled={busy} onClick={async () => { setBusy(true); const response = await fetch(`/api/care-plan-changes/${changeId}/accept`, { method: "POST" }); if (response.ok) router.push("/patient/today"); else setBusy(false); }}>{busy ? "Accepting…" : "Accept updated plan"}</button>;
}
export function ClarificationButton({ changeId }: { changeId: string }) {
  return <a className="secondary-button" href={`/patient/updates/${changeId}/clarify`}>Ask a question</a>;
}

export function ClarificationForm({ changeId }: { changeId: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendQuestion() {
    if (!question.trim()) return;
    setBusy(true);
    setError("");
    const response = await fetch("/api/clarifications/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ changeId, body: question.trim() }),
    });
    const body = await response.json() as { threadId?: string; error?: string };
    if (response.ok && body.threadId) {
      router.push(`/patient/messages/${body.threadId}`);
      return;
    }
    setBusy(false);
    setError(body.error ?? "Your question could not be sent. Please try again.");
  }

  return (
    <>
      <label className="field">
        What would you like to ask?
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="For example: How should I sit and position the cuff when taking a blood-pressure reading?"
        />
      </label>
      <p className="muted">Ask about the supplied demo instruction. Scheduling is handled by CareLoad.</p>
      {error && <p className="error-message" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy || !question.trim()} onClick={() => void sendQuestion()}>
        {busy ? "Sending…" : "Send question"}
      </button>
      <Link className="secondary-button" href={`/patient/updates/${changeId}`}>Back to update</Link>
    </>
  );
}
