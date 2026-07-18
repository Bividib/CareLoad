"use client";

import { useState } from "react";
import { CircleHelp, GitBranch } from "lucide-react";
import type { DailySignalEvidenceGraph, DailySignalEvidenceNodeType } from "@/domain/daily-signal/evidence-graph";
import type { DailySignalAnalysisMode } from "@/lib/daily-signal";
import { RoundedCard } from "@/components/ui/CareLoadUI";

const nodesOfType = (graph: DailySignalEvidenceGraph, type: DailySignalEvidenceNodeType) => graph.nodes.filter((node) => node.type === type);

export function DailySignalEvidencePanel({ graph, analysisMode }: { graph: DailySignalEvidenceGraph; analysisMode: DailySignalAnalysisMode }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = "daily-signal-evidence-panel";
  const report = nodesOfType(graph, "PATIENT_REPORT");
  const observations = nodesOfType(graph, "STRUCTURED_OBSERVATION");
  const answers = nodesOfType(graph, "FOLLOW_UP_ANSWER");
  const recent = nodesOfType(graph, "RECENT_PATTERN");
  const factors = nodesOfType(graph, "DECISION_FACTOR");
  const outcomes = nodesOfType(graph, "WORKFLOW_OUTCOME");

  return <div className="evidence-explanation">
    <button className="evidence-toggle" type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded((value) => !value)}><CircleHelp /> Why this result?</button>
    {expanded && <div id={panelId}><RoundedCard className="evidence-panel">
      <div className="evidence-panel-heading"><GitBranch /><div><h2>How CareLoad reached this result</h2><p>CareLoad connected today&apos;s update with your confirmed answers and recent check-in context.</p></div></div>
      <div className="evidence-path">
        <EvidenceSection title="What you said" nodes={report} />
        <EvidenceSection title="Structured observation" nodes={observations} badge={analysisMode === "FIXTURE" ? "Validated fixture extraction" : "AI-structured observation"} />
        {answers.length > 0 && <EvidenceSection title="What you confirmed" nodes={answers} />}
        {recent.length > 0 && <EvidenceSection title="Recent context" nodes={recent} />}
        <EvidenceSection title="Decision factors" nodes={factors} />
        <EvidenceSection title="Workflow result" nodes={outcomes} />
      </div>
      <p className="evidence-safety">CareLoad has not diagnosed a condition or recommended treatment.</p>
    </RoundedCard></div>}
  </div>;
}

function EvidenceSection({ title, nodes, badge }: { title: string; nodes: DailySignalEvidenceGraph["nodes"]; badge?: string }) {
  return <section className="evidence-step">
    <div className="evidence-step-title"><h3>{title}</h3>{badge && <span>{badge}</span>}</div>
    {nodes.length === 0 ? <p className="muted">No additional detail was recorded.</p> : nodes.map((node) => <div className="evidence-node" key={node.id}>
      <strong>{node.title}</strong><p>{node.detail}</p>
      {node.sourcePhrase && node.sourcePhrase !== node.detail && <small>Source phrase: “{node.sourcePhrase}”</small>}
      {node.technicalLabel && <small>{node.technicalLabel}</small>}
    </div>)}
  </section>;
}
