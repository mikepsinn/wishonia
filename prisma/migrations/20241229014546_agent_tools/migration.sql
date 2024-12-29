/*
  Warnings:

  - A unique constraint covering the columns `[scheduleId,scheduledFor]` on the table `ScheduledCall` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ToolType" ADD VALUE 'DISCORD';
ALTER TYPE "ToolType" ADD VALUE 'TELEGRAM';
ALTER TYPE "ToolType" ADD VALUE 'TWITTER';
ALTER TYPE "ToolType" ADD VALUE 'LINKEDIN';
ALTER TYPE "ToolType" ADD VALUE 'GITHUB_APP';
ALTER TYPE "ToolType" ADD VALUE 'SLACK';
ALTER TYPE "ToolType" ADD VALUE 'WHATSAPP';
ALTER TYPE "ToolType" ADD VALUE 'EMAIL';
ALTER TYPE "ToolType" ADD VALUE 'SMS';

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "credentialId" TEXT;

-- CreateTable
CREATE TABLE "PlatformCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "ToolType" NOT NULL,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "webhookUrl" TEXT,
    "apiKey" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAction" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "platform" "ToolType" NOT NULL,
    "actionType" TEXT NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "requestData" JSONB NOT NULL,
    "responseData" JSONB,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PlatformAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformCredential_userId_idx" ON "PlatformCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformCredential_userId_platform_key" ON "PlatformCredential"("userId", "platform");

-- CreateIndex
CREATE INDEX "PlatformAction_toolId_idx" ON "PlatformAction"("toolId");

-- CreateIndex
CREATE INDEX "PlatformAction_agentId_idx" ON "PlatformAction"("agentId");

-- CreateIndex
CREATE INDEX "PlatformAction_platform_idx" ON "PlatformAction"("platform");

-- CreateIndex
CREATE INDEX "PlatformAction_status_idx" ON "PlatformAction"("status");

-- CreateIndex
CREATE INDEX "PlatformAction_createdAt_idx" ON "PlatformAction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledCall_scheduleId_scheduledFor_key" ON "ScheduledCall"("scheduleId", "scheduledFor");

-- CreateIndex
CREATE INDEX "Tool_credentialId_idx" ON "Tool"("credentialId");

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "PlatformCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformCredential" ADD CONSTRAINT "PlatformCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformAction" ADD CONSTRAINT "PlatformAction_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformAction" ADD CONSTRAINT "PlatformAction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
