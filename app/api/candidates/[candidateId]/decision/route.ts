import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { decideCandidate } from "@/lib/candidate-service";
const schema = z.object({ decision: z.enum(["CONFIRMED","OUTDATED","UNSURE"]) });
export async function POST(request: Request, context: { params: Promise<{ candidateId: string }> }) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid decision." }, { status: 400 });
  const { candidateId } = await context.params;
  const candidate = await decideCandidate(db, candidateId, parsed.data.decision);
  await db.auditEvent.create({ data: {
    id: `audit-candidate-${Date.now()}-${candidate.id}`,
    patientId: candidate.patientId,
    type: "CANDIDATE_DECIDED",
    summary: `Patient set a source-grounded synthetic candidate task to ${candidate.status}`,
  } });
  return NextResponse.json({ id: candidate.id, status: candidate.status, verifiedTaskId: candidate.verifiedTaskId });
}
