/*
  Warnings:

  - A unique constraint covering the columns `[forCompanyId,forSeasonId]` on the table `CompanyApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `forSeasonId` to the `CompanyApplication` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CompanyApplication_forCompanyId_key";

-- AlterTable
ALTER TABLE "CompanyApplication" ADD COLUMN     "forSeasonId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApplication_forCompanyId_forSeasonId_key" ON "CompanyApplication"("forCompanyId", "forSeasonId");

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
