-- AlterTable
ALTER TABLE "VerifiedCareTask" ADD COLUMN "secondWindowEnd" TEXT;
ALTER TABLE "VerifiedCareTask" ADD COLUMN "secondWindowStart" TEXT;

-- CreateTable
CREATE TABLE "CarePlanChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "fixtureKey" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "proposedPlanId" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    CONSTRAINT "CarePlanChange_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SimulationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changeId" TEXT NOT NULL,
    "baselinePlanId" TEXT NOT NULL,
    "proposedPlanId" TEXT NOT NULL,
    "metricsJson" TEXT NOT NULL,
    "resolvedJson" TEXT NOT NULL,
    "unresolvedJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulationResult_changeId_fkey" FOREIGN KEY ("changeId") REFERENCES "CarePlanChange" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulationResult_changeId_key" ON "SimulationResult"("changeId");
