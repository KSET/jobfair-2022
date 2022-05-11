-- CreateTable
CREATE TABLE "EntryResumeLog" (
    "id" SERIAL NOT NULL,
    "event" TEXT,
    "eventId" INTEGER,
    "resumeId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,

    CONSTRAINT "EntryResumeLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EntryResumeLog" ADD CONSTRAINT "EntryResumeLog_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryResumeLog" ADD CONSTRAINT "EntryResumeLog_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
