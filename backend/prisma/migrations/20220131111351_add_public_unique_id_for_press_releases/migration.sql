/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `PressRelease` will be added. If there are existing duplicate values, this will fail.
  - The required column `uid` was added to the `PressRelease` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "PressRelease" ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PressRelease_uid_key" ON "PressRelease"("uid");
