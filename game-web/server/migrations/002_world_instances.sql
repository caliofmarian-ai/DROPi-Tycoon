BEGIN;

CREATE TABLE IF NOT EXISTS authority_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS world_instances (
  world_instance_id TEXT PRIMARY KEY,
  baseline_version TEXT NOT NULL,
  map_dataset_version TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL DEFAULT 'CREATED'
    CHECK (lifecycle_status IN ('CREATED', 'ACTIVE', 'SEALED')),
  revision BIGINT NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (char_length(BTRIM(world_instance_id)) BETWEEN 1 AND 128),
  CHECK (char_length(BTRIM(baseline_version)) BETWEEN 1 AND 128),
  CHECK (char_length(BTRIM(map_dataset_version)) BETWEEN 1 AND 128)
);

CREATE TABLE IF NOT EXISTS world_instance_actors (
  world_instance_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  hero_actor_id TEXT NOT NULL,
  revision BIGINT NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (world_instance_id, account_id),
  UNIQUE (world_instance_id, hero_actor_id),
  CONSTRAINT world_instance_actors_world_fk
    FOREIGN KEY (world_instance_id)
    REFERENCES world_instances (world_instance_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  CHECK (char_length(BTRIM(account_id)) BETWEEN 1 AND 128),
  CHECK (char_length(BTRIM(hero_actor_id)) BETWEEN 1 AND 128)
);

CREATE INDEX IF NOT EXISTS world_instance_actors_world_idx
  ON world_instance_actors (world_instance_id, account_id, hero_actor_id);

INSERT INTO authority_schema_migrations (version)
VALUES ('002_world_instances')
ON CONFLICT (version) DO NOTHING;

COMMIT;
