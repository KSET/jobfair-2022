/*
  Warnings:

  - Added the required column `categoryId` to the `ApplicationFusion` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add categoryId column as nullable first
ALTER TABLE "ApplicationFusion" ADD COLUMN "categoryId" INTEGER;

-- Step 2: Set default category for existing rows (use first available category)
UPDATE "ApplicationFusion" SET "categoryId" = (
  SELECT id FROM "ApplicationTalkCategory" ORDER BY id LIMIT 1
) WHERE "categoryId" IS NULL;

-- Step 3: Make it required (NOT NULL)
ALTER TABLE "ApplicationFusion" ALTER COLUMN "categoryId" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "ApplicationFusion" ADD CONSTRAINT "ApplicationFusion_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ApplicationTalkCategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
