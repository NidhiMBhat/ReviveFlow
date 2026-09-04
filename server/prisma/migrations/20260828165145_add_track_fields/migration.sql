/*
  Warnings:

  - You are about to drop the column `requireApprovalHighRisk` on the `PolicyRule` table. All the data in the column will be lost.
  - You are about to drop the column `retryCount` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Subscription` table. All the data in the column will be lost.
  - Made the column `aiConfidence` on table `AuditLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `intentPersona` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "complianceNote" TEXT DEFAULT 'Standard compliance check passed',
ALTER COLUMN "aiConfidence" SET NOT NULL,
ALTER COLUMN "revenueRecovered" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PolicyRule" DROP COLUMN "requireApprovalHighRisk",
ALTER COLUMN "id" SET DEFAULT 'default';

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "retryCount",
DROP COLUMN "updatedAt",
ALTER COLUMN "intentPersona" SET NOT NULL;
