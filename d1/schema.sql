-- One-time setup: wrangler d1 execute twolosttourists-blog --local/--remote --file=d1/schema.sql
CREATE TABLE IF NOT EXISTS posts (
	slug          TEXT PRIMARY KEY NOT NULL,
	title         TEXT NOT NULL,
	excerpt       TEXT NOT NULL,
	tags_flat     TEXT NOT NULL DEFAULT '',
	published_at  TEXT NOT NULL,
	draft         INTEGER NOT NULL DEFAULT 0,
	synced_at     TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at DESC);
