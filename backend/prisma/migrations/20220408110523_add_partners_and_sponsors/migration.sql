-- CreateTable
CREATE TABLE "Sponsor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,
    "forSeasonId" INTEGER NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,
    "forSeasonId" INTEGER NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
