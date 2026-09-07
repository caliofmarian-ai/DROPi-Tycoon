import { PROTOTYPE_GOVERNANCE_POLICY } from '../config/governance'
import type { DividendDistributionReceipt, DividendSettlementJournal } from '../types/dividend'
import type { CompanyEquityState } from '../types/equity'
import type { GameSessionState } from '../types/game'
import type { GovernanceBlockReason, GovernanceProposalState } from '../types/governance'
import type { OwnershipEconomyIntegrityResult, OwnershipEconomyState } from '../types/ownershipEconomy'
import type { PersonalFundsAccountState } from '../types/personalFinance'
import type {
  InternalTreasuryPurchaseRequest,
  TreasurySharePurchaseReceipt,
  TreasuryShareSettlementBlockReason,
  TreasuryShareSettlementJournal,
} from '../types/treasuryShareSettlement'
import type { CompanyValuationBreakdown } from '../types/valuation'
import {
  createLocalBusinessCompanyId,
  createLocalEconomicActorId,
} from './businessFormationSystem'
import {
  createDividendSettlementJournal,
  settleEndOfSeasonDividend,
} from './dividendSystem'
import {
  createInitialCompanyEquityState,
  validateCompanyEquityIntegrity,
} from './equityLedgerSystem'
import {
  createInitialCompanyGovernanceState,
  ensureExecutiveContinuity,
  executeExecutiveAppointment,
  validateCompanyGovernanceIntegrity,
} from './governanceSystem'
import {
  createPersonalFundsAccount,
  validatePersonalFundsIntegrity,
} from './personalFinanceSystem'
import {
  createTreasuryShareSettlementJournal,
  settleInternalTreasuryPurchase,
} from './treasuryShareSettlementSystem'

export const LOCAL_PLAYER_ACTOR_ID = createLocalEconomicActorId(1)
export const LOCAL_PLAYER_COMPANY_ID = createLocalBusinessCompanyId(1)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0
const isNonNegativeSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
const isFiniteNonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const cloneEquity = (state: CompanyEquityState): CompanyEquityState => ({
  ...state,
  pools: state.pools.map(pool => ({ ...pool })),
  holdings: state.holdings.map(holding => ({ ...holding })),
  activeMemberActorIds: [...state.activeMemberActorIds],
})

const clonePersonalAccount = (state: PersonalFundsAccountState): PersonalFundsAccountState => ({
  actorId: state.actorId,
  balance: state.balance,
  entries: state.entries.map(entry => ({ ...entry })),
})

const cloneTreasuryJournal = (journal: TreasuryShareSettlementJournal): TreasuryShareSettlementJournal => ({
  companyId: journal.companyId,
  receipts: journal.receipts.map(receipt => ({ ...receipt })),
})

const cloneDividendJournal = (journal: DividendSettlementJournal): DividendSettlementJournal => ({
  companyId: journal.companyId,
  receipts: journal.receipts.map(receipt => ({
    ...receipt,
    allocations: receipt.allocations.map(allocation => ({ ...allocation })),
  })),
})

export const cloneOwnershipEconomyState = (state: OwnershipEconomyState): OwnershipEconomyState => ({
  playerActorId: state.playerActorId,
  companyId: state.companyId,
  equity: cloneEquity(state.equity),
  personalAccounts: state.personalAccounts.map(clonePersonalAccount),
  treasuryShareJournal: cloneTreasuryJournal(state.treasuryShareJournal),
  dividendJournal: cloneDividendJournal(state.dividendJournal),
  governance: {
    companyId: state.governance.companyId,
    proposals: state.governance.proposals.map(proposal => ({
      ...proposal,
      action: { ...proposal.action },
      voterWeights: proposal.voterWeights.map(weight => ({ ...weight })),
      ballots: proposal.ballots.map(ballot => ({ ...ballot })),
      resolution: proposal.resolution ? { ...proposal.resolution } : undefined,
    })),
    receipts: state.governance.receipts.map(receipt => ({ ...receipt })),
  },
})

export const createInitialOwnershipEconomyState = (): OwnershipEconomyState => ({
  playerActorId: LOCAL_PLAYER_ACTOR_ID,
  companyId: LOCAL_PLAYER_COMPANY_ID,
  equity: createInitialCompanyEquityState(LOCAL_PLAYER_COMPANY_ID, LOCAL_PLAYER_ACTOR_ID),
  personalAccounts: [createPersonalFundsAccount(LOCAL_PLAYER_ACTOR_ID)],
  treasuryShareJournal: createTreasuryShareSettlementJournal(LOCAL_PLAYER_COMPANY_ID),
  dividendJournal: createDividendSettlementJournal(LOCAL_PLAYER_COMPANY_ID),
  governance: createInitialCompanyGovernanceState(LOCAL_PLAYER_COMPANY_ID),
})

