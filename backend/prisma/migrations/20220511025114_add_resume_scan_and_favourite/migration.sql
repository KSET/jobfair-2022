-- CreateTable
CREATE TABLE "ScannedResume" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScannedResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteResume" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,

    CONSTRAINT "FavouriteResume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScannedResume_companyId_resumeId_key" ON "ScannedResume"("companyId", "resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteResume_companyId_resumeId_key" ON "FavouriteResume"("companyId", "resumeId");

-- AddForeignKey
ALTER TABLE "ScannedResume" ADD CONSTRAINT "ScannedResume_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannedResume" ADD CONSTRAINT "ScannedResume_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannedResume" ADD CONSTRAINT "ScannedResume_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteResume" ADD CONSTRAINT "FavouriteResume_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteResume" ADD CONSTRAINT "FavouriteResume_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteResume" ADD CONSTRAINT "FavouriteResume_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
