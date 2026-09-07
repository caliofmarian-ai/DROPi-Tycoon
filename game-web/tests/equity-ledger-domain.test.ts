import { describe, expect, it } from 'vitest'
import {
  allocateEquityFromTreasury,
  createInitialCompanyEquityState,
  getActorEquityUnits,
  reconcileEquityMemberExit,
  sanitizeCompanyEquityState,
  setCurrentExecutive,
  setEquityMemberActive,
  transferEquityHolding,
  validateCompanyEquityIntegrity,
} from '../src/systems/equityLedgerSystem'
import {
  COMPANY_EQUITY_TOTAL_UNITS,
  EXTERNAL_MARKET_POOL_UNITS,
  INTERNAL_MEMBER_POOL_UNITS,
  type CompanyEquityState,
} from '../src/types/equity'

const COMPANY = 'COMPANY-001'
const FOUNDER = 'ACTOR-FOUNDER'

describe('company equity ledger domain', () => {
  it('starts with canonical 51/49 supply entirely held by treasury', () => {
    const state = createInitialCompanyEquityState(COMPANY, FOUNDER)

    expect(state.totalUnits).toBe(COMPANY_EQUITY_TOTAL_UNITS)
    expect(state.pools).toEqual([
      { poolId: 'InternalMember', totalUnits: 5100, treasuryUnits: 5100 },
      { poolId: 'ExternalMarket', totalUnits: 4900, treasuryUnits: 4900 },
    ])
    expect(INTERNAL_MEMBER_POOL_UNITS + EXTERNAL_MARKET_POOL_UNITS).toBe(COMPANY_EQUITY_TOTAL_UNITS)
    expect(state.holdings).toEqual([])
    expect(state.activeMemberActorIds).toEqual([FOUNDER])
    expect(state.founderActorId).toBe(FOUNDER)
    expect(state.executiveActorId).toBe(FOUNDER)
    expect(validateCompanyEquityIntegrity(state)).toEqual({ valid: true, errors: [] })
  })

  it('allocates internal units only to an active member and preserves supply integrity', () => {
    const initial = createInitialCompanyEquityState(COMPANY, FOUNDER)
    const result = allocateEquityFromTreasury(initial, FOUNDER, 'InternalMember', 1200)

    expect(result.changed).toBe(true)
    if (!result.changed) throw new Error('Expected allocation.')
    expect(getActorEquityUnits(result.state, FOUNDER, 'InternalMember')).toBe(1200)
    expect(result.state.pools.find(pool => pool.poolId === 'InternalMember')?.treasuryUnits).toBe(3900)
    expect(validateCompanyEquityIntegrity(result.state).valid).toBe(true)
  })

  it('blocks internal allocation to a non-member without changing state', () => {
    const initial = createInitialCompanyEquityState(COMPANY, FOUNDER)
    const result = allocateEquityFromTreasury(initial, 'ACTOR-OUTSIDER', 'InternalMember', 100)

    expect(result).toEqual({ changed: false, state: initial, reason: 'InternalMembershipRequired' })
  })

  it('allows external portfolio holdings without operational membership', () => {
    const initial = createInitialCompanyEquityState(COMPANY, FOUNDER)
    const result = allocateEquityFromTreasury(initial, 'ACTOR-INVESTOR', 'ExternalMarket', 800)

    expect(result.changed).toBe(true)
    if (!result.changed) throw new Error('Expected allocation.')
    expect(result.state.activeMemberActorIds).not.toContain('ACTOR-INVESTOR')
    expect(getActorEquityUnits(result.state, 'ACTOR-INVESTOR', 'ExternalMarket')).toBe(800)
    expect(validateCompanyEquityIntegrity(result.state).valid).toBe(true)
  })

  it('activates another member and allows restricted internal ownership', () => {
    const initial = createInitialCompanyEquityState(COMPANY, FOUNDER)
    const withMember = setEquityMemberActive(initial, 'ACTOR-MEMBER', true)
    const result = allocateEquityFromTreasury(withMember, 'ACTOR-MEMBER', 'InternalMember', 500)

    expect(result.changed).toBe(true)
    if (!result.changed) throw new Error('Expected allocation.')
    expect(getActorEquityUnits(result.state, 'ACTOR-MEMBER', 'InternalMember')).toBe(500)
    expect(validateCompanyEquityIntegrity(result.state).valid).toBe(true)
  })

  it('blocks transfer of internal units to a non-member', () => {
    const initial = createInitialCompanyEquityState(COMPANY, FOUNDER)
    const allocated = allocateEquityFromTreasury(initial, FOUNDER, 'InternalMember', 300)
    if (!allocated.changed) throw new Error('Expected allocation.')

    const transfer = transferEquityHolding(allocated.state, FOUNDER, 'ACTOR-OUTSIDER', 'InternalMember', 100)
    expect(transfer.changed).toBe(false)
    if (transfer.changed) throw new Error('Expected blocked transfer.')
    expect(transfer.reason).toBe('InternalMembershipRequired')
    expect(getActorEquityUnits(transfer.state, FOUNDER, 'InternalMember')).toBe(300)
  })

  it('transfers internal units between eligible members without changing total supply', () => {
    let state = createInitialCompanyEquityState(COMPANY, FOUNDER)
    state = setEquityMemberActive(state, 'ACTOR-MEMBER', true)
    const allocated = allocateEquityFromTreasury(state, FOUNDER, 'InternalMember', 700)
    if (!allocated.changed) throw new Error('Expected allocation.')

    const transfer = transferEquityHolding(allocated.state, FOUNDER, 'ACTOR-MEMBER', 'InternalMember', 250)
    expect(transfer.changed).toBe(true)
    if (!transfer.changed) throw new Error('Expected transfer.')
    expect(getActorEquityUnits(transfer.state, FOUNDER, 'InternalMember')).toBe(450)
    expect(getActorEquityUnits(transfer.state, 'ACTOR-MEMBER', 'InternalMember')).toBe(250)
    expect(validateCompanyEquityIntegrity(transfer.state).valid).toBe(true)
  })

  it('blocks invalid or excessive treasury allocations', () => {
    const initial = createInitialCompanyEquityState(COMPANY, FOUNDER)
    expect(allocateEquityFromTreasury(initial, FOUNDER, 'InternalMember', 0)).toMatchObject({
      changed: false,
      reason: 'InvalidUnits',
    })
    expect(allocateEquityFromTreasury(initial, FOUNDER, 'InternalMember', 5101)).toMatchObject({
      changed: false,
      reason: 'InsufficientTreasury',
    })
  })

  it('keeps Founder historical identity when executive control changes', () => {
    const initial = createInitialCompanyEquityState(COMPANY, FOUNDER)
    const changed = setCurrentExecutive(initial, 'ACTOR-EXECUTIVE')

    expect(changed.founderActorId).toBe(FOUNDER)
    expect(changed.executiveActorId).toBe('ACTOR-EXECUTIVE')
    expect(validateCompanyEquityIntegrity(changed).valid).toBe(true)
  })

  it('forfeits all internal/member shares on final company exit and returns them to treasury', () => {
    let state = createInitialCompanyEquityState(COMPANY, FOUNDER)
    state = setEquityMemberActive(state, 'ACTOR-MEMBER', true)
    const allocated = allocateEquityFromTreasury(state, 'ACTOR-MEMBER', 'InternalMember', 900)
    if (!allocated.changed) throw new Error('Expected allocation.')

    const exited = reconcileEquityMemberExit(allocated.state, 'ACTOR-MEMBER')

    expect(exited.activeMemberActorIds).not.toContain('ACTOR-MEMBER')
    expect(getActorEquityUnits(exited, 'ACTOR-MEMBER', 'InternalMember')).toBe(0)
    expect(exited.pools.find(pool => pool.poolId === 'InternalMember')?.treasuryUnits).toBe(5100)
    expect(validateCompanyEquityIntegrity(exited).valid).toBe(true)
  })

  it('preserves unrelated external portfolio holdings when membership ends', () => {
    let state = createInitialCompanyEquityState(COMPANY, FOUNDER)
    state = setEquityMemberActive(state, 'ACTOR-MEMBER', true)
    const internal = allocateEquityFromTreasury(state, 'ACTOR-MEMBER', 'InternalMember', 400)
    if (!internal.changed) throw new Error('Expected internal allocation.')
    const external = allocateEquityFromTreasury(internal.state, 'ACTOR-MEMBER', 'ExternalMarket', 300)
    if (!external.changed) throw new Error('Expected external allocation.')

    const exited = reconcileEquityMemberExit(external.state, 'ACTOR-MEMBER')

    expect(getActorEquityUnits(exited, 'ACTOR-MEMBER', 'InternalMember')).toBe(0)
    expect(getActorEquityUnits(exited, 'ACTOR-MEMBER', 'ExternalMarket')).toBe(300)
    expect(validateCompanyEquityIntegrity(exited).valid).toBe(true)
  })

  it('makes forfeited internal treasury units available for later acquisition by another active member', () => {
    let state = createInitialCompanyEquityState(COMPANY, FOUNDER)
    state = setEquityMemberActive(state, 'ACTOR-LEAVER', true)
    state = setEquityMemberActive(state, 'ACTOR-BUYER', true)
    const allocated = allocateEquityFromTreasury(state, 'ACTOR-LEAVER', 'InternalMember', 1000)
    if (!allocated.changed) throw new Error('Expected allocation.')

    const afterExit = reconcileEquityMemberExit(allocated.state, 'ACTOR-LEAVER')
    expect(afterExit.pools.find(pool => pool.poolId === 'InternalMember')?.treasuryUnits).toBe(5100)

    // Structural post-settlement movement only. A later #362 slice must authorize price/payment first.
    const buyerAcquisition = allocateEquityFromTreasury(afterExit, 'ACTOR-BUYER', 'InternalMember', 600)
    expect(buyerAcquisition.changed).toBe(true)
    if (!buyerAcquisition.changed) throw new Error('Expected buyer acquisition.')
    expect(getActorEquityUnits(buyerAcquisition.state, 'ACTOR-BUYER', 'InternalMember')).toBe(600)
    expect(buyerAcquisition.state.pools.find(pool => pool.poolId === 'InternalMember')?.treasuryUnits).toBe(4500)
    expect(validateCompanyEquityIntegrity(buyerAcquisition.state).valid).toBe(true)
  })

  it('member deactivation uses the same forfeiture reconciliation path', () => {
    let state = createInitialCompanyEquityState(COMPANY, FOUNDER)
    state = setEquityMemberActive(state, 'ACTOR-MEMBER', true)
    const allocated = allocateEquityFromTreasury(state, 'ACTOR-MEMBER', 'InternalMember', 200)
    if (!allocated.changed) throw new Error('Expected allocation.')

    const deactivated = setEquityMemberActive(allocated.state, 'ACTOR-MEMBER', false)
    expect(getActorEquityUnits(deactivated, 'ACTOR-MEMBER', 'InternalMember')).toBe(0)
    expect(deactivated.activeMemberActorIds).not.toContain('ACTOR-MEMBER')
    expect(validateCompanyEquityIntegrity(deactivated).valid).toBe(true)
  })

  it('sanitizer preserves valid ledgers and repairs invalid supply/unknown pools', () => {
    const valid = createInitialCompanyEquityState(COMPANY, FOUNDER)
    expect(sanitizeCompanyEquityState(valid, COMPANY, FOUNDER)).toEqual({ state: valid, repaired: false })

    const invalidSupply: CompanyEquityState = {
      ...valid,
      totalUnits: 9999,
    }
    expect(sanitizeCompanyEquityState(invalidSupply, COMPANY, FOUNDER).repaired).toBe(true)

    const unknownPool = {
      ...valid,
      pools: [...valid.pools, { poolId: 'UnknownPool', totalUnits: 0, treasuryUnits: 0 }],
    }
    expect(sanitizeCompanyEquityState(unknownPool, COMPANY, FOUNDER).repaired).toBe(true)
  })
})
