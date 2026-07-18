"use client";
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
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <button className="secondary-button" disabled={busy} onClick={async () => { setBusy(true); const response = await fetch("/api/clarifications/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changeId, body: "The Thursday evening measurement conflicts with Eleanor’s childcare commitment. Is another approved time within the existing clinical requirements available?" }) }); const body = await response.json() as { threadId?: string }; if (body.threadId) router.push(`/patient/messages/${body.threadId}`); else setBusy(false); }}>{busy ? "Sending…" : "Ask for clarification"}</button>;
}
