import type { BusinessCompanyId, EconomicActorId } from '../types/business'
import {
  COMPANY_EQUITY_TOTAL_UNITS,
  EQUITY_POOL_IDS,
  EXTERNAL_MARKET_POOL_UNITS,
  INTERNAL_MEMBER_POOL_UNITS,
  type CompanyEquityState,
  type EquityHoldingState,
  type EquityIntegrityResult,
  type EquityMutationResult,
  type EquityPoolId,
} from '../types/equity'

const cloneEquityState = (state: CompanyEquityState): CompanyEquityState => ({
  ...state,
  pools: state.pools.map(pool => ({ ...pool })),
  holdings: state.holdings.map(holding => ({ ...holding })),
  activeMemberActorIds: [...state.activeMemberActorIds],
})

export const createInitialCompanyEquityState = (
  companyId: BusinessCompanyId,
  founderActorId: EconomicActorId,
): CompanyEquityState => ({
  companyId,
  founderActorId,
  executiveActorId: founderActorId,
  totalUnits: COMPANY_EQUITY_TOTAL_UNITS,
  pools: [
    { poolId: 'InternalMember', totalUnits: INTERNAL_MEMBER_POOL_UNITS, treasuryUnits: INTERNAL_MEMBER_POOL_UNITS },
    { poolId: 'ExternalMarket', totalUnits: EXTERNAL_MARKET_POOL_UNITS, treasuryUnits: EXTERNAL_MARKET_POOL_UNITS },
  ],
  holdings: [],
  activeMemberActorIds: [founderActorId],
})

const isPositiveSafeInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const holdingKey = (actorId: EconomicActorId, poolId: EquityPoolId): string => `${actorId}\u0000${poolId}`

export const validateCompanyEquityIntegrity = (state: CompanyEquityState): EquityIntegrityResult => {
  const errors: string[] = []
  if (!state.companyId.trim()) errors.push('companyId must be non-empty.')
  if (!state.founderActorId.trim()) errors.push('founderActorId must be non-empty.')
  if (!state.executiveActorId.trim()) errors.push('executiveActorId must be non-empty.')
  if (state.totalUnits !== COMPANY_EQUITY_TOTAL_UNITS) errors.push('totalUnits must equal canonical company supply.')

  const poolById = new Map(state.pools.map(pool => [pool.poolId, pool]))
  if (state.pools.length !== EQUITY_POOL_IDS.length || poolById.size !== EQUITY_POOL_IDS.length) {
    errors.push('Equity pools must contain exactly one entry per canonical pool.')
  }

  const expectedPoolSupply: Record<EquityPoolId, number> = {
    InternalMember: INTERNAL_MEMBER_POOL_UNITS,
    ExternalMarket: EXTERNAL_MARKET_POOL_UNITS,
  }
  for (const poolId of EQUITY_POOL_IDS) {
    const pool = poolById.get(poolId)
    if (!pool) continue
    if (pool.totalUnits !== expectedPoolSupply[poolId]) errors.push(`${poolId} total supply is invalid.`)
    if (!Number.isSafeInteger(pool.treasuryUnits) || pool.treasuryUnits < 0 || pool.treasuryUnits > pool.totalUnits) {
      errors.push(`${poolId} treasury units are invalid.`)
    }
  }

  const activeMembers = new Set<string>()
  for (const actorId of state.activeMemberActorIds) {
    if (!actorId.trim() || activeMembers.has(actorId)) errors.push('Active member IDs must be non-empty and unique.')
    activeMembers.add(actorId)
  }

  const seenHoldings = new Set<string>()
  const heldByPool: Record<EquityPoolId, number> = { InternalMember: 0, ExternalMarket: 0 }
  for (const holding of state.holdings) {
    if (!holding.actorId.trim()) errors.push('Holding actorId must be non-empty.')
    const key = holdingKey(holding.actorId, holding.poolId)
    if (seenHoldings.has(key)) errors.push('Duplicate actor/pool holding detected.')
    seenHoldings.add(key)
    if (!isPositiveSafeInteger(holding.units)) errors.push('Holding units must be positive safe integers.')
    else heldByPool[holding.poolId] += holding.units
    if (holding.poolId === 'InternalMember' && !activeMembers.has(holding.actorId)) {
      errors.push('InternalMember holdings require active membership.')
    }
  }

  for (const poolId of EQUITY_POOL_IDS) {
    const pool = poolById.get(poolId)
    if (!pool) continue
    if (pool.treasuryUnits + heldByPool[poolId] !== pool.totalUnits) {
      errors.push(`${poolId} treasury plus holdings must equal pool supply.`)
    }
  }

  const poolTotal = state.pools.reduce((sum, pool) => sum + pool.totalUnits, 0)
  if (poolTotal !== state.totalUnits) errors.push('Pool supplies must sum to total company supply.')

  return { valid: errors.length === 0, errors }
}

