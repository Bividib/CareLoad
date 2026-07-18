import { z } from "zod";
import { aiRequestTimeoutMs, elevenLabsBaseUrl, elevenLabsSttModel } from "@/lib/env";

const transcriptionResponseSchema = z.object({
  text: z.string().min(1),
}).passthrough();

export class ElevenLabsRequestError extends Error {
  constructor(public readonly status: number) {
    super(`ElevenLabs transcription request failed with status ${status}.`);
    this.name = "ElevenLabsRequestError";
  }
}

export async function transcribeWithElevenLabs(
  audio: File,
  environment: Record<string, string | undefined> = process.env,
): Promise<string> {
  const parsedEnvironment = {
    apiKey: environment.ELEVENLABS_API_KEY?.trim(),
    baseUrl: elevenLabsBaseUrl(environment),
    model: elevenLabsSttModel(environment),
    timeoutMs: aiRequestTimeoutMs(environment),
  };
  if (!parsedEnvironment.apiKey) {
    throw new ElevenLabsRequestError(401);
  }

  const form = new FormData();
  form.append("file", audio, audio.name);
  form.append("model_id", parsedEnvironment.model);
  form.append("language_code", "eng");

  const response = await fetch(`${parsedEnvironment.baseUrl}/v1/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": parsedEnvironment.apiKey },
    body: form,
    signal: AbortSignal.timeout(parsedEnvironment.timeoutMs),
  });
  if (!response.ok) throw new ElevenLabsRequestError(response.status);

  return transcriptionResponseSchema.parse(await response.json()).text;
}
