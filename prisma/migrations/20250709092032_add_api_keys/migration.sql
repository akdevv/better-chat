/*
  Warnings:

  - You are about to drop the column `userSettingsId` on the `ApiKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,provider]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userSettingsId_fkey";

-- DropIndex
DROP INDEX "ApiKey_userSettingsId_idx";

-- DropIndex
DROP INDEX "ApiKey_userSettingsId_provider_key";

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "userSettingsId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_provider_key" ON "ApiKey"("userId", "provider");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
