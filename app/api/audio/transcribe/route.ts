import OpenAI from "openai";
import { NextResponse } from "next/server";

const allowed = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"]);
const maxBytes = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  const mime = audio.type.split(";")[0];
  if (!allowed.has(mime)) return NextResponse.json({ error: "Use WebM, OGG, MP4, or MP3 audio." }, { status: 415 });
  if (!audio.size || audio.size > maxBytes) return NextResponse.json({ error: "Audio must be between 1 byte and 10 MB." }, { status: 413 });
  if (process.env.DEMO_AI_FALLBACK === "true" || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ transcript: "My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.", mode: "FIXTURE" });
  }
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.audio.transcriptions.create({ file: audio, model: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-mini-transcribe" });
    return NextResponse.json({ transcript: result.text, mode: "LIVE" });
  } catch {
    return NextResponse.json({ error: "Transcription failed. Your recording was not stored; you can retry or type instead." }, { status: 502 });
  }
}

