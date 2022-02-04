/*
  Warnings:

  - You are about to drop the column `height` on the `ImageVariation` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `ImageVariation` table. All the data in the column will be lost.
  - Added the required column `originalImageId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "originalImageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ImageVariation" DROP COLUMN "height",
DROP COLUMN "width";

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_originalImageId_fkey" FOREIGN KEY ("originalImageId") REFERENCES "ImageVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
