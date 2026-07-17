import type { PrismaClient } from "@/generated/prisma6";
import type { DocumentExtraction } from "@/domain/onboarding/extraction-schema";
import { matchVerifiedTemplate } from "@/domain/onboarding/template-matching";

export async function persistExtraction(db: PrismaClient, documentId: string, extraction: DocumentExtraction, mode: "FIXTURE" | "LIVE") {
  const document = await db.careDocument.findUniqueOrThrow({ where: { id: documentId } });
  await db.candidateCareTask.deleteMany({ where: { documentId } });
  await db.careDocument.update({ where: { id: documentId }, data: {
    status: "EXTRACTED", extractionMode: mode, errorMessage: null,
    documentTitle: extraction.documentTitle, issuingService: extraction.issuingService,
    documentDate: extraction.documentDate, uncertaintiesJson: JSON.stringify(extraction.uncertainties),
  } });
  await db.candidateCareTask.createMany({ data: extraction.candidateTasks.map((task, index) => ({
    id: `${documentId}:candidate:${index + 1}`, patientId: document.patientId, documentId,
    title: task.title, description: task.description, sourceQuote: task.sourceQuote,
    sourcePage: task.sourcePage, explicitFrequency: task.explicitFrequency,
    explicitTiming: task.explicitTiming, explicitDuration: task.explicitDuration,
    requiresPatientConfirmation: task.requiresPatientConfirmation,
    requiresClinicalVerification: task.requiresClinicalVerification, confidence: task.confidence,
  })) });
}

export async function decideCandidate(db: PrismaClient, candidateId: string, decision: "CONFIRMED" | "OUTDATED" | "UNSURE") {
  const candidate = await db.candidateCareTask.findUniqueOrThrow({ where: { id: candidateId }, include: { document: true } });
  if (decision !== "CONFIRMED") return db.candidateCareTask.update({ where: { id: candidateId }, data: { status: decision, decisionAt: new Date(), verifiedTaskId: null } });
  const templates = await db.verifiedCareTask.findMany({ where: { patientId: candidate.patientId } });
  const template = matchVerifiedTemplate({ title: candidate.title, explicitFrequency: candidate.explicitFrequency, explicitTiming: candidate.explicitTiming, issuingService: candidate.document.issuingService, templateKey: candidate.templateKey }, templates);
  if (!template) return db.candidateCareTask.update({ where: { id: candidateId }, data: { status: "NEEDS_CLINICAL_VERIFICATION", decisionAt: new Date() } });
  await db.verifiedCareTask.update({ where: { id: template.id }, data: {
    active: true, source: candidate.document.originalName, supportingText: candidate.sourceQuote,
  } });
  return db.candidateCareTask.update({ where: { id: candidateId }, data: { status: "CONFIRMED", verifiedTaskId: template.id, templateKey: template.templateKey, decisionAt: new Date() } });
}
