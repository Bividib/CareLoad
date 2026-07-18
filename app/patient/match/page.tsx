import { MatchInboxScreen } from "@/components/MatchScreens";
import { demoResetGeneration } from "@/lib/demo-reset-generation";

export const dynamic = "force-dynamic";

export default async function MatchPage() {
  return <MatchInboxScreen resetGeneration={await demoResetGeneration()} />;
}
