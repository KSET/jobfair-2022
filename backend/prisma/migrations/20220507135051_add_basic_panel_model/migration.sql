-- AlterTable
ALTER TABLE "CalendarItem" ADD COLUMN     "forPanelId" INTEGER;

-- AlterTable
ALTER TABLE "CompanyApplication" ADD COLUMN     "panelId" INTEGER;

-- CreateTable
CREATE TABLE "CompanyPanel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CompanyPanel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "CompanyPanel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_forPanelId_fkey" FOREIGN KEY ("forPanelId") REFERENCES "CompanyPanel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
