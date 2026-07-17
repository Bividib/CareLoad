import { db } from "@/lib/db";
import { DemoControls } from "@/components/DemoControls";

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
  const environmentForcesFixtures =
    process.env.DEMO_AI_FALLBACK === "true" || !process.env.OPENAI_API_KEY;
  const effectiveFixtureMode = persistedFixtureMode || environmentForcesFixtures;

  return (
    <main className="demo-page">
      <h1>CareLoad presenter controls</h1>
      <p>
        Development-only controls for the entirely synthetic patient demo. This
        route is not linked from patient navigation.
      </p>
      <p role="status">
        <strong>
          Current AI processing mode:{" "}
          {effectiveFixtureMode ? "fixture demo results" : "live OpenAI"}
        </strong>
        .{" "}
        {environmentForcesFixtures
          ? "The server environment forces fixture mode (or has no API key)."
          : "The persisted presenter toggle controls the mode."}
      </p>
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
