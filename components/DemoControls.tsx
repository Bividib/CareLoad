"use client";
import { useState } from "react";
import { checkpointNames } from "@/lib/demo-checkpoints";

export function DemoControls({ fixtureMode }: { fixtureMode: boolean }) {
  const [status, setStatus] = useState("");
  async function action(path: string, body?: unknown) {
    setStatus("Working…");
    const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    setStatus(response.ok ? "Done. Refresh to inspect the seeded state." : "Action failed. Try reset.");
  }
  return <div className="demo-controls">
    <button onClick={() => void action("/api/demo/reset", { confirmSyntheticReset: true })}>Reset database</button>
    <label>Checkpoint<select onChange={(event) => { if (event.target.value) void action("/api/demo/checkpoint", { checkpoint: event.target.value }); }} defaultValue=""><option value="">Choose…</option>{checkpointNames.map((name) => <option key={name}>{name}</option>)}</select></label>
    <button onClick={() => void action("/api/care-plan-changes/trigger")}>Trigger synthetic update</button>
    <button onClick={() => void action("/api/demo/process-responses")}>Process response jobs</button>
    <button onClick={() => void action("/api/demo/settings", { fixtureMode: !fixtureMode })}>Turn fixture mode {fixtureMode ? "off" : "on"}</button>
    <p role="status">{status}</p>
  </div>;
}
