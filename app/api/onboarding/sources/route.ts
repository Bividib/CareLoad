import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { buildTalkThroughDraft } from "@/lib/life-map-draft";
const schema = z.object({ sources: z.array(z.enum(["UPLOAD","TALK"])).min(1), talkText: z.string().max(2000).optional() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Select at least one onboarding source." }, { status: 400 });
  const talkThroughDraft = parsed.data.talkText
    ? JSON.stringify(buildTalkThroughDraft(parsed.data.talkText))
    : null;
  await db.patient.update({ where: { id: "eleanor-reed" }, data: { onboardingSources: JSON.stringify(parsed.data.sources), talkThroughText: parsed.data.talkText, talkThroughDraft } });
  return NextResponse.json({ ok: true });
}
