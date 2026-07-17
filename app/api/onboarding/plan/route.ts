import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createInitialProposedPlan } from "@/lib/plan-service";
export async function POST() {
  const pending = await db.candidateCareTask.count({ where: { patientId: "eleanor-reed", status: "PENDING" } });
  if (pending) return NextResponse.json({ error: "Review every candidate task before planning." }, { status: 409 });
  const plan = await createInitialProposedPlan(db, "eleanor-reed");
  await db.auditEvent.create({ data: { id: `audit-initial-plan-${Date.now()}`, patientId: "eleanor-reed", type: "INITIAL_PLAN_PROPOSED", summary: "Deterministic initial plan generated from confirmed verified templates" } });
  return NextResponse.json({ ok: true, planId: plan.id });
}
