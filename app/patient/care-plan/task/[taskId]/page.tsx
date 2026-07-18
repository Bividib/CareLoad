import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock3, FileText, MapPin, ShieldCheck } from "lucide-react";
import { MobileShell, PageHeader, RoundedCard, SecondaryButton, StatusBanner } from "@/components/ui/CareLoadUI";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params, searchParams }: { params: Promise<{ taskId: string }>; searchParams: Promise<{ returnTo?: string }> }) {
  const { taskId } = await params;
  const requestedReturn = (await searchParams).returnTo;
  const returnTo = requestedReturn?.startsWith("/patient/care-plan") ? requestedReturn : "/patient/care-plan";
  const task = await db.verifiedCareTask.findUnique({ where: { id: taskId } });
  if (!task || task.patientId !== "eleanor-reed") notFound();
  return <MobileShell active="/patient/care-plan">
    <Link className="back-link" href={returnTo}>← Back to care plan</Link>
    <PageHeader title={task.title} subtitle={task.ownerService} />
    <StatusBanner title="Verified care task">This task matches a pre-verified instruction in Eleanor’s demo care plan.</StatusBanner>
    <RoundedCard className="task-detail-card">
      <div><Clock3 /><span><strong>When</strong><small>{task.fixedTime ?? `${task.windowStart} – ${task.windowEnd}`} · {task.frequency}</small></span></div>
      {task.requiredLocation && <div><MapPin /><span><strong>Where</strong><small>{task.requiredLocation}</small></span></div>}
      <div><ShieldCheck /><span><strong>Plan flexibility</strong><small>{task.mayMove ? "Can move within its verified time window" : "Kept at its fixed time"}</small></span></div>
      <div><FileText /><span><strong>Source</strong><small>{task.source}</small></span></div>
    </RoundedCard>
    <RoundedCard><h2>Source instruction</h2><blockquote>{task.supportingText}</blockquote></RoundedCard>
    <SecondaryButton href={returnTo}>Done</SecondaryButton>
  </MobileShell>;
}
