ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
  ON users (LOWER(email))
  WHERE email IS NOT NULL;
