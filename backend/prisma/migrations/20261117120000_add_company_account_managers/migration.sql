-- CreateTable
CREATE TABLE "CompanyAccountManager" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyAccountManager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyAccountManager_companyId_seasonId_idx" ON "CompanyAccountManager"("companyId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAccountManager_userId_companyId_seasonId_key" ON "CompanyAccountManager"("userId", "companyId", "seasonId");

-- AddForeignKey
ALTER TABLE "CompanyAccountManager" ADD CONSTRAINT "CompanyAccountManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAccountManager" ADD CONSTRAINT "CompanyAccountManager_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAccountManager" ADD CONSTRAINT "CompanyAccountManager_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

