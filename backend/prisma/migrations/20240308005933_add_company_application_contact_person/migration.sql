/*
  Warnings:

  - A unique constraint covering the columns `[contactPersonId]` on the table `CompanyApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CompanyApplication" ADD COLUMN     "contactPersonId" INTEGER;

-- CreateTable
CREATE TABLE "CompanyApplicationContactPerson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "CompanyApplicationContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApplication_contactPersonId_key" ON "CompanyApplication"("contactPersonId");

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "CompanyApplicationContactPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
