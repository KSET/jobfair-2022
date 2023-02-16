-- AlterTable
ALTER TABLE "ApplicationTalkCategory" ADD COLUMN     "forSeasonId" INTEGER;

-- AddForeignKey
ALTER TABLE "ApplicationTalkCategory" ADD CONSTRAINT "ApplicationTalkCategory_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
