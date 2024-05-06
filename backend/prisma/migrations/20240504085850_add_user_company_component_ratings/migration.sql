-- CreateTable
CREATE TABLE "UserCompanyComponentRating" (
    "id" SERIAL NOT NULL,
    "component" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "forUserId" INTEGER NOT NULL,
    "forCompanyId" INTEGER NOT NULL,
    "forSeasonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompanyComponentRating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserCompanyComponentRating" ADD CONSTRAINT "UserCompanyComponentRating_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompanyComponentRating" ADD CONSTRAINT "UserCompanyComponentRating_forCompanyId_fkey" FOREIGN KEY ("forCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompanyComponentRating" ADD CONSTRAINT "UserCompanyComponentRating_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
