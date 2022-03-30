/*
  Warnings:

  - A unique constraint covering the columns `[cocktailId]` on the table `CompanyApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CompanyApplication" ADD COLUMN     "cocktailId" INTEGER;

-- CreateTable
CREATE TABLE "CompanyApplicationApproval" (
    "id" SERIAL NOT NULL,
    "booth" BOOLEAN NOT NULL,
    "talkParticipants" INTEGER NOT NULL,
    "workshopParticipants" INTEGER NOT NULL,
    "panel" BOOLEAN NOT NULL,
    "cocktail" BOOLEAN NOT NULL,
    "forApplicationId" INTEGER NOT NULL,

    CONSTRAINT "CompanyApplicationApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationCocktail" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "colour" TEXT NOT NULL,

    CONSTRAINT "ApplicationCocktail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApplicationPresenterToCompanyApplication" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApplicationApproval_forApplicationId_key" ON "CompanyApplicationApproval"("forApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "_ApplicationPresenterToCompanyApplication_AB_unique" ON "_ApplicationPresenterToCompanyApplication"("A", "B");

-- CreateIndex
CREATE INDEX "_ApplicationPresenterToCompanyApplication_B_index" ON "_ApplicationPresenterToCompanyApplication"("B");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApplication_cocktailId_key" ON "CompanyApplication"("cocktailId");

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_cocktailId_fkey" FOREIGN KEY ("cocktailId") REFERENCES "ApplicationCocktail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyApplicationApproval" ADD CONSTRAINT "CompanyApplicationApproval_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationPresenterToCompanyApplication" ADD FOREIGN KEY ("A") REFERENCES "ApplicationPresenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationPresenterToCompanyApplication" ADD FOREIGN KEY ("B") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
