-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "deadline" BIGINT,
ADD COLUMN     "screenshotSettings" JSONB;

-- CreateTable
CREATE TABLE "public"."ActivationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "employeeId" CHAR(15) NOT NULL,
    "email" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authUserId" TEXT,

    CONSTRAINT "ActivationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivationToken_token_key" ON "public"."ActivationToken"("token");

-- CreateIndex
CREATE INDEX "ActivationToken_token_idx" ON "public"."ActivationToken"("token");

-- CreateIndex
CREATE INDEX "ActivationToken_employeeId_idx" ON "public"."ActivationToken"("employeeId");

-- CreateIndex
CREATE INDEX "ActivationToken_email_idx" ON "public"."ActivationToken"("email");

-- AddForeignKey
ALTER TABLE "public"."ActivationToken" ADD CONSTRAINT "ActivationToken_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "public"."AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
