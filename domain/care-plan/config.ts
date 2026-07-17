export const plannerConfig = {
  slotMinutes: 15,
  maximumBundleMinutes: 30,
  interruptionGapMinutes: 60,
  weights: { bundle: 30, homeEquipment: 20, fewerInterruptions: 12, protectedOverlap: -1000, frictionPeriod: -20, travel: -25 },
} as const;
