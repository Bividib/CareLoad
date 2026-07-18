import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createInitialProposedPlan, createProposedPlan } from "@/lib/plan-service";

const schema = z.object({
  anchors: z.array(z.object({ id: z.string(), title: z.string().min(1), startTime: z.string().regex(/^\d\d:\d\d$/), endTime: z.string().regex(/^\d\d:\d\d$/) })).min(1),
  frictions: z.array(z.object({ id: z.string(), category: z.string(), description: z.string(), enabled: z.boolean() })),
  newFriction: z.string().trim().min(1).max(160).optional(),
});

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the Life Map fields." }, { status: 400 });
  await db.$transaction(async (tx) => {
    await tx.lifeAnchor.deleteMany({
      where: {
        patientId: "eleanor-reed",
        id: { notIn: parsed.data.anchors.map((anchor) => anchor.id) },
      },
    });
    for (const anchor of parsed.data.anchors) {
      await tx.lifeAnchor.upsert({
        where: { id: anchor.id },
        update: { title: anchor.title, startTime: anchor.startTime, endTime: anchor.endTime },
        create: { ...anchor, patientId: "eleanor-reed", category: "ROUTINE", weekdays: "MON,TUE,WED,THU,FRI,SAT,SUN", protected: true },
      });
    }
    for (const friction of parsed.data.frictions) await tx.frictionFactor.update({ where: { id: friction.id }, data: { enabled: friction.enabled } });
    if (parsed.data.newFriction) await tx.frictionFactor.create({ data: { id: `friction-${Date.now()}`, patientId: "eleanor-reed", category: "TIME", description: parsed.data.newFriction } });
    await tx.auditEvent.create({ data: { id: `audit-life-map-${Date.now()}`, patientId: "eleanor-reed", type: "LIFE_MAP_SAVED", summary: "Patient saved synthetic Life Map and requested replanning" } });
  });
  const active = await db.carePlanVersion.count({ where: { patientId: "eleanor-reed", status: "ACTIVE" } });
  if (active) await createProposedPlan(db, "eleanor-reed");
  else await createInitialProposedPlan(db, "eleanor-reed");
  return NextResponse.json({ ok: true, proposedPlanCreated: true });
}
