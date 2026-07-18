"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  HeartHandshake,
  Send,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { MobileShell } from "@/components/ui/CareLoadUI";
import {
  dailyMatch,
  existingMatchInbox,
  inboxPreview,
  type LocalPeerMessage,
  type MatchProfile,
} from "@/domain/match/fixtures";
import {
  appendLocalPeerMessage,
  emptyMatchClientState,
  markMatchConversationRead,
  readMatchClientState,
  revealMarcusMatch,
  type MatchClientState,
} from "@/domain/match/client-state";

function MatchAvatar({
  profile,
  size = "medium",
}: {
  profile: MatchProfile;
  size?: "small" | "medium" | "large";
}) {
  return (
    <span
      className={`match-avatar avatar-${profile.avatarVariant} avatar-${size}`}
      aria-hidden="true"
    >
      {profile.name.slice(0, 1)}
    </span>
  );
}

function MatchDisclaimer() {
  return (
    <p className="match-disclaimer">
      Fictional composite profiles for this synthetic prototype. Peer experiences
      are not medical advice.
    </p>
  );
}

export function MatchInboxScreen({ resetGeneration }: { resetGeneration: string }) {
  const [clientState, setClientState] = useState<MatchClientState>(emptyMatchClientState);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setClientState(readMatchClientState(resetGeneration));
    });
    return () => {
      cancelled = true;
    };
  }, [resetGeneration]);

  const inboxProfiles: MatchProfile[] = clientState.marcusRevealed
    ? [...existingMatchInbox, dailyMatch.profile]
    : [...existingMatchInbox];
  const unreadCount = existingMatchInbox.filter(
    (profile) => profile.unread && !clientState.readProfileIds.includes(profile.id),
  ).length;

  return (
    <MobileShell active="/patient/match">
      <header className="match-page-heading">
        <span className="match-heading-icon"><UsersRound /></span>
        <div>
          <h1>Match</h1>
          <p>Stories from people with similar treatment experiences.</p>
        </div>
      </header>

      <div className="match-inbox-title">
        <h2>Inbox</h2>
        <span>{unreadCount ? `${unreadCount} new` : "All caught up"}</span>
      </div>

      <div className="match-inbox-list">
        {inboxProfiles.map((profile) => {
          const localMessages = clientState.messages[profile.id] ?? [];
          const latestLocalMessage = localMessages.at(-1);
          const preview = latestLocalMessage?.body
            ?? (profile.incomingMessages.length
              ? inboxPreview(profile)
              : "You matched today — say hello.");
          const unread = profile.unread && !clientState.readProfileIds.includes(profile.id);
          return (
          <Link
            className="match-preview-card"
            href={`/patient/match/${profile.id}`}
            key={profile.id}
            aria-label={`Open conversation with ${profile.name}`}
          >
            <MatchAvatar profile={profile} />
            <div className="match-preview-copy">
              <strong>{profile.name}</strong>
              <p>{preview}</p>
            </div>
            <div className="match-preview-meta">
              <time>{latestLocalMessage ? "Now" : profile.previewTime}</time>
              {unread && <span className="unread-dot" aria-label="Unread conversation" />}
            </div>
          </Link>
          );
        })}
      </div>

      {!clientState.marcusRevealed && (
        <Link className="match-reveal-button" href="/patient/match/daily">
          <Sparkles />
          Reveal daily match
        </Link>
      )}
      <MatchDisclaimer />
    </MobileShell>
  );
}

function PeerProfileHeader({
  profile,
  daily = false,
}: {
  profile: MatchProfile;
  daily?: boolean;
}) {
  return (
    <>
      <Link className="match-back-link" href="/patient/match">
        <ArrowLeft />
        Back to Match
      </Link>
      <section className="peer-profile-header">
        <MatchAvatar profile={profile} size="large" />
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.treatmentLabel} · {profile.treatmentStage}</p>
          <span className="match-status-badge">
            {daily ? <Star /> : <HeartHandshake />}
            {daily ? "Daily match" : profile.statusLabel}
          </span>
        </div>
      </section>
    </>
  );
}

