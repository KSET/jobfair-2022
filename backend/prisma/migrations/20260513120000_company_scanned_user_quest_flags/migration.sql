-- AlterTable
ALTER TABLE "CompanyScannedUser"
  ADD COLUMN "cvSaved" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "questEntered" BOOLEAN NOT NULL DEFAULT false;
