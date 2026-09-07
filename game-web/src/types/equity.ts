import type { BusinessCompanyId, EconomicActorId } from './business'

export const EQUITY_POOL_IDS = ['InternalMember', 'ExternalMarket'] as const
export type EquityPoolId = (typeof EQUITY_POOL_IDS)[number]

/**
 * Integer equity units avoid floating-point ownership drift. The 10,000-unit
 * supply maps directly to the canonical 51% / 49% structural pool baseline.
 */
export const COMPANY_EQUITY_TOTAL_UNITS = 10_000 as const
export const INTERNAL_MEMBER_POOL_UNITS = 5_100 as const
export const EXTERNAL_MARKET_POOL_UNITS = 4_900 as const

export interface EquityPoolState {
  poolId: EquityPoolId
  totalUnits: number
  /** Units owned by the company/treasury and not currently held by an actor. */
  treasuryUnits: number
}

export interface EquityHoldingState {
  actorId: EconomicActorId
  poolId: EquityPoolId
  units: number
}

export interface CompanyEquityState {
  companyId: BusinessCompanyId
  /** Permanent historical identity. Governance must never rewrite this field. */
  founderActorId: EconomicActorId
  /** Current leadership identity; deliberately distinct from Founder history. */
  executiveActorId: EconomicActorId
  totalUnits: number
  pools: EquityPoolState[]
  holdings: EquityHoldingState[]
  /** Membership eligibility for restricted InternalMember holdings. */
  activeMemberActorIds: EconomicActorId[]
}

export type EquityMutationBlockReason =
  | 'InvalidUnits'
  | 'InsufficientTreasury'
  | 'InsufficientHolding'
  | 'InternalMembershipRequired'
  | 'SameActor'

export type EquityMutationResult =
  | { changed: true; state: CompanyEquityState }
  | { changed: false; state: CompanyEquityState; reason: EquityMutationBlockReason }

export interface EquityIntegrityResult {
  valid: boolean
  errors: string[]
}
