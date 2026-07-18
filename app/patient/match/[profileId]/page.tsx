import { notFound } from "next/navigation";
import {
  DailyMatchScreen,
  PeerConversationScreen,
} from "@/components/MatchScreens";
import {
  matchProfiles,
  type MatchProfileId,
} from "@/domain/match/fixtures";
import { demoResetGeneration } from "@/lib/demo-reset-generation";

const profileIds = ["leila", "aisha", "marcus"] as const;

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [...profileIds, "daily"].map((profileId) => ({ profileId }));
}

export default async function MatchProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const resetGeneration = await demoResetGeneration();
  if (profileId === "daily") {
    return <DailyMatchScreen resetGeneration={resetGeneration} />;
  }
  if (!profileIds.includes(profileId as MatchProfileId)) notFound();
  return (
    <PeerConversationScreen
      profile={matchProfiles[profileId as MatchProfileId]}
      resetGeneration={resetGeneration}
    />
  );
}
