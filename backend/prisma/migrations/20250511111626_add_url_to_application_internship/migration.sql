/*
  Warnings:

  - Added the required column `url` to the `ApplicationInternship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationInternship" ADD COLUMN     "url" TEXT NOT NULL;
