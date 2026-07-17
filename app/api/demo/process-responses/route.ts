import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processDueSimulatedResponses } from "@/lib/simulated-responses";
export async function POST() { return NextResponse.json({ processed: await processDueSimulatedResponses(db, new Date(Date.now() + 86_400_000)) }); }
