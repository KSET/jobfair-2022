-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "rasterLogoId" INTEGER,
ADD COLUMN     "vectorLogoId" INTEGER;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_vectorLogoId_fkey" FOREIGN KEY ("vectorLogoId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_rasterLogoId_fkey" FOREIGN KEY ("rasterLogoId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
