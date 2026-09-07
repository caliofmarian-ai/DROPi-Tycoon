BEGIN;

CREATE TABLE IF NOT EXISTS authority_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authority_public_profiles (
  aggregate_id TEXT PRIMARY KEY,
  owner_actor_id TEXT NOT NULL,
  revision BIGINT NOT NULL CHECK (revision >= 1),
  display_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authority_sequence (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
  value BIGINT NOT NULL DEFAULT 0 CHECK (value >= 0)
);

INSERT INTO authority_sequence (singleton, value)
VALUES (TRUE, 0)
ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS authority_events (
  event_id TEXT PRIMARY KEY,
  command_id TEXT NOT NULL UNIQUE,
  aggregate_id TEXT NOT NULL,
  revision BIGINT NOT NULL CHECK (revision >= 1),
  authoritative_sequence BIGINT NOT NULL UNIQUE CHECK (authoritative_sequence >= 1),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS authority_events_aggregate_revision_idx
  ON authority_events (aggregate_id, revision);

CREATE TABLE IF NOT EXISTS authority_commands (
  command_id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  receipt JSONB NOT NULL,
  event JSONB,
  profile JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS authority_commands_aggregate_idx
  ON authority_commands (aggregate_id);

INSERT INTO authority_schema_migrations (version)
VALUES ('001_authority_public_profile')
ON CONFLICT (version) DO NOTHING;

COMMIT;
