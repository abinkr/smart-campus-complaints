ALTER TABLE "users"
  ADD COLUMN "login_failed_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "locked_until" TIMESTAMPTZ;

CREATE INDEX "idx_users_locked_until"
  ON "users"("locked_until");

CREATE TABLE "mfa_challenges" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "code_hash" VARCHAR(64) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "consumed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "mfa_challenges_user_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_mfa_challenges_user_id"
  ON "mfa_challenges"("user_id");

CREATE INDEX "idx_mfa_challenges_expires_at"
  ON "mfa_challenges"("expires_at");

CREATE INDEX "idx_mfa_challenges_consumed_at"
  ON "mfa_challenges"("consumed_at");
