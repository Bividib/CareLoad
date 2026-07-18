import { BriefcaseBusiness, Check, Heart, Leaf, Mic, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { LifeMapEditor } from "@/components/LifeMapEditor";
import { CareMomentCard, ComingSoonState, FrictionChip, MobileShell, PageHeader, PrimaryButton, RoundedCard, SecondaryButton, SectionTitle, StatusBanner } from "@/components/ui/CareLoadUI";
import { DailySignalEntry } from "@/components/DailySignalFlow";
import { buildDailySignalContext } from "@/lib/daily-signal";
import { MessagesClient } from "@/components/MessagingClient";
import { AcceptUpdateButton, ClarificationButton, TriggerUpdateButton } from "@/components/StressTestActions";
import { AcceptPlanButton } from "@/components/AcceptPlanButton";
import { CarePlanViews } from "@/components/CarePlanViews";

export async function TodayScreen() {
  const [plan, acceptedChange, receivedChange, todaySignal] = await Promise.all([
    db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "ACTIVE" }, include: { items: { include: { task: true }, orderBy: { startTime: "asc" } } } }),
    db.carePlanChange.findFirst({ where: { patientId: "eleanor-reed", status: "ACCEPTED" }, orderBy: { acceptedAt: "desc" } }),
    db.carePlanChange.findFirst({ where: { patientId: "eleanor-reed", status: { in: ["RECEIVED", "SIMULATED"] } } }),
    db.dailySignal.findFirst({ where: { patientId: "eleanor-reed", signalDate: "2026-07-17" }, orderBy: { updatedAt: "desc" } }),
  ]);
  const groups = new Map<string, NonNullable<typeof plan>["items"]>();
  const today = "2026-07-17";
  for (const item of plan?.items.filter((candidate) => candidate.occurrenceDate === today) ?? []) {
    if (item.status === "NEEDS_CLARIFICATION") continue;
    const key = item.momentId ?? item.id;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return <MobileShell active="/patient/today">
    <div className="greeting"><p>Good morning,</p><h1>Eleanor <span>☀</span></h1>{receivedChange && <a className="update-pill" href={`/patient/updates/${receivedChange.id}`}>1 care-plan update ›</a>}</div>
    {acceptedChange && <StatusBanner title="Plan updated today">Your accepted cardiology update is now in the active plan.</StatusBanner>}
    {receivedChange && <StatusBanner tone="amber" title="New update from cardiology"><a href={`/patient/updates/${receivedChange.id}`}>See impact on my week</a></StatusBanner>}
    <RoundedCard className="today-plan-card"><SectionTitle action="View plan" href="/patient/care-plan">Today’s plan</SectionTitle>
      {[...groups.values()].slice(0, 3).map((items) => <CareMomentCard key={items[0].id} title={items[0].momentTitle ?? "Care moment"} time={items[0].startTime ?? undefined} tasks={items.map((item) => item.task.title)} minutes={items.reduce((sum, item) => sum + item.task.durationMinutes, 0)} tone={(items[0].startTime ?? "") < "10:00" ? "amber" : (items[0].startTime ?? "") < "17:00" ? "blue" : "purple"} />)}
      {!groups.size && <p className="muted">Your generated care moments will appear after reset completes.</p>}
    </RoundedCard>
    <RoundedCard className="daily-signal-card"><div className="daily-signal-intro"><span className="round-icon mint">{todaySignal && ["RECORDED_ONLY", "SENT"].includes(todaySignal.status) ? <Check /> : <Heart />}</span><div><h2>Daily Signal</h2><p>{todaySignal && ["RECORDED_ONLY", "SENT"].includes(todaySignal.status) ? "Today’s optional check-in is complete." : "Optional check-in — tell us how you’re feeling today."}</p></div></div>{todaySignal && ["RECORDED_ONLY", "SENT"].includes(todaySignal.status) ? <span className="daily-complete">Recorded today</span> : <SecondaryButton href="/patient/daily-signal">Check in</SecondaryButton>}</RoundedCard>
    <RoundedCard className="protected-card"><SectionTitle action="Manage" href="/patient/life-map">Today’s plans</SectionTitle><div className="protected-row"><span className="round-icon mint"><BriefcaseBusiness /></span>Work until 14:00</div><div className="protected-row"><span className="round-icon rose"><Heart /></span>Granddaughter at 15:00</div><div className="protected-row"><span className="round-icon green"><Leaf /></span>Evening walk</div></RoundedCard>
  </MobileShell>;
}

