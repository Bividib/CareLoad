import type { DailySignalDisposition } from "./disposition";
import type { QuestionDefinition } from "./questions";
import type { DailySignalExtraction } from "./schema";

export type DailySignalEvidenceNodeType =
  | "PATIENT_REPORT"
  | "STRUCTURED_OBSERVATION"
  | "FOLLOW_UP_ANSWER"
  | "RECENT_PATTERN"
  | "DECISION_FACTOR"
  | "WORKFLOW_OUTCOME";

export type DailySignalEvidenceNode = {
  id: string;
  type: DailySignalEvidenceNodeType;
  title: string;
  detail: string;
  sourcePhrase?: string;
  technicalLabel?: string;
};

export type DailySignalEvidenceRelation = "STRUCTURED_AS" | "SUPPORTED_BY" | "ANSWERED_BY" | "COMPARED_WITH" | "CONTRIBUTES_TO" | "PRODUCES";

export type DailySignalEvidenceEdge = {
  id: string;
  from: string;
  to: string;
  relation: DailySignalEvidenceRelation;
};

export type DailySignalEvidenceGraph = {
  nodes: DailySignalEvidenceNode[];
  edges: DailySignalEvidenceEdge[];
  outcome: DailySignalDisposition["outcome"];
};

export function buildDailySignalEvidenceGraph(input: {
  rawText: string;
  extraction: DailySignalExtraction;
  questions: QuestionDefinition[];
  answers: Record<string, string>;
  trendSummary: string | null;
  disposition: DailySignalDisposition;
}): DailySignalEvidenceGraph {
  const nodes: DailySignalEvidenceNode[] = [{ id: "patient-report", type: "PATIENT_REPORT", title: "What you said", detail: input.rawText }];
  const edges: DailySignalEvidenceEdge[] = [];

  input.extraction.observations.forEach((observation, index) => {
    const id = `observation-${index}`;
    nodes.push({ id, type: "STRUCTURED_OBSERVATION", title: observation.domain, detail: observation.value, sourcePhrase: observation.sourcePhrase, technicalLabel: observation.trend === "WORSE" ? "Worse today" : observation.trend });
    edges.push({ id: `edge-report-${id}`, from: "patient-report", to: id, relation: "STRUCTURED_AS" });
  });

  input.questions.forEach((question) => {
    const answer = input.answers[question.id];
    if (answer) nodes.push({ id: `answer-${question.id}`, type: "FOLLOW_UP_ANSWER", title: question.text, detail: answer, technicalLabel: question.id });
  });

  const informativeTrend = Boolean(input.trendSummary && input.trendSummary !== "No new observations were recorded.");
  const hasRecentPattern = input.extraction.differentFromRecentPattern || informativeTrend;
  if (hasRecentPattern) {
    nodes.push({ id: "recent-pattern", type: "RECENT_PATTERN", title: "Recent context", detail: input.extraction.differentFromRecentPattern ? "This differs from recent check-ins." : input.trendSummary ?? "Recent check-in context was available.", technicalLabel: input.trendSummary ?? undefined });
  }

  input.disposition.factors.forEach((factor) => {
    const factorId = `decision-${factor.id}`;
    nodes.push({ id: factorId, type: "DECISION_FACTOR", title: factor.label, detail: factor.value, technicalLabel: factor.code });
    if (factor.answerId && input.answers[factor.answerId]) {
      edges.push({ id: `edge-answer-${factor.id}`, from: `answer-${factor.answerId}`, to: factorId, relation: "CONTRIBUTES_TO" });
    } else if (factor.source === "LONGITUDINAL_CONTEXT" && hasRecentPattern) {
      edges.push({ id: `edge-recent-${factor.id}`, from: "recent-pattern", to: factorId, relation: "COMPARED_WITH" });
    } else if (factor.observationDomain) {
      const observationIndex = input.extraction.observations.findIndex((item) => item.domain === factor.observationDomain);
      if (observationIndex >= 0) edges.push({ id: `edge-observation-${factor.id}`, from: `observation-${observationIndex}`, to: factorId, relation: "CONTRIBUTES_TO" });
    }
  });

  const outcomeTitle = input.disposition.outcome === "SHARE_SUGGESTED" ? "Sharing suggested" : input.disposition.outcome === "RECORD_ONLY" ? "Recorded only" : "Configured demonstration rule";
  nodes.push({ id: "workflow-outcome", type: "WORKFLOW_OUTCOME", title: outcomeTitle, detail: input.disposition.reason, technicalLabel: "Final decision: deterministic workflow rule" });
  input.disposition.factors.forEach((factor) => edges.push({ id: `edge-outcome-${factor.id}`, from: `decision-${factor.id}`, to: "workflow-outcome", relation: "PRODUCES" }));

  return { nodes, edges, outcome: input.disposition.outcome };
}
