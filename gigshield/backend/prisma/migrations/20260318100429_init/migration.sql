-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "workerHash" TEXT NOT NULL,
    "platforms" TEXT[],
    "zone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "weeklyEarningsHistory" DOUBLE PRECISION[],
    "currentWeeklyPremium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zoneRiskScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "seasonalMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "premiumAmount" DOUBLE PRECISION NOT NULL,
    "premiumPaid" BOOLEAN NOT NULL DEFAULT false,
    "coverageActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "disruptionType" TEXT NOT NULL,
    "gate1Passed" BOOLEAN NOT NULL DEFAULT false,
    "gate2Passed" BOOLEAN NOT NULL DEFAULT false,
    "fraudCheckPassed" BOOLEAN NOT NULL DEFAULT false,
    "payoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutStatus" TEXT NOT NULL DEFAULT 'pending',
    "disruptionStartTime" TIMESTAMP(3) NOT NULL,
    "disruptionEndTime" TIMESTAMP(3),
    "hoursLost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisruptionEvent" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confirmedByApi" BOOLEAN NOT NULL DEFAULT false,
    "apiSource" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisruptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnomalyArchetype" (
    "id" TEXT NOT NULL,
    "signatureHash" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "isAutoTrigger" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnomalyArchetype_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_workerHash_key" ON "Worker"("workerHash");

-- CreateIndex
CREATE UNIQUE INDEX "AnomalyArchetype_signatureHash_key" ON "AnomalyArchetype"("signatureHash");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
