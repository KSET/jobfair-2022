-- CreateTable
CREATE TABLE "CompanyScannedUser" (
    "id" SERIAL NOT NULL,
    "note" TEXT,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyScannedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyScannedUser_userId_companyId_key" ON "CompanyScannedUser"("userId", "companyId");

-- AddForeignKey
ALTER TABLE "CompanyScannedUser" ADD CONSTRAINT "CompanyScannedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyScannedUser" ADD CONSTRAINT "CompanyScannedUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyScannedUser" ADD CONSTRAINT "CompanyScannedUser_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
