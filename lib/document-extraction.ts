import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import cardiology from "@/fixtures/document-extractions/cardiology-discharge-summary.json";
import diabetes from "@/fixtures/document-extractions/diabetes-medication-list.json";
import gp from "@/fixtures/document-extractions/gp-care-notes.json";
import { documentExtractionSchema, type DocumentExtraction } from "@/domain/onboarding/extraction-schema";

const fixtures: Record<string, unknown> = {
  "cardiology-discharge-summary.pdf": cardiology,
  "diabetes-medication-list.pdf": diabetes,
  "gp-care-notes.pdf": gp,
};

export function fixtureExtraction(filename: string): DocumentExtraction {
  const fixture = fixtures[filename.toLowerCase()];
  if (!fixture) throw new Error(`No deterministic extraction fixture exists for ${filename}.`);
  return documentExtractionSchema.parse(fixture);
}

const systemRules = `Extract only information explicitly supported by this synthetic document.
Include the exact supporting quote for every extracted fact or task.
Never infer that a task can be skipped, delayed, delegated, its clinical criticality, a safe alternative timing, or a diagnosis.
Use null when information is absent. Preserve ambiguity instead of resolving it.
This is candidate information only and must never create clinical constraints.`;

export async function liveExtraction(storagePath: string, mimeType: string): Promise<DocumentExtraction> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  const bytes = await fs.readFile(storagePath);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const content = mimeType === "application/pdf"
    ? [{ type: "input_file" as const, filename: path.basename(storagePath), file_data: `data:application/pdf;base64,${bytes.toString("base64")}` }, { type: "input_text" as const, text: systemRules }]
    : [{ type: "input_text" as const, text: `${systemRules}\n\nDOCUMENT:\n${bytes.toString("utf8")}` }];
  const response = await client.responses.parse({
    model: process.env.OPENAI_TEXT_MODEL ?? "gpt-5.6",
    store: false,
    input: [{ role: "user", content }],
    text: { format: zodTextFormat(documentExtractionSchema, "document_extraction") },
  });
  if (!response.output_parsed) throw new Error("The model returned no validated extraction.");
  return documentExtractionSchema.parse(response.output_parsed);
}
