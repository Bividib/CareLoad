import { z } from "zod";

const serverEnvironmentSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_TEXT_MODEL: z.string().min(1).optional(),
  OPENAI_TRANSCRIPTION_MODEL: z.string().min(1).optional(),
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
  DEMO_AI_FALLBACK: z.enum(["true", "false"]).default("true"),
  DEMO_RESPONSE_DELAY_MS: z.coerce.number().int().nonnegative().default(10_000),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(
  environment: Record<string, string | undefined>,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
