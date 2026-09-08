import { describe, expect, it } from 'vitest'
import {
  createFreshLocalWorldIdentity,
  createInitialWorldIdentityState,
  deriveHeroActorId,
} from '../src/systems/worldIdentitySystem'
import {
  deriveWorldHeroActorId,
  normalizeWorldActorBinding,
  normalizeWorldInstanceCreate,
} from '../server/world-instance-identity.mjs'

describe('World Instance B1/B2 server identity boundary', () => {
  it('derives exactly the same hero actor ID as the merged B1 contract', () => {
    const pairs = [
      ['acct_local_primary_v1', 'wi_local_legacy_v1'],
      ['acct-test', 'world-a'],
      ['account:with:namespace', 'world_with_underscores'],
      ['unicode-account-ă', 'world-brăila'],
    ] as const

    for (const [accountId, worldInstanceId] of pairs) {
      expect(deriveWorldHeroActorId(accountId, worldInstanceId)).toBe(
        deriveHeroActorId(accountId, worldInstanceId),
      )
    }
  })

  it('accepts B1 legacy and fresh identity components without serializing Save v2', () => {
    const legacy = createInitialWorldIdentityState()
    const fresh = createFreshLocalWorldIdentity('world-b2-test', 'acct-b2-test')

    for (const identity of [legacy, fresh]) {
      expect(normalizeWorldInstanceCreate(identity)).toEqual({
        ok: true,
        value: {
          worldInstanceId: identity.worldInstanceId,
          baselineVersion: identity.baselineVersion,
          mapDatasetVersion: identity.mapDatasetVersion,
        },
      })
      expect(normalizeWorldActorBinding(identity)).toEqual({
        ok: true,
        value: {
          worldInstanceId: identity.worldInstanceId,
          accountId: identity.accountId,
          heroActorId: identity.heroActorId,
        },
      })
    }
  })

  it('rejects a forged hero actor instead of trusting caller-provided identity', () => {
    const identity = createFreshLocalWorldIdentity('world-forged', 'acct-forged')
    expect(normalizeWorldActorBinding({
      ...identity,
      heroActorId: 'hero_forged',
    })).toEqual({
      ok: false,
      code: 'HERO_ACTOR_ID_MISMATCH',
      expectedHeroActorId: identity.heroActorId,
    })
  })

  it('normalizes bounded B1 tokens and rejects malformed world identity input', () => {
    expect(normalizeWorldInstanceCreate({
      worldInstanceId: '  world-trimmed  ',
      baselineVersion: ' baseline-v1 ',
      mapDatasetVersion: ' map-v1 ',
    })).toEqual({
      ok: true,
      value: {
        worldInstanceId: 'world-trimmed',
        baselineVersion: 'baseline-v1',
        mapDatasetVersion: 'map-v1',
      },
    })

    expect(normalizeWorldInstanceCreate({
      worldInstanceId: 'w'.repeat(129),
      baselineVersion: 'baseline-v1',
      mapDatasetVersion: 'map-v1',
    })).toEqual({ ok: false, code: 'INVALID_WORLD_INSTANCE' })
  })
})
