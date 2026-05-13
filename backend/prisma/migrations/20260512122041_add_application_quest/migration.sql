-- CreateTable
CREATE TABLE "ApplicationQuest" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forApplicationId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationQuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationQuest_uid_key" ON "ApplicationQuest"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationQuest_forApplicationId_key" ON "ApplicationQuest"("forApplicationId");

-- AddForeignKey
ALTER TABLE "ApplicationQuest" ADD CONSTRAINT "ApplicationQuest_forApplicationId_fkey" FOREIGN KEY ("forApplicationId") REFERENCES "CompanyApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
