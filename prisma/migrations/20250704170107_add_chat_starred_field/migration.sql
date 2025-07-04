-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "isStarred" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "model" TEXT;

-- CreateIndex
CREATE INDEX "Chat_userId_isStarred_idx" ON "Chat"("userId", "isStarred");

-- CreateIndex
CREATE INDEX "Chat_userId_createdAt_idx" ON "Chat"("userId", "createdAt");
