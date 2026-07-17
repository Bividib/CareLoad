import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { decideCandidate } from "@/lib/candidate-service";

const schema = z.object({ decision: z.literal("CONFIRMED") });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid batch decision." }, { status: 400 });
  const pending = await db.candidateCareTask.findMany({ where: { patientId: "eleanor-reed", status: "PENDING" }, orderBy: { id: "asc" } });
  const candidates = [];
  for (const candidate of pending) candidates.push(await decideCandidate(db, candidate.id, parsed.data.decision));
  await db.auditEvent.create({ data: {
    id: `audit-candidate-batch-${Date.now()}`,
    patientId: "eleanor-reed",
    type: "CANDIDATES_CONFIRMED",
    summary: `Patient confirmed ${candidates.length} source-grounded synthetic candidate tasks`,
  } });
  return NextResponse.json({ candidates: candidates.map(({ id, status, verifiedTaskId }) => ({ id, status, verifiedTaskId })) });
}
