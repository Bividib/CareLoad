import { describe, expect, it } from "vitest";
import { documentExtractionSchema } from "@/domain/onboarding/extraction-schema";
import { maximumDocumentBytes, sanitiseFilename, validateUpload } from "@/domain/onboarding/upload-validation";
import { matchVerifiedTemplate } from "@/domain/onboarding/template-matching";
import { onboardingDestination } from "@/domain/onboarding/redirect";
import { transitionCandidate } from "@/domain/onboarding/candidate-decisions";
import { fixtureExtraction } from "@/lib/document-extraction";

describe("Milestone 4 onboarding domain", () => {
  it("validates supported uploads and sanitises filenames", () => {
    expect(validateUpload({ name: "../../My Fake Note.PDF", type: "application/pdf", size: 100 })).toMatchObject({ ok: true, safeName: "my-fake-note.pdf" });
    expect(sanitiseFilename("A <bad> name.md")).toBe("a-bad-name.md");
  });
  it("rejects unsupported and oversized files", () => {
    expect(validateUpload({ name: "record.html", type: "text/html", size: 100 })).toMatchObject({ ok: false });
    expect(validateUpload({ name: "record.pdf", type: "application/pdf", size: maximumDocumentBytes + 1 })).toMatchObject({ ok: false });
  });
  it("validates the complete structured extraction schema", () => {
    expect(documentExtractionSchema.parse(fixtureExtraction("cardiology-discharge-summary.pdf")).candidateTasks).toHaveLength(6);
    expect(() => documentExtractionSchema.parse({ documentTitle: "broken" })).toThrow();
  });
  it("uses deterministic fixture fallback and rejects an unknown fixture", () => {
    expect(fixtureExtraction("gp-care-notes.pdf").medications).toHaveLength(2);
    expect(() => fixtureExtraction("unknown.pdf")).toThrow(/no deterministic extraction fixture/i);
  });
  it("matches a candidate to an exact verified template without copying AI constraints", () => {
    const template = { id: "bp", templateKey: "blood-pressure", title: "Morning blood-pressure check", ownerService: "Cardiology", frequency: "DAILY", windowStart: "06:30", windowEnd: "08:30" };
    expect(matchVerifiedTemplate({ title: "Morning blood pressure check", explicitTiming: "any time", explicitFrequency: "sometimes" }, [template])).toBe(template);
  });
  it("leaves an unmatched task unresolved", () => {
    expect(matchVerifiedTemplate({ title: "A completely novel clinical instruction" }, [])).toBeNull();
  });
  it("selects the root redirect from persisted onboarding completion", () => {
    expect(onboardingDestination(false)).toBe("/onboarding/welcome");
    expect(onboardingDestination(true)).toBe("/patient/today");
  });
  it("allows only explicit candidate decision transitions", () => {
    expect(transitionCandidate("PENDING", "CONFIRMED")).toBe("CONFIRMED");
    expect(transitionCandidate("UNSURE", "OUTDATED")).toBe("OUTDATED");
    expect(() => transitionCandidate("INVALID", "CONFIRMED")).toThrow();
  });
});
