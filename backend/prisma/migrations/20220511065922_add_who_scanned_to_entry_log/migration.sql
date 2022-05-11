/*
  Warnings:

  - Added the required column `scannedById` to the `EntryResumeLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EntryResumeLog" ADD COLUMN     "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "scannedById" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "EntryResumeLog" ADD CONSTRAINT "EntryResumeLog_scannedById_fkey" FOREIGN KEY ("scannedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
