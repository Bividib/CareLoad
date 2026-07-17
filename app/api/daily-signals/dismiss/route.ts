import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  await db.dailySignalDismissal.upsert({
    where: { patientId_signalDate: { patientId: "eleanor-reed", signalDate: "2026-07-17" } },
    create: { id: `dismissal-2026-07-17`, patientId: "eleanor-reed", signalDate: "2026-07-17" },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
