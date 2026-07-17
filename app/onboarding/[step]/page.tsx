import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/shell/RoutePlaceholder";

const steps = {
  build: "Build your care plan",
  upload: "Upload documents",
  processing: "Processing documents",
  review: "Review extracted care tasks",
  "life-map": "Build your Life Map",
  preview: "Initial plan preview",
} as const;

type OnboardingStepPageProps = {
  params: Promise<{ step: string }>;
};

export function generateStaticParams() {
  return Object.keys(steps).map((step) => ({ step }));
}

export default async function OnboardingStepPage({
  params,
}: OnboardingStepPageProps) {
  const { step } = await params;

  if (!(step in steps)) {
    notFound();
  }

  return (
    <RoutePlaceholder
      title={steps[step as keyof typeof steps]}
      description="This route is reserved by the implementation plan. Its workflow is intentionally outside the foundation milestone."
    />
  );
}

