/*
  Warnings:

  - A unique constraint covering the columns `[typeId]` on the table `ApplicationCocktail` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApplicationCocktail_typeId_key" ON "ApplicationCocktail"("typeId");
