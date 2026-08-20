CREATE TABLE IF NOT EXISTS temporary_passwords (
  id TEXT PRIMARY KEY CHECK (length(id) = 36),
  label TEXT NOT NULL CHECK (length(label) BETWEEN 1 AND 120),
  pass_hash TEXT NOT NULL CHECK (length(pass_hash) = 64),
  pass_salt TEXT NOT NULL CHECK (length(pass_salt) = 32),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  use_count INTEGER NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS temporary_passwords_active ON temporary_passwords(expires_at, revoked_at);
CREATE INDEX IF NOT EXISTS temporary_passwords_creator ON temporary_passwords(created_by, created_at DESC);
