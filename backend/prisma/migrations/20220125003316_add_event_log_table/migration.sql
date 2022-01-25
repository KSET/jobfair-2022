-- CreateTable
CREATE TABLE "EventLog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
