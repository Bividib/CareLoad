import { z } from "zod";

export const DEFAULT_OPENAI_TEXT_MODEL = "gpt-5-mini";
export const DEFAULT_ELEVENLABS_STT_MODEL = "scribe_v2";
export const DEFAULT_ELEVENLABS_BASE_URL = "https://api.elevenlabs.io";

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

const serverEnvironmentSchema = z.object({
  OPENAI_API_KEY: optionalNonEmptyString,
  OPENAI_TEXT_MODEL: optionalNonEmptyString,
  ELEVENLABS_API_KEY: optionalNonEmptyString,
  ELEVENLABS_STT_MODEL: optionalNonEmptyString,
  ELEVENLABS_BASE_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.url().default(DEFAULT_ELEVENLABS_BASE_URL),
  ),
  DATABASE_URL: z.string().default("file:./dev.db"),
  DEMO_AI_FALLBACK: z.enum(["true", "false"]).default("true"),
  DEMO_AI_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(25_000),
  DEMO_RESPONSE_DELAY_MS: z.coerce.number().int().nonnegative().default(10_000),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(
  environment: Record<string, string | undefined>,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}

export function aiRequestTimeoutMs(
  environment: Record<string, string | undefined> = process.env,
): number {
  return parseServerEnvironment(environment).DEMO_AI_TIMEOUT_MS;
}

export function openAiTextModel(
  environment: Record<string, string | undefined> = process.env,
): string {
  return parseServerEnvironment(environment).OPENAI_TEXT_MODEL ?? DEFAULT_OPENAI_TEXT_MODEL;
}

export function elevenLabsSttModel(
  environment: Record<string, string | undefined> = process.env,
): string {
  return parseServerEnvironment(environment).ELEVENLABS_STT_MODEL ?? DEFAULT_ELEVENLABS_STT_MODEL;
}

export function elevenLabsBaseUrl(
  environment: Record<string, string | undefined> = process.env,
): string {
  return parseServerEnvironment(environment).ELEVENLABS_BASE_URL.replace(/\/+$/, "");
}
