ALTER TABLE users
  ADD COLUMN IF NOT EXISTS guest_key UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_guest_key_unique
  ON users (guest_key)
  WHERE guest_key IS NOT NULL;
