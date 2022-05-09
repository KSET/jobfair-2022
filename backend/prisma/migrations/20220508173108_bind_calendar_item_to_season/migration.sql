/*
  Warnings:

  - A unique constraint covering the columns `[forSeasonId]` on the table `CalendarItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `forSeasonId` to the `CalendarItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CalendarItem" ADD COLUMN     "forSeasonId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CalendarItem_forSeasonId_key" ON "CalendarItem"("forSeasonId");

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
