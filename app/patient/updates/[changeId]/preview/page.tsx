import { UpdateScreen } from "@/components/PatientScreens";

export const dynamic = "force-dynamic";
export default async function UpdatedPlanPreviewPage({ params }: { params: Promise<{ changeId: string }> }) {
  return <UpdateScreen changeId={(await params).changeId} preview />;
}
