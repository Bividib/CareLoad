"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { RoundedCard, SectionTitle } from "@/components/ui/CareLoadUI";

type Anchor = { id: string; title: string; startTime: string; endTime: string; weekdays: string };
type Friction = { id: string; category: string; description: string; enabled: boolean };

export function LifeMapEditor({
  anchors: initialAnchors,
  frictions,
  onboarding = false,
}: {
  anchors: Anchor[];
  frictions: Friction[];
  onboarding?: boolean;
}) {
  const router = useRouter();
  const [anchors, setAnchors] = useState(() => initialAnchors.map((anchor) => ({
    ...anchor,
    weekdays: anchor.weekdays === "SAT,SUN"
      ? anchor.weekdays
      : anchor.weekdays === "MON,TUE,WED,THU,FRI"
        ? anchor.weekdays
        : "MON,TUE,WED,THU,FRI,SAT,SUN",
  })));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saveButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (saveButton.current) saveButton.current.dataset.hydrated = "true";
  }, []);

  function updateAnchor(id: string, update: Partial<Anchor>) {
    setAnchors((current) => current.map((anchor) => anchor.id === id ? { ...anchor, ...update } : anchor));
  }

  function addAnchor() {
    setAnchors((current) => [...current, {
      id: `new-${Date.now()}`,
      title: "",
      startTime: "12:00",
      endTime: "12:30",
      weekdays: "MON,TUE,WED,THU,FRI,SAT,SUN",
    }]);
  }

  async function save() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/life-map", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anchors, frictions }),
    });
    const body = await response.json() as { planId?: string; error?: string };
    setBusy(false);
    if (response.ok && body.planId) {
      if (onboarding) router.push("/onboarding/preview");
      else router.push("/patient/life-map/preview");
    } else {
      setError(body.error ?? "Check that every routine has a name, start time, and end time.");
    }
  }

  return <>
    <RoundedCard className="life-routines-card">
      <SectionTitle>Your regular routines</SectionTitle>
      <p className="muted">CareLoad protects these times when it builds your plan.</p>
      <div className="routine-list">
        {anchors.map((anchor, index) => <div key={anchor.id} className="routine-editor">
          <span className="routine-icon"><CalendarDays /></span>
          <div className="routine-fields">
            <label>Routine name
              <input aria-label={`Routine ${index + 1} name`} value={anchor.title} onChange={(event) => updateAnchor(anchor.id, { title: event.target.value })} placeholder="For example, School run" />
            </label>
            <div className="routine-times">
              <label>Starts<input aria-label={`${anchor.title || `Routine ${index + 1}`} start`} type="time" value={anchor.startTime} onChange={(event) => updateAnchor(anchor.id, { startTime: event.target.value })} /></label>
              <label>Ends<input aria-label={`${anchor.title || `Routine ${index + 1}`} end`} type="time" value={anchor.endTime} onChange={(event) => updateAnchor(anchor.id, { endTime: event.target.value })} /></label>
            </div>
            <label>Days
              <select aria-label={`${anchor.title || `Routine ${index + 1}`} days`} value={anchor.weekdays} onChange={(event) => updateAnchor(anchor.id, { weekdays: event.target.value })}>
                <option value="MON,TUE,WED,THU,FRI,SAT,SUN">Every day</option>
                <option value="MON,TUE,WED,THU,FRI">Weekdays only</option>
                <option value="SAT,SUN">Weekends</option>
              </select>
            </label>
            {(!anchor.startTime || !anchor.endTime) && <small className="muted">Choose the exact start and end time before continuing.</small>}
          </div>
          <button className="remove-routine" aria-label={`Remove ${anchor.title || `routine ${index + 1}`}`} onClick={() => setAnchors((current) => current.filter((item) => item.id !== anchor.id))}><Trash2 /></button>
        </div>)}
      </div>
      <button className="add-routine" onClick={addAnchor}><Plus /> Add another routine</button>
    </RoundedCard>
    <RoundedCard className="priority-card">
      <SectionTitle>What this protects</SectionTitle>
      <div className="priority-grid"><span>Family time<small>Keep routines clear</small></span><span>Work<small>Avoid interruptions</small></span><span>Rest<small>Leave breathing room</small></span></div>
    </RoundedCard>
    {error && <p className="error-message" role="alert">{error}</p>}
    <button ref={saveButton} data-hydrated="false" className="primary-button" type="button" onClick={save} disabled={busy || anchors.some((anchor) => !anchor.title.trim() || !anchor.startTime || !anchor.endTime)}>{busy ? "Building your plan…" : onboarding ? "Looks right, build my plan" : "Save changes"}</button>
  </>;
}
