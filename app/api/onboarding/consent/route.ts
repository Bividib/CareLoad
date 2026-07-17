import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
const schema = z.object({ planningConsent: z.literal(true), syntheticDataConsent: z.literal(true) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Both acknowledgements are required." }, { status: 400 });
  await db.patient.update({ where: { id: "eleanor-reed" }, data: parsed.data });
  await db.auditEvent.create({ data: { id: `audit-consent-${Date.now()}`, patientId: "eleanor-reed", type: "ONBOARDING_CONSENT", summary: "Patient accepted planning and synthetic-data acknowledgements" } });
  return NextResponse.json({ ok: true });
}
