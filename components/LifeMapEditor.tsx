"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FrictionChip, LifeAnchorRow, PrimaryButton, RoundedCard, SectionTitle } from "@/components/ui/CareLoadUI";

type Anchor = { id: string; title: string; startTime: string; endTime: string };
type Friction = { id: string; category: string; description: string; enabled: boolean };

export function LifeMapEditor({ anchors: initialAnchors, frictions: initialFrictions }: { anchors: Anchor[]; frictions: Friction[] }) {
  const router = useRouter();
  const [anchors, setAnchors] = useState(initialAnchors);
  const [frictions, setFrictions] = useState(initialFrictions);
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const response = await fetch("/api/life-map", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anchors, frictions, newFriction: description || undefined }),
    });
    setBusy(false);
    if (response.ok) { setSaved(true); setDescription(""); router.refresh(); }
  }

  return <>
    <RoundedCard>
      <SectionTitle action="Edit">Daily anchors</SectionTitle>
      <p className="muted">The regular parts of your day we build around.</p>
      {anchors.map((anchor) => <div key={anchor.id} className="editable-anchor"><LifeAnchorRow title={anchor.title} time={`${anchor.startTime} – ${anchor.endTime}`} /><label>Start<input aria-label={`${anchor.title} start`} type="time" value={anchor.startTime} onChange={(event) => setAnchors(anchors.map((item) => item.id === anchor.id ? { ...item, startTime: event.target.value } : item))} /></label><label>End<input aria-label={`${anchor.title} end`} type="time" value={anchor.endTime} onChange={(event) => setAnchors(anchors.map((item) => item.id === anchor.id ? { ...item, endTime: event.target.value } : item))} /></label></div>)}
      <button className="text-button" onClick={() => setAnchors([...anchors, { id: `new-${Date.now()}`, title: "New life anchor", startTime: "12:00", endTime: "12:30" }])}>+ Add an anchor</button>
    </RoundedCard>
    <RoundedCard><SectionTitle>Priorities to protect</SectionTitle><div className="priority-grid"><span>Family time<small>Every day</small></span><span>Work<small>Stay focused</small></span><span>Rest<small>Recharge daily</small></span></div></RoundedCard>
    <RoundedCard>
      <SectionTitle>Friction factors</SectionTitle><p className="muted">What gets in the way so we can plan better.</p>
      <div className="chips">{["TIME","LOCATION","PHYSICAL","COGNITIVE","EMOTIONAL","SOCIAL","FINANCIAL"].map((category) => <button key={category} onClick={() => setFrictions(frictions.map((item) => item.category === category ? { ...item, enabled: !item.enabled } : item))}><FrictionChip selected={frictions.some((item) => item.category === category && item.enabled)}>{category[0] + category.slice(1).toLowerCase()}</FrictionChip></button>)}</div>
      <div className="selected-frictions">{frictions.filter((item) => item.enabled).map((item) => <span key={item.id}>{item.description}</span>)}</div>
      <label className="field">Add a friction description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="For example, public transport is unreliable" /></label>
    </RoundedCard>
    {saved && <p className="save-message" role="status">Life Map saved. A proposed plan was created for review; your active plan is unchanged.</p>}
    <PrimaryButton type="button"><span onClick={save}>{busy ? "Saving…" : "Save my Life Map"}</span></PrimaryButton>
  </>;
}
