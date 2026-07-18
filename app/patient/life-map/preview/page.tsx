import { redirect } from "next/navigation";
import { PreviewScreen } from "@/components/OnboardingScreens";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LifeMapPreviewPage() {
  const [plan, activePlan, unresolvedCount] = await Promise.all([
    db.carePlanVersion.findFirst({
      where: { patientId: "eleanor-reed", status: "PROPOSED" },
      include: {
        items: {
          include: { task: true },
          orderBy: [{ occurrenceDate: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { version: "desc" },
    }),
    db.carePlanVersion.findFirst({
      where: { patientId: "eleanor-reed", status: "ACTIVE" },
      include: { items: true },
      orderBy: { version: "desc" },
    }),
    db.candidateCareTask.count({
      where: { patientId: "eleanor-reed", status: "NEEDS_CLINICAL_VERIFICATION" },
    }),
  ]);

  if (!plan) redirect("/patient/life-map");
  const careUpdate = await db.carePlanChange.findFirst({
    where: { proposedPlanId: plan.id, status: "SIMULATED" },
    select: { id: true },
  });
  if (careUpdate) redirect(`/patient/updates/${careUpdate.id}/preview`);
  return <PreviewScreen plan={plan} baselineItems={activePlan?.items ?? []} unresolvedCount={unresolvedCount} update />;
}
