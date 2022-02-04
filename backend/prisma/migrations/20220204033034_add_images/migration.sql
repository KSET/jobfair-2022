-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploaderId" INTEGER NOT NULL,
    "fullImageId" INTEGER NOT NULL,
    "thumbImageId" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageVariation" (
    "id" SERIAL NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "etag" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "minioKey" TEXT NOT NULL,

    CONSTRAINT "ImageVariation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_uid_key" ON "Image"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ImageVariation_minioKey_key" ON "ImageVariation"("minioKey");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_fullImageId_fkey" FOREIGN KEY ("fullImageId") REFERENCES "ImageVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_thumbImageId_fkey" FOREIGN KEY ("thumbImageId") REFERENCES "ImageVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
