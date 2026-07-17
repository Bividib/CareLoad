import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { acceptCarePlanChange } from "@/lib/stress-test";
export async function POST(_: Request, { params }: { params: Promise<{ changeId: string }> }) {
  try { return NextResponse.json(await acceptCarePlanChange(db, (await params).changeId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to accept update." }, { status: 409 }); }
}
