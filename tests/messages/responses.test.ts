import { describe, expect, it } from "vitest";
import { clarificationKindForQuestion, classifyResponse, responseTemplates, simulatedResponseSchema } from "@/domain/messages/responses";

describe("simulated response policy", () => {
  it("validates every deterministic fallback template", () => {
    Object.values(responseTemplates).forEach((template) => expect(simulatedResponseSchema.parse(template)).toEqual(template));
  });
  it("selects response families deterministically", () => {
    expect(classifyResponse({ urgent: true, clarification: false, shareSuggested: true })).toBe("URGENT_TEMPLATE");
    expect(classifyResponse({ urgent: false, clarification: true, shareSuggested: false })).toBe("CLARIFICATION_APPROVED");
    expect(classifyResponse({ urgent: false, clarification: true, clarificationKind: "SCHEDULING_CONFLICT", shareSuggested: false })).toBe("CLARIFICATION_NO_CHANGE");
    expect(classifyResponse({ urgent: false, clarification: false, shareSuggested: true })).toBe("ROUTINE_REVIEW_OFFERED");
  });
  it("distinguishes instruction-use questions from actual scheduling conflicts", () => {
    expect(clarificationKindForQuestion("How should I sit when taking the reading?")).toBe("INSTRUCTION_USE");
    expect(clarificationKindForQuestion("The morning window conflicts with childcare.")).toBe("SCHEDULING_CONFLICT");
  });
  it("contains no prohibited reassurance or medication changes", () => {
    const content = JSON.stringify(responseTemplates).toLowerCase();
    expect(content).not.toContain("you are safe");
    expect(content).not.toContain("nothing serious");
    expect(content).not.toContain("change your medication");
  });
  it("keeps response fixtures concise, specific, and explicitly simulated", () => {
    expect(responseTemplates.ROUTINE_REVIEW_OFFERED.message).toContain("extra blood-pressure monitoring");
    expect(responseTemplates.ROUTINE_REVIEW_OFFERED.message).toContain("For this demo");
    expect(responseTemplates.CLARIFICATION_APPROVED.message).toContain("sit quietly for five minutes");
    expect(responseTemplates.CLARIFICATION_APPROVED.actionsForToday.join(" ")).toContain("simulated response");
    expect(responseTemplates.CLARIFICATION_NO_CHANGE.message).toContain("did not supply an alternative time");
    expect(responseTemplates.CLARIFICATION_NO_CHANGE.actionsForToday.join(" ")).toContain("active plan remains unchanged");
  });
});
