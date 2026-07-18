import { AcceptPlanButton } from "@/components/AcceptPlanButton";
import { AcceptUpdateButton, ClarificationButton, TriggerUpdateButton } from "@/components/StressTestActions";
import { ChevronRight } from "lucide-react";
import {
  CareMomentCard,
  MobileShell,
  PageHeader,
  RoundedCard,
  SecondaryButton,
  SectionTitle,
  StatusBanner,
} from "@/components/ui/CareLoadUI";
import { db } from "@/lib/db";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

export async function UpdateScreen({
  changeId,
  preview = false,
}: {
  changeId: string;
  preview?: boolean;
}) {
  const change = await db.carePlanChange.findUnique({
    where: { id: changeId },
    include: { simulation: true },
  });

  if (!change?.simulation) {
    const proposed = preview
      ? await db.carePlanVersion.findFirst({
          where: { patientId: "eleanor-reed", status: "PROPOSED" },
          orderBy: { version: "desc" },
        })
      : null;
    return (
      <MobileShell active="/patient/care-plan">
        <PageHeader title={preview ? "Proposed plan preview" : "Care-plan update"} />
        <StatusBanner tone="amber" title="Care-team update">
          {proposed
            ? "Review the proposed plan created from your saved Life Map."
            : "No update is ready to review yet."}
        </StatusBanner>
        {proposed ? <AcceptPlanButton planId={proposed.id} /> : <TriggerUpdateButton />}
      </MobileShell>
    );
  }

  const proposedPlan = await db.carePlanVersion.findUnique({
    where: { id: change.simulation.proposedPlanId },
    select: { rangeStart: true, rangeEnd: true },
  });

  return (
    <MobileShell active="/patient/care-plan">
      <PageHeader title={preview ? "Updated plan preview" : "Care-plan update"} />
      <StatusBanner tone="amber" title="New update from cardiology">
        {change.title}
        <br />
        <small>
          Received {change.receivedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </small>
      </StatusBanner>
      <RoundedCard>
        <details>
          <summary>View original instruction</summary>
          <p>{change.originalText}</p>
          <p><strong>Delegation:</strong> Not allowed for these readings.</p>
        </details>
      </RoundedCard>
      {preview ? (
        <>
          <RoundedCard className="update-period">
            <SectionTitle>Dates this update changes</SectionTitle>
            <strong>Every day</strong>
            <p>
              {proposedPlan
                ? `${formatDate(proposedPlan.rangeStart)} to ${formatDate(proposedPlan.rangeEnd)}`
                : "For the 14-day update period"}
            </p>
          </RoundedCard>
          <RoundedCard>
            <SectionTitle>Schedule on each affected day</SectionTitle>
            <CareMomentCard
              title="Morning blood-pressure reading"
              time="07:00–10:00"
              tasks={["Use the home blood-pressure cuff"]}
              minutes={5}
              tone="amber"
            />
            <CareMomentCard
              title="Evening blood-pressure reading"
              time="17:00–20:00"
              tasks={["Use the home blood-pressure cuff"]}
              minutes={5}
              tone="purple"
            />
          </RoundedCard>
          <RoundedCard>
            <SectionTitle>How this fits your current plan</SectionTitle>
            <ul className="update-changes">
              <li>Compatible readings can share an existing home care moment</li>
              <li>Existing tasks stay within their verified time windows</li>
              <li>The new blood-pressure readings cannot be delegated</li>
            </ul>
          </RoundedCard>
          <AcceptUpdateButton changeId={change.id} />
          <SecondaryButton href="/patient/today">Keep current plan for now</SecondaryButton>
        </>
      ) : (
        <>
          <RoundedCard className="update-summary">
            <SectionTitle>What the update adds</SectionTitle>
            <p>One morning and one evening blood-pressure reading each day for 14 days. Each requires the home cuff and cannot be delegated.</p>
          </RoundedCard>
          <a className="primary-button" href={`/patient/updates/${change.id}/preview`}>
            Preview dates and times <ChevronRight />
          </a>
          <ClarificationButton changeId={change.id} />
          <SecondaryButton href="/patient/today">Keep current plan for now</SecondaryButton>
        </>
      )}
    </MobileShell>
  );
}
