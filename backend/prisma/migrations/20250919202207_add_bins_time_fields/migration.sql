-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "binsTimeIn" TEXT NOT NULL DEFAULT '06:00',
ADD COLUMN     "binsTimeOut" TEXT NOT NULL DEFAULT '20:00';
