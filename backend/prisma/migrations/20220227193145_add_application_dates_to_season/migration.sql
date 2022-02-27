-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "applicationsFrom" TIMESTAMP(3),
ADD COLUMN     "applicationsUntil" TIMESTAMP(3);

UPDATE "Season" SET "applicationsFrom" = "startsAt",
"applicationsUntil" = "endsAt";

ALTER TABLE "Season" ALTER COLUMN   "applicationsFrom" SET NOT NULL,
ALTER COLUMN    "applicationsUntil" SET NOT NULL;
