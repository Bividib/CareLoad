import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateUpload } from "@/domain/onboarding/upload-validation";

export async function POST(request: Request) {
  const form = await request.formData();
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (!files.length || files.length > 3) return NextResponse.json({ error: "Choose between 1 and 3 documents." }, { status: 400 });
  const prepared = files.map((file) => ({ file, validation: validateUpload(file) }));
  const invalid = prepared.find((item) => !item.validation.ok);
  if (invalid && !invalid.validation.ok) return NextResponse.json({ error: invalid.validation.error }, { status: 400 });
  const uploadRoot = path.join(process.cwd(), "var", "uploads");
  await fs.mkdir(uploadRoot, { recursive: true });
  const records = [];
  for (const item of prepared) {
    if (!item.validation.ok) continue;
    const id = `document-${crypto.randomUUID()}`;
    const storedName = `${id}-${item.validation.safeName}`;
    const storagePath = path.join(uploadRoot, storedName);
    await fs.writeFile(storagePath, Buffer.from(await item.file.arrayBuffer()), { flag: "wx" });
    records.push(await db.careDocument.create({ data: {
      id, patientId: "eleanor-reed", originalName: item.file.name,
      safeName: item.validation.safeName, mimeType: item.file.type || "application/octet-stream",
      sizeBytes: item.file.size, storagePath, status: "UPLOADED",
    } }));
  }
  return NextResponse.json({ documents: records.map(({ id, originalName, status }) => ({ id, originalName, status })) });
}
