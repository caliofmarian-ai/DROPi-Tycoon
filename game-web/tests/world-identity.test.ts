import { afterEach, describe, expect, it } from 'vitest'
import {
  clearGameSession,
  getOrCreateGameSession,
  replaceEntireGameSession,
  replaceGameSession,
  startNewGameSession,
} from '../src/state/gameSession'
import {
  CURRENT_MAP_DATASET_VERSION,
  CURRENT_WORLD_BASELINE_VERSION,
  LOCAL_LEGACY_WORLD_INSTANCE_ID,
  LOCAL_PRIMARY_ACCOUNT_ID,
  createFreshLocalWorldIdentity,
  createInitialWorldIdentityState,
  deriveHeroActorId,
  isWorldIdentityStateValid,
  sanitizeWorldIdentityState,
} from '../src/systems/worldIdentitySystem'
import { decodeSave, restoreGameSessionFromSave, serializeGameSession } from '../src/persistence/saveSystem'

afterEach(() => clearGameSession())

describe('World Instance and hero identity B1', () => {
  it('materializes one stable legacy-local account/world/hero identity', () => {
    const identity = createInitialWorldIdentityState()
    expect(identity).toEqual({
      worldInstanceId: LOCAL_LEGACY_WORLD_INSTANCE_ID,
      accountId: LOCAL_PRIMARY_ACCOUNT_ID,
      heroActorId: deriveHeroActorId(LOCAL_PRIMARY_ACCOUNT_ID, LOCAL_LEGACY_WORLD_INSTANCE_ID),
      baselineVersion: CURRENT_WORLD_BASELINE_VERSION,
      mapDatasetVersion: CURRENT_MAP_DATASET_VERSION,
      mode: 'LegacyLocal',
    })
    expect(isWorldIdentityStateValid(identity)).toBe(true)
  })

  it('derives the same hero for the same account/world and a different hero for a different world', () => {
    const account = 'acct-test'
    const worldA = createFreshLocalWorldIdentity('world-a', account)
    const worldAReplay = createFreshLocalWorldIdentity('world-a', account)
    const worldB = createFreshLocalWorldIdentity('world-b', account)

    expect(worldA.heroActorId).toBe(worldAReplay.heroActorId)
    expect(worldA.heroActorId).not.toBe(worldB.heroActorId)
    expect(worldA.accountId).toBe(worldB.accountId)
    expect(worldA.worldInstanceId).not.toBe(worldB.worldInstanceId)
  })

  it('repairs a mismatched hero identity from authoritative account/world inputs', () => {
    const valid = createFreshLocalWorldIdentity('world-test', 'acct-test')
    const repaired = sanitizeWorldIdentityState({ ...valid, heroActorId: 'hero-forged' })
    expect(repaired.repaired).toBe(true)
    expect(repaired.state.heroActorId).toBe(deriveHeroActorId('acct-test', 'world-test'))
    expect(isWorldIdentityStateValid(repaired.state)).toBe(true)
  })

  it('repairs malformed identity input to the deterministic legacy-local identity', () => {
    const result = sanitizeWorldIdentityState({ worldInstanceId: '', accountId: 7, mode: 'Online' })
    expect(result.repaired).toBe(true)
    expect(result.state).toEqual(createInitialWorldIdentityState())
  })

  it('new runtime sessions always contain valid identity', () => {
    const session = startNewGameSession()
    expect(session.worldIdentity).toEqual(createInitialWorldIdentityState())
    expect(isWorldIdentityStateValid(session.worldIdentity)).toBe(true)
  })

  it('materializes identity when replacing a legacy session that omitted it', () => {
    const original = startNewGameSession()
    const legacy = { ...original, worldIdentity: undefined }
    const replaced = replaceEntireGameSession(legacy)
    expect(replaced.worldIdentity).toEqual(createInitialWorldIdentityState())
    expect(getOrCreateGameSession().worldIdentity).toEqual(replaced.worldIdentity)
  })

  it('preserves a valid fresh-world identity across ordinary runtime state replacement', () => {
    const session = startNewGameSession()
    const freshIdentity = createFreshLocalWorldIdentity('world-fresh-002', 'acct-local-owner')
    replaceEntireGameSession({ ...session, worldIdentity: freshIdentity })

    const replaced = replaceGameSession(session.world, session.company, session.settings)
    expect(replaced.worldIdentity).toEqual(freshIdentity)
  })

  it('keeps Save v2 unchanged while runtime restore rematerializes B1 identity', () => {
    const session = startNewGameSession()
    const raw = serializeGameSession(session)
    const parsed = JSON.parse(raw) as Record<string, unknown>
    expect(parsed.formatVersion).toBe(2)
    expect(parsed).not.toHaveProperty('worldIdentity')

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') throw new Error('expected valid Save v2')
    const restoredWithoutB1 = restoreGameSessionFromSave(decoded.save)
    expect(restoredWithoutB1.worldIdentity).toBeUndefined()

    const runtime = replaceEntireGameSession(restoredWithoutB1)
    expect(runtime.worldIdentity).toEqual(createInitialWorldIdentityState())
  })
})
