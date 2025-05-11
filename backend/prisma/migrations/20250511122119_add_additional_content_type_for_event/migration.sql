/*
  Warnings:

  - A unique constraint covering the columns `[forAdditionalContentId]` on the table `CalendarItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CalendarItem" ADD COLUMN     "forAdditionalContentId" INTEGER;

-- CreateTable
CREATE TABLE "AdditionalContent" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleHr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionHr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdditionalContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdditionalContentToApplicationPresenter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalContent_uid_key" ON "AdditionalContent"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "_AdditionalContentToApplicationPresenter_AB_unique" ON "_AdditionalContentToApplicationPresenter"("A", "B");

-- CreateIndex
CREATE INDEX "_AdditionalContentToApplicationPresenter_B_index" ON "_AdditionalContentToApplicationPresenter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarItem_forAdditionalContentId_key" ON "CalendarItem"("forAdditionalContentId");

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_forAdditionalContentId_fkey" FOREIGN KEY ("forAdditionalContentId") REFERENCES "AdditionalContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdditionalContentToApplicationPresenter" ADD CONSTRAINT "_AdditionalContentToApplicationPresenter_A_fkey" FOREIGN KEY ("A") REFERENCES "AdditionalContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdditionalContentToApplicationPresenter" ADD CONSTRAINT "_AdditionalContentToApplicationPresenter_B_fkey" FOREIGN KEY ("B") REFERENCES "ApplicationPresenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
