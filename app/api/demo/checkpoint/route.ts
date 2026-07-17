import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkpointNames, seedCheckpoint } from "@/lib/demo-checkpoints";
const schema = z.object({ checkpoint: z.enum(checkpointNames) });
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Demo controls are development-only." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Unknown checkpoint." }, { status: 400 });
  await seedCheckpoint(db, parsed.data.checkpoint);
  return NextResponse.json({ ok: true, checkpoint: parsed.data.checkpoint });
}