export async function CarePlanScreen() {
  const [tasks, anchors, plan] = await Promise.all([
    db.verifiedCareTask.findMany({ where: { patientId: "eleanor-reed", verified: true }, orderBy: { title: "asc" } }),
    db.lifeAnchor.findMany({ where: { patientId: "eleanor-reed", protected: true } }),
    db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "ACTIVE" }, include: { items: { include: { task: true }, orderBy: [{ occurrenceDate: "asc" }, { startTime: "asc" }] } } }),
  ]);
  return <MobileShell active="/patient/care-plan"><PageHeader title="Care Plan" />
    <a className="verified-banner" href="#verified"><span className="round-icon mint">✓</span><div><strong>Verified for your care plan</strong><small>Last reviewed today</small></div><span>›</span></a>
    <CarePlanViews items={plan?.items.map((item) => ({ id: item.id, occurrenceDate: item.occurrenceDate, startTime: item.startTime, momentTitle: item.momentTitle, task: { id: item.task.id, title: item.task.title } })) ?? []} tasks={tasks} anchors={anchors} />
  </MobileShell>;
}

export async function LifeMapScreen() {
  const [anchors, frictions] = await Promise.all([db.lifeAnchor.findMany({ where: { patientId: "eleanor-reed" }, orderBy: { startTime: "asc" } }), db.frictionFactor.findMany({ where: { patientId: "eleanor-reed" } })]);
  return <MobileShell active="/patient/life-map"><PageHeader title="Add to My Life" subtitle="Help us understand your real day." /><LifeMapEditor anchors={anchors} frictions={frictions} /></MobileShell>;
}

export async function MessagesScreen({ selectedId }: { selectedId?: string } = {}) {
  const [threads, change] = await Promise.all([db.messageThread.findMany({ where: { patientId: "eleanor-reed" }, include: { messages: { orderBy: { createdAt: "asc" } }, jobs: true }, orderBy: { updatedAt: "desc" } }), db.carePlanChange.findFirst({ where: { patientId: "eleanor-reed", status: { in: ["RECEIVED", "SIMULATED"] } }, orderBy: { receivedAt: "desc" } })]);
  return <MessagesClient selectedId={selectedId} planUpdate={change ? { id: change.id, title: change.title } : null} initial={{ threads: threads.map((thread) => ({ ...thread, messages: thread.messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString() })), jobs: thread.jobs.map((job) => ({ state: job.state })) })), pending: threads.some((thread) => thread.jobs.some((job) => job.state === "PENDING")), unreadCount: threads.filter((thread) => thread.unread).length }} />;
}

export async function DailySignalScreen({ editId }: { editId?: string } = {}) {
  const [context, editing] = await Promise.all([
    buildDailySignalContext(db, "eleanor-reed"),
    editId ? db.dailySignal.findUnique({ where: { id: editId } }) : null,
  ]);
  return <DailySignalEntry prompt={context.greetingPrompt} initialText={editing?.patientId === "eleanor-reed" ? editing.rawText : ""} />;
}

export function LegacyDailySignalFixture({ review = false }: { review?: boolean }) {
  return <MobileShell active="/patient/today"><PageHeader title={review ? "Review your update" : "Daily Signal"} subtitle={review ? "Check these structured demo observations." : "Optional check-in — you can skip this."} />
    {review ? <><RoundedCard><SectionTitle>CareLoad heard</SectionTitle><ul className="observations"><li>Stomach discomfort: present</li><li>Duration: a few days</li><li>Fatigue: more than usual</li><li>Eating and drinking: maintained</li></ul></RoundedCard><RoundedCard><SectionTitle>Why show this?</SectionTitle><p>These patient-reported changes may be useful context in this fictional demo. CareLoad does not diagnose.</p></RoundedCard><PrimaryButton>Send simulated update</PrimaryButton><SecondaryButton>Keep monitoring in the demo</SecondaryButton><p className="notice">This does not diagnose a condition or contact a clinician.</p></> :
    <><RoundedCard className="signal-input"><span className="microphone"><Mic /></span><div className="wave">▂▃▅▂▆▃▂▅▇▃▂▅</div><blockquote>“My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.”</blockquote></RoundedCard><SectionTitle>A couple of quick follow-up questions</SectionTitle><RoundedCard><div className="question">How many days has this been going on?</div></RoundedCard><RoundedCard><div className="question">Has anything changed in your medicines recently?</div></RoundedCard><div className="chips">{["1–2 days","3–5 days","More than 5 days","Not sure"].map((text) => <FrictionChip key={text}>{text}</FrictionChip>)}</div><PrimaryButton href="/patient/daily-signal/review"><Sparkles /> Review what CareLoad heard</PrimaryButton></>}
  </MobileShell>;
}

