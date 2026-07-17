import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { acceptProposedPlan } from "@/lib/plan-service";

export async function POST(_: Request, context: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await context.params;
    const plan = await acceptProposedPlan(db, planId);
    return NextResponse.json({ ok: true, activePlanId: plan.id });
  } catch {
    return NextResponse.json({ error: "The proposed plan could not be accepted." }, { status: 409 });
  }
}
