/*
  Warnings:

  - A unique constraint covering the columns `[forCompanyId]` on the table `CompanyApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `forCompanyId` to the `CompanyApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompanyApplication" ADD COLUMN     "forCompanyId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApplication_forCompanyId_key" ON "CompanyApplication"("forCompanyId");

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_forCompanyId_fkey" FOREIGN KEY ("forCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
