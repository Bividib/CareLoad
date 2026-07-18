"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Info, Send, Sparkles, UserRound } from "lucide-react";
import { MobileShell, PageHeader, PrimaryButton, RoundedCard, SecondaryButton, SectionTitle } from "@/components/ui/CareLoadUI";

type MessageData = { id: string; author: "PATIENT" | "SIMULATED_CARE_TEAM"; body: string; metadataJson: string; createdAt: string };
type ThreadData = { id: string; subject: string; unread: boolean; messages: MessageData[]; jobs: Array<{ state: string }> };
type MessagesPayload = { threads: ThreadData[]; pending: boolean; unreadCount: number };

export function SendUpdateButton({ signalId, sendAnyway = false, secondary = false }: { signalId: string; sendAnyway?: boolean; secondary?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send() {
    setBusy(true);
    const response = await fetch("/api/daily-signals/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ signalId, sendAnyway }) });
    const body = await response.json() as { threadId?: string; error?: string };
    setBusy(false);
    if (!response.ok || !body.threadId) return setError(body.error ?? "Unable to send update.");
    router.push(`/patient/messages?thread=${body.threadId}`);
  }
  const label = <><Send />{busy ? "Sending…" : sendAnyway ? "Send anyway" : "Send update"}</>;
  return <>{error && <div className="error-message" role="alert">{error}</div>}{secondary ? <SecondaryButton onClick={() => void send()}>{label}</SecondaryButton> : <PrimaryButton onClick={() => void send()}>{label}</PrimaryButton>}</>;
}

export function MessagesClient({ initial, selectedId, planUpdate }: { initial: MessagesPayload; selectedId?: string; planUpdate?: { id: string; title: string } | null }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [toast, setToast] = useState("");
  const active = data.threads.find((thread) => thread.id === selectedId) ?? data.threads[0];
  useEffect(() => {
    if (!data.pending) return;
    const timer = setInterval(async () => {
      const next = await fetch("/api/messages", { cache: "no-store" }).then((response) => response.json() as Promise<MessagesPayload>);
      if (next.unreadCount > data.unreadCount) {
        setToast("A response has arrived.");
        router.refresh();
      }
      setData(next);
    }, 2000);
    return () => clearInterval(timer);
  }, [data.pending, data.unreadCount, router]);
  useEffect(() => { if (active?.unread) void fetch(`/api/messages/${active.id}/read`, { method: "POST" }); }, [active?.id, active?.unread]);
  return <MobileShell active="/patient/messages"><PageHeader title="Messages" subtitle="Messages in this synthetic demo" />
    {toast && <div className="toast" role="status">{toast}</div>}
    {!active ? <RoundedCard><SectionTitle>No messages yet</SectionTitle><p className="muted">A patient-approved update will appear here after it is sent.</p></RoundedCard> :
      <RoundedCard className="conversation-card">
        <div className="conversation-heading"><Sparkles /><strong>Your conversation</strong></div>
        <div className="day-divider"><span />Today<span /></div>
        {active.messages.map((message) => {
          const careTeam = message.author === "SIMULATED_CARE_TEAM";
          const clarification = active.subject === "Care-plan clarification";
          return <div key={message.id} className={`message ${careTeam ? "care-team" : "patient"}`}>
            <div className="message-author"><span className="round-icon mint">{careTeam ? <Sparkles /> : <UserRound />}</span><div><strong>{careTeam ? "Care Response Team" : "You"}</strong><small>{careTeam ? "Predefined simulated response" : clarification ? "Your question" : "Care update"} · {message.createdAt.slice(11, 16)}</small></div></div>
            <p>{message.body}</p>
            <span className="reviewed">Reviewed at {message.createdAt.slice(11, 16)} <CheckCheck /></span>
            {careTeam && <a className="meaning-link" href={`/patient/messages/${active.id}/today`}><Info /><span><strong>What this means for today</strong><small>Review the recorded next steps</small></span><b>›</b></a>}
            {careTeam && planUpdate && !clarification && <a className="update-message-link" href={`/patient/updates/${planUpdate.id}`}><span><strong>View your care-plan update</strong><small>{planUpdate.title}</small></span>›</a>}
          </div>;
        })}
        {active.jobs.some((job) => job.state === "PENDING") && <div className="response-wait" role="status"><span /> Awaiting response…<small>Typically within 10 seconds.</small></div>}
      </RoundedCard>}
    <div className="ai-note"><Sparkles /> No real care team is connected. Responses shown here are predefined and simulated.</div>
  </MobileShell>;
}
