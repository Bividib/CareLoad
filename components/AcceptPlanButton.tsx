"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptPlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function accept() {
    setBusy(true);
    const response = await fetch(`/api/plans/${planId}/accept`, { method: "POST" });
    if (response.ok) router.push("/patient/today");
    else setBusy(false);
  }
  return <button className="primary-button" onClick={accept} disabled={busy}>{busy ? "Accepting…" : "Accept proposed plan"}</button>;
}
