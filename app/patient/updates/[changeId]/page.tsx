import { UpdateScreen } from "@/components/UpdateScreen";

export const dynamic = "force-dynamic";
export default async function CarePlanUpdatePage({ params }: { params: Promise<{ changeId: string }> }) {
  return <UpdateScreen changeId={(await params).changeId} />;
}
