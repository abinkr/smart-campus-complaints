ALTER TABLE mfa_challenges
  DROP COLUMN IF EXISTS code_hash,
  ADD COLUMN IF NOT EXISTS verification_sid VARCHAR(64) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_channel VARCHAR(20) NOT NULL DEFAULT 'email';

ALTER TABLE mfa_challenges
  ALTER COLUMN verification_sid DROP DEFAULT;

CREATE INDEX IF NOT EXISTS idx_mfa_challenges_verification_sid
  ON mfa_challenges(verification_sid);
