ALTER TABLE mfa_challenges
  ADD COLUMN IF NOT EXISTS code_hash VARCHAR(255),
  ALTER COLUMN verification_sid DROP NOT NULL;
