import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { fixtureExtraction, liveExtraction } from "@/lib/document-extraction";
import { persistExtraction } from "@/lib/candidate-service";
const schema = z.object({ documentIds: z.array(z.string()).min(1).max(3), forceFixture: z.boolean().default(false) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose documents to process." }, { status: 400 });
  const documents = await db.careDocument.findMany({
    where: { id: { in: parsed.data.documentIds }, patientId: "eleanor-reed" },
  });
  const byId = new Map(documents.map((document) => [document.id, document]));
  await db.careDocument.updateMany({
    where: { id: { in: documents.map((document) => document.id) } },
    data: { status: "PROCESSING", errorMessage: null },
  });
  const useFixture = parsed.data.forceFixture || process.env.DEMO_AI_FALLBACK === "true";
  const extracted = await Promise.all(parsed.data.documentIds.map(async (id) => {
    const document = byId.get(id);
    if (!document) return { id, status: "FAILED" as const, error: "Document not found." };
    try {
      const extraction = useFixture
        ? fixtureExtraction(document.safeName)
        : await liveExtraction(document.storagePath, document.mimeType);
      return { id, status: "EXTRACTED" as const, extraction };
    } catch (error) {
      return {
        id,
        status: "FAILED" as const,
        error: error instanceof Error ? error.message : "Extraction failed.",
      };
    }
  }));
  const results = [];
  for (const result of extracted) {
    if (result.status === "EXTRACTED") {
      await persistExtraction(db, result.id, result.extraction, useFixture ? "FIXTURE" : "LIVE");
      results.push({ id: result.id, status: result.status, mode: useFixture ? "FIXTURE" : "LIVE" });
    } else {
      if (byId.has(result.id)) {
        await db.careDocument.update({ where: { id: result.id }, data: { status: "FAILED", errorMessage: result.error } });
      }
      results.push({ id: result.id, status: result.status, error: result.error });
    }
  }
  return NextResponse.json({ results, hasFailures: results.some((result) => result.status === "FAILED") });
}
