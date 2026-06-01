ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  complaint_id UUID,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ(6),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT notifications_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT notifications_complaint_fk
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS notifications_user_complaint_type_unique
  ON notifications(user_id, complaint_id, type);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON notifications(user_id, read_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_complaint_id
  ON notifications(complaint_id);
