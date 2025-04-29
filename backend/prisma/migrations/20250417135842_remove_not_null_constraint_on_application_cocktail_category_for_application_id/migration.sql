-- DropForeignKey
ALTER TABLE "ApplicationCocktailCategory" DROP CONSTRAINT "ApplicationCocktailCategory_forApplicationId_fkey";

-- AlterTable
ALTER TABLE "ApplicationCocktailCategory" ALTER COLUMN "forApplicationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ApplicationCocktailCategory" ADD CONSTRAINT "ApplicationCocktailCategory_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
