-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "binsDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "binsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "binsSchedule" TEXT,
ADD COLUMN     "binsTypes" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "binsTypesMap" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "binsWeekdays" JSONB NOT NULL DEFAULT '[]';
