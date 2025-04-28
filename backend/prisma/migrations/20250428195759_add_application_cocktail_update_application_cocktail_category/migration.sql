/*
  Warnings:

  - You are about to drop the column `cocktailId` on the `CompanyApplication` table. All the data in the column will be lost.
  - You are about to drop the `ApplicationCocktailCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApplicationCocktailCategory" DROP CONSTRAINT "ApplicationCocktailCategory_forApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationCocktailCategory" DROP CONSTRAINT "ApplicationCocktailCategory_forSeasonId_fkey";

-- DropIndex
DROP INDEX "CompanyApplication_cocktailId_key";

-- AlterTable
ALTER TABLE "CompanyApplication" DROP COLUMN "cocktailId";

-- DropTable
DROP TABLE "ApplicationCocktailCategory";

-- CreateTable
CREATE TABLE "ApplicationCocktail" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forApplicationId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationCocktail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationCocktailType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "forApplicationId" INTEGER,
    "forSeasonId" INTEGER,

    CONSTRAINT "ApplicationCocktailType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationCocktail_uid_key" ON "ApplicationCocktail"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationCocktail_forApplicationId_key" ON "ApplicationCocktail"("forApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationCocktailType_forApplicationId_key" ON "ApplicationCocktailType"("forApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationCocktailType_forSeasonId_type_key" ON "ApplicationCocktailType"("forSeasonId", "type");

-- AddForeignKey
ALTER TABLE "ApplicationCocktail" ADD CONSTRAINT "ApplicationCocktail_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ApplicationCocktailType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationCocktail" ADD CONSTRAINT "ApplicationCocktail_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationCocktailType" ADD CONSTRAINT "ApplicationCocktailType_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
