import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { MobileShell, PageHeader, PrimaryButton, RoundedCard } from "@/components/ui/CareLoadUI";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MessageMeaningPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const thread = await db.messageThread.findUnique({
    where: { id: threadId },
    include: { messages: { where: { author: "SIMULATED_CARE_TEAM" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!thread || thread.patientId !== "eleanor-reed" || !thread.messages[0]) notFound();
  const metadata = JSON.parse(thread.messages[0].metadataJson) as { actionsForToday?: string[] };
  return <MobileShell active="/patient/messages">
    <PageHeader title="What this means for today" subtitle="The recorded next steps from the simulated care-team response." />
    <RoundedCard className="meaning-page-card"><span className="round-icon mint"><ShieldCheck /></span><div><h2>For today</h2><ul>{metadata.actionsForToday?.map((item) => <li key={item}>{item}</li>)}</ul></div></RoundedCard>
    <p className="notice">This is predefined fictional prototype content, not clinical advice.</p>
    <PrimaryButton href={`/patient/messages/${thread.id}`}>Back to Messages</PrimaryButton>
  </MobileShell>;
}
