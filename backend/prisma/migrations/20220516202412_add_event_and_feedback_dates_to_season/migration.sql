-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "eventFrom" TIMESTAMP(3),
ADD COLUMN     "eventUntil" TIMESTAMP(3),
ADD COLUMN     "feedbackFrom" TIMESTAMP(3),
ADD COLUMN     "feedbackUntil" TIMESTAMP(3);

UPDATE "Season" SET "eventFrom" = "startsAt",
 "eventUntil" = "endsAt",
 "feedbackFrom" = "startsAt",
 "feedbackUntil" = "endsAt";

ALTER TABLE "Season" ALTER COLUMN "eventFrom" SET NOT NULL,
ALTER COLUMN     "eventUntil" SET NOT NULL,
ALTER COLUMN     "feedbackFrom" SET NOT NULL,
ALTER COLUMN     "feedbackUntil" SET NOT NULL;
