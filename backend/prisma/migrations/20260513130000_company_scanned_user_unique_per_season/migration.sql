-- DropIndex
DROP INDEX "CompanyScannedUser_userId_companyId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CompanyScannedUser_userId_companyId_seasonId_key" ON "CompanyScannedUser"("userId", "companyId", "seasonId");
