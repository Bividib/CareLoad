"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  countUnreadMatchConversations,
  emptyMatchClientState,
  matchClientStateChangedEvent,
  readMatchNotificationState,
} from "@/domain/match/client-state";

const initialUnreadCount = countUnreadMatchConversations(emptyMatchClientState);

function notificationLabel(unreadCount: number) {
  if (unreadCount === 0) return "Notifications: no unread Match messages";
  return `Notifications: ${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"} in Match`;
}

export function MatchNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const refresh = () => setUnreadCount(countUnreadMatchConversations(readMatchNotificationState()));
    refresh();
    window.addEventListener(matchClientStateChangedEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(matchClientStateChangedEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const label = notificationLabel(unreadCount);
  return <Link className="icon-button bell" href="/patient/match" aria-label={label} title={label}>
    <Bell />
    {unreadCount > 0 && <span className="notification-badge" aria-hidden="true">{unreadCount}</span>}
  </Link>;
}
