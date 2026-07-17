import { Info, Keyboard, Mic, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { LifeMapEditor } from "@/components/LifeMapEditor";
import { AcceptPlanButton } from "@/components/AcceptPlanButton";
import { CareMomentCard, ComingSoonState, FrictionChip, MobileShell, PageHeader, PrimaryButton, RoundedCard, SecondaryButton, SectionTitle, SegmentedControl, StatusBanner, TaskRow } from "@/components/ui/CareLoadUI";

export async function TodayScreen() {
  const plan = await db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "ACTIVE" }, include: { items: { include: { task: true }, orderBy: { startTime: "asc" } } } });
  const groups = new Map<string, NonNullable<typeof plan>["items"]>();
  const today = "2026-07-17";
  for (const item of plan?.items.filter((candidate) => candidate.occurrenceDate === today) ?? []) {
    if (item.status === "NEEDS_CLARIFICATION") continue;
    const key = item.momentId ?? item.id;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return <MobileShell active="/patient/today">
    <div className="greeting"><p>Good morning,</p><h1>Eleanor <span>☀</span></h1><span className="update-pill">Synthetic active plan</span></div>
    <RoundedCard><SectionTitle action="View plan">Today’s plan</SectionTitle>
      {[...groups.values()].slice(0, 3).map((items) => <CareMomentCard key={items[0].id} title={items[0].momentTitle ?? "Care moment"} time={items[0].startTime ?? undefined} tasks={items.map((item) => item.task.title)} minutes={items.reduce((sum, item) => sum + item.task.durationMinutes, 0)} tone={(items[0].startTime ?? "") < "10:00" ? "amber" : (items[0].startTime ?? "") < "17:00" ? "blue" : "purple"} />)}
      {!groups.size && <p className="muted">Your generated care moments will appear after reset completes.</p>}
    </RoundedCard>
    <RoundedCard className="daily-signal-card"><div><h2>Daily Signal</h2><p>Optional check-in — tell us how you’re feeling today.</p></div><SecondaryButton href="/patient/daily-signal"><Mic /> Speak</SecondaryButton><SecondaryButton href="/patient/daily-signal"><Keyboard /> Type</SecondaryButton></RoundedCard>
    <RoundedCard><SectionTitle action="Manage">Protected today</SectionTitle><ul className="protected"><li>Work until 14:00</li><li>Granddaughter care Tuesday and Thursday</li><li>Evening walk at 19:00</li></ul><SecondaryButton>Today is difficult</SecondaryButton></RoundedCard>
  </MobileShell>;
}

export async function CarePlanScreen() {
  const [tasks, anchors, plan] = await Promise.all([
    db.verifiedCareTask.findMany({ where: { patientId: "eleanor-reed", verified: true }, orderBy: { title: "asc" } }),
    db.lifeAnchor.findMany({ where: { patientId: "eleanor-reed", protected: true } }),
    db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "ACTIVE" }, include: { items: true } }),
  ]);
  return <MobileShell active="/patient/care-plan"><PageHeader title="Care Plan" />
    <StatusBanner title="Synthetic verified tasks">Matched to pre-verified demo templates. No real care team is connected.</StatusBanner><SegmentedControl />
    <RoundedCard><SectionTitle action="View full plan">This week at a glance</SectionTitle><div className="week-list">{["Mon","Tue","Wed","Thu","Fri"].map((day, index) => <div key={day}><strong>{day}</strong><span>Generated care moments and protected anchors</span><em>{plan?.items.filter((item) => new Date(`${item.occurrenceDate}T12:00:00`).getDay() === index + 1).length ?? 0} actions</em></div>)}</div></RoundedCard>
    <RoundedCard><SectionTitle>Verified tasks</SectionTitle>{tasks.map((task) => <TaskRow key={task.id} title={task.title} source={task.source} fixed={!task.mayMove} />)}</RoundedCard>
    <RoundedCard><SectionTitle>Protected anchors</SectionTitle><div className="priority-grid">{anchors.slice(0, 3).map((anchor) => <span key={anchor.id}>{anchor.title}<small>{anchor.startTime} – {anchor.endTime}</small></span>)}</div></RoundedCard>
  </MobileShell>;
}

export async function LifeMapScreen() {
  const [anchors, frictions] = await Promise.all([db.lifeAnchor.findMany({ where: { patientId: "eleanor-reed" }, orderBy: { startTime: "asc" } }), db.frictionFactor.findMany({ where: { patientId: "eleanor-reed" } })]);
  return <MobileShell active="/patient/life-map"><PageHeader title="Add to My Life" subtitle="Help us understand your real day." /><LifeMapEditor anchors={anchors} frictions={frictions} /></MobileShell>;
}

