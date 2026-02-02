-- CreateTable
CREATE TABLE "ApplicationFusion" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleHr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionHr" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "forApplicationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationFusion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationFusion_uid_key" ON "ApplicationFusion"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationFusion_forApplicationId_key" ON "ApplicationFusion"("forApplicationId");

-- AddForeignKey
ALTER TABLE "ApplicationFusion" ADD CONSTRAINT "ApplicationFusion_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add forFusionId column to CalendarItem
ALTER TABLE "CalendarItem" ADD COLUMN "forFusionId" INTEGER;

-- CreateIndex for CalendarItem forFusionId
CREATE UNIQUE INDEX "CalendarItem_forFusionId_key" ON "CalendarItem"("forFusionId");

-- AddForeignKey for CalendarItem to ApplicationFusion
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_forFusionId_fkey" FOREIGN KEY ("forFusionId") REFERENCES "ApplicationFusion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add fusionParticipants column to CompanyApplicationApproval with default 0
ALTER TABLE "CompanyApplicationApproval" ADD COLUMN "fusionParticipants" INTEGER NOT NULL DEFAULT 0;

-- Add relation between ApplicationPresenter and ApplicationFusion (many-to-many)
CREATE TABLE "_ApplicationFusionToApplicationPresenter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApplicationFusionToApplicationPresenter_AB_unique" ON "_ApplicationFusionToApplicationPresenter"("A", "B");

-- CreateIndex
CREATE INDEX "_ApplicationFusionToApplicationPresenter_B_index" ON "_ApplicationFusionToApplicationPresenter"("B");

-- AddForeignKey
ALTER TABLE "_ApplicationFusionToApplicationPresenter" ADD CONSTRAINT "_ApplicationFusionToApplicationPresenter_A_fkey" FOREIGN KEY ("A") REFERENCES "ApplicationFusion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationFusionToApplicationPresenter" ADD CONSTRAINT "_ApplicationFusionToApplicationPresenter_B_fkey" FOREIGN KEY ("B") REFERENCES "ApplicationPresenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
