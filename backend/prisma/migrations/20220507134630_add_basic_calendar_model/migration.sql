-- CreateTable
CREATE TABLE "CalendarItem" (
    "id" SERIAL NOT NULL,
    "start" DATE NOT NULL,
    "end" DATE NOT NULL,
    "title" TEXT,
    "location" TEXT,
    "type" TEXT,
    "text" TEXT,
    "grouped" BOOLEAN NOT NULL DEFAULT true,
    "forTalkId" INTEGER,
    "forWorkshopId" INTEGER,

    CONSTRAINT "CalendarItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_forTalkId_fkey" FOREIGN KEY ("forTalkId") REFERENCES "ApplicationTalk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_forWorkshopId_fkey" FOREIGN KEY ("forWorkshopId") REFERENCES "ApplicationWorkshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
