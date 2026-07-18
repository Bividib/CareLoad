import { db } from "@/lib/db";

export async function demoResetGeneration(): Promise<string> {
  const reset = await db.auditEvent.findFirst({
    where: { patientId: "eleanor-reed", type: "DEMO_RESET" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return reset?.createdAt.toISOString() ?? "unseeded";
}
