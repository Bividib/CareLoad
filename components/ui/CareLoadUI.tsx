import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays, Check, ChevronRight, CircleHelp, ClipboardCheck,
  Clock3, Home, MessageCircle, Plus, ShieldCheck, UsersRound,
} from "lucide-react";
import { MatchNotificationBell } from "@/components/MatchNotificationBell";

export function CareLoadLogo() {
  return <Link href="/patient/today" className="logo" aria-label="CareLoad home">
    <svg className="careload-mark" viewBox="0 0 48 42" aria-hidden="true">
      <path d="M24 39 6.8 23.1C-4.4 11.4 10.3-4.7 24 8.2 37.7-4.7 52.4 11.4 41.2 23.1Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 22h8l3-7 5 14 4-8h8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>CareLoad</span>
  </Link>;
}

export function NotificationBell() {
  return <MatchNotificationBell />;
}

export function AppHeader({ showNotifications = true }: { showNotifications?: boolean }) {
  return <header className="app-header"><CareLoadLogo />{showNotifications && <NotificationBell />}</header>;
}

export function MobileShell({ children, active, onboarding = false }: { children: ReactNode; active?: string; onboarding?: boolean }) {
  return <main className={`mobile-shell ${onboarding ? "onboarding-shell" : ""}`}><AppHeader showNotifications={!onboarding} />{children}{!onboarding && <BottomNavigation active={active} />}<footer className="prototype-note">Synthetic hackathon prototype · Not a medical device · Not for real patient care</footer></main>;
}

const nav = [
  ["/patient/today", "Today", Home],
  ["/patient/care-plan", "Care Plan", CalendarDays],
  ["/patient/life-map", "Add to My Life", Plus],
  ["/patient/messages", "Messages", MessageCircle],
  ["/patient/match", "Match", UsersRound],
] as const;

export function BottomNavigation({ active }: { active?: string }) {
  return <nav className="bottom-nav" aria-label="Patient navigation">{nav.map(([href, label, Icon], index) =>
    <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={index === 2 ? "add-life" : ""}><span><Icon /></span><small>{label}</small></Link>)}</nav>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="page-header"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>;
}

export function RoundedCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card ${className}`}>{children}</section>;
}

export function StatusBanner({ title, children, tone = "mint" }: { title: string; children?: ReactNode; tone?: "mint" | "amber" | "blue" }) {
  return <div className={`status-banner ${tone}`}><span className="icon-well"><Check /></span><div><strong>{title}</strong>{children && <p>{children}</p>}</div></div>;
}

export function DurationPill({ minutes, tone = "blue" }: { minutes: number; tone?: string }) {
  return <span className={`duration ${tone}`}><Clock3 /> {minutes} min</span>;
}

export function CareMomentCard({ title, tasks, minutes, tone = "blue", time }: { title: string; tasks: string[]; minutes: number; tone?: string; time?: string }) {
  return <article className="care-moment"><span className={`moment-icon ${tone}`}><Clock3 /></span><div className="moment-copy">{time && <small>{time}</small>}<h3>{title}</h3><ul>{tasks.map((task) => <li key={task}>{task}</li>)}</ul></div><DurationPill minutes={minutes} tone={tone} /></article>;
}

export function TaskRow({ id, title, source, fixed }: { id?: string; title: string; source: string; fixed: boolean }) {
  const content = <><ClipboardCheck /><div><strong>{title}</strong><small>{source}</small></div><span className={fixed ? "tag fixed" : "tag flexible"}>{fixed ? "Fixed" : "Flexible"}</span><ChevronRight /></>;
  return id ? <Link className="task-row" href={`/patient/care-plan/task/${id}`}>{content}</Link> : <div className="task-row">{content}</div>;
}

export function SegmentedControl() {
  return <div className="segments" aria-label="Care plan view"><button>Today</button><button className="selected">This week</button><button>Tasks</button></div>;
}

export function LifeAnchorRow({ title, time }: { title: string; time: string }) {
  return <div className="anchor-row"><CalendarDays /><strong>{title}</strong><span>{time}</span><ChevronRight /></div>;
}

export function FrictionChip({ children, selected = false }: { children: ReactNode; selected?: boolean }) {
  return <span className={`friction-chip ${selected ? "selected" : ""}`}>{children}</span>;
}

export function PrimaryButton({ children, href, type = "button", onClick }: { children: ReactNode; href?: string; type?: "button" | "submit"; onClick?: () => void }) {
  const content = <>{children}<ChevronRight /></>;
  return href ? <Link className="primary-button" href={href}>{content}</Link> : <button className="primary-button" type={type} onClick={onClick}>{content}</button>;
}

export function SecondaryButton({ children, href, onClick }: { children: ReactNode; href?: string; onClick?: () => void }) {
  return href ? <Link className="secondary-button" href={href}>{children}</Link> : <button className="secondary-button" onClick={onClick}>{children}</button>;
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <RoundedCard className="empty"><CircleHelp /><h2>{title}</h2><p>{children}</p></RoundedCard>;
}

export function LoadingSkeleton() { return <div className="loading-skeleton" aria-label="Loading"><i /><i /><i /></div>; }

export function ComingSoonState({ title }: { title: string }) {
  return <EmptyState title={title}>Coming in the next milestone. No real healthcare connection is used.</EmptyState>;
}

export function SectionTitle({ children, action, href }: { children: ReactNode; action?: string; href?: string }) {
  return <div className="section-title"><h2>{children}</h2>{action && (href ? <Link href={href}>{action} <ChevronRight /></Link> : <span>{action} <ChevronRight /></span>)}</div>;
}

export function VerifiedIcon() { return <span className="icon-well"><ShieldCheck /></span>; }
