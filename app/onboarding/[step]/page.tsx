import { notFound } from "next/navigation";
import { BuildScreen, ProcessingScreen, PreviewScreen, ReviewScreen, UploadScreen } from "@/components/OnboardingScreens";
import { LifeMapEditor } from "@/components/LifeMapEditor";
import { MobileShell, PageHeader, RoundedCard, SectionTitle } from "@/components/ui/CareLoadUI";
import { db } from "@/lib/db";

const steps = ["build","upload","processing","review","life-map","preview"] as const;
export const dynamic = "force-dynamic";
export function generateStaticParams() { return steps.map((step) => ({ step })); }

export default async function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!steps.includes(step as (typeof steps)[number])) notFound();
  const patient = await db.patient.findUniqueOrThrow({ where: { id: "eleanor-reed" } });
  if (step === "build") return <BuildScreen selected={JSON.parse(patient.onboardingSources) as string[]} initialTalk={patient.talkThroughText ?? ""} />;
  const documents = await db.careDocument.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: "asc" } });
  if (step === "upload") return <UploadScreen initialDocuments={documents} />;
  if (step === "processing") return <ProcessingScreen existingDocuments={documents} />;
  if (step === "review") {
    const [candidates, facts] = await Promise.all([
      db.candidateCareTask.findMany({ where: { patientId: patient.id }, include: { document: { select: { originalName: true, issuingService: true } } }, orderBy: { createdAt: "asc" } }),
      db.patientFactConfirmation.findMany({ where: { patientId: patient.id } }),
    ]);
    return <ReviewScreen candidates={candidates} facts={facts} />;
  }
  if (step === "life-map") {
    const [anchors, frictions, support] = await Promise.all([
      db.lifeAnchor.findMany({ where: { patientId: patient.id }, orderBy: { startTime: "asc" } }),
      db.frictionFactor.findMany({ where: { patientId: patient.id } }),
      db.supportPerson.findFirst({ where: { patientId: patient.id } }),
    ]);
    return <MobileShell onboarding><PageHeader title="Confirm your Life Map" subtitle="Review seeded details and any typed Talk-it-through context before planning." />{patient.talkThroughDraft && <RoundedCard><SectionTitle>CareLoad heard</SectionTitle><p>{patient.talkThroughText}</p><small>Review this draft before saving. It contains Life Map information only.</small></RoundedCard>}<RoundedCard><SectionTitle>Maya’s permitted support</SectionTitle><p>May collect prescriptions and help with transport. May not access complete health information.</p><p><strong>Current confirmation:</strong> {support ? "Included" : "Not included"}</p></RoundedCard><LifeMapEditor anchors={anchors} frictions={frictions} onboarding /></MobileShell>;
  }
  const [plan, unresolvedCount] = await Promise.all([
    db.carePlanVersion.findFirst({ where: { patientId: patient.id, status: "PROPOSED" }, include: { items: { include: { task: true }, orderBy: [{ occurrenceDate: "asc" }, { startTime: "asc" }] } }, orderBy: { version: "desc" } }),
    db.candidateCareTask.count({ where: { patientId: patient.id, status: "NEEDS_CLINICAL_VERIFICATION" } }),
  ]);
  return <PreviewScreen plan={plan} unresolvedCount={unresolvedCount} />;
}
