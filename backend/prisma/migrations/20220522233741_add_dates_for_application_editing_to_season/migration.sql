-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "applicationsEditableFrom" TIMESTAMP(3),
ADD COLUMN     "applicationsEditableUntil" TIMESTAMP(3);

UPDATE "Season" SET "applicationsEditableFrom" = "applicationsUntil",
 "applicationsEditableUntil" = "eventFrom";

ALTER TABLE "Season" ALTER COLUMN "applicationsEditableFrom" SET NOT NULL,
ALTER COLUMN     "applicationsEditableUntil" SET NOT NULL;
