import { describe, expect, it } from "vitest";
import { classifyResponse, responseTemplates, simulatedResponseSchema } from "@/domain/messages/responses";

describe("simulated response policy", () => {
  it("validates every deterministic fallback template", () => {
    Object.values(responseTemplates).forEach((template) => expect(simulatedResponseSchema.parse(template)).toEqual(template));
  });
  it("selects response families deterministically", () => {
    expect(classifyResponse({ urgent: true, clarification: false, shareSuggested: true })).toBe("URGENT_TEMPLATE");
    expect(classifyResponse({ urgent: false, clarification: true, shareSuggested: false })).toBe("CLARIFICATION_APPROVED");
    expect(classifyResponse({ urgent: false, clarification: false, shareSuggested: true })).toBe("ROUTINE_REVIEW_OFFERED");
  });
  it("contains no prohibited reassurance or medication changes", () => {
    const content = JSON.stringify(responseTemplates).toLowerCase();
    expect(content).not.toContain("you are safe");
    expect(content).not.toContain("nothing serious");
    expect(content).not.toContain("change your medication");
  });
});
