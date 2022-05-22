-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "scheduleFrom" TIMESTAMP(3),
ADD COLUMN     "scheduleUntil" TIMESTAMP(3);

UPDATE "Season" SET "scheduleFrom" = "showParticipantsFrom",
 "scheduleUntil" = "eventUntil";

ALTER TABLE "Season" ALTER COLUMN "scheduleFrom" SET NOT NULL,
ALTER COLUMN     "scheduleUntil" SET NOT NULL;
