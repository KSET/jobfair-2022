-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_fullImageId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_originalImageId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_thumbImageId_fkey";

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_originalImageId_fkey" FOREIGN KEY ("originalImageId") REFERENCES "ImageVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_fullImageId_fkey" FOREIGN KEY ("fullImageId") REFERENCES "ImageVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_thumbImageId_fkey" FOREIGN KEY ("thumbImageId") REFERENCES "ImageVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
