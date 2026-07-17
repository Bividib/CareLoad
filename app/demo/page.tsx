import { db } from "@/lib/db";
import { DemoControls } from "@/components/DemoControls";

export const dynamic = "force-dynamic";
export default async function DemoPage() {
  const [setting, audits] = await Promise.all([db.demoSetting.findUnique({ where: { id: "demo" } }), db.auditEvent.findMany({ where: { patientId: "eleanor-reed" }, orderBy: { createdAt: "desc" }, take: 30 })]);
  return <main className="demo-page"><h1>CareLoad presenter controls</h1><p>Development-only controls for the entirely synthetic patient demo. This route is not linked from patient navigation.</p><DemoControls fixtureMode={setting?.fixtureMode ?? true} /><h2>AuditEvent timeline</h2><ol>{audits.map((event) => <li key={event.id}><strong>{event.type}</strong> — {event.summary}</li>)}</ol></main>;
}
