import { ZodError } from "zod";

export type SafeAiError = {
  code:
    | "CONFIGURATION"
    | "MODEL_ACCESS"
    | "RATE_LIMITED"
    | "TIMEOUT"
    | "VALIDATION"
    | "REQUEST_FAILED";
  message: string;
};

type ErrorDetails = {
  status?: unknown;
  code?: unknown;
  name?: unknown;
  message?: unknown;
};

export function safeAiError(error: unknown, provider: "OpenAI" | "ElevenLabs" = "OpenAI"): SafeAiError {
  if (error instanceof ZodError) {
    return {
      code: "CONFIGURATION",
      message: "Live AI configuration is invalid. Check the server settings on the demo controls page.",
    };
  }

  const details = typeof error === "object" && error !== null
    ? error as ErrorDetails
    : {};
  const status = typeof details.status === "number" ? details.status : undefined;
  const code = typeof details.code === "string" ? details.code : "";
  const name = typeof details.name === "string" ? details.name : "";
  const message = typeof details.message === "string" ? details.message.toLocaleLowerCase() : "";

  if ([401, 403, 404].includes(status ?? 0) || code === "model_not_found") {
    return {
      code: "MODEL_ACCESS",
      message: `The configured ${provider} model or API key is not available to this project.`,
    };
  }
  if (status === 429) {
    return {
      code: "RATE_LIMITED",
      message: `${provider} is temporarily rate-limiting this demo. Your input was preserved; wait briefly and retry.`,
    };
  }
  if (
    name.includes("Timeout")
    || code === "ETIMEDOUT"
    || code === "ECONNABORTED"
    || message.includes("timed out")
    || message.includes("timeout")
  ) {
    return {
      code: "TIMEOUT",
      message: `The live ${provider} request timed out. Your input was preserved; retry when ready.`,
    };
  }
  if (message.includes("validated") || message.includes("schema") || message.includes("parse")) {
    return {
      code: "VALIDATION",
      message: `${provider} returned a result that did not match CareLoad's safety schema.`,
    };
  }
  return {
    code: "REQUEST_FAILED",
    message: `The live ${provider} request failed. Your input was preserved; retry when ready.`,
  };
}
