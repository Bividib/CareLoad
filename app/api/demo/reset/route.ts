import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { resetSyntheticData } from "@/prisma/seed-data";

const requestSchema = z.object({ confirmSyntheticReset: z.literal(true) });

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Demo reset is development-only." }, { status: 403 });
  }
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Reset confirmation required." }, { status: 400 });
  await resetSyntheticData(db);
  return NextResponse.json({ ok: true, patientId: "eleanor-reed" });
}
