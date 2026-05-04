-- CreateTable
CREATE TABLE "OtherContentPresenter" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bioEn" TEXT NOT NULL DEFAULT '',
    "bioHr" TEXT NOT NULL DEFAULT '',
    "photoId" INTEGER,
    "forContentId" INTEGER NOT NULL,

    CONSTRAINT "OtherContentPresenter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OtherContentPresenter" ADD CONSTRAINT "OtherContentPresenter_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherContentPresenter" ADD CONSTRAINT "OtherContentPresenter_forContentId_fkey" FOREIGN KEY ("forContentId") REFERENCES "OtherContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