const treasuryReceiptIsValid = (receipt: TreasurySharePurchaseReceipt, companyId: string): boolean =>
  isNonEmptyString(receipt.purchaseId) &&
  receipt.companyId === companyId &&
  isNonEmptyString(receipt.buyerActorId) &&
  isPositiveSafeInteger(receipt.units) &&
  isNonEmptyString(receipt.valuationPolicyVersion) &&
  isNonEmptyString(receipt.pricingPolicyVersion) &&
  isFiniteNonNegative(receipt.referenceEquityUnitValue) &&
  isPositiveSafeInteger(receipt.totalPrice) &&
  isNonEmptyString(receipt.personalLedgerTransactionId) &&
  isNonNegativeSafeInteger(receipt.companyMoneyBefore) &&
  isNonNegativeSafeInteger(receipt.companyMoneyAfter) &&
  receipt.companyMoneyAfter - receipt.companyMoneyBefore === receipt.totalPrice &&
  isNonNegativeSafeInteger(receipt.buyerInternalUnitsAfter) &&
  isNonNegativeSafeInteger(receipt.internalTreasuryUnitsAfter)

const treasuryJournalIsValid = (journal: TreasuryShareSettlementJournal, companyId: string): boolean => {
  if (journal.companyId !== companyId) return false
  const ids = new Set<string>()
  for (const receipt of journal.receipts) {
    if (!treasuryReceiptIsValid(receipt, companyId) || ids.has(receipt.purchaseId)) return false
    ids.add(receipt.purchaseId)
  }
  return true
}

const dividendReceiptIsValid = (receipt: DividendDistributionReceipt, companyId: string): boolean => {
  if (
    !isNonEmptyString(receipt.distributionId) ||
    receipt.companyId !== companyId ||
    !isNonEmptyString(receipt.seasonId) ||
    typeof receipt.seasonNetProfit !== 'number' ||
    !Number.isSafeInteger(receipt.seasonNetProfit) ||
    !isNonEmptyString(receipt.policyVersion) ||
    !isPositiveSafeInteger(receipt.totalOutstandingHeldUnits) ||
    !isPositiveSafeInteger(receipt.totalDividendAmount) ||
    !isNonNegativeSafeInteger(receipt.companyMoneyBefore) ||
    !isNonNegativeSafeInteger(receipt.companyMoneyAfter) ||
    receipt.companyMoneyBefore - receipt.companyMoneyAfter !== receipt.totalDividendAmount ||
    !Array.isArray(receipt.allocations) || receipt.allocations.length === 0
  ) return false

  const actors = new Set<string>()
  let heldUnits = 0
  let amount = 0
  for (const allocation of receipt.allocations) {
    if (
      !isNonEmptyString(allocation.actorId) || actors.has(allocation.actorId) ||
      !isPositiveSafeInteger(allocation.heldUnits) ||
      !isNonNegativeSafeInteger(allocation.amount)
    ) return false
    if (allocation.amount > 0 && !isNonEmptyString(allocation.personalLedgerTransactionId)) return false
    if (allocation.amount === 0 && allocation.personalLedgerTransactionId !== undefined) return false
    actors.add(allocation.actorId)
    heldUnits += allocation.heldUnits
    amount += allocation.amount
  }
  return Number.isSafeInteger(heldUnits) && Number.isSafeInteger(amount) &&
    heldUnits === receipt.totalOutstandingHeldUnits && amount === receipt.totalDividendAmount
}

const dividendJournalIsValid = (journal: DividendSettlementJournal, companyId: string): boolean => {
  if (journal.companyId !== companyId) return false
  const distributionIds = new Set<string>()
  const seasonIds = new Set<string>()
  for (const receipt of journal.receipts) {
    if (
      !dividendReceiptIsValid(receipt, companyId) ||
      distributionIds.has(receipt.distributionId) ||
      seasonIds.has(receipt.seasonId)
    ) return false
    distributionIds.add(receipt.distributionId)
    seasonIds.add(receipt.seasonId)
  }
  return true
}

const matchingPersonalEntryExists = (
  account: PersonalFundsAccountState,
  transactionId: string,
  delta: number,
  reason: 'EquityPurchase' | 'DividendIncome',
  companyId: string,
): boolean => account.entries.some(entry =>
  entry.transactionId === transactionId &&
  entry.actorId === account.actorId &&
  entry.delta === delta &&
  entry.reason === reason &&
  entry.companyId === companyId,
)

