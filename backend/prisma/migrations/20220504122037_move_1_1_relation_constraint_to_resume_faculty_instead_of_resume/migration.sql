/*
  Warnings:

  - You are about to drop the column `facultyId` on the `Resume` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[forResumeId]` on the table `ResumeFaculty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `forResumeId` to the `ResumeFaculty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_facultyId_fkey";

-- DropIndex
DROP INDEX "Resume_facultyId_key";

-- AlterTable
ALTER TABLE "ResumeFaculty" ADD COLUMN     "forResumeId" INTEGER;

UPDATE "ResumeFaculty" rf SET "forResumeId" = r."id" FROM "Resume" r WHERE r."facultyId" = rf."id";

ALTER TABLE "ResumeFaculty" ALTER COLUMN "forResumeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "facultyId";

-- CreateIndex
CREATE UNIQUE INDEX "ResumeFaculty_forResumeId_key" ON "ResumeFaculty"("forResumeId");

-- AddForeignKey
ALTER TABLE "ResumeFaculty" ADD CONSTRAINT "ResumeFaculty_forResumeId_fkey" FOREIGN KEY ("forResumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
