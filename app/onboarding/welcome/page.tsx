import { WelcomeScreen } from "@/components/OnboardingScreens";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function WelcomePage() {
  const patient = await db.patient.findUnique({ where: { id: "eleanor-reed" }, select: { planningConsent: true, syntheticDataConsent: true } });
  return <WelcomeScreen initialConsent={Boolean(patient?.planningConsent && patient.syntheticDataConsent)} />;
}
