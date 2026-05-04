/*
  Warnings:

  - A unique constraint covering the columns `[forOtherContentId]` on the table `CalendarItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CalendarItem" ADD COLUMN     "forOtherContentId" INTEGER;

-- CreateTable
CREATE TABLE "OtherContent" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "nameHr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionHr" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "subtype" TEXT NOT NULL DEFAULT 'other',
    "forSeasonId" INTEGER NOT NULL,

    CONSTRAINT "OtherContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtherContent_uid_key" ON "OtherContent"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarItem_forOtherContentId_key" ON "CalendarItem"("forOtherContentId");

-- AddForeignKey
ALTER TABLE "OtherContent" ADD CONSTRAINT "OtherContent_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_forOtherContentId_fkey" FOREIGN KEY ("forOtherContentId") REFERENCES "OtherContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
