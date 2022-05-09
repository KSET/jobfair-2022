-- CreateTable
CREATE TABLE "EventReservation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventReservation_userId_idx" ON "EventReservation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventReservation_eventId_eventType_userId_key" ON "EventReservation"("eventId", "eventType", "userId");

-- AddForeignKey
ALTER TABLE "EventReservation" ADD CONSTRAINT "EventReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
