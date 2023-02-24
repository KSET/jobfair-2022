-- DropForeignKey
ALTER TABLE "ApplicationTalk" DROP CONSTRAINT "ApplicationTalk_forApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationWorkshop" DROP CONSTRAINT "ApplicationWorkshop_forApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyApplication" DROP CONSTRAINT "CompanyApplication_cocktailId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyApplication" DROP CONSTRAINT "CompanyApplication_feedbackFormId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyApplicationApproval" DROP CONSTRAINT "CompanyApplicationApproval_forApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyApplicationFeedback" DROP CONSTRAINT "CompanyApplicationFeedback_forApplicationId_fkey";

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_cocktailId_fkey" FOREIGN KEY ("cocktailId") REFERENCES "ApplicationCocktail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_feedbackFormId_fkey" FOREIGN KEY ("feedbackFormId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyApplicationFeedback" ADD CONSTRAINT "CompanyApplicationFeedback_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyApplicationApproval" ADD CONSTRAINT "CompanyApplicationApproval_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationTalk" ADD CONSTRAINT "ApplicationTalk_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationWorkshop" ADD CONSTRAINT "ApplicationWorkshop_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
