"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mic, ShieldCheck, Sparkles, Upload, Users } from "lucide-react";
import { MobileShell, PageHeader, PrimaryButton, RoundedCard, SecondaryButton, SectionTitle, StatusBanner, TaskRow } from "@/components/ui/CareLoadUI";

export function WelcomeScreen() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  return <MobileShell onboarding><PageHeader title="Welcome to CareLoad ☀" subtitle="Organise a verified synthetic care workload around everyday life — so you can see what realistically fits." />
    <div className="benefits"><div><FileText /><strong>Stay organised</strong><p>Care tasks, routines, and appointments in one place.</p></div><div><ShieldCheck /><strong>Plan with confidence</strong><p>Only pre-verified synthetic task constraints are scheduled.</p></div><div><Users /><strong>Care that fits your life</strong><p>Protect work, family, rest, and the things that matter.</p></div></div>
    <RoundedCard><SectionTitle>Prototype and privacy boundary</SectionTitle><p>This hackathon app uses synthetic information only. It does not connect to a health record, clinician, or healthcare organisation.</p><p>Daily Signals are always optional.</p></RoundedCard>
    <label className="consent"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /> I understand CareLoad supports planning and does not replace a clinician.</label>
    <button className="primary-button" disabled={!accepted} onClick={() => router.push("/onboarding/build")}>Get started</button><SecondaryButton>Learn how it works</SecondaryButton>
  </MobileShell>;
}

export function OnboardingScreen({ step }: { step: string }) {
  if (step === "build") return <MobileShell onboarding><div className="progress">● ○ ○ ○ <span>Step 1 of 4</span></div><PageHeader title="Build your care plan" subtitle="Choose how to get started" /><div className="option-list"><Option icon={<Upload />} title="Upload documents" text="Synthetic discharge letters and medication lists" /><Option icon={<ShieldCheck />} title="Connect health record" text="Simulated for demo" /><Option icon={<Mic />} title="Talk it through" text="Speak or type your routine and care needs" /></div><StatusBanner title="Use more than one option">We’ll bring the synthetic fixtures together.</StatusBanner><PrimaryButton href="/onboarding/upload">Continue</PrimaryButton></MobileShell>;
  if (step === "upload") return <MobileShell onboarding><PageHeader title="Upload documents" subtitle="Synthetic PDF, TXT, or Markdown only." /><RoundedCard className="upload-zone"><Upload /><h2>Drop demo documents here</h2><p>Maximum 3 files, 5 MB each. Never upload real patient information.</p><SecondaryButton>Browse demo files</SecondaryButton></RoundedCard><RoundedCard><SectionTitle>Included samples</SectionTitle><p>Cardiology discharge summary · Diabetes medication list · GP care notes</p></RoundedCard><PrimaryButton href="/onboarding/review">Process demo documents</PrimaryButton></MobileShell>;
  if (step === "review") return <MobileShell onboarding><div className="progress">✓ ✓ ● ○ <span>Review tasks</span></div><PageHeader title="We found your care tasks" subtitle="Fixture candidates retain their synthetic source evidence." /><RoundedCard><TaskRow title="Morning blood-pressure check" source="Cardiology discharge summary" fixed={false} /><TaskRow title="Take Metformin with breakfast" source="Diabetes medication list" fixed={false} /><TaskRow title="Foot check in the evening" source="Diabetes clinic letter" fixed={false} /><TaskRow title="Collect repeat prescription" source="GP care notes" fixed={false} /></RoundedCard><RoundedCard><SectionTitle>Confirm factual details</SectionTitle><p>Confirmation means the fixture is current, not that you are clinically verifying its safety.</p></RoundedCard><PrimaryButton href="/onboarding/life-map">Looks right, continue</PrimaryButton></MobileShell>;
  if (step === "life-map") return <MobileShell onboarding><PageHeader title="Build your Life Map" subtitle="Add routines and priorities the planner must protect." /><RoundedCard><SectionTitle>Daily anchors</SectionTitle><p>School run · Part-time work · Granddaughter care · Evening walk</p></RoundedCard><RoundedCard><SectionTitle>Preferences and friction</SectionTitle><p>Bundle tasks, fewer notifications, home equipment, commute, and fatigue after work.</p></RoundedCard><PrimaryButton href="/onboarding/preview">Save my Life Map</PrimaryButton></MobileShell>;
  if (step === "preview") return <MobileShell onboarding><PageHeader title="Your first plan preview" subtitle="One deterministic plan fitted around Eleanor’s synthetic Life Map." /><div className="metric-grid"><span><strong>52</strong>actions</span><span><strong>250</strong>minutes</span><span><strong>18</strong>moments</span></div><RoundedCard><SectionTitle>What CareLoad protected</SectionTitle><p>School run, work, granddaughter care, evening walk, verified timing windows, and home equipment.</p></RoundedCard><PrimaryButton href="/patient/today">Accept plan</PrimaryButton><SecondaryButton href="/onboarding/life-map">Adjust Life Map</SecondaryButton></MobileShell>;
  return <MobileShell onboarding><PageHeader title="Reading synthetic documents" /><RoundedCard><Sparkles /><h2>Preparing fixture tasks</h2><p>Linking instructions to exact synthetic source text and verified templates.</p></RoundedCard><PrimaryButton href="/onboarding/review">Continue to review</PrimaryButton></MobileShell>;
}

function Option({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <RoundedCard><span className="option-icon">{icon}</span><div><h2>{title}</h2><p>{text}</p></div></RoundedCard>;
}
