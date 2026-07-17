import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processDueSimulatedResponses } from "@/lib/simulated-responses";

export async function GET() {
  await processDueSimulatedResponses(db);
  const threads = await db.messageThread.findMany({ where: { patientId: "eleanor-reed" }, include: { messages: { orderBy: { createdAt: "asc" } }, jobs: true }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ threads, pending: threads.some((thread) => thread.jobs.some((job) => job.state === "PENDING")), unreadCount: threads.filter((thread) => thread.unread).length });
}
