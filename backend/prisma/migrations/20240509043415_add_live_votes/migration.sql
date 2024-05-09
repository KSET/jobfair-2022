-- CreateTable
CREATE TABLE "LiveVote" (
    "option" TEXT NOT NULL,
    "forUserId" INTEGER NOT NULL,
    "forSeasonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "LiveVoteComment" (
    "id" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "forUserId" INTEGER NOT NULL,
    "forSeasonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveVoteComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveVote_forSeasonId_forUserId_key" ON "LiveVote"("forSeasonId", "forUserId");

-- AddForeignKey
ALTER TABLE "LiveVote" ADD CONSTRAINT "LiveVote_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveVote" ADD CONSTRAINT "LiveVote_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveVoteComment" ADD CONSTRAINT "LiveVoteComment_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveVoteComment" ADD CONSTRAINT "LiveVoteComment_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
