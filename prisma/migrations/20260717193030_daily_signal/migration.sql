-- CreateTable
CREATE TABLE "DailySignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "signalDate" TEXT NOT NULL,
    "inputMode" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "transcript" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "extractionJson" TEXT,
    "questionsJson" TEXT NOT NULL DEFAULT '[]',
    "answersJson" TEXT NOT NULL DEFAULT '{}',
    "confirmedJson" TEXT,
    "trendSummary" TEXT,
    "shareSuggested" BOOLEAN NOT NULL DEFAULT false,
    "shareReason" TEXT,
    "urgentRuleTriggered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailySignal_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailySignalDismissal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "signalDate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "DailySignal_patientId_signalDate_idx" ON "DailySignal"("patientId", "signalDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailySignalDismissal_patientId_signalDate_key" ON "DailySignalDismissal"("patientId", "signalDate");
