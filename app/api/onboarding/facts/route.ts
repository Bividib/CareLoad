import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
const schema = z.object({ answers: z.record(z.string(), z.enum(["YES","NO","UNSURE"])) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the factual answers." }, { status: 400 });
  for (const [key, answer] of Object.entries(parsed.data.answers)) await db.patientFactConfirmation.update({ where: { patientId_key: { patientId: "eleanor-reed", key } }, data: { answer } });
  return NextResponse.json({ ok: true });
}
