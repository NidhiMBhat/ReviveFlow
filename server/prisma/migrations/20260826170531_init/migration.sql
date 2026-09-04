-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "failureReason" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "intentPersona" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "aiConfidence" DOUBLE PRECISION,
    "policyDecision" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "revenueRecovered" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyRule" (
    "id" TEXT NOT NULL,
    "maxAutoRecoveryAmount" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "maxRetryAttempts" INTEGER NOT NULL DEFAULT 2,
    "requireApprovalHighRisk" BOOLEAN NOT NULL DEFAULT true,
    "autonomyMode" TEXT NOT NULL DEFAULT 'AUTONOMOUS',

    CONSTRAINT "PolicyRule_pkey" PRIMARY KEY ("id")
);