const updateHolding = (
  holdings: EquityHoldingState[], actorId: EconomicActorId, poolId: EquityPoolId, delta: number,
): EquityHoldingState[] => {
  const next = holdings.map(holding => ({ ...holding }))
  const index = next.findIndex(holding => holding.actorId === actorId && holding.poolId === poolId)
  const current = index >= 0 ? next[index].units : 0
  const resulting = current + delta
  if (resulting < 0) throw new Error('Equity holding cannot become negative.')
  if (resulting === 0) {
    if (index >= 0) next.splice(index, 1)
    return next
  }
  if (index >= 0) next[index] = { ...next[index], units: resulting }
  else next.push({ actorId, poolId, units: resulting })
  return next
}

export const setEquityMemberActive = (
  state: CompanyEquityState, actorId: EconomicActorId, active: boolean,
): CompanyEquityState => {
  const next = cloneEquityState(state)
  const members = new Set(next.activeMemberActorIds)
  if (active) members.add(actorId)
  else members.delete(actorId)
  next.activeMemberActorIds = [...members]
  return next
}

export const allocateEquityFromTreasury = (
  state: CompanyEquityState,
  actorId: EconomicActorId,
  poolId: EquityPoolId,
  units: number,
): EquityMutationResult => {
  if (!isPositiveSafeInteger(units)) return { changed: false, state, reason: 'InvalidUnits' }
  if (poolId === 'InternalMember' && !state.activeMemberActorIds.includes(actorId)) {
    return { changed: false, state, reason: 'InternalMembershipRequired' }
  }
  const pool = state.pools.find(item => item.poolId === poolId)
  if (!pool || pool.treasuryUnits < units) return { changed: false, state, reason: 'InsufficientTreasury' }

  const next = cloneEquityState(state)
  const nextPool = next.pools.find(item => item.poolId === poolId)!
  nextPool.treasuryUnits -= units
  next.holdings = updateHolding(next.holdings, actorId, poolId, units)
  return { changed: true, state: next }
}

export const transferEquityHolding = (
  state: CompanyEquityState,
  fromActorId: EconomicActorId,
  toActorId: EconomicActorId,
  poolId: EquityPoolId,
  units: number,
): EquityMutationResult => {
  if (!isPositiveSafeInteger(units)) return { changed: false, state, reason: 'InvalidUnits' }
  if (fromActorId === toActorId) return { changed: false, state, reason: 'SameActor' }
  if (poolId === 'InternalMember' && !state.activeMemberActorIds.includes(toActorId)) {
    return { changed: false, state, reason: 'InternalMembershipRequired' }
  }
  const source = state.holdings.find(holding => holding.actorId === fromActorId && holding.poolId === poolId)
  if (!source || source.units < units) return { changed: false, state, reason: 'InsufficientHolding' }

  const next = cloneEquityState(state)
  next.holdings = updateHolding(next.holdings, fromActorId, poolId, -units)
  next.holdings = updateHolding(next.holdings, toActorId, poolId, units)
  return { changed: true, state: next }
}

export const setCurrentExecutive = (
  state: CompanyEquityState,
  executiveActorId: EconomicActorId,
): CompanyEquityState => ({ ...cloneEquityState(state), executiveActorId })

/**
 * Internal/member-restricted holdings return to company treasury on exit in this
 * baseline path. External holdings are deliberately preserved as portfolio assets.
 */
export const reconcileEquityMemberExit = (
  state: CompanyEquityState,
  actorId: EconomicActorId,
): CompanyEquityState => {
  const next = cloneEquityState(state)
  const internalHolding = next.holdings.find(
    holding => holding.actorId === actorId && holding.poolId === 'InternalMember',
  )
  if (internalHolding) {
    const pool = next.pools.find(item => item.poolId === 'InternalMember')!
    pool.treasuryUnits += internalHolding.units
    next.holdings = next.holdings.filter(
      holding => !(holding.actorId === actorId && holding.poolId === 'InternalMember'),
    )
  }
  next.activeMemberActorIds = next.activeMemberActorIds.filter(id => id !== actorId)
  return next
}

export const getActorEquityUnits = (
  state: CompanyEquityState, actorId: EconomicActorId, poolId: EquityPoolId,
): number => state.holdings.find(holding => holding.actorId === actorId && holding.poolId === poolId)?.units ?? 0

export const sanitizeCompanyEquityState = (
  value: unknown,
  expectedCompanyId: BusinessCompanyId,
  founderActorId: EconomicActorId,
): { state: CompanyEquityState; repaired: boolean } => {
  const fallback = createInitialCompanyEquityState(expectedCompanyId, founderActorId)
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return { state: fallback, repaired: true }
  const candidate = value as CompanyEquityState
  try {
    const cloned = cloneEquityState(candidate)
    if (cloned.companyId !== expectedCompanyId || cloned.founderActorId !== founderActorId) {
      return { state: fallback, repaired: true }
    }
    const integrity = validateCompanyEquityIntegrity(cloned)
    return integrity.valid ? { state: cloned, repaired: false } : { state: fallback, repaired: true }
  } catch {
    return { state: fallback, repaired: true }
  }
}
