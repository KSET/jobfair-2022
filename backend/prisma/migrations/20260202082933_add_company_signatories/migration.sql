-- CreateTable
CREATE TABLE "CompanySignatory" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forCompanyId" INTEGER NOT NULL,

    CONSTRAINT "CompanySignatory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanySignatory" ADD CONSTRAINT "CompanySignatory_forCompanyId_fkey" FOREIGN KEY ("forCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