function PeerComposer({
  profile,
  resetGeneration,
  emptyState = false,
}: {
  profile: MatchProfile;
  resetGeneration: string;
  emptyState?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<LocalPeerMessage[]>([]);

  useEffect(() => {
    const state = markMatchConversationRead(profile.id, resetGeneration);
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setMessages(state.messages[profile.id] ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.id, resetGeneration]);

  function send() {
    const body = draft.trim();
    if (!body) return;
    const state = appendLocalPeerMessage(profile.id, body, resetGeneration);
    setMessages(state.messages[profile.id] ?? []);
    setDraft("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <>
      {emptyState && messages.length === 0 && (
        <section className="match-empty-conversation">
          <Sparkles />
          <h2>You matched today</h2>
          <p>
            Start with a simple hello or share what part of Marcus’s experience
            felt familiar.
          </p>
        </section>
      )}

      <div className="peer-local-messages" aria-live="polite">
        {messages.map((message) => (
          <article className="peer-message outgoing" key={message.id}>
            <p>{message.body}</p>
            <small>Delivered ✓✓</small>
          </article>
        ))}
      </div>

      <form className="peer-composer" onSubmit={submit}>
        <label className="sr-only" htmlFor={`reply-${profile.id}`}>
          Write a reply to {profile.name}
        </label>
        <textarea
          id={`reply-${profile.id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a reply…"
          rows={1}
        />
        <button type="submit" disabled={!draft.trim()} aria-label={`Send reply to ${profile.name}`}>
          <Send />
        </button>
      </form>
      <p className="composer-hint">Enter to send · Shift+Enter for a new line</p>
    </>
  );
}

export function PeerConversationScreen({
  profile,
  resetGeneration,
}: {
  profile: MatchProfile;
  resetGeneration: string;
}) {
  const isMarcus = profile.id === "marcus";
  return (
    <MobileShell active="/patient/match">
      <PeerProfileHeader profile={profile} daily={isMarcus} />

      {!isMarcus && (
        <section className="peer-conversation" aria-label={`Conversation with ${profile.name}`}>
          <div className="peer-day-divider"><span />Today<span /></div>
          {profile.incomingMessages.map((message) => (
            <article className="peer-message incoming" key={message.id}>
              <MatchAvatar profile={profile} size="small" />
              <div>
                <p>{message.body}</p>
                <time>{message.time}</time>
              </div>
            </article>
          ))}
        </section>
      )}

      <PeerComposer
        profile={profile}
        resetGeneration={resetGeneration}
        emptyState={isMarcus}
      />
      <MatchDisclaimer />
    </MobileShell>
  );
}

export function DailyMatchScreen({ resetGeneration }: { resetGeneration: string }) {
  const marcus = dailyMatch.profile;

  useEffect(() => {
    revealMarcusMatch(resetGeneration);
  }, [resetGeneration]);

  return (
    <MobileShell active="/patient/match">
      <header className="match-page-heading daily-heading">
        <span className="match-heading-icon"><UsersRound /></span>
        <div><h1>Daily match</h1></div>
      </header>

      <section className="daily-match-card">
        <div className="daily-match-profile">
          <div className="daily-avatar-reveal">
            <MatchAvatar profile={marcus} size="large" />
          </div>
          <div>
            <h2>Marcus</h2>
            <div className="daily-match-badges">
              <span>{marcus.treatmentStage}</span>
              <strong><Star />Strong match</strong>
            </div>
          </div>
        </div>

        <p className="daily-match-description">{dailyMatch.description}</p>

        <div className="common-experiences">
          <h3>What you have in common</h3>
          {dailyMatch.commonExperiences.map((experience, index) => (
            <div style={{ "--match-row": index } as React.CSSProperties} key={experience}>
              <Check />
              <span>{experience}</span>
            </div>
          ))}
        </div>

        <p className="match-basis-note">
          This match is based on shared reported experiences, not predicted
          medical outcomes.
        </p>

        <Link className="match-primary-action" href="/patient/match/marcus">
          <Send />
          Send a message
        </Link>
      </section>

      <Link className="existing-match-link" href="/patient/match/leila">
        <MatchAvatar profile={existingMatchInbox[0]} />
        <span>
          <small>Existing conversation</small>
          <strong>Leila</strong>
          <em>{existingMatchInbox[0].treatmentStage}</em>
        </span>
        <ChevronRight />
      </Link>
      <MatchDisclaimer />
    </MobileShell>
  );
}
