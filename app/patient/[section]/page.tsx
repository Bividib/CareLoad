import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/shell/RoutePlaceholder";

const sections = {
  today: "Today",
  "care-plan": "Care Plan",
  "life-map": "Add to My Life",
  "daily-signal": "Daily Signal",
  messages: "Messages",
  help: "Help",
} as const;

type PatientSectionPageProps = {
  params: Promise<{ section: string }>;
};

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export default async function PatientSectionPage({
  params,
}: PatientSectionPageProps) {
  const { section } = await params;

  if (!(section in sections)) {
    notFound();
  }

  return (
    <RoutePlaceholder
      title={sections[section as keyof typeof sections]}
      description="This patient route is scaffolded only. Stored patient workflows will be added in their ordered milestones."
    />
  );
}

