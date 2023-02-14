-- AlterTable
ALTER TABLE "PressRelease" ADD COLUMN     "forSeasonId" INTEGER;

-- AddForeignKey
ALTER TABLE "PressRelease" ADD CONSTRAINT "PressRelease_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