export function HelpScreen() {
  return <MobileShell active="/patient/help"><PageHeader title="Help" subtitle="About this synthetic CareLoad prototype." /><RoundedCard><SectionTitle>Important boundary</SectionTitle><p>CareLoad supports workload planning with synthetic information. It does not provide medical advice, diagnosis, triage, or real messaging.</p></RoundedCard><ComingSoonState title="More help" /></MobileShell>;
}

export async function UpdateScreen({ changeId, preview = false }: { changeId: string; preview?: boolean }) {
  const change = await db.carePlanChange.findUnique({ where: { id: changeId }, include: { simulation: true } });
  if (!change?.simulation) {
    const proposed = preview ? await db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "PROPOSED" }, orderBy: { version: "desc" } }) : null;
    return <MobileShell active="/patient/care-plan"><PageHeader title={preview ? "Proposed plan preview" : "Care-plan update"} /><StatusBanner tone="amber" title="Care-team update">{proposed ? "Review the proposed plan created from your saved Life Map." : "No update is ready to review yet."}</StatusBanner>{proposed ? <AcceptPlanButton planId={proposed.id} /> : <TriggerUpdateButton />}</MobileShell>;
  }
  const metrics = JSON.parse(change.simulation.metricsJson) as Record<string, number>;
  const unresolved = JSON.parse(change.simulation.unresolvedJson) as Array<{ occurrenceDate: string; reason: string; violatedConstraints: string[] }>;
  return <MobileShell active="/patient/care-plan"><PageHeader title={preview ? "Updated plan preview" : "Care-plan update"} /><StatusBanner tone="amber" title="New update from cardiology">{change.title}<br /><small>Received {change.receivedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></StatusBanner>
    <RoundedCard><details><summary>View original instruction</summary><p>{change.originalText}</p></details></RoundedCard>
    {preview ? <><RoundedCard className="update-changes"><SectionTitle>What changed</SectionTitle><ul className="observations"><li>Morning and evening readings added inside verified windows</li><li>Compatible morning work bundled</li><li>Flexible work moved only when permitted</li></ul></RoundedCard><RoundedCard><SectionTitle>Your updated day</SectionTitle><CareMomentCard title="Morning routine" tasks={["Blood-pressure reading", "Existing compatible home tasks"]} minutes={5} tone="amber" /><CareMomentCard title="Evening routine" tasks={["Blood-pressure reading", "Existing evening tasks"]} minutes={5} tone="purple" /></RoundedCard><StatusBanner title="Why this helps">Reduces interruptions while keeping protected work and family time in place.</StatusBanner><AcceptUpdateButton changeId={change.id} /></> : <><RoundedCard className="update-highlight"><h2>{change.title}</h2><p>Starting today</p></RoundedCard><h2 className="choice-heading">See impact on your week</h2><div className="metric-grid update-metrics"><span><strong>+{metrics.actionsAdded}</strong>actions</span><span><strong>+{metrics.minutesAdded}</strong>minutes</span><span><strong>{metrics.interruptionsAfterOptimisation}</strong>interruptions</span></div><RoundedCard><SectionTitle>What CareLoad can solve</SectionTitle><ul className="observations"><li>Bundle compatible home readings</li><li>Move flexible work within verified windows</li><li>Keep protected time in place</li></ul></RoundedCard>{unresolved.length > 0 && <StatusBanner tone="amber" title="Needs clarification">{unresolved[0].reason} No task is omitted.</StatusBanner>}<PrimaryButton href={`/patient/updates/${change.id}/preview`}>Preview updated plan</PrimaryButton></>}<ClarificationButton changeId={change.id} /><SecondaryButton href="/patient/today">Keep current plan for now</SecondaryButton></MobileShell>;
}
