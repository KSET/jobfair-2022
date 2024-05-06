CREATE VIEW "UserCompanyComponentRatingAveragesView" AS
SELECT
	"forCompanyId",
	"forSeasonId",
	"component",
	AVG("rating") AS "ratingAvg"
FROM
	"UserCompanyComponentRating"
GROUP BY
	"forSeasonId",
	"forCompanyId",
	"component"
ORDER BY
	"forCompanyId",
	"component";