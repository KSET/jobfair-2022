/*
  Warnings:

  - You are about to drop the column `forCompanyId` on the `ApplicationTalk` table. All the data in the column will be lost.
  - You are about to drop the column `forCompanyId` on the `ApplicationWorkshop` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[forApplicationId]` on the table `ApplicationTalk` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[forApplicationId]` on the table `ApplicationWorkshop` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ApplicationTalk" DROP CONSTRAINT "ApplicationTalk_forCompanyId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationWorkshop" DROP CONSTRAINT "ApplicationWorkshop_forCompanyId_fkey";

-- DropIndex
DROP INDEX "ApplicationTalk_forCompanyId_key";

-- DropIndex
DROP INDEX "ApplicationWorkshop_forCompanyId_key";

-- AlterTable
ALTER TABLE "ApplicationTalk" DROP COLUMN "forCompanyId",
ADD COLUMN     "forApplicationId" INTEGER;

-- AlterTable
ALTER TABLE "ApplicationWorkshop" DROP COLUMN "forCompanyId",
ADD COLUMN     "forApplicationId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTalk_forApplicationId_key" ON "ApplicationTalk"("forApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationWorkshop_forApplicationId_key" ON "ApplicationWorkshop"("forApplicationId");

-- AddForeignKey
ALTER TABLE "ApplicationTalk" ADD CONSTRAINT "ApplicationTalk_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationWorkshop" ADD CONSTRAINT "ApplicationWorkshop_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
