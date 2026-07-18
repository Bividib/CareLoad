import { z } from "zod";

export const simulatedResponseSchema = z.object({
  scenarioKey: z.enum(["MONITOR_AND_REVIEW_IF_PERSISTENT","ROUTINE_REVIEW_OFFERED","REQUEST_MORE_INFORMATION","CLARIFICATION_APPROVED","CLARIFICATION_NO_CHANGE","URGENT_TEMPLATE"]),
  message: z.string().min(1),
  actionsForToday: z.array(z.string()),
  reviewSuggested: z.boolean(),
  urgentTemplateRequired: z.boolean(),
}).strict();

export type SimulatedCareTeamResponse = z.infer<typeof simulatedResponseSchema>;

export function clarificationKindForQuestion(body: string) {
  return /\b(what time|which time|morning|evening|window|schedule|conflict|childcare|work shift|daily routine)\b/i.test(body)
    ? "SCHEDULING_CONFLICT" as const
    : "INSTRUCTION_USE" as const;
}

export const responseTemplates: Record<SimulatedCareTeamResponse["scenarioKey"], SimulatedCareTeamResponse> = {
  MONITOR_AND_REVIEW_IF_PERSISTENT: { scenarioKey: "MONITOR_AND_REVIEW_IF_PERSISTENT", message: "Thank you for the update. The team has recorded what you confirmed and would review it if the change continues.", actionsForToday: ["Continue following the current synthetic care plan.", "Use CareLoad to record another optional check-in if you choose."], reviewSuggested: true, urgentTemplateRequired: false },
  ROUTINE_REVIEW_OFFERED: {
    scenarioKey: "ROUTINE_REVIEW_OFFERED",
    message: "Thank you for the update. I’ll prepare a care-plan update with extra blood-pressure monitoring. For this demo, record any reading above 180/120 mmHg or below 90/60 mmHg and follow the supplied care instructions.",
    actionsForToday: ["Your active care plan has not changed until you review and accept the proposed update."],
    reviewSuggested: true,
    urgentTemplateRequired: false,
  },
  REQUEST_MORE_INFORMATION: { scenarioKey: "REQUEST_MORE_INFORMATION", message: "The team would like more information before responding to this synthetic update.", actionsForToday: ["Your active care plan remains unchanged."], reviewSuggested: true, urgentTemplateRequired: false },
  CLARIFICATION_APPROVED: {
    scenarioKey: "CLARIFICATION_APPROVED",
    message: "For this demo measurement, sit quietly for five minutes with your back supported and feet flat. Place the cuff on your bare upper arm, then take the reading as shown in the supplied instructions.",
    actionsForToday: ["This is a predefined simulated response about using the demo blood-pressure cuff. It does not change your active plan."],
    reviewSuggested: false,
    urgentTemplateRequired: false,
  },
  CLARIFICATION_NO_CHANGE: {
    scenarioKey: "CLARIFICATION_NO_CHANGE",
    message: "The service stated that the original verified morning and evening windows remain required. It did not supply an alternative time for the conflicting reading.",
    actionsForToday: ["Your active plan remains unchanged.", "The unresolved conflict remains visible in the proposed plan for operational clarification."],
    reviewSuggested: false,
    urgentTemplateRequired: false,
  },
  URGENT_TEMPLATE: { scenarioKey: "URGENT_TEMPLATE", message: "A configured synthetic urgent demonstration rule matched. Routine delayed messaging is not presented as sufficient.", actionsForToday: ["This is predefined prototype wording, not clinical guidance."], reviewSuggested: false, urgentTemplateRequired: true },
};

export function classifyResponse(input: {
  urgent: boolean;
  clarification: boolean;
  shareSuggested: boolean;
  clarificationKind?: string;
}) {
  if (input.urgent) return "URGENT_TEMPLATE" as const;
  if (input.clarification) {
    return input.clarificationKind === "SCHEDULING_CONFLICT"
      ? "CLARIFICATION_NO_CHANGE" as const
      : "CLARIFICATION_APPROVED" as const;
  }
  return input.shareSuggested ? "ROUTINE_REVIEW_OFFERED" as const : "MONITOR_AND_REVIEW_IF_PERSISTENT" as const;
}

