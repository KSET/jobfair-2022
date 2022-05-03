/*
  Warnings:

  - A unique constraint covering the columns `[resumeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resumeId" INTEGER;

-- CreateTable
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "studyType" TEXT NOT NULL,
    "studyYear" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "cvId" INTEGER,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeFaculty" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL DEFAULT E'',
    "module" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "ResumeFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeTechnology" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ResumeTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeInterest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ResumeInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeWorkExperience" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "start" DATE NOT NULL,
    "until" DATE NOT NULL,
    "forResumeId" INTEGER NOT NULL,

    CONSTRAINT "ResumeWorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeProject" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "start" DATE NOT NULL,
    "until" DATE NOT NULL,
    "forResumeId" INTEGER NOT NULL,

    CONSTRAINT "ResumeProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeVolunteerExperience" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "start" DATE NOT NULL,
    "until" DATE NOT NULL,
    "forResumeId" INTEGER NOT NULL,

    CONSTRAINT "ResumeVolunteerExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ResumeToResumeTechnology" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ResumeToResumeInterest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Resume_uid_key" ON "Resume"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_facultyId_key" ON "Resume"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeTechnology_name_key" ON "ResumeTechnology"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeInterest_name_key" ON "ResumeInterest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ResumeToResumeTechnology_AB_unique" ON "_ResumeToResumeTechnology"("A", "B");

-- CreateIndex
CREATE INDEX "_ResumeToResumeTechnology_B_index" ON "_ResumeToResumeTechnology"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ResumeToResumeInterest_AB_unique" ON "_ResumeToResumeInterest"("A", "B");

-- CreateIndex
CREATE INDEX "_ResumeToResumeInterest_B_index" ON "_ResumeToResumeInterest"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_resumeId_key" ON "User"("resumeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "ResumeFaculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeWorkExperience" ADD CONSTRAINT "ResumeWorkExperience_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProject" ADD CONSTRAINT "ResumeProject_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeVolunteerExperience" ADD CONSTRAINT "ResumeVolunteerExperience_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeToResumeTechnology" ADD FOREIGN KEY ("A") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeToResumeTechnology" ADD FOREIGN KEY ("B") REFERENCES "ResumeTechnology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeToResumeInterest" ADD FOREIGN KEY ("A") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeToResumeInterest" ADD FOREIGN KEY ("B") REFERENCES "ResumeInterest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
