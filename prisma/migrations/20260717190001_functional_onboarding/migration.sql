-- CreateTable
CREATE TABLE "CareDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "safeName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "extractionMode" TEXT,
    "errorMessage" TEXT,
    "documentTitle" TEXT,
    "issuingService" TEXT,
    "documentDate" TEXT,
    "uncertaintiesJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateCareTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceQuote" TEXT NOT NULL,
    "sourcePage" INTEGER,
    "explicitFrequency" TEXT,
    "explicitTiming" TEXT,
    "explicitDuration" TEXT,
    "requiresPatientConfirmation" BOOLEAN NOT NULL,
    "requiresClinicalVerification" BOOLEAN NOT NULL,
    "confidence" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "templateKey" TEXT,
    "verifiedTaskId" TEXT,
    "decisionAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateCareTask_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CandidateCareTask_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CareDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CandidateCareTask_verifiedTaskId_fkey" FOREIGN KEY ("verifiedTaskId") REFERENCES "VerifiedCareTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientFactConfirmation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT 'UNANSWERED',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientFactConfirmation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "synthetic" BOOLEAN NOT NULL DEFAULT true,
    "planningConsent" BOOLEAN NOT NULL DEFAULT false,
    "syntheticDataConsent" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingSources" TEXT NOT NULL DEFAULT '[]',
    "talkThroughText" TEXT,
    "talkThroughDraft" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Patient" ("createdAt", "id", "name", "synthetic") SELECT "createdAt", "id", "name", "synthetic" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE TABLE "new_VerifiedCareTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "supportingText" TEXT NOT NULL,
    "ownerService" TEXT NOT NULL,
    "criticality" TEXT NOT NULL,
    "timingType" TEXT NOT NULL,
    "windowStart" TEXT NOT NULL,
    "windowEnd" TEXT NOT NULL,
    "fixedTime" TEXT,
    "frequency" TEXT NOT NULL,
    "weekdays" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "mayMove" BOOLEAN NOT NULL,
    "mayDelegate" BOOLEAN NOT NULL,
    "requiredLocation" TEXT,
    "requiredEquipment" TEXT,
    "bundleGroup" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "templateKey" TEXT,
    CONSTRAINT "VerifiedCareTask_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VerifiedCareTask" ("bundleGroup", "criticality", "durationMinutes", "endDate", "fixedTime", "frequency", "id", "mayDelegate", "mayMove", "ownerService", "patientId", "requiredEquipment", "requiredLocation", "source", "startDate", "supportingText", "timingType", "title", "verified", "weekdays", "windowEnd", "windowStart") SELECT "bundleGroup", "criticality", "durationMinutes", "endDate", "fixedTime", "frequency", "id", "mayDelegate", "mayMove", "ownerService", "patientId", "requiredEquipment", "requiredLocation", "source", "startDate", "supportingText", "timingType", "title", "verified", "weekdays", "windowEnd", "windowStart" FROM "VerifiedCareTask";
DROP TABLE "VerifiedCareTask";
ALTER TABLE "new_VerifiedCareTask" RENAME TO "VerifiedCareTask";
CREATE UNIQUE INDEX "VerifiedCareTask_templateKey_key" ON "VerifiedCareTask"("templateKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PatientFactConfirmation_patientId_key_key" ON "PatientFactConfirmation"("patientId", "key");
