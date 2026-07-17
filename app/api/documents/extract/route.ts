import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { fixtureExtraction, liveExtraction } from "@/lib/document-extraction";
import { persistExtraction } from "@/lib/candidate-service";
const schema = z.object({ documentIds: z.array(z.string()).min(1).max(3), forceFixture: z.boolean().default(false) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose documents to process." }, { status: 400 });
  const results = [];
  for (const id of parsed.data.documentIds) {
    const document = await db.careDocument.findFirst({ where: { id, patientId: "eleanor-reed" } });
    if (!document) { results.push({ id, status: "FAILED", error: "Document not found." }); continue; }
    await db.careDocument.update({ where: { id }, data: { status: "PROCESSING", errorMessage: null } });
    try {
      const useFixture = parsed.data.forceFixture || process.env.DEMO_AI_FALLBACK === "true";
      const extraction = useFixture ? fixtureExtraction(document.safeName) : await liveExtraction(document.storagePath, document.mimeType);
      await persistExtraction(db, id, extraction, useFixture ? "FIXTURE" : "LIVE");
      results.push({ id, status: "EXTRACTED", mode: useFixture ? "FIXTURE" : "LIVE" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Extraction failed.";
      await db.careDocument.update({ where: { id }, data: { status: "FAILED", errorMessage: message } });
      results.push({ id, status: "FAILED", error: message });
    }
  }
  return NextResponse.json({ results, hasFailures: results.some((result) => result.status === "FAILED") });
}
