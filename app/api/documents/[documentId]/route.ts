import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, context: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await context.params;
  const document = await db.careDocument.findFirst({ where: { id: documentId, patientId: "eleanor-reed" } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  await db.careDocument.delete({ where: { id: document.id } });
  const uploadRoot = path.resolve(process.cwd(), "var", "uploads");
  const storagePath = path.resolve(document.storagePath);
  if (storagePath.startsWith(`${uploadRoot}${path.sep}`)) await fs.rm(storagePath, { force: true });
  await db.auditEvent.create({ data: {
    id: `audit-document-removed-${Date.now()}`,
    patientId: document.patientId,
    type: "DOCUMENT_REMOVED",
    summary: `Patient removed synthetic document ${document.originalName}`,
  } });
  return NextResponse.json({ ok: true });
}
