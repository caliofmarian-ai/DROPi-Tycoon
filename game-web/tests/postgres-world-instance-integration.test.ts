import postgres from 'postgres'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import {
  CURRENT_MAP_DATASET_VERSION,
  CURRENT_WORLD_BASELINE_VERSION,
  createFreshLocalWorldIdentity,
} from '../src/systems/worldIdentitySystem'
import {
  createPostgresWorldInstanceRepository,
  runWorldInstanceMigrations,
} from '../server/postgres-world-instances.mjs'

const databaseUrl = process.env.AUTHORITY_TEST_DATABASE_URL
const describePostgres = databaseUrl ? describe : describe.skip

const worldCreate = (worldInstanceId: string) => ({
  worldInstanceId,
  baselineVersion: CURRENT_WORLD_BASELINE_VERSION,
  mapDatasetVersion: CURRENT_MAP_DATASET_VERSION,
})

const openRepository = () => createPostgresWorldInstanceRepository({ databaseUrl })

describePostgres('issue #544 PostgreSQL World Instance B2 persistence', () => {
  const admin = databaseUrl ? postgres(databaseUrl, { max: 1, prepare: false }) : undefined

  beforeEach(async () => {
    if (!admin) return
    await runWorldInstanceMigrations(admin)
    await admin.unsafe(`
      TRUNCATE TABLE world_instance_actors, world_instances;
    `)
  })

  afterAll(async () => {
    await admin?.end({ timeout: 2 })
  })

  it('applies the World Instance migration repeatedly with one migration record', async () => {
    if (!admin) return
    await runWorldInstanceMigrations(admin)
    await runWorldInstanceMigrations(admin)

    const rows = await admin`
      SELECT COUNT(*)::int AS count
      FROM authority_schema_migrations
      WHERE version = '002_world_instances'
    `
    expect(rows[0].count).toBe(1)
  })

  it('persists immutable baseline/map identity across repository recreation', async () => {
    const first = await openRepository()
    const created = await first.createWorldInstance(worldCreate('world-persisted'))
    expect(created).toEqual({
      kind: 'created',
      world: {
        ...worldCreate('world-persisted'),
        lifecycleStatus: 'CREATED',
        revision: 1,
      },
    })
    await first.close()

    const second = await openRepository()
    await expect(second.getWorldInstance('world-persisted')).resolves.toEqual({
      ...worldCreate('world-persisted'),
      lifecycleStatus: 'CREATED',
      revision: 1,
    })

    await expect(second.createWorldInstance(worldCreate('world-persisted'))).resolves.toMatchObject({
      kind: 'duplicate',
      world: worldCreate('world-persisted'),
    })
    await expect(second.createWorldInstance({
      ...worldCreate('world-persisted'),
      mapDatasetVersion: 'different-map-version',
    })).resolves.toMatchObject({
      kind: 'conflict',
      code: 'WORLD_INSTANCE_ID_CONFLICT',
      world: worldCreate('world-persisted'),
    })
    await second.close()
  })

  it('uses optimistic revision checks for the bounded World Instance lifecycle update', async () => {
    const repository = await openRepository()
    await repository.createWorldInstance(worldCreate('world-revision'))

    const updated = await repository.updateWorldInstanceLifecycle({
      worldInstanceId: 'world-revision',
      expectedRevision: 1,
      lifecycleStatus: 'ACTIVE',
    })
    expect(updated).toMatchObject({
      kind: 'updated',
      world: {
        ...worldCreate('world-revision'),
        lifecycleStatus: 'ACTIVE',
        revision: 2,
      },
    })

    await expect(repository.updateWorldInstanceLifecycle({
      worldInstanceId: 'world-revision',
      expectedRevision: 1,
      lifecycleStatus: 'SEALED',
    })).resolves.toMatchObject({
      kind: 'conflict',
      code: 'STALE_REVISION',
      world: { lifecycleStatus: 'ACTIVE', revision: 2 },
    })

    await expect(repository.updateWorldInstanceLifecycle({
      worldInstanceId: 'world-revision',
      expectedRevision: 2,
      lifecycleStatus: 'ACTIVE',
    })).resolves.toMatchObject({
      kind: 'unchanged',
      world: { lifecycleStatus: 'ACTIVE', revision: 2 },
    })
    await repository.close()
  })

  it('durably binds exactly one B1-derived hero for an account inside one world', async () => {
    const repository = await openRepository()
    const identity = createFreshLocalWorldIdentity('world-actor', 'acct-actor')
    await repository.createWorldInstance(identity)

    const created = await repository.bindWorldActor(identity)
    expect(created).toEqual({
      kind: 'created',
      actor: {
        worldInstanceId: identity.worldInstanceId,
        accountId: identity.accountId,
        heroActorId: identity.heroActorId,
        revision: 1,
      },
    })
    await expect(repository.bindWorldActor(identity)).resolves.toEqual({
      kind: 'duplicate',
      actor: created.actor,
    })

    await expect(repository.bindWorldActor({
      ...identity,
      heroActorId: 'hero_forged',
    })).resolves.toEqual({
      kind: 'rejected',
      code: 'HERO_ACTOR_ID_MISMATCH',
      expectedHeroActorId: identity.heroActorId,
    })

    await repository.close()
    const reopened = await openRepository()
    await expect(reopened.getWorldActor(identity.worldInstanceId, identity.accountId)).resolves.toEqual(created.actor)
    await reopened.close()
  })

  it('hard-scopes actor persistence by world and does not clone mature-world state into a fresh world', async () => {
    const repository = await openRepository()
    const mature = createFreshLocalWorldIdentity('world-mature', 'acct-shared')
    const fresh = createFreshLocalWorldIdentity('world-fresh', 'acct-shared')

    await repository.createWorldInstance(mature)
    await repository.bindWorldActor(mature)
    await repository.updateWorldInstanceLifecycle({
      worldInstanceId: mature.worldInstanceId,
      expectedRevision: 1,
      lifecycleStatus: 'ACTIVE',
    })

    const freshCreated = await repository.createWorldInstance({
      ...fresh,
      sourceWorldInstanceId: mature.worldInstanceId,
    })
    expect(freshCreated).toMatchObject({
      kind: 'created',
      world: {
        worldInstanceId: fresh.worldInstanceId,
        lifecycleStatus: 'CREATED',
        revision: 1,
      },
    })
    expect(fresh.heroActorId).not.toBe(mature.heroActorId)
    await expect(repository.stats(mature.worldInstanceId)).resolves.toEqual({ worldExists: true, actors: 1 })
    await expect(repository.stats(fresh.worldInstanceId)).resolves.toEqual({ worldExists: true, actors: 0 })
    await expect(repository.getWorldActor(fresh.worldInstanceId, fresh.accountId)).resolves.toBeUndefined()

    const boundFresh = await repository.bindWorldActor(fresh)
    expect(boundFresh).toMatchObject({
      kind: 'created',
      actor: {
        worldInstanceId: fresh.worldInstanceId,
        accountId: fresh.accountId,
        heroActorId: fresh.heroActorId,
      },
    })
    await expect(repository.getWorldActor(mature.worldInstanceId, mature.accountId)).resolves.toMatchObject({
      heroActorId: mature.heroActorId,
    })
    await repository.close()
  })
})
