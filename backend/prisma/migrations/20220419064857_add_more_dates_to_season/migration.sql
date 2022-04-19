-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "showParticipantsFrom" TIMESTAMP(3),
ADD COLUMN     "showParticipantsUntil" TIMESTAMP(3),
ADD COLUMN     "showPartnersFrom" TIMESTAMP(3),
ADD COLUMN     "showPartnersUntil" TIMESTAMP(3),
ADD COLUMN     "showSponsorsFrom" TIMESTAMP(3),
ADD COLUMN     "showSponsorsUntil" TIMESTAMP(3);

UPDATE "Season" SET "showParticipantsFrom" = "startsAt",
 "showParticipantsUntil" = "endsAt",
 "showPartnersFrom" = "startsAt",
 "showPartnersUntil" = "endsAt",
 "showSponsorsFrom" = "startsAt",
 "showSponsorsUntil" = "endsAt";

ALTER TABLE "Season" ALTER COLUMN "showParticipantsFrom" SET NOT NULL,
ALTER COLUMN     "showParticipantsUntil" SET NOT NULL,
ALTER COLUMN     "showPartnersFrom" SET NOT NULL,
ALTER COLUMN     "showPartnersUntil" SET NOT NULL,
ALTER COLUMN     "showSponsorsFrom" SET NOT NULL,
ALTER COLUMN     "showSponsorsUntil" SET NOT NULL;
