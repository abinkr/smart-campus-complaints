CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_complaints_user_created_at_desc
  ON complaints (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaints_user_status_created_at_desc
  ON complaints (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaints_user_priority_created_at_desc
  ON complaints (user_id, priority, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaints_id_text_trgm
  ON complaints USING GIN ((id::text) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_complaints_title_trgm
  ON complaints USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_complaints_description_trgm
  ON complaints USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_complaints_category_trgm
  ON complaints USING GIN (category gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_complaints_department_trgm
  ON complaints USING GIN (department gin_trgm_ops);
