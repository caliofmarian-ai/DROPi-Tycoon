import { describe, expect, it, vi } from 'vitest'
import { LocalSharedAuthorityAdapter, createLocalAuthorityId } from '../src/systems/localSharedAuthorityAdapter'
import { SHARED_STATE_AUTHORITY_TARGET } from '../src/types/sharedAuthority'

const makeCommand = (overrides: Partial<{
  commandId: string
  actorId: string
  aggregateId: string
  expectedRevision: number
}> = {}) => ({
  commandId: overrides.commandId ?? 'CMD-001',
  actorId: overrides.actorId ?? 'ACTOR-001',
  aggregateId: overrides.aggregateId ?? 'COMPANY-001',
  commandType: 'AdjustBalance' as const,
  expectedRevision: overrides.expectedRevision ?? 0,
  payload: { delta: 10 },
})

describe('shared authority contract', () => {
  it('keeps presentation/input local while shared economic truth targets server authority', () => {
    expect(SHARED_STATE_AUTHORITY_TARGET.CameraPresentation).toBe('LocalPresentation')
    expect(SHARED_STATE_AUTHORITY_TARGET.TouchInput).toBe('LocalPresentation')
    expect(SHARED_STATE_AUTHORITY_TARGET.AudioPreferences).toBe('LocalPresentation')
    expect(SHARED_STATE_AUTHORITY_TARGET.SharedCompanyBalance).toBe('FutureServerAuthoritative')
    expect(SHARED_STATE_AUTHORITY_TARGET.CompanyIdentityMembership).toBe('FutureServerAuthoritative')
    expect(SHARED_STATE_AUTHORITY_TARGET.SharedMarketplaceSettlement).toBe('FutureServerAuthoritative')
    expect(SHARED_STATE_AUTHORITY_TARGET.CompanyPermissionsRoles).toBe('FutureServerAuthoritative')
  })

  it('creates deterministic opaque local ids only inside an explicit namespace', () => {
    expect(createLocalAuthorityId('install-A', 'command', 7)).toBe('LOCAL:install-A:command:7')
    expect(() => createLocalAuthorityId('', 'command', 1)).toThrow(/namespace/i)
    expect(() => createLocalAuthorityId('install-A', 'command', 0)).toThrow(/sequence/i)
  })

  it('applies a first-seen command once and advances the aggregate revision', () => {
    const adapter = new LocalSharedAuthorityAdapter<'BalanceAdjusted', { delta: number }>('install-A')
    const result = adapter.execute(makeCommand(), () => ({
      accepted: true,
      eventType: 'BalanceAdjusted',
      eventPayload: { delta: 10 },
    }))

    expect(result.kind).toBe('applied')
    if (result.kind !== 'applied') throw new Error('Expected applied result.')
    expect(result.receipt.accepted).toBe(true)
    expect(result.receipt.resultingRevision).toBe(1)
    expect(result.event.revision).toBe(1)
    expect(result.event.payload).toEqual({ delta: 10 })
    expect(adapter.getRevision('COMPANY-001')).toBe(1)
  })

  it('returns the original receipt/event on replay without invoking settlement twice', () => {
    const adapter = new LocalSharedAuthorityAdapter<'BalanceAdjusted', { delta: number }>('install-A')
    const handler = vi.fn(() => ({
      accepted: true as const,
      eventType: 'BalanceAdjusted' as const,
      eventPayload: { delta: 10 },
    }))
    const command = makeCommand()

    const first = adapter.execute(command, handler)
    const replay = adapter.execute(command, handler)

    expect(first.kind).toBe('applied')
    expect(replay.kind).toBe('duplicate')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(adapter.getRevision('COMPANY-001')).toBe(1)
    expect(replay.receipt).toEqual(first.receipt)
    if (first.kind !== 'applied' || replay.kind !== 'duplicate') throw new Error('Unexpected result kind.')
    expect(replay.event).toEqual(first.event)
  })

  it('rejects stale clients before domain settlement runs', () => {
    const adapter = new LocalSharedAuthorityAdapter<'BalanceAdjusted', { delta: number }>('install-A')
    adapter.execute(makeCommand(), () => ({ accepted: true, eventType: 'BalanceAdjusted', eventPayload: { delta: 10 } }))
    const staleHandler = vi.fn(() => ({ accepted: true as const, eventType: 'BalanceAdjusted' as const, eventPayload: { delta: 5 } }))

    const stale = adapter.execute(makeCommand({ commandId: 'CMD-002', expectedRevision: 0 }), staleHandler)

    expect(stale.kind).toBe('rejected')
    expect(stale.receipt.rejectionReason).toBe('StaleRevision')
    expect(stale.receipt.resultingRevision).toBe(1)
    expect(staleHandler).not.toHaveBeenCalled()
    expect(adapter.getRevision('COMPANY-001')).toBe(1)
  })

  it('makes a repeated stale command idempotent as the same rejection receipt', () => {
    const adapter = new LocalSharedAuthorityAdapter<'BalanceAdjusted', { delta: number }>('install-A')
    adapter.execute(makeCommand(), () => ({ accepted: true, eventType: 'BalanceAdjusted', eventPayload: { delta: 10 } }))
    const staleCommand = makeCommand({ commandId: 'CMD-STALE', expectedRevision: 0 })

    const first = adapter.execute(staleCommand, () => ({ accepted: true, eventType: 'BalanceAdjusted', eventPayload: { delta: 5 } }))
    const replay = adapter.execute(staleCommand, () => ({ accepted: true, eventType: 'BalanceAdjusted', eventPayload: { delta: 5 } }))

    expect(first.kind).toBe('rejected')
    expect(replay.kind).toBe('duplicate')
    expect(replay.receipt).toEqual(first.receipt)
  })

  it('records validation rejection so reconnect/retry cannot mutate it into a later acceptance', () => {
    const adapter = new LocalSharedAuthorityAdapter<'BalanceAdjusted', { delta: number }>('install-A')
    const command = makeCommand({ commandId: 'CMD-DENIED' })

    const denied = adapter.execute(command, () => ({ accepted: false, reason: 'ValidationFailed' }))
    const retry = adapter.execute(command, () => ({ accepted: true, eventType: 'BalanceAdjusted', eventPayload: { delta: 10 } }))

    expect(denied.kind).toBe('rejected')
    expect(denied.receipt.rejectionReason).toBe('ValidationFailed')
    expect(retry.kind).toBe('duplicate')
    expect(retry.receipt).toEqual(denied.receipt)
    expect(adapter.getRevision('COMPANY-001')).toBe(0)
  })

  it('tracks independent revisions for independent aggregates', () => {
    const adapter = new LocalSharedAuthorityAdapter<'Changed', { value: number }>('install-A')
    adapter.execute(makeCommand({ commandId: 'CMD-A', aggregateId: 'COMPANY-A' }), () => ({
      accepted: true, eventType: 'Changed', eventPayload: { value: 1 },
    }))
    adapter.execute(makeCommand({ commandId: 'CMD-B', aggregateId: 'COMPANY-B' }), () => ({
      accepted: true, eventType: 'Changed', eventPayload: { value: 2 },
    }))

    expect(adapter.getRevision('COMPANY-A')).toBe(1)
    expect(adapter.getRevision('COMPANY-B')).toBe(1)
  })

  it('exposes stored receipts for reconnect reconciliation', () => {
    const adapter = new LocalSharedAuthorityAdapter<'Changed', { value: number }>('install-A')
    const applied = adapter.execute(makeCommand({ commandId: 'CMD-RECONNECT' }), () => ({
      accepted: true, eventType: 'Changed', eventPayload: { value: 1 },
    }))

    expect(adapter.getReceipt('CMD-RECONNECT')).toEqual(applied.receipt)
    expect(adapter.getReceipt('UNKNOWN')).toBeUndefined()
  })

  it('makes a second concurrent command stale after the first advances revision', () => {
    const adapter = new LocalSharedAuthorityAdapter<'Changed', { value: number }>('install-A')
    const first = makeCommand({ commandId: 'CMD-1', expectedRevision: 0 })
    const concurrent = makeCommand({ commandId: 'CMD-2', expectedRevision: 0 })

    expect(adapter.execute(first, () => ({ accepted: true, eventType: 'Changed', eventPayload: { value: 1 } })).kind).toBe('applied')
    const second = adapter.execute(concurrent, () => ({ accepted: true, eventType: 'Changed', eventPayload: { value: 2 } }))

    expect(second.kind).toBe('rejected')
    expect(second.receipt.rejectionReason).toBe('StaleRevision')
  })

  it('treats command ids as globally unique replay keys even if a replay changes aggregate fields', () => {
    const adapter = new LocalSharedAuthorityAdapter<'Changed', { value: number }>('install-A')
    const first = adapter.execute(makeCommand({ commandId: 'GLOBAL-CMD', aggregateId: 'COMPANY-A' }), () => ({
      accepted: true, eventType: 'Changed', eventPayload: { value: 1 },
    }))
    const malformedReplay = adapter.execute(makeCommand({ commandId: 'GLOBAL-CMD', aggregateId: 'COMPANY-B' }), () => ({
      accepted: true, eventType: 'Changed', eventPayload: { value: 2 },
    }))

    expect(malformedReplay.kind).toBe('duplicate')
    expect(malformedReplay.receipt).toEqual(first.receipt)
    expect(adapter.getRevision('COMPANY-B')).toBe(0)
  })
})
