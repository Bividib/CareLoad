"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Sparkles } from "lucide-react";
import { MobileShell, PageHeader, PrimaryButton, RoundedCard, SectionTitle } from "@/components/ui/CareLoadUI";

type MessageData = { id: string; author: "PATIENT" | "SIMULATED_CARE_TEAM"; body: string; metadataJson: string; createdAt: string };
type ThreadData = { id: string; subject: string; unread: boolean; messages: MessageData[]; jobs: Array<{ state: string }> };
type MessagesPayload = { threads: ThreadData[]; pending: boolean; unreadCount: number };

export function SendUpdateButton({ signalId }: { signalId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send() {
    setBusy(true);
    const response = await fetch("/api/daily-signals/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ signalId }) });
    const body = await response.json() as { threadId?: string; error?: string };
    setBusy(false);
    if (!response.ok || !body.threadId) return setError(body.error ?? "Unable to send update.");
    router.push(`/patient/messages?thread=${body.threadId}`);
  }
  return <>{error && <div className="error-message" role="alert">{error}</div>}<PrimaryButton><span onClick={() => void send()}>{busy ? "Sending…" : "Send update"}</span></PrimaryButton></>;
}

export function MessagesClient({ initial, selectedId }: { initial: MessagesPayload; selectedId?: string }) {
  const [data, setData] = useState(initial);
  const [toast, setToast] = useState("");
  const active = data.threads.find((thread) => thread.id === selectedId) ?? data.threads[0];
  useEffect(() => {
    if (!data.pending) return;
    const timer = setInterval(async () => {
      const next = await fetch("/api/messages", { cache: "no-store" }).then((response) => response.json() as Promise<MessagesPayload>);
      if (next.unreadCount > data.unreadCount) setToast("A simulated response has arrived.");
      setData(next);
    }, 2000);
    return () => clearInterval(timer);
  }, [data.pending, data.unreadCount]);
  useEffect(() => { if (active?.unread) void fetch(`/api/messages/${active.id}/read`, { method: "POST" }); }, [active?.id, active?.unread]);
  return <MobileShell active="/patient/messages"><PageHeader title="Messages" subtitle="Synthetic demo conversation — nothing leaves this application." />
    {toast && <div className="toast" role="status">{toast}</div>}
    {!active ? <RoundedCard><SectionTitle>No messages yet</SectionTitle><p className="muted">A patient-approved update will appear here after it is sent.</p></RoundedCard> :
      <RoundedCard><SectionTitle>{active.subject}</SectionTitle>{active.messages.map((message) => <div key={message.id} className={`message ${message.author === "PATIENT" ? "patient" : "simulated"}`}><strong>{message.author === "PATIENT" ? "You" : <><Sparkles /> Simulated care-team response</>}</strong><small>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small><p>{message.body}</p>{message.author === "SIMULATED_CARE_TEAM" && (() => { const meta = JSON.parse(message.metadataJson) as { actionsForToday?: string[] }; return <div className="meaning"><Info /><div><strong>What this means for today</strong><ul>{meta.actionsForToday?.map((item) => <li key={item}>{item}</li>)}</ul></div></div>; })()}</div>)}
      {active.jobs.some((job) => job.state === "PENDING") && <div className="response-wait" role="status"><span /> Awaiting fictional response…</div>}</RoundedCard>}
    <div className="ai-note"><Sparkles /> Responses are clearly fictional. Approved templates may be AI-reworded, but cannot diagnose, change medication, or alter the active plan.</div>
  </MobileShell>;
}
