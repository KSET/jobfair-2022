/*
  Warnings:

  - Made the column `forApplicationId` on table `ApplicationTalk` required. This step will fail if there are existing NULL values in that column.
  - Made the column `forApplicationId` on table `ApplicationWorkshop` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ApplicationTalk" DROP CONSTRAINT "ApplicationTalk_forApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationWorkshop" DROP CONSTRAINT "ApplicationWorkshop_forApplicationId_fkey";

-- AlterTable
ALTER TABLE "ApplicationTalk" ALTER COLUMN "forApplicationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ApplicationWorkshop" ALTER COLUMN "forApplicationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ApplicationTalk" ADD CONSTRAINT "ApplicationTalk_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationWorkshop" ADD CONSTRAINT "ApplicationWorkshop_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
