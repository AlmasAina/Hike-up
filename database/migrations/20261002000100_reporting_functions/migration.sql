-- Reporting & housekeeping functions used by the API (see apps/api/src/admin and customer modules).

-- Per-customer request counters for the customer dashboard.
CREATE OR REPLACE FUNCTION customer_request_stats(p_customer_id uuid)
RETURNS TABLE (total bigint, pending bigint, in_progress bigint, completed bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    count(*)                                                              AS total,
    count(*) FILTER (WHERE status IN ('NEW', 'CONTACTED', 'QUOTED'))      AS pending,
    count(*) FILTER (WHERE status IN ('IN_PROGRESS', 'APPROVED'))         AS in_progress,
    count(*) FILTER (WHERE status = 'COMPLETED')                          AS completed
  FROM quote_requests
  WHERE customer_id = p_customer_id
    AND deleted_at IS NULL;
$$;

-- Quote requests per calendar month (Asia/Dubai) for the last p_months months, zero-filled.
CREATE OR REPLACE FUNCTION quote_requests_by_month(p_months integer DEFAULT 12)
RETURNS TABLE (month text, count bigint)
LANGUAGE sql
STABLE
AS $$
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', now() AT TIME ZONE 'Asia/Dubai') - make_interval(months => p_months - 1),
      date_trunc('month', now() AT TIME ZONE 'Asia/Dubai'),
      interval '1 month'
    ) AS m
  )
  SELECT to_char(months.m, 'YYYY-MM') AS month, count(q.id) AS count
  FROM months
  LEFT JOIN quote_requests q
    ON date_trunc('month', q.created_at AT TIME ZONE 'Asia/Dubai') = months.m
   AND q.deleted_at IS NULL
  GROUP BY months.m
  ORDER BY months.m;
$$;

-- New customer registrations per month for the last p_months months, zero-filled.
CREATE OR REPLACE FUNCTION customer_growth_by_month(p_months integer DEFAULT 12)
RETURNS TABLE (month text, count bigint)
LANGUAGE sql
STABLE
AS $$
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', now() AT TIME ZONE 'Asia/Dubai') - make_interval(months => p_months - 1),
      date_trunc('month', now() AT TIME ZONE 'Asia/Dubai'),
      interval '1 month'
    ) AS m
  ),
  customers AS (
    SELECT u.id, u.created_at
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id AND r.name = 'CUSTOMER'
  )
  SELECT to_char(months.m, 'YYYY-MM') AS month, count(c.id) AS count
  FROM months
  LEFT JOIN customers c
    ON date_trunc('month', c.created_at AT TIME ZONE 'Asia/Dubai') = months.m
  GROUP BY months.m
  ORDER BY months.m;
$$;

-- Requests grouped by service (unassigned requests reported as 'General enquiry').
CREATE OR REPLACE FUNCTION quote_requests_by_service(p_limit integer DEFAULT 10)
RETURNS TABLE (service text, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(s.title, 'General enquiry') AS service, count(q.id) AS count
  FROM quote_requests q
  LEFT JOIN services s ON s.id = q.service_id
  WHERE q.deleted_at IS NULL
  GROUP BY coalesce(s.title, 'General enquiry')
  ORDER BY count(q.id) DESC
  LIMIT p_limit;
$$;

-- Removes expired / revoked refresh tokens and used one-time tokens. Called by the API on a schedule.
CREATE OR REPLACE PROCEDURE purge_expired_tokens()
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM refresh_tokens
   WHERE expires_at < now() - interval '1 day'
      OR (revoked_at IS NOT NULL AND revoked_at < now() - interval '30 days');
  DELETE FROM password_reset_tokens WHERE expires_at < now() - interval '1 day';
  DELETE FROM email_verification_tokens WHERE expires_at < now() - interval '1 day';
END;
$$;

-- Rating must be between 1 and 5 (Prisma cannot express CHECK constraints).
ALTER TABLE testimonials
  ADD CONSTRAINT testimonials_rating_range CHECK (rating BETWEEN 1 AND 5);

-- Lower-case email uniqueness guard for users (emails are normalised by the API too).
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));
