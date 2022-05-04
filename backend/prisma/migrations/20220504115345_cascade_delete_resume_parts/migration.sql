-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeProject" DROP CONSTRAINT "ResumeProject_forResumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeStudyYear" DROP CONSTRAINT "ResumeStudyYear_forResumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeVolunteerExperience" DROP CONSTRAINT "ResumeVolunteerExperience_forResumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeWorkExperience" DROP CONSTRAINT "ResumeWorkExperience_forResumeId_fkey";

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "ResumeFaculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeWorkExperience" ADD CONSTRAINT "ResumeWorkExperience_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProject" ADD CONSTRAINT "ResumeProject_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeVolunteerExperience" ADD CONSTRAINT "ResumeVolunteerExperience_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeStudyYear" ADD CONSTRAINT "ResumeStudyYear_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
