import { BriefcaseBusiness, Check, Heart, Leaf, Mic, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { LifeMapEditor } from "@/components/LifeMapEditor";
import { CareMomentCard, ComingSoonState, FrictionChip, MobileShell, PageHeader, PrimaryButton, RoundedCard, SecondaryButton, SectionTitle, StatusBanner } from "@/components/ui/CareLoadUI";
import { DailySignalEntry } from "@/components/DailySignalFlow";
import { buildDailySignalContext } from "@/lib/daily-signal";
import { MessagesClient } from "@/components/MessagingClient";
import { CarePlanViews } from "@/components/CarePlanViews";
import { currentDemoDate } from "@/lib/demo-date";

export async function TodayScreen() {
  const today = currentDemoDate();
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    new Date(`${today}T12:00:00Z`).getUTCDay()
  ];
  const [plan, acceptedChange, receivedChange, todaySignal, anchors] = await Promise.all([
    db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "ACTIVE" }, include: { items: { include: { task: true }, orderBy: { startTime: "asc" } } } }),
    db.carePlanChange.findFirst({ where: { patientId: "eleanor-reed", status: "ACCEPTED" }, orderBy: { acceptedAt: "desc" } }),
    db.carePlanChange.findFirst({ where: { patientId: "eleanor-reed", status: { in: ["RECEIVED", "SIMULATED"] } } }),
    db.dailySignal.findFirst({ where: { patientId: "eleanor-reed", signalDate: today }, orderBy: { updatedAt: "desc" } }),
    db.lifeAnchor.findMany({ where: { patientId: "eleanor-reed", protected: true }, orderBy: { startTime: "asc" } }),
  ]);
  const groups = new Map<string, NonNullable<typeof plan>["items"]>();
  const needsReview: NonNullable<typeof plan>["items"] = [];
  for (const item of plan?.items.filter((candidate) => candidate.occurrenceDate === today) ?? []) {
    if (item.status === "NEEDS_CLARIFICATION") {
      needsReview.push(item);
      continue;
    }
    const key = item.momentId ?? item.id;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return <MobileShell active="/patient/today">
    <div className="greeting"><p>Good morning,</p><h1>Eleanor <span>☀</span></h1>{receivedChange && <a className="update-pill" href={`/patient/updates/${receivedChange.id}`}>1 care-plan update ›</a>}</div>
    {acceptedChange && <StatusBanner title="Plan updated today">Your accepted cardiology update is now in the active plan.</StatusBanner>}
    {receivedChange && <StatusBanner tone="amber" title="New update from cardiology"><a href={`/patient/updates/${receivedChange.id}`}>See impact on my week</a></StatusBanner>}
    <RoundedCard className="today-plan-card"><SectionTitle action="View medical plan" href="/patient/care-plan?view=today">Medical plan</SectionTitle>
      {[...groups.values()].map((items) => <CareMomentCard key={items[0].id} title={items[0].momentTitle ?? "Care moment"} time={items[0].startTime ?? undefined} tasks={items.map((item) => item.task.title)} minutes={items.reduce((sum, item) => sum + item.task.durationMinutes, 0)} tone={(items[0].startTime ?? "") < "10:00" ? "amber" : (items[0].startTime ?? "") < "17:00" ? "blue" : "purple"} />)}
      {needsReview.map((item) => <article className="plan-review-item" key={item.id}><strong>Needs review</strong><div><b>{item.task.title}</b><span>No permitted time remains inside its verified window. It has not been silently moved or removed.</span></div></article>)}
      {!groups.size && <p className="muted">Your generated care moments will appear after reset completes.</p>}
    </RoundedCard>
    <RoundedCard className="daily-signal-card"><div className="daily-signal-intro"><span className="round-icon mint">{todaySignal && ["RECORDED_ONLY", "SENT"].includes(todaySignal.status) ? <Check /> : <Heart />}</span><div><h2>Daily Signal</h2><p>{todaySignal && ["RECORDED_ONLY", "SENT"].includes(todaySignal.status) ? "Today’s optional check-in is complete." : "Optional check-in — tell us how you’re feeling today."}</p></div></div>{todaySignal && ["RECORDED_ONLY", "SENT"].includes(todaySignal.status) ? <span className="daily-complete">Recorded today</span> : <SecondaryButton href="/patient/daily-signal">Check in</SecondaryButton>}</RoundedCard>
    <RoundedCard className="protected-card"><SectionTitle action="Manage" href="/patient/life-map">Your plan</SectionTitle>
      {anchors.filter((anchor) => anchor.weekdays.split(",").includes(weekday)).slice(0, 3).map((anchor, index) => {
        const Icon = index === 0 ? BriefcaseBusiness : index === 1 ? Heart : Leaf;
        const tone = index === 0 ? "mint" : index === 1 ? "rose" : "green";
        return <div className="protected-row" key={anchor.id}><span className={`round-icon ${tone}`}><Icon /></span>{anchor.title} · {anchor.startTime}–{anchor.endTime}</div>;
      })}
      {!anchors.some((anchor) => anchor.weekdays.split(",").includes(weekday)) && <p className="muted">No protected routines added for today.</p>}
    </RoundedCard>
  </MobileShell>;
}

export async function CarePlanScreen() {
  const [tasks, plan] = await Promise.all([
    db.verifiedCareTask.findMany({ where: { patientId: "eleanor-reed", verified: true, active: true }, orderBy: { title: "asc" } }),
    db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "ACTIVE" }, include: { items: { include: { task: true }, orderBy: [{ occurrenceDate: "asc" }, { startTime: "asc" }] } } }),
  ]);
  return <MobileShell active="/patient/care-plan"><PageHeader title="Medical plan" subtitle="Your verified care work and scheduled times." />
    <a className="verified-banner" href="#verified"><span className="round-icon mint">✓</span><div><strong>Verified for your care plan</strong><small>Last reviewed today</small></div><span>›</span></a>
    <CarePlanViews items={plan?.items.map((item) => ({ id: item.id, occurrenceDate: item.occurrenceDate, startTime: item.startTime, momentId: item.momentId, momentTitle: item.momentTitle, durationMinutes: item.task.durationMinutes, status: item.status, explanation: item.explanation, task: { id: item.task.id, title: item.task.title } })) ?? []} tasks={tasks} />
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
