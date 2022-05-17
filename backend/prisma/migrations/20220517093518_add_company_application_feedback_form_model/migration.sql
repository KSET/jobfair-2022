-- CreateTable
CREATE TABLE "CompanyApplicationFeedback" (
    "id" SERIAL NOT NULL,
    "forApplicationId" INTEGER NOT NULL,
    "dateRating" INTEGER NOT NULL,
    "timeRating" INTEGER NOT NULL,
    "dateComments" TEXT NOT NULL DEFAULT E'',
    "applicationRating" INTEGER NOT NULL,
    "onsiteRating" INTEGER NOT NULL,
    "foodRating" INTEGER NOT NULL,
    "applicationComments" TEXT NOT NULL DEFAULT E'',
    "attendanceRating" INTEGER NOT NULL,
    "mostLiked" INTEGER NOT NULL,
    "experienceComments" TEXT NOT NULL DEFAULT E'',
    "overallRating" INTEGER NOT NULL,
    "recommended" INTEGER NOT NULL,
    "testemonial" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyApplicationFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApplicationFeedback_forApplicationId_key" ON "CompanyApplicationFeedback"("forApplicationId");

-- AddForeignKey
ALTER TABLE "CompanyApplicationFeedback" ADD CONSTRAINT "CompanyApplicationFeedback_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
