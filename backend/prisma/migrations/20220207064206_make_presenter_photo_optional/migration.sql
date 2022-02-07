-- DropForeignKey
ALTER TABLE "ApplicationPresenter" DROP CONSTRAINT "ApplicationPresenter_photoId_fkey";

-- AlterTable
ALTER TABLE "ApplicationPresenter" ALTER COLUMN "photoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ApplicationPresenter" ADD CONSTRAINT "ApplicationPresenter_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
