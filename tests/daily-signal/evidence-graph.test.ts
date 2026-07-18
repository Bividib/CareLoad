import { describe, expect, it } from "vitest";
import { buildDailySignalEvidenceGraph } from "@/domain/daily-signal/evidence-graph";
import { evaluateDailySignalDisposition } from "@/domain/daily-signal/disposition";
import { fixtureForText } from "@/domain/daily-signal/fixtures";
import { questionIdsForExtraction, selectQuestions } from "@/domain/daily-signal/questions";

const rawText = "My stomach has felt uncomfortable for three days, it is worse today, and it is affecting my usual activities.";

function graphFixture() {
  const extraction = fixtureForText(rawText);
  const questions = selectQuestions(questionIdsForExtraction(extraction), []);
  const answers = { BOWEL_DURATION: "3–5 days", DAILY_ACTIVITY_IMPACT: "Yes" };
  const disposition = evaluateDailySignalDisposition(extraction, answers);
  return buildDailySignalEvidenceGraph({ rawText, extraction, questions, answers, trendSummary: "stomach reported in 1 consecutive check-in.", disposition });
}

describe("Daily Signal evidence graph", () => {
  it("builds a stable source-grounded path to the deterministic outcome", () => {
    const graph = graphFixture();
    expect(graph).toEqual(graphFixture());
    expect(graph.outcome).toBe("SHARE_SUGGESTED");
    expect(graph.nodes.find((node) => node.type === "PATIENT_REPORT")?.detail).toBe(rawText);
    expect(graph.nodes.find((node) => node.type === "STRUCTURED_OBSERVATION")).toMatchObject({ title: "stomach", detail: "stomach discomfort reported", sourcePhrase: rawText });
    expect(graph.nodes.filter((node) => node.type === "FOLLOW_UP_ANSWER").map((node) => node.detail)).toEqual(["3–5 days", "Yes"]);
    expect(graph.nodes.some((node) => node.type === "RECENT_PATTERN" && node.detail === "This differs from recent check-ins.")).toBe(true);
    expect(graph.nodes.filter((node) => node.type === "DECISION_FACTOR")).toHaveLength(4);
    expect(graph.edges.filter((edge) => edge.to === "workflow-outcome" && edge.relation === "PRODUCES")).toHaveLength(4);
    expect(graph.nodes.find((node) => node.type === "WORKFLOW_OUTCOME")?.title).toBe("Sharing suggested");
    expect(JSON.stringify(graph)).not.toMatch(/timestamp|diagnos(ed|is)|recommended treatment/i);
  });
});
