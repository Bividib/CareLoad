import { db } from "@/lib/db";
import { DemoControls } from "@/components/DemoControls";
import { elevenLabsSttModel, openAiTextModel } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const [setting, audits] = await Promise.all([
    db.demoSetting.findUnique({ where: { id: "demo" } }),
    db.auditEvent.findMany({
      where: { patientId: "eleanor-reed" },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);
  const persistedFixtureMode = setting?.fixtureMode ?? true;
  const environmentForcesTextFixtures =
    process.env.DEMO_AI_FALLBACK === "true" || !process.env.OPENAI_API_KEY;
  const environmentForcesVoiceFixtures =
    process.env.DEMO_AI_FALLBACK === "true" || !process.env.ELEVENLABS_API_KEY;
  const effectiveTextFixtureMode = persistedFixtureMode || environmentForcesTextFixtures;
  const effectiveVoiceFixtureMode = persistedFixtureMode || environmentForcesVoiceFixtures;

  return (
    <main className="demo-page">
      <h1>CareLoad presenter controls</h1>
      <p>
        Development-only controls for the entirely synthetic patient demo. This
        route is not linked from patient navigation.
      </p>
      <div role="status" className="demo-mode-status">
        <p><strong>Document and text extraction:</strong> {effectiveTextFixtureMode ? "demo fixtures" : "live OpenAI"}</p>
        <p><strong>Voice transcription:</strong> {effectiveVoiceFixtureMode ? "demo transcript" : "live ElevenLabs"}</p>
        <p>{environmentForcesTextFixtures || environmentForcesVoiceFixtures
          ? "At least one provider is forced to fixtures because its server key is missing or DEMO_AI_FALLBACK is on."
          : "The persisted presenter toggle controls both modes."}</p>
      </div>
      <ul className="demo-models">
        <li><strong>Text model:</strong> {openAiTextModel()}</li>
        <li><strong>Transcription model:</strong> ElevenLabs {elevenLabsSttModel()}</li>
      </ul>
      <DemoControls fixtureMode={persistedFixtureMode} />
      <h2>AuditEvent timeline</h2>
      <ol>
        {audits.map((event) => (
          <li key={event.id}>
            <strong>{event.type}</strong> — {event.summary}
          </li>
        ))}
      </ol>
    </main>
  );
}
