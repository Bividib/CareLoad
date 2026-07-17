import { z } from "zod";

const serverEnvironmentSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_TEXT_MODEL: z.string().min(1).optional(),
  OPENAI_TRANSCRIPTION_MODEL: z.string().min(1).optional(),
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
