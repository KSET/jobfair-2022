-- CreateTable
CREATE TABLE "CompanyApplication" (
    "id" SERIAL NOT NULL,
    "wantsPanel" BOOLEAN NOT NULL,
    "wantsCocktail" BOOLEAN NOT NULL,

    CONSTRAINT "CompanyApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationTalk" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleHr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionHr" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "forCompanyId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationTalk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationTalkCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ApplicationTalkCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationPresenter" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bioEn" TEXT NOT NULL,
    "bioHr" TEXT NOT NULL,
    "photoId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationPresenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationWorkshop" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleHr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionHr" TEXT NOT NULL,
    "notesEn" TEXT NOT NULL,
    "notesHr" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "forCompanyId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationWorkshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApplicationPresenterToApplicationTalk" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ApplicationPresenterToApplicationWorkshop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTalk_uid_key" ON "ApplicationTalk"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTalk_forCompanyId_key" ON "ApplicationTalk"("forCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTalk_categoryId_key" ON "ApplicationTalk"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTalkCategory_name_key" ON "ApplicationTalkCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationWorkshop_uid_key" ON "ApplicationWorkshop"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationWorkshop_forCompanyId_key" ON "ApplicationWorkshop"("forCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "_ApplicationPresenterToApplicationTalk_AB_unique" ON "_ApplicationPresenterToApplicationTalk"("A", "B");

-- CreateIndex
CREATE INDEX "_ApplicationPresenterToApplicationTalk_B_index" ON "_ApplicationPresenterToApplicationTalk"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApplicationPresenterToApplicationWorkshop_AB_unique" ON "_ApplicationPresenterToApplicationWorkshop"("A", "B");

-- CreateIndex
CREATE INDEX "_ApplicationPresenterToApplicationWorkshop_B_index" ON "_ApplicationPresenterToApplicationWorkshop"("B");

-- AddForeignKey
ALTER TABLE "ApplicationTalk" ADD CONSTRAINT "ApplicationTalk_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApplicationTalkCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationTalk" ADD CONSTRAINT "ApplicationTalk_forCompanyId_fkey" FOREIGN KEY ("forCompanyId") REFERENCES "CompanyApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationPresenter" ADD CONSTRAINT "ApplicationPresenter_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationWorkshop" ADD CONSTRAINT "ApplicationWorkshop_forCompanyId_fkey" FOREIGN KEY ("forCompanyId") REFERENCES "CompanyApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationPresenterToApplicationTalk" ADD FOREIGN KEY ("A") REFERENCES "ApplicationPresenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationPresenterToApplicationTalk" ADD FOREIGN KEY ("B") REFERENCES "ApplicationTalk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationPresenterToApplicationWorkshop" ADD FOREIGN KEY ("A") REFERENCES "ApplicationPresenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationPresenterToApplicationWorkshop" ADD FOREIGN KEY ("B") REFERENCES "ApplicationWorkshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
