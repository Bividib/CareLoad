import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DailyMatchScreen,
  MatchInboxScreen,
  PeerConversationScreen,
} from "@/components/MatchScreens";
import { BottomNavigation } from "@/components/ui/CareLoadUI";
import {
  existingMatchInbox,
  inboxPreview,
  matchProfiles,
} from "@/domain/match/fixtures";

const resetGeneration = "reset-1";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("Match navigation", () => {
  it("replaces Help with Match without changing Messages", () => {
    render(<BottomNavigation active="/patient/match" />);
    const navigation = screen.getByRole("navigation", { name: "Patient navigation" });
    expect(within(navigation).queryByRole("link", { name: "Help" })).not.toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "Match" })).toHaveAttribute("href", "/patient/match");
    expect(within(navigation).getByRole("link", { name: "Match" })).toHaveAttribute("aria-current", "page");
    expect(within(navigation).getByRole("link", { name: "Messages" })).toHaveAttribute("href", "/patient/messages");
  });

  it("keeps Match active on a nested conversation screen", () => {
    render(<PeerConversationScreen profile={matchProfiles.leila} resetGeneration={resetGeneration} />);
    expect(screen.getByRole("link", { name: "Match" })).toHaveAttribute("aria-current", "page");
  });
});

describe("Match inbox fixtures", () => {
  it("shows exactly Leila and Aisha as the two existing conversations", () => {
    render(<MatchInboxScreen resetGeneration={resetGeneration} />);
    expect(screen.getByText("2 new")).toBeVisible();
    expect(screen.getByRole("link", { name: "Notifications: 2 unread messages in Match" })).toHaveAttribute("href", "/patient/match");
    expect(screen.getByRole("link", { name: "Open conversation with Leila" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Open conversation with Aisha" })).toBeVisible();
    expect(screen.queryByText("Marcus")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reveal daily match" })).toHaveAttribute("href", "/patient/match/daily");
  });

  it("derives every inbox preview from the first opened message", () => {
    render(<MatchInboxScreen resetGeneration={resetGeneration} />);
    for (const profile of existingMatchInbox) {
      expect(inboxPreview(profile)).toBe(profile.incomingMessages[0]?.body);
      expect(screen.getByText(profile.incomingMessages[0].body)).toBeVisible();
    }
  });
});

describe.each([
  ["Leila", matchProfiles.leila],
  ["Aisha", matchProfiles.aisha],
] as const)("%s peer conversation", (_name, profile) => {
  it("opens with the same first message used by the inbox", () => {
    render(<PeerConversationScreen profile={profile} resetGeneration={resetGeneration} />);
    const conversation = screen.getByRole("region", { name: `Conversation with ${profile.name}` });
    expect(within(conversation).getByText(inboxPreview(profile))).toBeVisible();
  });
});

describe("local-only peer composer", () => {
  it("updates and removes the header notification as both fixture conversations are opened", async () => {
    const leila = render(<PeerConversationScreen profile={matchProfiles.leila} resetGeneration={resetGeneration} />);
    expect(await screen.findByRole("link", { name: "Notifications: 1 unread message in Match" })).toBeVisible();
    leila.unmount();

    render(<PeerConversationScreen profile={matchProfiles.aisha} resetGeneration={resetGeneration} />);
    const notification = await screen.findByRole("link", { name: "Notifications: no unread Match messages" });
    expect(notification).toBeVisible();
    expect(within(notification).queryByText("1")).not.toBeInTheDocument();
    expect(within(notification).queryByText("2")).not.toBeInTheDocument();
  });

  it("trims and appends replies without making a request", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<PeerConversationScreen profile={matchProfiles.leila} resetGeneration={resetGeneration} />);

    const input = screen.getByLabelText("Write a reply to Leila");
    const send = screen.getByRole("button", { name: "Send reply to Leila" });
    expect(send).toBeDisabled();

    fireEvent.change(input, { target: { value: "   Thank you — I’ve been struggling with that too.   " } });
    fireEvent.click(send);

    expect(screen.getByText("Thank you — I’ve been struggling with that too.")).toBeVisible();
    expect(screen.getByText("Delivered ✓✓")).toBeVisible();
    expect(input).toHaveValue("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends with Enter and keeps Shift+Enter available for a newline", () => {
    render(<PeerConversationScreen profile={matchProfiles.aisha} resetGeneration={resetGeneration} />);
    const input = screen.getByLabelText("Write a reply to Aisha");
    fireEvent.change(input, { target: { value: "A local reply" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(input).toHaveValue("A local reply");
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(screen.getByText("A local reply")).toBeVisible();
  });

  it("keeps a sent reply and clears the unread dot after navigation", async () => {
    const conversation = render(<PeerConversationScreen profile={matchProfiles.leila} resetGeneration={resetGeneration} />);
    fireEvent.change(screen.getByLabelText("Write a reply to Leila"), {
      target: { value: "A reply that should remain visible" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reply to Leila" }));
    conversation.unmount();

    const inbox = render(<MatchInboxScreen resetGeneration={resetGeneration} />);
    const leila = await screen.findByRole("link", { name: "Open conversation with Leila" });
    expect(await within(leila).findByText("A reply that should remain visible")).toBeVisible();
    expect(within(leila).queryByLabelText("Unread conversation")).not.toBeInTheDocument();
    expect(screen.getByText("1 new")).toBeVisible();
    inbox.unmount();

    render(<PeerConversationScreen profile={matchProfiles.leila} resetGeneration={resetGeneration} />);
    expect(await screen.findByText("A reply that should remain visible")).toBeVisible();
  });

  it("moves a revealed and messaged Marcus into the inbox", async () => {
    const daily = render(<DailyMatchScreen resetGeneration={resetGeneration} />);
    daily.unmount();

    const conversation = render(<PeerConversationScreen profile={matchProfiles.marcus} resetGeneration={resetGeneration} />);
    fireEvent.change(screen.getByLabelText("Write a reply to Marcus"), {
      target: { value: "Hi Marcus, this felt familiar." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reply to Marcus" }));
    conversation.unmount();

    render(<MatchInboxScreen resetGeneration={resetGeneration} />);
    expect(await screen.findByRole("link", { name: "Open conversation with Marcus" })).toBeVisible();
    expect(await screen.findByText("Hi Marcus, this felt familiar.")).toBeVisible();
    expect(screen.queryByRole("link", { name: "Reveal daily match" })).not.toBeInTheDocument();
  });

  it("clears persisted Match progress when the demo database generation changes", async () => {
    const conversation = render(
      <PeerConversationScreen
        profile={matchProfiles.marcus}
        resetGeneration="before-reset"
      />,
    );
    fireEvent.change(screen.getByLabelText("Write a reply to Marcus"), {
      target: { value: "This belongs to the previous demo run." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reply to Marcus" }));
    conversation.unmount();

    render(<MatchInboxScreen resetGeneration="after-reset" />);

    expect(await screen.findByText("2 new")).toBeVisible();
    expect(screen.queryByRole("link", { name: "Open conversation with Marcus" })).not.toBeInTheDocument();
    expect(screen.queryByText("This belongs to the previous demo run.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reveal daily match" })).toBeVisible();
  });
});

describe("Daily Match", () => {
  it("presents Marcus, the shared reasons, and honest prototype controls", () => {
    render(<DailyMatchScreen resetGeneration={resetGeneration} />);
    expect(screen.getByRole("heading", { name: "Marcus" })).toBeVisible();
    expect(screen.getByText("Strong match")).toBeVisible();
    expect(screen.getByText("Similar treatment stage")).toBeVisible();
    expect(screen.getByText("Both wanted practical support")).toBeVisible();
    expect(screen.getByText(/not predicted medical outcomes/)).toBeVisible();
    expect(screen.getByText("Leila")).toBeVisible();
    expect(screen.getByText("Existing conversation")).toBeVisible();
    expect(screen.getByRole("link", { name: "Send a message" })).toHaveAttribute("href", "/patient/match/marcus");
    expect(screen.getByText(/Fictional composite profiles/)).toBeVisible();
  });

  it("does not show a story-listening control", () => {
    render(<DailyMatchScreen resetGeneration={resetGeneration} />);
    expect(screen.queryByRole("button", { name: "Listen to story" })).not.toBeInTheDocument();
    expect(screen.queryByText("Prototype audio preview")).not.toBeInTheDocument();
  });
});
