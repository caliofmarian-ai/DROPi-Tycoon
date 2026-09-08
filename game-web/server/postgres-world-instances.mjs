import { readFile } from 'node:fs/promises'
import postgres from 'postgres'
import {
  normalizeAccountId,
  normalizeWorldActorBinding,
  normalizeWorldInstanceCreate,
  normalizeWorldInstanceId,
} from './world-instance-identity.mjs'

const WORLD_INSTANCE_LOCK_KEY = 4_210_002
const migrationUrl = new URL('./migrations/002_world_instances.sql', import.meta.url)
const WORLD_LIFECYCLE_STATUSES = new Set(['CREATED', 'ACTIVE', 'SEALED'])

const worldProjection = row => ({
  worldInstanceId: row.world_instance_id,
  baselineVersion: row.baseline_version,
  mapDatasetVersion: row.map_dataset_version,
  lifecycleStatus: row.lifecycle_status,
  revision: Number(row.revision),
})

const actorProjection = row => ({
  worldInstanceId: row.world_instance_id,
  accountId: row.account_id,
  heroActorId: row.hero_actor_id,
  revision: Number(row.revision),
})

const readWorld = async (sql, worldInstanceId) => {
  const rows = await sql`
    SELECT world_instance_id, baseline_version, map_dataset_version, lifecycle_status, revision
    FROM world_instances
    WHERE world_instance_id = ${worldInstanceId}
  `
  return rows[0]
}

const readActor = async (sql, worldInstanceId, accountId) => {
  const rows = await sql`
    SELECT world_instance_id, account_id, hero_actor_id, revision
    FROM world_instance_actors
    WHERE world_instance_id = ${worldInstanceId}
      AND account_id = ${accountId}
  `
  return rows[0]
}

export const runWorldInstanceMigrations = async sql => {
  const source = await readFile(migrationUrl, 'utf8')
  await sql.unsafe(source)
}