export const validateOwnershipEconomyIntegrity = (
  state: OwnershipEconomyState,
): OwnershipEconomyIntegrityResult => {
  const errors: string[] = []
  if (state.playerActorId !== LOCAL_PLAYER_ACTOR_ID) errors.push('Local player actor identity is invalid.')
  if (state.companyId !== LOCAL_PLAYER_COMPANY_ID) errors.push('Local company identity is invalid.')

  const equityIntegrity = validateCompanyEquityIntegrity(state.equity)
  if (!equityIntegrity.valid) errors.push('Equity state is invalid.')
  if (state.equity.companyId !== state.companyId) errors.push('Equity company identity mismatch.')
  if (state.equity.founderActorId !== state.playerActorId) errors.push('Legacy local Founder identity mismatch.')

  const accounts = new Map<string, PersonalFundsAccountState>()
  for (const account of state.personalAccounts) {
    if (accounts.has(account.actorId)) {
      errors.push('Personal Money actor accounts must be unique.')
      continue
    }
    accounts.set(account.actorId, account)
    if (!validatePersonalFundsIntegrity(account).valid) errors.push(`Personal Money account is invalid: ${account.actorId}`)
  }
  if (!accounts.has(state.playerActorId)) errors.push('Local player Personal Money account is missing.')
  for (const holding of state.equity.holdings) {
    if (!accounts.has(holding.actorId)) errors.push(`Equity holder lacks Personal Money account: ${holding.actorId}`)
  }

  if (!treasuryJournalIsValid(state.treasuryShareJournal, state.companyId)) {
    errors.push('Treasury share settlement journal is invalid.')
  } else {
    for (const receipt of state.treasuryShareJournal.receipts) {
      const account = accounts.get(receipt.buyerActorId)
      if (!account || !matchingPersonalEntryExists(
        account,
        receipt.personalLedgerTransactionId,
        -receipt.totalPrice,
        'EquityPurchase',
        state.companyId,
      )) errors.push(`Treasury receipt lacks matching Personal Money debit: ${receipt.purchaseId}`)
    }
  }

  if (!dividendJournalIsValid(state.dividendJournal, state.companyId)) {
    errors.push('Dividend settlement journal is invalid.')
  } else {
    for (const receipt of state.dividendJournal.receipts) {
      for (const allocation of receipt.allocations) {
        if (allocation.amount === 0) continue
        const account = accounts.get(allocation.actorId)
        if (!account || !allocation.personalLedgerTransactionId || !matchingPersonalEntryExists(
          account,
          allocation.personalLedgerTransactionId,
          allocation.amount,
          'DividendIncome',
          state.companyId,
        )) errors.push(`Dividend allocation lacks matching Personal Money credit: ${receipt.distributionId}/${allocation.actorId}`)
      }
    }
  }

  if (state.governance.companyId !== state.companyId || !validateCompanyGovernanceIntegrity(state.governance).valid) {
    errors.push('Governance state is invalid or belongs to another company.')
  }

  return { valid: errors.length === 0, errors }
}

export const sanitizeOwnershipEconomyState = (
  value: unknown,
): { state: OwnershipEconomyState; repaired: boolean } => {
  const fallback = createInitialOwnershipEconomyState()
  if (value === undefined) return { state: fallback, repaired: false }
  if (!isRecord(value)) return { state: fallback, repaired: true }

  try {
    const candidate = cloneOwnershipEconomyState(value as unknown as OwnershipEconomyState)
    return validateOwnershipEconomyIntegrity(candidate).valid
      ? { state: candidate, repaired: false }
      : { state: fallback, repaired: true }
  } catch {
    return { state: fallback, repaired: true }
  }
}

export const getPersonalFundsAccount = (
  state: OwnershipEconomyState,
  actorId: string,
): PersonalFundsAccountState | undefined => state.personalAccounts.find(account => account.actorId === actorId)

const cloneSessionWithOwnership = (
  session: GameSessionState,
  ownershipEconomy: OwnershipEconomyState,
  companyMoney: number = session.company.money,
): GameSessionState => ({
  ...session,
  company: { ...session.company, money: companyMoney },
  ownershipEconomy: cloneOwnershipEconomyState(ownershipEconomy),
})

export type SessionTreasuryPurchaseResult =
  | {
      settled: true
      changed: boolean
      replayed: boolean
      session: GameSessionState
      receipt: TreasurySharePurchaseReceipt
    }
  | {
      settled: false
      changed: false
      session: GameSessionState
      reason: TreasuryShareSettlementBlockReason | 'BuyerAccountMissing'
    }

