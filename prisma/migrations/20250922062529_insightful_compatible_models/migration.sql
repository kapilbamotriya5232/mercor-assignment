/*
  Warnings:

  - You are about to alter the column `organizationId` on the `ApiToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - You are about to drop the column `employeeId` on the `AuditLog` table. All the data in the column will be lost.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `activationExpiry` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `activationToken` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `isOnboarded` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Employee` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - You are about to alter the column `organizationId` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - The primary key for the `Organization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `Organization` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isActive` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Project` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - You are about to alter the column `organizationId` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - You are about to drop the column `appName` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the column `base64Data` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the column `computerName` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the column `hasPermissions` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the column `macAddress` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the column `timeEntryId` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the column `windowTitle` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to alter the column `employeeId` on the `Screenshot` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isActive` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - You are about to alter the column `projectId` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(15)`.
  - You are about to drop the `TimeEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EmployeeToProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EmployeeToTask` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[authUserId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identifier` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invited` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedSettingsId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `createdAt` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createdAt` on the `Organization` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `creatorId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `createdAt` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `app` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appFileName` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appFilePath` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `computer` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hwid` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedSettingsId` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestampTranslated` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `Screenshot` table without a default value. This is not possible if the table is not empty.
  - The required column `windowId` was added to the `Screenshot` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `url` on table `Screenshot` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `timestamp` on the `Screenshot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `productivity` on table `Screenshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `osVersion` on table `Screenshot` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `creatorId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `createdAt` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."ApiToken" DROP CONSTRAINT "ApiToken_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Employee" DROP CONSTRAINT "Employee_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Screenshot" DROP CONSTRAINT "Screenshot_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Screenshot" DROP CONSTRAINT "Screenshot_timeEntryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimeEntry" DROP CONSTRAINT "TimeEntry_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimeEntry" DROP CONSTRAINT "TimeEntry_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EmployeeToProject" DROP CONSTRAINT "_EmployeeToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EmployeeToProject" DROP CONSTRAINT "_EmployeeToProject_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EmployeeToTask" DROP CONSTRAINT "_EmployeeToTask_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EmployeeToTask" DROP CONSTRAINT "_EmployeeToTask_B_fkey";

-- DropIndex
DROP INDEX "public"."AuditLog_employeeId_idx";

-- DropIndex
DROP INDEX "public"."Employee_activationToken_key";

-- DropIndex
DROP INDEX "public"."Employee_resetToken_key";

-- DropIndex
DROP INDEX "public"."Screenshot_timeEntryId_idx";

-- AlterTable
ALTER TABLE "public"."ApiToken" ALTER COLUMN "organizationId" SET DATA TYPE CHAR(15);

-- AlterTable
ALTER TABLE "public"."AuditLog" DROP COLUMN "employeeId",
ADD COLUMN     "authUserId" TEXT;

-- AlterTable
ALTER TABLE "public"."Employee" DROP CONSTRAINT "Employee_pkey",
DROP COLUMN "activationExpiry",
DROP COLUMN "activationToken",
DROP COLUMN "isActive",
DROP COLUMN "isOnboarded",
DROP COLUMN "lastLoginAt",
DROP COLUMN "password",
DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry",
DROP COLUMN "role",
DROP COLUMN "updatedAt",
ADD COLUMN     "accountId" CHAR(15) NOT NULL,
ADD COLUMN     "authUserId" TEXT,
ADD COLUMN     "deactivated" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "identifier" TEXT NOT NULL,
ADD COLUMN     "invited" BIGINT NOT NULL,
ADD COLUMN     "projects" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sharedSettingsId" CHAR(15) NOT NULL,
ADD COLUMN     "teamId" CHAR(15) NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'personal',
ALTER COLUMN "id" SET DATA TYPE CHAR(15),
ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL,
ALTER COLUMN "organizationId" SET DATA TYPE CHAR(15),
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Organization" DROP CONSTRAINT "Organization_pkey",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" SET DATA TYPE CHAR(15),
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL,
ADD CONSTRAINT "Organization_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "billable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "creatorId" CHAR(15) NOT NULL,
ADD COLUMN     "description" TEXT DEFAULT '',
ADD COLUMN     "employees" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "payroll" JSONB,
ADD COLUMN     "priorities" JSONB NOT NULL DEFAULT '["low","medium","high"]',
ADD COLUMN     "statuses" JSONB NOT NULL DEFAULT '["To do","In progress","Done"]',
ADD COLUMN     "teams" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "id" SET DATA TYPE CHAR(15),
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL,
ALTER COLUMN "organizationId" SET DATA TYPE CHAR(15),
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Screenshot" DROP COLUMN "appName",
DROP COLUMN "base64Data",
DROP COLUMN "computerName",
DROP COLUMN "hasPermissions",
DROP COLUMN "ipAddress",
DROP COLUMN "macAddress",
DROP COLUMN "timeEntryId",
DROP COLUMN "windowTitle",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "app" TEXT NOT NULL,
ADD COLUMN     "appFileName" TEXT NOT NULL,
ADD COLUMN     "appFilePath" TEXT NOT NULL,
ADD COLUMN     "appId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "appLabelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "categoryId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "categoryLabelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "computer" TEXT NOT NULL,
ADD COLUMN     "document" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "domain" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "gateways" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "hwid" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organizationId" CHAR(15) NOT NULL,
ADD COLUMN     "os" TEXT NOT NULL,
ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectId" CHAR(15) NOT NULL,
ADD COLUMN     "sharedSettingsId" CHAR(15) NOT NULL,
ADD COLUMN     "shiftId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "site" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "taskId" CHAR(15) NOT NULL,
ADD COLUMN     "taskPriority" TEXT,
ADD COLUMN     "taskStatus" TEXT,
ADD COLUMN     "teamId" CHAR(15) NOT NULL,
ADD COLUMN     "timestampTranslated" BIGINT NOT NULL,
ADD COLUMN     "timezoneOffset" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'scheduled',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user" TEXT NOT NULL,
ADD COLUMN     "windowId" TEXT NOT NULL,
ALTER COLUMN "url" SET NOT NULL,
ALTER COLUMN "url" SET DEFAULT '',
DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" BIGINT NOT NULL,
ALTER COLUMN "productivity" SET NOT NULL,
ALTER COLUMN "productivity" SET DEFAULT 1,
ALTER COLUMN "osVersion" SET NOT NULL,
ALTER COLUMN "employeeId" SET DATA TYPE CHAR(15);

-- AlterTable
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "billable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "creatorId" CHAR(15) NOT NULL,
ADD COLUMN     "description" TEXT DEFAULT '',
ADD COLUMN     "employees" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "organizationId" CHAR(15) NOT NULL,
ADD COLUMN     "payroll" JSONB,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'low',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'To Do',
ADD COLUMN     "teams" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "id" SET DATA TYPE CHAR(15),
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL,
ALTER COLUMN "projectId" SET DATA TYPE CHAR(15),
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."TimeEntry";

-- DropTable
DROP TABLE "public"."_EmployeeToProject";

-- DropTable
DROP TABLE "public"."_EmployeeToTask";

-- CreateTable
CREATE TABLE "public"."Window" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "note" TEXT NOT NULL DEFAULT '',
    "start" BIGINT NOT NULL,
    "end" BIGINT,
    "timezoneOffset" BIGINT NOT NULL DEFAULT 0,
    "shiftId" TEXT NOT NULL,
    "projectId" CHAR(15) NOT NULL,
    "taskId" CHAR(15) NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "overtime" BOOLEAN NOT NULL DEFAULT false,
    "billRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeBillRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimePayRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taskStatus" TEXT,
    "taskPriority" TEXT,
    "user" TEXT NOT NULL,
    "computer" TEXT NOT NULL,
    "domain" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "hwid" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "osVersion" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" CHAR(15) NOT NULL,
    "teamId" CHAR(15) NOT NULL,
    "sharedSettingsId" CHAR(15) NOT NULL,
    "organizationId" CHAR(15) NOT NULL,
    "startTranslated" BIGINT NOT NULL,
    "endTranslated" BIGINT,
    "negativeTime" BIGINT NOT NULL DEFAULT 0,
    "deletedScreenshots" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Window_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" CHAR(15) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "organizationId" CHAR(15) NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SharedSettings" (
    "id" CHAR(15) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'personal',
    "settings" JSONB DEFAULT '{}',
    "organizationId" CHAR(15) NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "SharedSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activationToken" TEXT,
    "activationExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "AuthUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Window_employeeId_idx" ON "public"."Window"("employeeId");

-- CreateIndex
CREATE INDEX "Window_projectId_idx" ON "public"."Window"("projectId");

-- CreateIndex
CREATE INDEX "Window_taskId_idx" ON "public"."Window"("taskId");

-- CreateIndex
CREATE INDEX "Window_start_idx" ON "public"."Window"("start");

-- CreateIndex
CREATE INDEX "Window_shiftId_idx" ON "public"."Window"("shiftId");

-- CreateIndex
CREATE INDEX "Team_organizationId_idx" ON "public"."Team"("organizationId");

-- CreateIndex
CREATE INDEX "SharedSettings_organizationId_idx" ON "public"."SharedSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_email_key" ON "public"."AuthUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_activationToken_key" ON "public"."AuthUser"("activationToken");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_resetToken_key" ON "public"."AuthUser"("resetToken");

-- CreateIndex
CREATE INDEX "AuthUser_email_idx" ON "public"."AuthUser"("email");

-- CreateIndex
CREATE INDEX "AuditLog_authUserId_idx" ON "public"."AuditLog"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_authUserId_key" ON "public"."Employee"("authUserId");

-- CreateIndex
CREATE INDEX "Employee_teamId_idx" ON "public"."Employee"("teamId");

-- CreateIndex
CREATE INDEX "Project_archived_idx" ON "public"."Project"("archived");

-- CreateIndex
CREATE INDEX "Screenshot_projectId_idx" ON "public"."Screenshot"("projectId");

-- CreateIndex
CREATE INDEX "Screenshot_taskId_idx" ON "public"."Screenshot"("taskId");

-- CreateIndex
CREATE INDEX "Screenshot_timestamp_idx" ON "public"."Screenshot"("timestamp");

-- CreateIndex
CREATE INDEX "Task_organizationId_idx" ON "public"."Task"("organizationId");

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "public"."AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_sharedSettingsId_fkey" FOREIGN KEY ("sharedSettingsId") REFERENCES "public"."SharedSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Window" ADD CONSTRAINT "Window_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Window" ADD CONSTRAINT "Window_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Window" ADD CONSTRAINT "Window_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Screenshot" ADD CONSTRAINT "Screenshot_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Screenshot" ADD CONSTRAINT "Screenshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Screenshot" ADD CONSTRAINT "Screenshot_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SharedSettings" ADD CONSTRAINT "SharedSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiToken" ADD CONSTRAINT "ApiToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "public"."AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
