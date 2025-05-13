/*
  Warnings:

  - You are about to drop the column `description` on the `ApplicationInternship` table. All the data in the column will be lost.
  - You are about to drop the column `workingPeriod` on the `ApplicationInternship` table. All the data in the column will be lost.
  - Added the required column `url` to the `ApplicationInternship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workingPeriodEnd` to the `ApplicationInternship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workingPeriodStart` to the `ApplicationInternship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationInternship" DROP COLUMN "description",
DROP COLUMN "workingPeriod",
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "workingPeriodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workingPeriodStart" TIMESTAMP(3) NOT NULL;
