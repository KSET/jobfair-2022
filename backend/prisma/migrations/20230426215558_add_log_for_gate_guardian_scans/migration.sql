-- CreateTable
CREATE TABLE "GateGuardianLog" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "forUserId" INTEGER NOT NULL,
    "forSeasonId" INTEGER NOT NULL,
    "scannedById" INTEGER NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateGuardianLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GateGuardianLog" ADD CONSTRAINT "GateGuardianLog_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateGuardianLog" ADD CONSTRAINT "GateGuardianLog_forSeasonId_fkey" FOREIGN KEY ("forSeasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateGuardianLog" ADD CONSTRAINT "GateGuardianLog_scannedById_fkey" FOREIGN KEY ("scannedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
