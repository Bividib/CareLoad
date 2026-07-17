import { z } from "zod";

export const simulatedResponseSchema = z.object({
  scenarioKey: z.enum(["MONITOR_AND_REVIEW_IF_PERSISTENT","ROUTINE_REVIEW_OFFERED","REQUEST_MORE_INFORMATION","CLARIFICATION_APPROVED","CLARIFICATION_NO_CHANGE","URGENT_TEMPLATE"]),
  message: z.string().min(1),
  actionsForToday: z.array(z.string()),
  reviewSuggested: z.boolean(),
  urgentTemplateRequired: z.boolean(),
}).strict();

export type SimulatedCareTeamResponse = z.infer<typeof simulatedResponseSchema>;

export const responseTemplates: Record<SimulatedCareTeamResponse["scenarioKey"], SimulatedCareTeamResponse> = {
  MONITOR_AND_REVIEW_IF_PERSISTENT: { scenarioKey: "MONITOR_AND_REVIEW_IF_PERSISTENT", message: "Thank you for the update. The fictional team has recorded what you confirmed and would review it if the change continues.", actionsForToday: ["Continue following the current synthetic care plan.", "Use CareLoad to record another optional check-in if you choose."], reviewSuggested: true, urgentTemplateRequired: false },
  ROUTINE_REVIEW_OFFERED: { scenarioKey: "ROUTINE_REVIEW_OFFERED", message: "Thank you. The fictional team has offered a routine review of the observations you confirmed.", actionsForToday: ["Your active care plan has not changed."], reviewSuggested: true, urgentTemplateRequired: false },
  REQUEST_MORE_INFORMATION: { scenarioKey: "REQUEST_MORE_INFORMATION", message: "The fictional team would like more information before responding to this synthetic update.", actionsForToday: ["Your active care plan remains unchanged."], reviewSuggested: true, urgentTemplateRequired: false },
  CLARIFICATION_APPROVED: { scenarioKey: "CLARIFICATION_APPROVED", message: "The fictional service approved the alternative operational window described in this demonstration.", actionsForToday: ["Review the revised proposed plan before accepting it."], reviewSuggested: false, urgentTemplateRequired: false },
  CLARIFICATION_NO_CHANGE: { scenarioKey: "CLARIFICATION_NO_CHANGE", message: "The fictional service stated that the original verified window remains required.", actionsForToday: ["The unresolved conflict remains visible in the proposed plan."], reviewSuggested: false, urgentTemplateRequired: false },
  URGENT_TEMPLATE: { scenarioKey: "URGENT_TEMPLATE", message: "A configured synthetic urgent demonstration rule matched. Routine delayed messaging is not presented as sufficient.", actionsForToday: ["This is predefined prototype wording, not clinical guidance."], reviewSuggested: false, urgentTemplateRequired: true },
};

export function classifyResponse(input: { urgent: boolean; clarification: boolean; shareSuggested: boolean }) {
  if (input.urgent) return "URGENT_TEMPLATE" as const;
  if (input.clarification) return "CLARIFICATION_APPROVED" as const;
  return input.shareSuggested ? "ROUTINE_REVIEW_OFFERED" as const : "MONITOR_AND_REVIEW_IF_PERSISTENT" as const;
}

