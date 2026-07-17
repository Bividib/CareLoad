export type CandidateDecision = "CONFIRMED" | "OUTDATED" | "UNSURE";
export function transitionCandidate(current: string, decision: CandidateDecision) {
  if (!["PENDING", "CONFIRMED", "OUTDATED", "UNSURE", "NEEDS_CLINICAL_VERIFICATION"].includes(current)) throw new Error("Unknown candidate status.");
  return decision;
}
