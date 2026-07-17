import { z } from "zod";

export const observationSchema = z.object({
  domain: z.string().min(1),
  value: z.string().min(1),
  trend: z.enum(["NEW", "WORSE", "SAME", "BETTER", "UNCLEAR"]),
  durationText: z.string().nullable(),
  certainty: z.enum(["CONFIRMED", "UNCERTAIN", "INFERRED_POSSIBILITY"]),
  sourcePhrase: z.string().min(1),
});

export const dailySignalExtractionSchema = z.object({
  observations: z.array(observationSchema),
  missingInformation: z.array(z.string()),
  suggestedQuestionIds: z.array(z.string()).max(2),
  differentFromRecentPattern: z.boolean(),
  shareSuggested: z.boolean(),
  shareReason: z.string().nullable(),
  requiresDeterministicRuleCheck: z.boolean(),
}).strict();

export type DailySignalExtraction = z.infer<typeof dailySignalExtractionSchema>;

