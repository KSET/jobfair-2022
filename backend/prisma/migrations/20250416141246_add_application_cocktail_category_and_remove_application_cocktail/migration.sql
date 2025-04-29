/*
  Warnings:

  - You are about to drop the `ApplicationCocktail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompanyApplication" DROP CONSTRAINT "CompanyApplication_cocktailId_fkey";

-- DropTable
DROP TABLE "ApplicationCocktail";

-- CreateTable
CREATE TABLE "ApplicationCocktailCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "forApplicationId" INTEGER NOT NULL,
    "forSeasonId" INTEGER,

    CONSTRAINT "ApplicationCocktailCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationCocktailCategory_forApplicationId_key" ON "ApplicationCocktailCategory"("forApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationCocktailCategory_forSeasonId_name_key" ON "ApplicationCocktailCategory"("forSeasonId", "name");

-- AddForeignKey
ALTER TABLE "ApplicationCocktailCategory" ADD CONSTRAINT "ApplicationCocktailCategory_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationCocktailCategory" ADD CONSTRAINT "ApplicationCocktailCategory_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