export const createPostgresWorldInstanceRepository = async ({ databaseUrl, migrate = true } = {}) => {
  if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
    throw new Error('A non-empty databaseUrl is required for PostgreSQL World Instance persistence.')
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
  })

  try {
    if (migrate) await runWorldInstanceMigrations(sql)
    await sql`SELECT 1 AS ready`
  } catch (error) {
    await sql.end({ timeout: 2 }).catch(() => {})
    throw error
  }

  const getWorldInstance = async worldInstanceIdValue => {
    const worldInstanceId = normalizeWorldInstanceId(worldInstanceIdValue)
    if (!worldInstanceId) return undefined
    const row = await readWorld(sql, worldInstanceId)
    return row ? worldProjection(row) : undefined
  }

  const createWorldInstance = async input => {
    const normalized = normalizeWorldInstanceCreate(input)
    if (!normalized.ok) return { kind: 'rejected', code: normalized.code }
    const value = normalized.value

    return sql.begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(${WORLD_INSTANCE_LOCK_KEY})`

      const inserted = await tx`
        INSERT INTO world_instances (
          world_instance_id,
          baseline_version,
          map_dataset_version
        ) VALUES (
          ${value.worldInstanceId},
          ${value.baselineVersion},
          ${value.mapDatasetVersion}
        )
        ON CONFLICT (world_instance_id) DO NOTHING
        RETURNING world_instance_id, baseline_version, map_dataset_version, lifecycle_status, revision
      `

      if (inserted[0]) {
        return { kind: 'created', world: worldProjection(inserted[0]) }
      }

      const existing = await readWorld(tx, value.worldInstanceId)
      if (!existing) throw new Error('World Instance disappeared during idempotent creation.')
      const world = worldProjection(existing)
      if (
        world.baselineVersion === value.baselineVersion
        && world.mapDatasetVersion === value.mapDatasetVersion
      ) {
        return { kind: 'duplicate', world }
      }

      return {
        kind: 'conflict',
        code: 'WORLD_INSTANCE_ID_CONFLICT',
        world,
      }
    })
  }

  const updateWorldInstanceLifecycle = async input => {
    const worldInstanceId = normalizeWorldInstanceId(input?.worldInstanceId)
    const expectedRevision = input?.expectedRevision
    const lifecycleStatus = input?.lifecycleStatus
    if (
      !worldInstanceId
      || !Number.isSafeInteger(expectedRevision)
      || expectedRevision < 1
      || !WORLD_LIFECYCLE_STATUSES.has(lifecycleStatus)
    ) {
      return { kind: 'rejected', code: 'INVALID_WORLD_INSTANCE_UPDATE' }
    }

    return sql.begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(${WORLD_INSTANCE_LOCK_KEY})`
      const existing = await readWorld(tx, worldInstanceId)
      if (!existing) return { kind: 'missing', code: 'WORLD_INSTANCE_NOT_FOUND' }

      const current = worldProjection(existing)
      if (current.revision !== expectedRevision) {
        return { kind: 'conflict', code: 'STALE_REVISION', world: current }
      }
      if (current.lifecycleStatus === lifecycleStatus) {
        return { kind: 'unchanged', world: current }
      }

      const updated = await tx`
        UPDATE world_instances
        SET lifecycle_status = ${lifecycleStatus},
            revision = revision + 1,
            updated_at = NOW()
        WHERE world_instance_id = ${worldInstanceId}
          AND revision = ${expectedRevision}
        RETURNING world_instance_id, baseline_version, map_dataset_version, lifecycle_status, revision
      `
      if (!updated[0]) throw new Error('World Instance revision changed under advisory lock.')
      return { kind: 'updated', world: worldProjection(updated[0]) }
    })
  }

  const getWorldActor = async (worldInstanceIdValue, accountIdValue) => {
    const worldInstanceId = normalizeWorldInstanceId(worldInstanceIdValue)
    const accountId = normalizeAccountId(accountIdValue)
    if (!worldInstanceId || !accountId) return undefined
    const row = await readActor(sql, worldInstanceId, accountId)
    return row ? actorProjection(row) : undefined
  }

  const bindWorldActor = async input => {
    const normalized = normalizeWorldActorBinding(input)
    if (!normalized.ok) {
      return {
        kind: 'rejected',
        code: normalized.code,
        ...(normalized.expectedHeroActorId
          ? { expectedHeroActorId: normalized.expectedHeroActorId }
          : {}),
      }
    }
    const value = normalized.value

    return sql.begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(${WORLD_INSTANCE_LOCK_KEY})`

      const world = await readWorld(tx, value.worldInstanceId)
      if (!world) return { kind: 'missing', code: 'WORLD_INSTANCE_NOT_FOUND' }

      const existing = await readActor(tx, value.worldInstanceId, value.accountId)
      if (existing) {
        const actor = actorProjection(existing)
        if (actor.heroActorId === value.heroActorId) return { kind: 'duplicate', actor }
        return { kind: 'conflict', code: 'ACCOUNT_WORLD_ACTOR_CONFLICT', actor }
      }

      const heroRows = await tx`
        SELECT world_instance_id, account_id, hero_actor_id, revision
        FROM world_instance_actors
        WHERE world_instance_id = ${value.worldInstanceId}
          AND hero_actor_id = ${value.heroActorId}
      `
      if (heroRows[0]) {
        return {
          kind: 'conflict',
          code: 'HERO_ACTOR_ID_CONFLICT',
          actor: actorProjection(heroRows[0]),
        }
      }

      const inserted = await tx`
        INSERT INTO world_instance_actors (
          world_instance_id,
          account_id,
          hero_actor_id
        ) VALUES (
          ${value.worldInstanceId},
          ${value.accountId},
          ${value.heroActorId}
        )
        RETURNING world_instance_id, account_id, hero_actor_id, revision
      `
      return { kind: 'created', actor: actorProjection(inserted[0]) }
    })
  }

  const stats = async worldInstanceIdValue => {
    const worldInstanceId = normalizeWorldInstanceId(worldInstanceIdValue)
    if (!worldInstanceId) return { worldExists: false, actors: 0 }
    const [worldRows, actorRows] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM world_instances WHERE world_instance_id = ${worldInstanceId}`,
      sql`SELECT COUNT(*)::int AS count FROM world_instance_actors WHERE world_instance_id = ${worldInstanceId}`,
    ])
    return {
      worldExists: worldRows[0].count === 1,
      actors: actorRows[0].count,
    }
  }

  return {
    authority: 'server-database',
    durability: 'postgresql',
    scope: 'world-instance-b2-foundation',
    publicMultiplayerWrites: false,
    createWorldInstance,
    getWorldInstance,
    updateWorldInstanceLifecycle,
    bindWorldActor,
    getWorldActor,
    stats,
    close: () => sql.end({ timeout: 5 }),
  }
}
