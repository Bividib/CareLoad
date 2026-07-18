"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ChevronRight, HeartPulse, MoonStar, ShieldCheck, Sun, Sunrise } from "lucide-react";
import { CareMomentCard, RoundedCard } from "@/components/ui/CareLoadUI";
import { currentDemoDate } from "@/lib/demo-date";

type PlanItem = { id: string; occurrenceDate: string; startTime: string | null; momentId: string | null; momentTitle: string | null; durationMinutes: number; status: string; explanation: string; task: { id: string; title: string } };
type Task = { id: string; title: string; source: string; ownerService: string; mayMove: boolean };
const tones = ["amber", "blue", "purple", "mint", "rose"] as const;
const icons = [Sunrise, Sun, CalendarDays, ShieldCheck, MoonStar];

export function CarePlanViews({ items, tasks }: { items: PlanItem[]; tasks: Task[] }) {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const [view, setView] = useState<"TODAY" | "WEEK" | "TASKS">(requestedView === "today" ? "TODAY" : requestedView === "tasks" ? "TASKS" : "WEEK");
  const grouped = new Map<string, PlanItem[]>();
  for (const item of items) grouped.set(item.occurrenceDate, [...(grouped.get(item.occurrenceDate) ?? []), item]);
  const days = [...grouped.entries()].slice(0, 7);
  const today = days.find(([date]) => date === currentDemoDate())?.[1] ?? days[0]?.[1] ?? [];
  const todayMoments = new Map<string, PlanItem[]>();
  const todayNeedsReview = today.filter((item) => item.status === "NEEDS_CLARIFICATION");
  for (const item of today.filter((candidate) => candidate.status !== "NEEDS_CLARIFICATION")) {
    const key = item.momentId ?? item.id;
    todayMoments.set(key, [...(todayMoments.get(key) ?? []), item]);
  }
  const [selectedDate, setSelectedDate] = useState(searchParams.get("date") ?? days[0]?.[0] ?? "");
  const selectedDay = grouped.get(selectedDate) ?? [];
  const returnPath = view === "TASKS" ? "/patient/care-plan?view=tasks" : view === "TODAY" ? "/patient/care-plan?view=today" : `/patient/care-plan?view=week&date=${selectedDate}`;
  return <>
    <div className="segments" aria-label="Care plan view">{(["TODAY", "WEEK", "TASKS"] as const).map((key) => <button key={key} className={view === key ? "selected" : ""} aria-pressed={view === key} onClick={() => setView(key)}>{key === "WEEK" ? "This week" : key[0] + key.slice(1).toLowerCase()}</button>)}</div>
    {view === "TODAY" && <RoundedCard className="plan-section-card medical-plan-card"><ReferenceHead icon={<Sun />} title="Medical plan" subtitle="The same complete care schedule shown on Today" />{[...todayMoments.values()].map((moment) => <CareMomentCard key={moment[0].id} title={moment[0].momentTitle ?? "Care moment"} time={moment[0].startTime ?? undefined} tasks={moment.map((item) => item.task.title)} minutes={moment.reduce((total, item) => total + item.durationMinutes, 0)} tone={(moment[0].startTime ?? "") < "10:00" ? "amber" : (moment[0].startTime ?? "") < "17:00" ? "blue" : "purple"} />)}{todayNeedsReview.map((item) => <article className="plan-review-item" key={item.id}><strong>Needs review</strong><div><b>{item.task.title}</b><span>No permitted time remains inside its verified window. It has not been silently moved or removed.</span></div></article>)}</RoundedCard>}
    {view === "WEEK" && <RoundedCard className="plan-section-card"><ReferenceHead icon={<CalendarDays />} title="Medical care this week" subtitle="Choose a day to see its care moments" /><div className="reference-week-list">{days.slice(0, 7).map(([date, rows], index) => { const Icon = icons[index % icons.length]; const label = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(new Date(`${date}T12:00:00`)); const moments = [...new Set(rows.map((row) => row.momentTitle ?? row.task.title))]; return <button className={selectedDate === date ? "active-day" : ""} key={date} onClick={() => setSelectedDate(date)}><span className={`round-icon ${tones[index % tones.length]}`}><Icon /></span><strong>{label}</strong><span>{moments.slice(0, 2).join(", ")}</span><em className={tones[index % tones.length]}>{moments.length} {moments.length === 1 ? "moment" : "moments"}</em></button>; })}</div>{selectedDay.length > 0 && <div className="selected-day-detail"><h3>{new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(new Date(`${selectedDate}T12:00:00`))}</h3>{selectedDay.map((item) => <Link href={`/patient/care-plan/task/${item.task.id}?returnTo=${encodeURIComponent(`/patient/care-plan?view=week&date=${selectedDate}`)}`} key={item.id}><span>{item.startTime ?? "Needs review"}</span><strong>{item.task.title}</strong><ChevronRight /></Link>)}</div>}</RoundedCard>}
    {(view === "WEEK" || view === "TASKS") && <RoundedCard className="plan-section-card" ><div id="verified" /><ReferenceHead icon={<HeartPulse />} title="Verified tasks" subtitle="Agreed and confirmed for this demo plan" action={view === "WEEK" ? <button onClick={() => setView("TASKS")}>View all <ChevronRight /></button> : undefined} />{tasks.slice(0, view === "TASKS" ? tasks.length : 4).map((task) => <Link className="task-row" href={`/patient/care-plan/task/${task.id}?returnTo=${encodeURIComponent(view === "TASKS" ? "/patient/care-plan?view=tasks" : returnPath)}`} key={task.id}><ShieldCheck /><div><strong>{task.title}</strong><small>{task.ownerService}</small></div><span className={!task.mayMove ? "tag fixed" : "tag flexible"}>{!task.mayMove ? "Fixed" : "Flexible"}</span><ChevronRight /></Link>)}</RoundedCard>}
  </>;
}

function ReferenceHead({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="reference-section-head"><span className="round-icon mint">{icon}</span><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>;
}
