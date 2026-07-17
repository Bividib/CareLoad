import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { onboardingDestination } from "@/domain/onboarding/redirect";

export const dynamic = "force-dynamic";
export default async function Home() {
  const patient = await db.patient.findUnique({ where: { id: "eleanor-reed" }, select: { onboardingCompleted: true } });
  redirect(onboardingDestination(patient?.onboardingCompleted ?? false));
}
