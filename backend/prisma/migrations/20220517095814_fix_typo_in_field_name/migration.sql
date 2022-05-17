/*
  Warnings:

  - You are about to drop the column `testemonial` on the `CompanyApplicationFeedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyApplicationFeedback" DROP COLUMN "testemonial",
ADD COLUMN     "testimonial" TEXT NOT NULL DEFAULT E'';
