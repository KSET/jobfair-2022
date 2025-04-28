/*
  Warnings:

  - You are about to drop the column `forApplicationId` on the `ApplicationCocktailType` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ApplicationCocktailType_forApplicationId_key";

-- AlterTable
ALTER TABLE "ApplicationCocktailType" DROP COLUMN "forApplicationId";
