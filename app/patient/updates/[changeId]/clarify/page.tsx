import { notFound } from "next/navigation";
import { ClarificationForm } from "@/components/StressTestActions";
import { MobileShell, PageHeader, RoundedCard } from "@/components/ui/CareLoadUI";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ClarifyCarePlanUpdatePage({
  params,
}: {
  params: Promise<{ changeId: string }>;
}) {
  const { changeId } = await params;
  const change = await db.carePlanChange.findUnique({
    where: { id: changeId },
    select: { id: true, title: true },
  });
  if (!change) notFound();

  return (
    <MobileShell active="/patient/care-plan">
      <PageHeader
        title="Ask about this instruction"
        subtitle="Send a question to the Care Response Team."
      />
      <RoundedCard className="clarification-context">
        <strong>Care-plan update</strong>
        <p>{change.title}</p>
      </RoundedCard>
      <ClarificationForm changeId={change.id} />
      <p className="notice">This sends a question within the synthetic demo. It does not contact a real clinician.</p>
    </MobileShell>
  );
}
