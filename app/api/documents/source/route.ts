import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Candidate required." }, { status: 400 });
  const candidate = await db.candidateCareTask.findFirst({ where: { id, patientId: "eleanor-reed" }, include: { document: true } });
  if (!candidate) return NextResponse.json({ error: "Source not found." }, { status: 404 });
  const bytes = await fs.readFile(candidate.document.storagePath);
  return new Response(bytes, { headers: { "Content-Type": candidate.document.mimeType, "Content-Disposition": `inline; filename="${candidate.document.safeName}"`, "X-Content-Type-Options": "nosniff" } });
}
