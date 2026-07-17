import { z } from "zod";

const sourced = z.object({ sourceQuote: z.string().min(1) });
export const documentExtractionSchema = z.object({
  documentTitle: z.string().nullable(),
  issuingService: z.string().nullable(),
  documentDate: z.string().nullable(),
  patientFacts: z.array(sourced.extend({ factType: z.string(), value: z.string(), confidence: z.number().min(0).max(1) })),
  candidateTasks: z.array(sourced.extend({
    title: z.string().min(1), description: z.string().nullable(), sourcePage: z.number().int().positive().nullable(),
    explicitFrequency: z.string().nullable(), explicitTiming: z.string().nullable(), explicitDuration: z.string().nullable(),
    requiresPatientConfirmation: z.boolean(), requiresClinicalVerification: z.boolean(), confidence: z.number().min(0).max(1),
  })),
  appointments: z.array(sourced.extend({ title: z.string(), date: z.string().nullable(), time: z.string().nullable(), location: z.string().nullable() })),
  medications: z.array(sourced.extend({ name: z.string(), instruction: z.string().nullable() })),
  uncertainties: z.array(sourced.extend({ description: z.string() })),
});

export type DocumentExtraction = z.infer<typeof documentExtractionSchema>;
