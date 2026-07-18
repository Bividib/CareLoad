import { z } from "zod";
import {
  existingMatchInbox,
  type LocalPeerMessage,
  type MatchProfileId,
} from "@/domain/match/fixtures";

const storageKey = "careload.match.frontend-state.v1";
export const matchClientStateChangedEvent = "careload:match-state-changed";

const localPeerMessageSchema = z.object({
  id: z.string(),
  direction: z.literal("OUTGOING"),
  body: z.string(),
  deliveryState: z.literal("DELIVERED"),
});

const matchClientStateSchema = z.object({
  resetGeneration: z.string(),
  marcusRevealed: z.boolean(),
  readProfileIds: z.array(z.enum(["leila", "aisha", "marcus"])),
  messages: z.object({
    leila: z.array(localPeerMessageSchema).optional(),
    aisha: z.array(localPeerMessageSchema).optional(),
    marcus: z.array(localPeerMessageSchema).optional(),
  }),
});

export type MatchClientState = {
  marcusRevealed: boolean;
  readProfileIds: MatchProfileId[];
  messages: Partial<Record<MatchProfileId, LocalPeerMessage[]>>;
};

export const emptyMatchClientState: MatchClientState = {
  marcusRevealed: false,
  readProfileIds: [],
  messages: {},
};

function notifyMatchClientStateChanged() {
  window.dispatchEvent(new Event(matchClientStateChangedEvent));
}

function parseStoredState(value: string | null, resetGeneration: string): MatchClientState {
  if (!value) return emptyMatchClientState;
  try {
    const parsed = matchClientStateSchema.safeParse(JSON.parse(value));
    if (!parsed.success || parsed.data.resetGeneration !== resetGeneration) {
      window.localStorage.removeItem(storageKey);
      notifyMatchClientStateChanged();
      return emptyMatchClientState;
    }
    return parsed.data;
  } catch {
    window.localStorage.removeItem(storageKey);
    notifyMatchClientStateChanged();
    return emptyMatchClientState;
  }
}

export function readMatchClientState(resetGeneration: string): MatchClientState {
  return parseStoredState(window.localStorage.getItem(storageKey), resetGeneration);
}

export function readMatchNotificationState(): MatchClientState {
  const value = window.localStorage.getItem(storageKey);
  if (!value) return emptyMatchClientState;
  try {
    const parsed = matchClientStateSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : emptyMatchClientState;
  } catch {
    return emptyMatchClientState;
  }
}

export function countUnreadMatchConversations(state: MatchClientState): number {
  return existingMatchInbox.filter(
    (profile) => profile.unread && !state.readProfileIds.includes(profile.id),
  ).length;
}

function writeMatchClientState(
  state: MatchClientState,
  resetGeneration: string,
): MatchClientState {
  window.localStorage.setItem(storageKey, JSON.stringify({ ...state, resetGeneration }));
  notifyMatchClientStateChanged();
  return state;
}

export function markMatchConversationRead(
  profileId: MatchProfileId,
  resetGeneration: string,
): MatchClientState {
  const current = readMatchClientState(resetGeneration);
  if (current.readProfileIds.includes(profileId)) return current;
  return writeMatchClientState({
    ...current,
    readProfileIds: [...current.readProfileIds, profileId],
  }, resetGeneration);
}

export function revealMarcusMatch(resetGeneration: string): MatchClientState {
  const current = readMatchClientState(resetGeneration);
  if (current.marcusRevealed) return current;
  return writeMatchClientState({ ...current, marcusRevealed: true }, resetGeneration);
}

export function appendLocalPeerMessage(
  profileId: MatchProfileId,
  body: string,
  resetGeneration: string,
): MatchClientState {
  const current = readMatchClientState(resetGeneration);
  const existing = current.messages[profileId] ?? [];
  const message: LocalPeerMessage = {
    id: `local-${profileId}-${Date.now()}-${existing.length + 1}`,
    direction: "OUTGOING",
    body,
    deliveryState: "DELIVERED",
  };
  return writeMatchClientState({
    ...current,
    marcusRevealed: current.marcusRevealed || profileId === "marcus",
    readProfileIds: current.readProfileIds.includes(profileId)
      ? current.readProfileIds
      : [...current.readProfileIds, profileId],
    messages: { ...current.messages, [profileId]: [...existing, message] },
  }, resetGeneration);
}
