import { describe, expect, it } from 'vitest'
import {
  CURRENT_MAP_DATASET_VERSION,
  CURRENT_WORLD_BASELINE_VERSION,
} from '../src/systems/worldIdentitySystem'
import {
  createWorldInstanceRuntimeAdapter,
} from '../server/world-instance-runtime-adapter.mjs'

type TrustedIdentity = {
  worldInstanceId: string
  accountId: string
  baselineVersion: string
  mapDatasetVersion: string
}

type WorldProjection = Omit<TrustedIdentity, 'accountId'> & {
  lifecycleStatus: 'CREATED'
  revision: number
}

type ActorProjection = Pick<TrustedIdentity, 'worldInstanceId' | 'accountId'> & {
  heroActorId: string
  revision: number
}

const trusted = (worldInstanceId: string, accountId: string): TrustedIdentity => ({
  worldInstanceId,
  accountId,
  baselineVersion: CURRENT_WORLD_BASELINE_VERSION,
  mapDatasetVersion: CURRENT_MAP_DATASET_VERSION,
})

const createMemoryRepository = () => {
  const worlds = new Map<string, WorldProjection>()
  const actors = new Map<string, ActorProjection>()
  const calls = { createWorldInstance: 0, bindWorldActor: 0 }
  const actorKey = (worldInstanceId: string, accountId: string) => `${worldInstanceId}\u001f${accountId}`

  return {
    durability: 'memory-test',
    worlds,
    actors,
    calls,
    createWorldInstance: async (input: TrustedIdentity) => {
      calls.createWorldInstance += 1
      const existing = worlds.get(input.worldInstanceId)
      if (existing) {
        if (
          existing.baselineVersion !== input.baselineVersion
          || existing.mapDatasetVersion !== input.mapDatasetVersion
        ) {
          return { kind: 'conflict', code: 'WORLD_INSTANCE_ID_CONFLICT', world: existing }
        }
        return { kind: 'duplicate', world: existing }
      }

      const world: WorldProjection = {
        worldInstanceId: input.worldInstanceId,
        baselineVersion: input.baselineVersion,
        mapDatasetVersion: input.mapDatasetVersion,
        lifecycleStatus: 'CREATED',
        revision: 1,
      }
      worlds.set(input.worldInstanceId, world)
      return { kind: 'created', world }
    },
    getWorldInstance: async (worldInstanceId: string) => worlds.get(worldInstanceId),
    bindWorldActor: async (input: TrustedIdentity & { heroActorId: string }) => {
      calls.bindWorldActor += 1
      if (!worlds.has(input.worldInstanceId)) {
        return { kind: 'missing', code: 'WORLD_INSTANCE_NOT_FOUND' }
      }

      const key = actorKey(input.worldInstanceId, input.accountId)
      const existing = actors.get(key)
      if (existing) {
        if (existing.heroActorId !== input.heroActorId) {
          return { kind: 'conflict', code: 'ACCOUNT_WORLD_ACTOR_CONFLICT', actor: existing }
        }
        return { kind: 'duplicate', actor: existing }
      }

      const actor: ActorProjection = {
        worldInstanceId: input.worldInstanceId,
        accountId: input.accountId,
        heroActorId: input.heroActorId,
        revision: 1,
      }
      actors.set(key, actor)
      return { kind: 'created', actor }
    },
    getWorldActor: async (worldInstanceId: string, accountId: string) => actors.get(actorKey(worldInstanceId, accountId)),
  }
}

describe('issue #616 World Instance B2 runtime adapter', () => {
  it('fails closed when only client-authored identity fields are available', async () => {
    const repository = createMemoryRepository()
    const adapter = createWorldInstanceRuntimeAdapter({ repository })

    await expect(adapter.ensureIdentity({
      worldInstanceId: 'client-world',
      accountId: 'client-account',
      heroActorId: 'client-hero',
    })).resolves.toEqual({
      kind: 'blocked',
      code: 'AUTHENTICATED_IDENTITY_REQUIRED',
    })

    expect(adapter.publicRoutes).toBe(false)
    expect(adapter.publicClientIdentityInput).toBe(false)
    expect(repository.calls).toEqual({ createWorldInstance: 0, bindWorldActor: 0 })
    expect(repository.worlds.size).toBe(0)
    expect(repository.actors.size).toBe(0)
  })

  it('uses only server-resolved identity and ignores spoofed request fields', async () => {
    const repository = createMemoryRepository()
    const expected = trusted('world-trusted', 'acct-trusted')
    const adapter = createWorldInstanceRuntimeAdapter({
      repository,
      resolveTrustedIdentity: async requestContext =>
        (requestContext as { sessionId?: string }).sessionId === 'trusted-session' ? expected : undefined,
    })

    const result = await adapter.ensureIdentity({
      sessionId: 'trusted-session',
      worldInstanceId: 'world-forged',
      accountId: 'acct-forged',
      heroActorId: 'hero-forged',
    })

    expect(result).toMatchObject({
      kind: 'created',
      identity: expected,
      world: { worldInstanceId: expected.worldInstanceId },
      actor: {
        worldInstanceId: expected.worldInstanceId,
        accountId: expected.accountId,
      },
    })
    expect(result.identity.heroActorId).toMatch(/^hero_/)
    expect(result.identity.heroActorId).not.toBe('hero-forged')
    expect(repository.worlds.has('world-forged')).toBe(false)
    expect(repository.actors.size).toBe(1)
  })

  it('is idempotent on retry and preserves one actor binding', async () => {
    const repository = createMemoryRepository()
    const expected = trusted('world-retry', 'acct-retry')
    const adapter = createWorldInstanceRuntimeAdapter({
      repository,
      resolveTrustedIdentity: async () => expected,
    })

    const first = await adapter.ensureIdentity({ requestId: 'first' })
    const retry = await adapter.ensureIdentity({ requestId: 'retry' })

    expect(first.kind).toBe('created')
    expect(retry.kind).toBe('existing')
    expect(retry.identity).toEqual(first.identity)
    expect(retry.actor).toEqual(first.actor)
    expect(repository.worlds.size).toBe(1)
    expect(repository.actors.size).toBe(1)
  })

  it('hard-isolates the same account across worlds and different accounts inside one world', async () => {
    const repository = createMemoryRepository()
    const contexts: Record<string, TrustedIdentity> = {
      accountAWorld1: trusted('world-one', 'acct-a'),
      accountAWorld2: trusted('world-two', 'acct-a'),
      accountBWorld1: trusted('world-one', 'acct-b'),
    }
    const adapter = createWorldInstanceRuntimeAdapter({
      repository,
      resolveTrustedIdentity: async requestContext => contexts[(requestContext as { key: string }).key],
    })

    const accountAWorld1 = await adapter.ensureIdentity({ key: 'accountAWorld1' })
    const accountAWorld2 = await adapter.ensureIdentity({ key: 'accountAWorld2' })
    const accountBWorld1 = await adapter.ensureIdentity({ key: 'accountBWorld1' })

    expect(accountAWorld1.identity.heroActorId).not.toBe(accountAWorld2.identity.heroActorId)
    expect(accountAWorld1.identity.heroActorId).not.toBe(accountBWorld1.identity.heroActorId)
    expect(accountAWorld2.identity.heroActorId).not.toBe(accountBWorld1.identity.heroActorId)
    expect(repository.worlds.size).toBe(2)
    expect(repository.actors.size).toBe(3)
  })
})
