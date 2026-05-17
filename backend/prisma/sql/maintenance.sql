SELECT status, COUNT(*)
FROM complaints
GROUP BY status;

SELECT
  department,
  ROUND((AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400))::NUMERIC, 2) AS avg_days,
  COUNT(*) AS total_resolved
FROM complaints
WHERE resolved_at IS NOT NULL
  AND department IS NOT NULL
GROUP BY department
ORDER BY avg_days;

SELECT
  id,
  title,
  status,
  priority,
  department,
  created_at,
  EXTRACT(DAY FROM NOW() - created_at) AS days_open
FROM complaints
WHERE status != 'RESOLVED'
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY priority DESC, created_at ASC;

DELETE FROM refresh_tokens
WHERE expires_at < NOW();

SELECT
  TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
  COUNT(*) AS submitted,
  COUNT(*) FILTER (WHERE status = 'RESOLVED') AS resolved
FROM complaints
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY 1;

SELECT
  category,
  COUNT(*) AS count
FROM complaints
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC
LIMIT 5;

SELECT
  id,
  title,
  priority,
  status,
  created_at
FROM complaints
WHERE department IS NULL
  AND status != 'RESOLVED'
ORDER BY priority DESC, created_at ASC;
