/*
  Warnings:

  - You are about to drop the column `apiKeys` on the `UserSettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('OPENAI', 'GOOGLE', 'ANTHROPIC');

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "apiKeys";

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userSettingsId" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "lastValidated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiKey_userSettingsId_idx" ON "ApiKey"("userSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userSettingsId_provider_key" ON "ApiKey"("userSettingsId", "provider");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userSettingsId_fkey" FOREIGN KEY ("userSettingsId") REFERENCES "UserSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