export const settleSessionInternalTreasuryPurchase = (
  session: GameSessionState,
  request: InternalTreasuryPurchaseRequest,
  valuation: CompanyValuationBreakdown,
): SessionTreasuryPurchaseResult => {
  const ownership = sanitizeOwnershipEconomyState(session.ownershipEconomy).state
  const buyerAccount = getPersonalFundsAccount(ownership, request.buyerActorId)
  if (!buyerAccount) return { settled: false, changed: false, session, reason: 'BuyerAccountMissing' }

  const result = settleInternalTreasuryPurchase(
    request,
    ownership.equity,
    buyerAccount,
    session.company.money,
    valuation,
    ownership.treasuryShareJournal,
  )
  if (!result.settled) return { settled: false, changed: false, session, reason: result.reason }
  if (result.replayed) return { settled: true, changed: false, replayed: true, session, receipt: result.receipt }

  const nextOwnership = cloneOwnershipEconomyState(ownership)
  nextOwnership.equity = result.equityState
  nextOwnership.treasuryShareJournal = result.journal
  nextOwnership.personalAccounts = nextOwnership.personalAccounts.map(account =>
    account.actorId === result.buyerFunds.actorId ? result.buyerFunds : account,
  )
  if (!validateOwnershipEconomyIntegrity(nextOwnership).valid) {
    return { settled: false, changed: false, session, reason: 'AtomicMutationFailed' }
  }

  return {
    settled: true,
    changed: true,
    replayed: false,
    session: cloneSessionWithOwnership(session, nextOwnership, result.issuingCompanyMoney),
    receipt: result.receipt,
  }
}

export type SessionDividendResult =
  | {
      settled: true
      changed: boolean
      replayed: boolean
      session: GameSessionState
      receipt: DividendDistributionReceipt
    }
  | {
      settled: false
      changed: false
      session: GameSessionState
      reason: import('../types/dividend').DividendSettlementBlockReason
    }

export const settleSessionEndOfSeasonDividend = (
  session: GameSessionState,
  request: import('../types/dividend').DividendDistributionRequest,
): SessionDividendResult => {
  const ownership = sanitizeOwnershipEconomyState(session.ownershipEconomy).state
  const result = settleEndOfSeasonDividend(
    request,
    ownership.equity,
    ownership.personalAccounts,
    session.company.money,
    ownership.dividendJournal,
  )
  if (!result.settled) return { settled: false, changed: false, session, reason: result.reason }
  if (result.replayed) return { settled: true, changed: false, replayed: true, session, receipt: result.receipt }

  const nextOwnership = cloneOwnershipEconomyState(ownership)
  nextOwnership.equity = result.equityState
  nextOwnership.personalAccounts = result.personalAccounts
  nextOwnership.dividendJournal = result.journal
  if (!validateOwnershipEconomyIntegrity(nextOwnership).valid) {
    return { settled: false, changed: false, session, reason: 'AtomicMutationFailed' }
  }
  return {
    settled: true,
    changed: true,
    replayed: false,
    session: cloneSessionWithOwnership(session, nextOwnership, result.issuingCompanyMoney),
    receipt: result.receipt,
  }
}

export type SessionGovernanceExecutionResult =
  | {
      executed: true
      changed: boolean
      duplicate: boolean
      session: GameSessionState
      proposal: GovernanceProposalState
    }
  | {
      executed: false
      changed: false
      session: GameSessionState
      reason: GovernanceBlockReason
    }

export const executeSessionExecutiveAppointment = (
  session: GameSessionState,
  input: { commandId: string; proposalId: string },
): SessionGovernanceExecutionResult => {
  const ownership = sanitizeOwnershipEconomyState(session.ownershipEconomy).state
  const result = executeExecutiveAppointment(
    ownership.governance,
    ownership.equity,
    input,
    PROTOTYPE_GOVERNANCE_POLICY,
  )
  if (!result.changed) {
    if (result.duplicate && result.proposal) {
      return { executed: true, changed: false, duplicate: true, session, proposal: result.proposal }
    }
    return { executed: false, changed: false, session, reason: result.reason }
  }
  const nextOwnership = cloneOwnershipEconomyState(ownership)
  nextOwnership.equity = result.equityState
  nextOwnership.governance = result.governanceState
  if (!validateOwnershipEconomyIntegrity(nextOwnership).valid) {
    return { executed: false, changed: false, session, reason: 'InvalidGovernanceState' }
  }
  return {
    executed: true,
    changed: true,
    duplicate: false,
    session: cloneSessionWithOwnership(session, nextOwnership),
    proposal: result.proposal,
  }
}

export const ensureSessionExecutiveContinuity = (
  session: GameSessionState,
): { changed: boolean; session: GameSessionState; mode: import('../types/governance').ExecutiveContinuityMode } => {
  const ownership = sanitizeOwnershipEconomyState(session.ownershipEconomy).state
  const continuity = ensureExecutiveContinuity(ownership.equity)
  if (!continuity.changed) return { changed: false, session, mode: continuity.mode }
  const nextOwnership = cloneOwnershipEconomyState(ownership)
  nextOwnership.equity = continuity.state
  return {
    changed: true,
    session: cloneSessionWithOwnership(session, nextOwnership),
    mode: continuity.mode,
  }
}
