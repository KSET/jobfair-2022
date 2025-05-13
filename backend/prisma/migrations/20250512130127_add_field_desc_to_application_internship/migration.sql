/*
  Warnings:

  - Added the required column `description` to the `ApplicationInternship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workingPeriod` to the `ApplicationInternship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationInternship" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "workingPeriod" TEXT NOT NULL;
