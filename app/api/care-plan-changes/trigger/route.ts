import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { triggerAndSimulateCareUpdate } from "@/lib/stress-test";
export async function POST() { return NextResponse.json(await triggerAndSimulateCareUpdate(db)); }
