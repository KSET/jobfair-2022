CREATE EXTENSION pg_trgm;
CREATE EXTENSION btree_gin;

CREATE INDEX ResumeTechnology_name_index
   ON "ResumeTechnology" USING GIN (to_tsvector('english', "name"));

CREATE INDEX ResumeInterest_name_index
   ON "ResumeInterest" USING GIN (to_tsvector('english', "name"));
