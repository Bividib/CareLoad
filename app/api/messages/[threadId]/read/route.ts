import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function POST(_: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  await db.messageThread.updateMany({ where: { id: threadId, patientId: "eleanor-reed" }, data: { unread: false } });
  return NextResponse.json({ ok: true });
}
