import postgres from 'postgres'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import {
  CURRENT_MAP_DATASET_VERSION,
  CURRENT_WORLD_BASELINE_VERSION,
} from '../src/systems/worldIdentitySystem'
import { runWorldInstanceMigrations } from '../server/postgres-world-instances.mjs'
import { createPostgresWorldInstanceRuntimeAdapter } from '../server/world-instance-runtime-adapter.mjs'

const databaseUrl = process.env.AUTHORITY_TEST_DATABASE_URL
const describePostgres = databaseUrl ? describe : describe.skip

const trustedIdentity = (worldInstanceId: string, accountId: string) => ({
  worldInstanceId,
  accountId,
  baselineVersion: CURRENT_WORLD_BASELINE_VERSION,
  mapDatasetVersion: CURRENT_MAP_DATASET_VERSION,
})

describePostgres('issue #616 PostgreSQL World Instance runtime adapter', () => {
  const admin = databaseUrl ? postgres(databaseUrl, { max: 1, prepare: false }) : undefined

  beforeEach(async () => {
    if (!admin) return
    await runWorldInstanceMigrations(admin)
    await admin.unsafe('TRUNCATE TABLE world_instance_actors, world_instances;')
  })

  afterAll(async () => {
    await admin?.end({ timeout: 2 })
  })

  it('keeps unauthenticated runtime identity creation fail-closed with zero durable rows', async () => {
    const adapter = await createPostgresWorldInstanceRuntimeAdapter({ databaseUrl })

    await expect(adapter.ensureIdentity({
      accountId: 'client-account',
      worldInstanceId: 'client-world',
      heroActorId: 'client-hero',
    })).resolves.toEqual({
      kind: 'blocked',
      code: 'AUTHENTICATED_IDENTITY_REQUIRED',
    })

    if (!admin) return
    const [worldCount] = await admin`SELECT COUNT(*)::int AS count FROM world_instances`
    const [actorCount] = await admin`SELECT COUNT(*)::int AS count FROM world_instance_actors`
    expect(worldCount.count).toBe(0)
    expect(actorCount.count).toBe(0)
    await adapter.close()
  })

  it('returns the same durable identity on retry and after repository recreation', async () => {
    const context = trustedIdentity('world-restart', 'acct-restart')
    const resolveTrustedIdentity = async requestContext =>
      (requestContext as { sessionId?: string }).sessionId === 'server-session' ? context : undefined

    const firstRuntime = await createPostgresWorldInstanceRuntimeAdapter({
      databaseUrl,
      resolveTrustedIdentity,
    })
    const created = await firstRuntime.ensureIdentity({ sessionId: 'server-session' })
    const retry = await firstRuntime.ensureIdentity({ sessionId: 'server-session' })

    expect(created.kind).toBe('created')
    expect(retry.kind).toBe('existing')
    expect(retry.identity).toEqual(created.identity)
    expect(retry.actor).toEqual(created.actor)
    await firstRuntime.close()

    const restartedRuntime = await createPostgresWorldInstanceRuntimeAdapter({
      databaseUrl,
      resolveTrustedIdentity,
    })
    const restored = await restartedRuntime.readIdentity({ sessionId: 'server-session' })
    const ensuredAgain = await restartedRuntime.ensureIdentity({ sessionId: 'server-session' })

    expect(restored).toMatchObject({
      kind: 'ready',
      identity: created.identity,
      actor: created.actor,
    })
    expect(ensuredAgain).toMatchObject({
      kind: 'existing',
      identity: created.identity,
      actor: created.actor,
    })

    if (!admin) return
    const [worldCount] = await admin`
      SELECT COUNT(*)::int AS count
      FROM world_instances
      WHERE world_instance_id = ${context.worldInstanceId}
    `
    const [actorCount] = await admin`
      SELECT COUNT(*)::int AS count
      FROM world_instance_actors
      WHERE world_instance_id = ${context.worldInstanceId}
        AND account_id = ${context.accountId}
    `
    expect(worldCount.count).toBe(1)
    expect(actorCount.count).toBe(1)
    await restartedRuntime.close()
  })

  it('persists isolated bindings for cross-world and cross-account trusted contexts', async () => {
    const contexts = {
      a1: trustedIdentity('world-a', 'acct-one'),
      a2: trustedIdentity('world-b', 'acct-one'),
      b1: trustedIdentity('world-a', 'acct-two'),
    }
    const runtime = await createPostgresWorldInstanceRuntimeAdapter({
      databaseUrl,
      resolveTrustedIdentity: async requestContext => contexts[(requestContext as { key: keyof typeof contexts }).key],
    })

    const a1 = await runtime.ensureIdentity({ key: 'a1' })
    const a2 = await runtime.ensureIdentity({ key: 'a2' })
    const b1 = await runtime.ensureIdentity({ key: 'b1' })

    expect(a1.identity.heroActorId).not.toBe(a2.identity.heroActorId)
    expect(a1.identity.heroActorId).not.toBe(b1.identity.heroActorId)
    expect(a2.identity.heroActorId).not.toBe(b1.identity.heroActorId)

    if (!admin) return
    const rows = await admin`
      SELECT world_instance_id, account_id, hero_actor_id
      FROM world_instance_actors
      ORDER BY world_instance_id, account_id
    `
    expect(rows).toHaveLength(3)
    expect(new Set(rows.map(row => row.hero_actor_id)).size).toBe(3)
    await runtime.close()
  })
})
