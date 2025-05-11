-- CreateTable
CREATE TABLE "ApplicationInternship" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "competencies" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workingPeriod" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forApplicationId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationInternship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationInternship_uid_key" ON "ApplicationInternship"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationInternship_forApplicationId_key" ON "ApplicationInternship"("forApplicationId");

-- AddForeignKey
ALTER TABLE "ApplicationInternship" ADD CONSTRAINT "ApplicationInternship_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
