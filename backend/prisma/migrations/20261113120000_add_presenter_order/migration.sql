-- AlterTable
ALTER TABLE "ApplicationPresenter" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- Backfill: number existing presenters within each event in creation order.
-- Presenters of one save share "createdAt" (one transaction), so "id" (insertion order) breaks ties.

-- Talks: A = presenter, B = talk
UPDATE "ApplicationPresenter" p
SET "order" = o."order"
FROM (
    SELECT
        j."A" AS "presenterId",
        ROW_NUMBER() OVER (PARTITION BY j."B" ORDER BY ap."createdAt", ap."id") - 1 AS "order"
    FROM "_ApplicationPresenterToApplicationTalk" j
    JOIN "ApplicationPresenter" ap ON ap."id" = j."A"
) o
WHERE p."id" = o."presenterId";

-- Workshops: A = presenter, B = workshop
UPDATE "ApplicationPresenter" p
SET "order" = o."order"
FROM (
    SELECT
        j."A" AS "presenterId",
        ROW_NUMBER() OVER (PARTITION BY j."B" ORDER BY ap."createdAt", ap."id") - 1 AS "order"
    FROM "_ApplicationPresenterToApplicationWorkshop" j
    JOIN "ApplicationPresenter" ap ON ap."id" = j."A"
) o
WHERE p."id" = o."presenterId";

-- Fusions: A = fusion, B = presenter
UPDATE "ApplicationPresenter" p
SET "order" = o."order"
FROM (
    SELECT
        j."B" AS "presenterId",
        ROW_NUMBER() OVER (PARTITION BY j."A" ORDER BY ap."createdAt", ap."id") - 1 AS "order"
    FROM "_ApplicationFusionToApplicationPresenter" j
    JOIN "ApplicationPresenter" ap ON ap."id" = j."B"
) o
WHERE p."id" = o."presenterId";

-- Panels: A = presenter, B = company application
UPDATE "ApplicationPresenter" p
SET "order" = o."order"
FROM (
    SELECT
        j."A" AS "presenterId",
        ROW_NUMBER() OVER (PARTITION BY j."B" ORDER BY ap."createdAt", ap."id") - 1 AS "order"
    FROM "_ApplicationPresenterToCompanyApplication" j
    JOIN "ApplicationPresenter" ap ON ap."id" = j."A"
) o
WHERE p."id" = o."presenterId";
