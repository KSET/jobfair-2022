-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL,
    "photoId" INTEGER NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryImage_uid_key" ON "GalleryImage"("uid");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
