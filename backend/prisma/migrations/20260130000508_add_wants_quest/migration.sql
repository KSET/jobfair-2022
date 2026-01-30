-- AlterTable
ALTER TABLE "CompanyApplication" ADD COLUMN     "wantsQuest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CompanyApplicationApproval" ADD COLUMN     "quest" BOOLEAN NOT NULL DEFAULT false;
