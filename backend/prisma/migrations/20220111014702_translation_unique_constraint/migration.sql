/*
  Warnings:

  - A unique constraint covering the columns `[key,language]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Translation_key_language_idx" ON "Translation"("key", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_key_language_key" ON "Translation"("key", "language");
