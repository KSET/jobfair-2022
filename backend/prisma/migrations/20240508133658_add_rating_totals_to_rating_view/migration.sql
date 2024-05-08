DROP VIEW IF EXISTS "UserCompanyComponentRatingAveragesView";
CREATE OR REPLACE VIEW "UserCompanyComponentRatingAveragesView" AS
SELECT
	"forCompanyId",
	"forSeasonId",
	"component",
	AVG("rating") AS "ratingAvg",
	COUNT(*) AS "ratingCount"
FROM
	"UserCompanyComponentRating"
GROUP BY
	"forSeasonId",
	"forCompanyId",
	"component"
ORDER BY
	"forCompanyId",
	"component";