export function MessagesScreen() {
  return <MobileShell active="/patient/messages"><PageHeader title="Messages" subtitle="Synthetic demo conversation — nothing leaves this application." /><RoundedCard><SectionTitle>Your conversation</SectionTitle><div className="message patient"><strong>You</strong><small>Care update · 08:15</small><h3>Summary of your update</h3><p>Stomach discomfort for a few days and more tired than usual; still eating and drinking.</p></div><div className="message simulated"><strong><Sparkles /> Simulated care-team response</strong><small>Fictional Dr Ahmed · demo only · 14:32</small><p>This predefined fictional response does not diagnose or change your care plan.</p></div><div className="meaning"><Info /><div><strong>What this means for today</strong><p>Your active verified plan is unchanged. This prototype cannot provide clinical guidance.</p></div></div></RoundedCard><div className="ai-note"><Sparkles /> AI assistance is not active in this milestone; this is a deterministic fixture.</div></MobileShell>;
}

export function DailySignalScreen({ review = false }: { review?: boolean }) {
  return <MobileShell active="/patient/today"><PageHeader title={review ? "Review your update" : "Daily Signal"} subtitle={review ? "Check these structured demo observations." : "Optional check-in — you can skip this."} />
    {review ? <><RoundedCard><SectionTitle>CareLoad heard</SectionTitle><ul className="observations"><li>Stomach discomfort: present</li><li>Duration: a few days</li><li>Fatigue: more than usual</li><li>Eating and drinking: maintained</li></ul></RoundedCard><RoundedCard><SectionTitle>Why show this?</SectionTitle><p>These patient-reported changes may be useful context in this fictional demo. CareLoad does not diagnose.</p></RoundedCard><PrimaryButton>Send simulated update</PrimaryButton><SecondaryButton>Keep monitoring in the demo</SecondaryButton><p className="notice">This does not diagnose a condition or contact a clinician.</p></> :
    <><RoundedCard className="signal-input"><span className="microphone"><Mic /></span><div className="wave">▂▃▅▂▆▃▂▅▇▃▂▅</div><blockquote>“My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.”</blockquote></RoundedCard><SectionTitle>A couple of quick follow-up questions</SectionTitle><RoundedCard><div className="question">How many days has this been going on?</div></RoundedCard><RoundedCard><div className="question">Has anything changed in your medicines recently?</div></RoundedCard><div className="chips">{["1–2 days","3–5 days","More than 5 days","Not sure"].map((text) => <FrictionChip key={text}>{text}</FrictionChip>)}</div><PrimaryButton href="/patient/daily-signal/review"><Sparkles /> Review what CareLoad heard</PrimaryButton></>}
  </MobileShell>;
}

export function HelpScreen() {
  return <MobileShell active="/patient/help"><PageHeader title="Help" subtitle="About this synthetic CareLoad prototype." /><RoundedCard><SectionTitle>Important boundary</SectionTitle><p>CareLoad supports workload planning with synthetic information. It does not provide medical advice, diagnosis, triage, or real messaging.</p></RoundedCard><ComingSoonState title="More help" /></MobileShell>;
}

export async function UpdateScreen({ preview = false }: { preview?: boolean }) {
  const proposed = preview ? await db.carePlanVersion.findFirst({ where: { patientId: "eleanor-reed", status: "PROPOSED" }, orderBy: { version: "desc" } }) : null;
  return <MobileShell active="/patient/care-plan"><PageHeader title={preview ? "Updated plan preview" : "Care-plan update"} /><StatusBanner tone="amber" title="Synthetic cardiology update">Twice-daily blood-pressure monitoring fixture for 14 days.</StatusBanner>
    {preview ? <><RoundedCard><SectionTitle>What changed</SectionTitle><ul className="observations"><li>Morning reading added</li><li>Questionnaire moved within its verified window</li><li>Prescription collection delegated to Maya</li></ul></RoundedCard><RoundedCard><CareMomentCard title="Morning routine" tasks={["Levothyroxine", "Blood-pressure reading", "Weight check"]} minutes={20} tone="amber" /><CareMomentCard title="Evening routine" tasks={["Atorvastatin", "Foot check", "Symptom log"]} minutes={15} tone="purple" /></RoundedCard>{proposed ? <AcceptPlanButton planId={proposed.id} /> : <p className="notice">Save the Life Map to create a proposed plan first.</p>}</> : <><div className="metric-grid"><span><strong>+28</strong>actions</span><span><strong>+18</strong>interruptions</span><span><strong>4</strong>work conflicts</span></div><RoundedCard><SectionTitle>What CareLoad can solve</SectionTitle><ul className="observations"><li>Bundle compatible home readings</li><li>Move flexible work within verified windows</li><li>Keep protected anchors visible</li></ul></RoundedCard><StatusBanner tone="amber" title="Needs clarification">Evening timing conflicts with childcare; no task will be omitted.</StatusBanner><PrimaryButton href="/patient/updates/demo-update/preview">Preview updated plan</PrimaryButton></>}<SecondaryButton>Ask for clarification</SecondaryButton></MobileShell>;
}
