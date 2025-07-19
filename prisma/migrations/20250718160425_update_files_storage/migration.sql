/*
  Warnings:

  - You are about to drop the column `fileCategory` on the `MessageFile` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `MessageFile` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `MessageFile` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `MessageFile` table. All the data in the column will be lost.
  - You are about to drop the column `parsedContent` on the `MessageFile` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `MessageFile` table. All the data in the column will be lost.
  - You are about to drop the `MessageImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UploadedImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[messageId,uploadedFileId]` on the table `MessageFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uploadedFileId` to the `MessageFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileGroup" AS ENUM ('IMAGE', 'PDF', 'TEXT', 'CODE');

-- DropForeignKey
ALTER TABLE "MessageImage" DROP CONSTRAINT "MessageImage_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageImage" DROP CONSTRAINT "MessageImage_uploadedImageId_fkey";

-- AlterTable
ALTER TABLE "MessageFile" DROP COLUMN "fileCategory",
DROP COLUMN "fileName",
DROP COLUMN "metadata",
DROP COLUMN "mimeType",
DROP COLUMN "parsedContent",
DROP COLUMN "size",
ADD COLUMN     "uploadedFileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "MessageImage";

-- DropTable
DROP TABLE "UploadedImage";

-- DropEnum
DROP TYPE "FileCategory";

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "fileGroup" "FileGroup" NOT NULL,
    "uploadThingKey" TEXT NOT NULL,
    "uploadThingUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_uploadThingKey_key" ON "UploadedFile"("uploadThingKey");

-- CreateIndex
CREATE INDEX "UploadedFile_userId_idx" ON "UploadedFile"("userId");

-- CreateIndex
CREATE INDEX "UploadedFile_uploadThingKey_idx" ON "UploadedFile"("uploadThingKey");

-- CreateIndex
CREATE INDEX "UploadedFile_fileGroup_idx" ON "UploadedFile"("fileGroup");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFile_messageId_uploadedFileId_key" ON "MessageFile"("messageId", "uploadedFileId");

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageFile" ADD CONSTRAINT "MessageFile_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
