-- DropIndex
DROP INDEX "ApplicationInternship_forApplicationId_key";

-- AlterTable
ALTER TABLE "ApplicationInternship" ADD COLUMN     "externalCompany" TEXT,
ADD COLUMN     "places" INTEGER,
ADD COLUMN     "signed" BOOLEAN,
ALTER COLUMN "competencies" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "url" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ApplicationInternship_forApplicationId_idx" ON "ApplicationInternship"("forApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationInternship_forApplicationId_position_workingPeri_key" ON "ApplicationInternship"("forApplicationId", "position", "workingPeriodStart", "workingPeriodEnd");
