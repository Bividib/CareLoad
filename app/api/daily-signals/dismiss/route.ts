import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentDemoDate } from "@/lib/demo-date";

export async function POST() {
  const signalDate = currentDemoDate();
  await db.dailySignalDismissal.upsert({
    where: { patientId_signalDate: { patientId: "eleanor-reed", signalDate } },
    create: { id: `dismissal-${signalDate}`, patientId: "eleanor-reed", signalDate },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
