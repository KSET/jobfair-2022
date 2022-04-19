/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `Partner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `Sponsor` will be added. If there are existing duplicate values, this will fail.
  - The required column `uid` was added to the `Partner` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uid` was added to the `Sponsor` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Partner_uid_key" ON "Partner"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_uid_key" ON "Sponsor"("uid");
