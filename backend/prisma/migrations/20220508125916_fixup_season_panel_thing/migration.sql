/*
  Warnings:

  - A unique constraint covering the columns `[forSeasonId]` on the table `CompanyPanel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CompanyPanel_forSeasonId_key" ON "CompanyPanel"("forSeasonId");
