import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  const signal = await db.dailySignal.create({ data: {
    id: `signal-same-${Date.now()}`, patientId: "eleanor-reed", signalDate: "2026-07-17",
    inputMode: "SAME", rawText: "I feel about the same", status: "RECORDED_ONLY",
    extractionJson: JSON.stringify({ observations: [], missingInformation: [], suggestedQuestionIds: [], differentFromRecentPattern: false, shareSuggested: false, shareReason: null, requiresDeterministicRuleCheck: false }),
    confirmedJson: "[]", trendSummary: "No new observations were recorded.",
  } });
  return NextResponse.json({ id: signal.id });
}

