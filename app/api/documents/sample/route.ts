import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitiseFilename } from "@/domain/onboarding/upload-validation";
import { z } from "zod";
const schema = z.object({ names: z.array(z.enum(["cardiology-discharge-summary.pdf","diabetes-medication-list.pdf","gp-care-notes.pdf"])).min(1).max(3) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose valid sample documents." }, { status: 400 });
  const records = [];
  for (const name of parsed.data.names) {
    const existing = await db.careDocument.findFirst({ where: { patientId: "eleanor-reed", originalName: name } });
    if (existing) {
      records.push(existing);
      continue;
    }
    const source = path.join(process.cwd(), "public", "demo-documents", name);
    const id = `document-${crypto.randomUUID()}`;
    const uploadRoot = path.join(process.cwd(), "var", "uploads");
    await fs.mkdir(uploadRoot, { recursive: true });
    const target = path.join(uploadRoot, `${id}-${name}`);
    await fs.copyFile(source, target);
    const stat = await fs.stat(target);
    records.push(await db.careDocument.create({ data: { id, patientId: "eleanor-reed", originalName: name, safeName: sanitiseFilename(name), mimeType: "application/pdf", sizeBytes: stat.size, storagePath: target } }));
  }
  return NextResponse.json({ documents: records.map(({ id, originalName, status }) => ({ id, originalName, status })) });
}
