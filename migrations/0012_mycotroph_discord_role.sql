-- Migration 0012: Discord Guild Gateway and Mycotroph Role
ALTER TABLE users ADD COLUMN is_mycotroph INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN discord_user_id TEXT;
ALTER TABLE users ADD COLUMN discord_guild_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_mycotroph ON users(is_mycotroph);
