/*
  Warnings:

  - Added the required column `forSeasonId` to the `CompanyPanel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompanyPanel" ADD COLUMN     "forSeasonId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CompanyPanel" ADD CONSTRAINT "CompanyPanel_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
