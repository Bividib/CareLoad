import { MessagesScreen } from "@/components/PatientScreens";

export const dynamic = "force-dynamic";
export default async function MessageThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  return <MessagesScreen selectedId={(await params).threadId} />;
}
