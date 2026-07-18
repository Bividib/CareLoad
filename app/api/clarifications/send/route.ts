import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { responseDelayMs } from "@/lib/simulated-responses";
import { clarificationKindForQuestion } from "@/domain/messages/responses";

const schema = z.object({ changeId: z.string().min(1), body: z.string().min(1).max(2000) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Clarification text is required." }, { status: 400 });
  const suffix = `${parsed.data.changeId}-${Date.now()}`;
  const result = await db.$transaction(async (tx) => {
    const thread = await tx.messageThread.create({ data: { id: `thread-clarification-${suffix}`, patientId: "eleanor-reed", subject: "Care-plan clarification" } });
    const message = await tx.message.create({
      data: {
        id: `message-clarification-${suffix}`,
        threadId: thread.id,
        patientId: "eleanor-reed",
        author: "PATIENT",
        body: parsed.data.body,
        metadataJson: JSON.stringify({ clarificationKind: clarificationKindForQuestion(parsed.data.body) }),
      },
    });
    const dueAt = new Date(Date.now() + responseDelayMs());
    await tx.simulatedResponseJob.create({ data: { id: `response-job-${message.id}`, patientId: "eleanor-reed", threadId: thread.id, triggeringMessageId: message.id, family: "CLARIFICATION", dueAt } });
    return { threadId: thread.id, dueAt };
  });
  return NextResponse.json(result);
}

