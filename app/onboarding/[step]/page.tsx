import { notFound } from "next/navigation";
import { BuildScreen, ConnectRecordScreen, OnboardingStepper, ProcessingScreen, PreviewScreen, ReviewScreen, TalkThroughScreen, UploadScreen } from "@/components/OnboardingScreens";
import { LifeMapEditor } from "@/components/LifeMapEditor";
import { MobileShell, PageHeader, RoundedCard, SectionTitle } from "@/components/ui/CareLoadUI";
import { db } from "@/lib/db";
import { buildTalkThroughDraft, talkThroughDraftSchema } from "@/lib/life-map-draft";

const steps = ["build","upload","connect","talk","processing","review","life-map","preview"] as const;
export const dynamic = "force-dynamic";
export function generateStaticParams() { return steps.map((step) => ({ step })); }

export default async function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!steps.includes(step as (typeof steps)[number])) notFound();
  const patient = await db.patient.findUniqueOrThrow({ where: { id: "eleanor-reed" } });
  const selected = JSON.parse(patient.onboardingSources) as string[];
  if (step === "build") {
    const completedSources = [
      ...(selected.includes("UPLOAD") ? ["UPLOAD"] : []),
      ...(selected.includes("SIMULATED_RECORD") ? ["SIMULATED_RECORD"] : []),
      ...(patient.talkThroughText ? ["TALK"] : []),
    ];
    return <BuildScreen selected={selected} completedSources={completedSources} />;
  }
  if (step === "connect") return <ConnectRecordScreen selected={selected} />;
  if (step === "talk") return <TalkThroughScreen selected={selected} initialTalk={patient.talkThroughText ?? ""} />;
  const documents = await db.careDocument.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: "asc" } });
  if (step === "upload") return <UploadScreen initialDocuments={documents} selected={selected} />;
  if (step === "processing") return <ProcessingScreen existingDocuments={documents} />;
  if (step === "review") {
    const [candidates, facts] = await Promise.all([
      db.candidateCareTask.findMany({ where: { patientId: patient.id }, include: { document: { select: { originalName: true, issuingService: true, extractionMode: true } } }, orderBy: { createdAt: "asc" } }),
      db.patientFactConfirmation.findMany({ where: { patientId: patient.id } }),
    ]);
    return <ReviewScreen candidates={candidates} facts={facts} />;
  }
  if (step === "life-map") {
    const [savedAnchors, frictions] = await Promise.all([
      db.lifeAnchor.findMany({ where: { patientId: patient.id }, orderBy: { startTime: "asc" } }),
      db.frictionFactor.findMany({ where: { patientId: patient.id } }),
    ]);
    const talkDraft = patient.talkThroughDraft
      ? talkThroughDraftSchema.safeParse(JSON.parse(patient.talkThroughDraft))
      : null;
    const anchors = talkDraft?.success
      ? talkDraft.data.anchors.some((anchor) => !anchor.startTime || !anchor.endTime)
        ? buildTalkThroughDraft(talkDraft.data.sourceText).anchors
        : talkDraft.data.anchors
      : savedAnchors;
    return <MobileShell onboarding><OnboardingStepper currentStep={4} /><PageHeader title="Make care fit your life" subtitle="Add the regular parts of your day that your care plan should work around." />{patient.talkThroughDraft && <RoundedCard className="heard-card"><SectionTitle>What you told us</SectionTitle><p>{patient.talkThroughText}</p><small>You can adjust the times and names below before continuing.</small></RoundedCard>}<LifeMapEditor anchors={anchors} frictions={frictions} onboarding /></MobileShell>;
  }
  const [plan, activePlan, unresolvedCount] = await Promise.all([
    db.carePlanVersion.findFirst({ where: { patientId: patient.id, status: "PROPOSED" }, include: { items: { include: { task: true }, orderBy: [{ occurrenceDate: "asc" }, { startTime: "asc" }] } }, orderBy: { version: "desc" } }),
    db.carePlanVersion.findFirst({ where: { patientId: patient.id, status: "ACTIVE" }, include: { items: true }, orderBy: { version: "desc" } }),
    db.candidateCareTask.count({ where: { patientId: patient.id, status: "NEEDS_CLINICAL_VERIFICATION" } }),
  ]);
  return <PreviewScreen plan={plan} baselineItems={activePlan?.items ?? []} unresolvedCount={unresolvedCount} />;
}
