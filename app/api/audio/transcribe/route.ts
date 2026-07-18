import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateAudio } from "@/domain/daily-signal/audio-validation";
import { safeAiError } from "@/lib/ai-errors";
import { transcribeWithElevenLabs } from "@/lib/elevenlabs-transcription";

export async function POST(request: Request) {
  const form = await request.formData();
  const audio = form.get("audio");
  const context = form.get("context");
  if (!(audio instanceof File)) return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  const validation = validateAudio(audio);
  if (validation) return NextResponse.json({ error: validation.error }, { status: validation.status });
  const setting = await db.demoSetting.findUnique({ where: { id: "demo" } });
  if (setting?.fixtureMode || process.env.DEMO_AI_FALLBACK === "true" || !process.env.ELEVENLABS_API_KEY) {
    const transcript = context === "ONBOARDING"
      ? "I work weekday mornings, look after my granddaughter on Tuesdays and Thursdays, prefer fewer reminders, and usually walk in the evening."
      : "My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.";
    return NextResponse.json({ transcript, mode: "FIXTURE" });
  }
  try {
    const transcript = await transcribeWithElevenLabs(audio);
    return NextResponse.json({ transcript, mode: "LIVE", provider: "ELEVENLABS" });
  } catch (error) {
    const safeError = safeAiError(error, "ElevenLabs");
    return NextResponse.json({
      error: `${safeError.message} Your recording was not stored; you can retry or type instead.`,
      errorCode: safeError.code,
    }, { status: 502 });
  }
}
