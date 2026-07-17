import { notFound } from "next/navigation";

import { CarePlanScreen, DailySignalScreen, HelpScreen, LifeMapScreen, MessagesScreen, TodayScreen } from "@/components/PatientScreens";

const sections = ["today", "care-plan", "life-map", "daily-signal", "messages", "help"] as const;
export const dynamic = "force-dynamic";

type PatientSectionPageProps = {
  params: Promise<{ section: string }>;
};

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default async function PatientSectionPage({
  params,
}: PatientSectionPageProps) {
  const { section } = await params;

  if (!sections.includes(section as (typeof sections)[number])) {
    notFound();
  }

  if (section === "today") return <TodayScreen />;
  if (section === "care-plan") return <CarePlanScreen />;
  if (section === "life-map") return <LifeMapScreen />;
  if (section === "daily-signal") return <DailySignalScreen />;
  if (section === "messages") return <MessagesScreen />;
  return <HelpScreen />;
}
