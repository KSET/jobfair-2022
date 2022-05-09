/*
  Warnings:

  - A unique constraint covering the columns `[forTalkId]` on the table `CalendarItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[forWorkshopId]` on the table `CalendarItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[forPanelId]` on the table `CalendarItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CalendarItem_forTalkId_key" ON "CalendarItem"("forTalkId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarItem_forWorkshopId_key" ON "CalendarItem"("forWorkshopId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarItem_forPanelId_key" ON "CalendarItem"("forPanelId");
