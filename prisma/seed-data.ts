import type { PrismaClient } from "../generated/prisma6";

const patientId = "eleanor-reed";
const weekdays = "MON,TUE,WED,THU,FRI";

export async function resetSyntheticData(db: PrismaClient) {
  await db.simulatedResponseJob.deleteMany();
  await db.message.deleteMany();
  await db.messageThread.deleteMany();
  await db.dailySignalDismissal.deleteMany();
  await db.dailySignal.deleteMany();
  await db.patientFactConfirmation.deleteMany();
  await db.candidateCareTask.deleteMany();
  await db.careDocument.deleteMany();
  await db.auditEvent.deleteMany();
  await db.scheduledPlanItem.deleteMany();
  await db.carePlanVersion.deleteMany();
  await db.supportPerson.deleteMany();
  await db.frictionFactor.deleteMany();
  await db.patientPreference.deleteMany();
  await db.lifeAnchor.deleteMany();
  await db.verifiedCareTask.deleteMany();
  await db.condition.deleteMany();
  await db.patient.deleteMany();

  await db.patient.create({
    data: {
      id: patientId,
      name: "Eleanor Reed",
      synthetic: true,
      conditions: {
        create: [
          { id: "condition-heart-failure", name: "Heart failure" },
          { id: "condition-diabetes", name: "Type 2 diabetes" },
          { id: "condition-thyroid", name: "Hypothyroidism" },
        ],
      },
      anchors: {
        create: [
          { id: "anchor-school", title: "School run", category: "FAMILY", startTime: "07:30", endTime: "08:15", weekdays, protected: true, location: "away" },
          { id: "anchor-work", title: "Part-time work", category: "WORK", startTime: "08:30", endTime: "14:00", weekdays, protected: true, location: "work" },
          { id: "anchor-granddaughter", title: "Granddaughter care", category: "FAMILY", startTime: "15:00", endTime: "18:30", weekdays: "TUE,THU", protected: true, location: "home" },
          { id: "anchor-walk", title: "Evening walk", category: "ACTIVITY", startTime: "19:00", endTime: "19:30", weekdays: "MON,TUE,WED,THU,FRI,SAT,SUN", protected: true, location: "away" },
        ],
      },
      preferences: {
        create: [
          { id: "pref-bundle", key: "bundle", label: "Prefers tasks bundled together" },
          { id: "pref-notifications", key: "fewer-notifications", label: "Prefers fewer notifications" },
          { id: "pref-voice", key: "voice", label: "Prefers voice input" },
          { id: "pref-meals", key: "avoid-meals", label: "Avoid unnecessary health tasks during meals" },
        ],
      },
      frictions: {
        create: [
          { id: "friction-commute", category: "TIME", description: "Long commute" },
          { id: "friction-equipment", category: "LOCATION", description: "Monitoring equipment is normally at home" },
          { id: "friction-tired", category: "PHYSICAL", description: "Becomes tired after work" },
          { id: "friction-prescriptions", category: "SOCIAL", description: "Needs help collecting some prescriptions" },
          { id: "friction-checklists", category: "COGNITIVE", description: "Dislikes long or repetitive checklists" },
        ],
      },
      supportPeople: {
        create: {
          id: "support-maya", name: "Maya", relationship: "Daughter",
          mayCollectPrescription: true, mayProvideTransport: true,
          fullHealthAccess: false, availability: "FRI 14:30-17:00",
        },
      },
    },
  });

  const tasks = [
    ["levothyroxine", "Take Levothyroxine before breakfast", "GP care notes", "GP", "IMPORTANT", "WINDOW", "06:30", "07:30", null, "DAILY", null, 5, true, false, "home", null, "morning"],
    ["metformin", "Take Metformin with breakfast", "Diabetes medication list", "Diabetes clinic", "IMPORTANT", "WINDOW", "07:00", "08:30", null, "DAILY", null, 5, true, false, "home", null, "morning"],
    ["atorvastatin", "Take Atorvastatin in the evening", "GP care notes", "GP", "IMPORTANT", "WINDOW", "18:00", "22:00", null, "DAILY", null, 5, true, false, "home", null, "evening"],
    ["blood-pressure", "Morning blood-pressure check", "Cardiology discharge summary", "Cardiology", "IMPORTANT", "WINDOW", "06:30", "08:30", null, "DAILY", null, 5, true, false, "home", "Blood-pressure cuff", "morning"],
    ["weight", "Morning weight check", "Cardiology discharge summary", "Cardiology", "IMPORTANT", "WINDOW", "06:30", "08:30", null, "DAILY", null, 5, true, false, "home", "Scales", "morning"],
    ["foot-check", "Evening foot check", "Diabetes clinic letter", "Diabetes clinic", "ROUTINE", "WINDOW", "18:00", "22:00", null, "DAILY", null, 5, true, false, "home", null, "evening"],
    ["questionnaire", "Weekly wellbeing questionnaire", "Cardiology clinic letter", "Cardiology", "ROUTINE", "FLEXIBLE", "09:00", "18:00", null, "WEEKLY", "FRI", 10, true, false, null, null, "admin"],
    ["cardiology-appointment", "Cardiology appointment", "Cardiology appointment letter", "Cardiology", "FIXED", "APPOINTMENT", "11:00", "11:45", "11:00", "ONE_OFF", "WED", 45, false, false, "clinic", null, null],
    ["diabetes-appointment", "Diabetes review appointment", "Diabetes appointment letter", "Diabetes clinic", "FIXED", "APPOINTMENT", "15:30", "16:15", "15:30", "ONE_OFF", "MON", 45, false, false, "clinic", null, null],
    ["prescription", "Collect repeat prescription", "GP care notes", "GP", "ROUTINE", "WINDOW", "14:00", "17:30", null, "WEEKLY", "FRI", 20, true, true, "pharmacy", null, "admin"],
    ["symptom-log", "Symptom log", "Cardiology discharge summary", "Cardiology", "ROUTINE", "WINDOW", "18:00", "22:00", null, "DAILY", null, 5, true, false, "home", null, "evening"],
    ["education", "Read heart-health education", "Cardiology education leaflet", "Cardiology", "ROUTINE", "FLEXIBLE", "14:00", "18:00", null, "WEEKLY", "SAT", 15, true, false, "home", null, "education"],
  ] as const;

  for (const task of tasks) {
    await db.verifiedCareTask.create({
      data: {
        id: task[0], patientId, title: task[1], source: task[2],
        supportingText: `Synthetic source text: ${task[1]}.`, ownerService: task[3],
        criticality: task[4], timingType: task[5], windowStart: task[6],
        windowEnd: task[7], fixedTime: task[8], frequency: task[9],
        weekdays: task[10], durationMinutes: task[11], mayMove: task[12],
        mayDelegate: task[13], requiredLocation: task[14],
        requiredEquipment: task[15], bundleGroup: task[16],
        templateKey: task[0], active: false,
      },
    });
  }

  await db.patientFactConfirmation.createMany({ data: [
    { id: "fact-bp-monitor", patientId, key: "bp-monitor-home", label: "Eleanor has a blood-pressure monitor at home" },
    { id: "fact-prescription-current", patientId, key: "prescription-current", label: "Prescription collection remains current" },
    { id: "fact-medication-list", patientId, key: "medication-list-current", label: "The medication list is current" },
    { id: "fact-appointments", patientId, key: "appointments-active", label: "Selected appointments remain active" },
  ] });
  await db.auditEvent.create({
    data: { id: "audit-seed", patientId, type: "DEMO_RESET", summary: "Synthetic Eleanor starting state restored" },
  });
}
