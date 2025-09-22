-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "deadline" BIGINT,
ADD COLUMN     "labels" JSONB NOT NULL DEFAULT '[]';
