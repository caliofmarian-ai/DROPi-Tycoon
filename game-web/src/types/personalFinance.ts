import type { BusinessCompanyId, EconomicActorId } from './business'

export const PERSONAL_FINANCE_REASONS = [
  'WageIncome',
  'DividendIncome',
  'OtherGameplayIncome',
  'EquityPurchase',
  'TrainingExpense',
  'PersonalExpense',
] as const
export type PersonalFinanceReason = (typeof PERSONAL_FINANCE_REASONS)[number]

export interface PersonalFinanceLedgerEntry {
  transactionId: string
  sequence: number
  actorId: EconomicActorId
  /** Signed whole Personal Money units. Positive = credit; negative = debit. */
  delta: number
  reason: PersonalFinanceReason
  /** Optional company counterparty for wages, dividends, or equity investment. */
  companyId?: BusinessCompanyId
}

export interface PersonalFundsAccountState {
  actorId: EconomicActorId
  balance: number
  entries: PersonalFinanceLedgerEntry[]
}

export type PersonalFundsMutationBlockReason =
  | 'InvalidAmount'
  | 'InsufficientPersonalFunds'
  | 'ActorMismatch'
  | 'InvalidReasonDirection'

export type PersonalFundsMutationResult =
  | { changed: true; state: PersonalFundsAccountState; entry: PersonalFinanceLedgerEntry }
  | { changed: false; state: PersonalFundsAccountState; reason: PersonalFundsMutationBlockReason }

export interface PersonalFundsIntegrityResult {
  valid: boolean
  errors: string[]
}
