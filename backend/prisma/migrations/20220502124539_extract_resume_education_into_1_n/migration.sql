/*
  Warnings:

  - You are about to drop the column `studyType` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `studyYear` on the `Resume` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "studyType",
DROP COLUMN "studyYear";

-- CreateTable
CREATE TABLE "ResumeStudyYear" (
    "id" SERIAL NOT NULL,
    "studyType" TEXT NOT NULL,
    "studyYear" INTEGER NOT NULL,
    "forResumeId" INTEGER NOT NULL,

    CONSTRAINT "ResumeStudyYear_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResumeStudyYear" ADD CONSTRAINT "ResumeStudyYear_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
