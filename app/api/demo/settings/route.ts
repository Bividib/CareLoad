import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
const schema = z.object({ fixtureMode: z.boolean() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "fixtureMode must be boolean." }, { status: 400 });
  return NextResponse.json(await db.demoSetting.upsert({ where: { id: "demo" }, create: { id: "demo", fixtureMode: parsed.data.fixtureMode }, update: { fixtureMode: parsed.data.fixtureMode } }));
}
