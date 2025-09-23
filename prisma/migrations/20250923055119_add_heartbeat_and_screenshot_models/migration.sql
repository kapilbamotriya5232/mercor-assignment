/*
  Warnings:

  - You are about to drop the column `authUserId` on the `ActivationToken` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `screenshotSettings` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ActivationToken" DROP CONSTRAINT "ActivationToken_authUserId_fkey";

-- DropIndex
DROP INDEX "public"."ActivationToken_email_idx";

-- AlterTable
ALTER TABLE "public"."ActivationToken" DROP COLUMN "authUserId";

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "deadline",
DROP COLUMN "screenshotSettings";

-- AlterTable
ALTER TABLE "public"."Window" ADD COLUMN     "lastHeartbeat" BIGINT,
ADD COLUMN     "missedScreenshots" JSONB;

-- CreateIndex
CREATE INDEX "ActivationToken_expiresAt_idx" ON "public"."ActivationToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."Screenshot" ADD CONSTRAINT "Screenshot_windowId_fkey" FOREIGN KEY ("windowId") REFERENCES "public"."Window"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
