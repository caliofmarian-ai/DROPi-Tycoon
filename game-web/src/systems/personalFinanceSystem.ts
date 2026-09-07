import type { EconomicActorId, BusinessCompanyId } from '../types/business'
import {
  PERSONAL_FINANCE_REASONS,
  type PersonalFinanceLedgerEntry,
  type PersonalFinanceReason,
  type PersonalFundsAccountState,
  type PersonalFundsIntegrityResult,
  type PersonalFundsMutationResult,
} from '../types/personalFinance'

const CREDIT_REASONS = new Set<PersonalFinanceReason>([
  'WageIncome',
  'DividendIncome',
  'OtherGameplayIncome',
])
const DEBIT_REASONS = new Set<PersonalFinanceReason>([
  'EquityPurchase',
  'TrainingExpense',
  'PersonalExpense',
])

const isPositiveSafeInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const cloneAccount = (state: PersonalFundsAccountState): PersonalFundsAccountState => ({
  actorId: state.actorId,
  balance: state.balance,
  entries: state.entries.map(entry => ({ ...entry })),
})

export const createPersonalFundsAccount = (actorId: EconomicActorId): PersonalFundsAccountState => ({
  actorId,
  balance: 0,
  entries: [],
})

const nextSequence = (state: PersonalFundsAccountState): number => state.entries.length + 1
const transactionIdFor = (actorId: EconomicActorId, sequence: number): string =>
  `personal:${actorId}:tx:${sequence}`

const appendEntry = (
  state: PersonalFundsAccountState,
  delta: number,
  reason: PersonalFinanceReason,
  companyId?: BusinessCompanyId,
): PersonalFundsMutationResult => {
  const sequence = nextSequence(state)
  const entry: PersonalFinanceLedgerEntry = {
    transactionId: transactionIdFor(state.actorId, sequence),
    sequence,
    actorId: state.actorId,
    delta,
    reason,
    ...(companyId ? { companyId } : {}),
  }
  const next = cloneAccount(state)
  next.balance += delta
  next.entries.push(entry)
  return { changed: true, state: next, entry }
}

export const creditPersonalFunds = (
  state: PersonalFundsAccountState,
  amount: number,
  reason: PersonalFinanceReason,
  companyId?: BusinessCompanyId,
): PersonalFundsMutationResult => {
  if (!isPositiveSafeInteger(amount)) return { changed: false, state, reason: 'InvalidAmount' }
  if (!CREDIT_REASONS.has(reason)) return { changed: false, state, reason: 'InvalidReasonDirection' }
  return appendEntry(state, amount, reason, companyId)
}

export const debitPersonalFunds = (
  state: PersonalFundsAccountState,
  amount: number,
  reason: PersonalFinanceReason,
  companyId?: BusinessCompanyId,
): PersonalFundsMutationResult => {
  if (!isPositiveSafeInteger(amount)) return { changed: false, state, reason: 'InvalidAmount' }
  if (!DEBIT_REASONS.has(reason)) return { changed: false, state, reason: 'InvalidReasonDirection' }
  if (state.balance < amount) return { changed: false, state, reason: 'InsufficientPersonalFunds' }
  return appendEntry(state, -amount, reason, companyId)
}

export const validatePersonalFundsIntegrity = (
  state: PersonalFundsAccountState,
): PersonalFundsIntegrityResult => {
  const errors: string[] = []
  if (!state.actorId.trim()) errors.push('actorId must be non-empty.')
  if (!Number.isSafeInteger(state.balance) || state.balance < 0) {
    errors.push('Personal Money balance must be a non-negative safe integer.')
  }

  let derivedBalance = 0
  const seenTransactionIds = new Set<string>()
  state.entries.forEach((entry, index) => {
    const expectedSequence = index + 1
    if (entry.sequence !== expectedSequence) errors.push('Ledger sequences must be contiguous and ordered.')
    if (entry.transactionId !== transactionIdFor(state.actorId, entry.sequence)) {
      errors.push('Ledger transactionId must match actor and sequence.')
    }
    if (seenTransactionIds.has(entry.transactionId)) errors.push('Ledger transaction IDs must be unique.')
    seenTransactionIds.add(entry.transactionId)
    if (entry.actorId !== state.actorId) errors.push('Ledger entry actorId must match account actorId.')
    if (!Number.isSafeInteger(entry.delta) || entry.delta === 0) errors.push('Ledger delta must be a non-zero safe integer.')
    if (!PERSONAL_FINANCE_REASONS.includes(entry.reason)) errors.push('Ledger reason is not canonical.')
    if (CREDIT_REASONS.has(entry.reason) && entry.delta <= 0) errors.push('Income reasons require positive deltas.')
    if (DEBIT_REASONS.has(entry.reason) && entry.delta >= 0) errors.push('Expense/investment reasons require negative deltas.')
    derivedBalance += entry.delta
    if (derivedBalance < 0) errors.push('Ledger history cannot produce a negative personal balance.')
  })

  if (derivedBalance !== state.balance) errors.push('Ledger-derived balance must equal stored Personal Money balance.')

  return { valid: errors.length === 0, errors }
}

export const sanitizePersonalFundsAccount = (
  value: unknown,
  expectedActorId: EconomicActorId,
): { state: PersonalFundsAccountState; repaired: boolean } => {
  const fallback = createPersonalFundsAccount(expectedActorId)
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { state: fallback, repaired: true }
  }

  try {
    const candidate = value as PersonalFundsAccountState
    const cloned = cloneAccount(candidate)
    if (cloned.actorId !== expectedActorId) return { state: fallback, repaired: true }
    const integrity = validatePersonalFundsIntegrity(cloned)
    return integrity.valid ? { state: cloned, repaired: false } : { state: fallback, repaired: true }
  } catch {
    return { state: fallback, repaired: true }
  }
}
