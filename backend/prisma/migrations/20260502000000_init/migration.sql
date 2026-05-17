CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE role_enum AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE priority_enum AS ENUM ('HIGH', 'MEDIUM', 'LOW');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role role_enum NOT NULL DEFAULT 'STUDENT',
  department VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  CONSTRAINT departments_name_unique UNIQUE (name)
);

CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(50),
  priority priority_enum,
  nlp_confidence NUMERIC(5, 2),
  status status_enum NOT NULL DEFAULT 'OPEN',
  department VARCHAR(100),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT complaints_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE complaint_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL,
  changed_by UUID,
  old_status VARCHAR(30),
  new_status VARCHAR(30),
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT logs_complaint_fk FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  CONSTRAINT logs_admin_fk FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(64) NOT NULL,
  user_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT refresh_tokens_token_hash_unique UNIQUE (token_hash),
  CONSTRAINT refresh_tokens_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaints_status_priority ON complaints(status, priority);
CREATE INDEX idx_complaints_department_status ON complaints(department, status);
CREATE INDEX idx_complaints_resolved_at ON complaints(resolved_at) WHERE resolved_at IS NOT NULL;
CREATE INDEX idx_logs_complaint_id ON complaint_logs(complaint_id);
CREATE INDEX idx_logs_changed_by ON complaint_logs(changed_by);
CREATE INDEX idx_logs_changed_at ON complaint_logs(changed_at DESC);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
