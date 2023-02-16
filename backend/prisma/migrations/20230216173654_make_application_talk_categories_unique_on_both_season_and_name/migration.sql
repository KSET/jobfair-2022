/*
  Warnings:

  - A unique constraint covering the columns `[forSeasonId,name]` on the table `ApplicationTalkCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ApplicationTalkCategory_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTalkCategory_forSeasonId_name_key" ON "ApplicationTalkCategory"("forSeasonId", "name");
