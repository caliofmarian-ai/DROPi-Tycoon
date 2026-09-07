import { DIVIDEND_POLICY_V1 } from '../config/dividends'
import type {
  DividendAllocation,
  DividendCapacity,
  DividendDistributionReceipt,
  DividendDistributionRequest,
  DividendPolicy,
  DividendSettlementBlockReason,
  DividendSettlementJournal,
  DividendSettlementResult,
} from '../types/dividend'
import type { CompanyEquityState } from '../types/equity'
import type { PersonalFundsAccountState } from '../types/personalFinance'
import { validateCompanyEquityIntegrity } from './equityLedgerSystem'
import { creditPersonalFunds, validatePersonalFundsIntegrity } from './personalFinanceSystem'

const BASIS_POINTS_DENOMINATOR = 10_000n
const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

const isSafeInteger = (value: number): boolean => Number.isSafeInteger(value)
const isNonNegativeSafeInteger = (value: number): boolean => isSafeInteger(value) && value >= 0
const isPositiveSafeInteger = (value: number): boolean => isSafeInteger(value) && value > 0
const actorIdCompare = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0

const policyIsValid = (policy: DividendPolicy): boolean =>
  Boolean(policy.version.trim()) &&
  Number.isSafeInteger(policy.payoutBasisPoints) &&
  policy.payoutBasisPoints >= 0 &&
  policy.payoutBasisPoints <= 10_000 &&
  isNonNegativeSafeInteger(policy.minimumCompanyReserve)

const cloneJournal = (journal: DividendSettlementJournal): DividendSettlementJournal => ({
  companyId: journal.companyId,
  receipts: journal.receipts.map(receipt => ({
    ...receipt,
    allocations: receipt.allocations.map(allocation => ({ ...allocation })),
  })),
})

const receiptAllocationIsValid = (allocation: DividendAllocation): boolean =>
  Boolean(allocation.actorId.trim()) &&
  isPositiveSafeInteger(allocation.heldUnits) &&
  isNonNegativeSafeInteger(allocation.amount) &&
  (!allocation.personalLedgerTransactionId || Boolean(allocation.personalLedgerTransactionId.trim()))

const journalIsValid = (journal: DividendSettlementJournal): boolean => {
  if (!journal.companyId.trim()) return false
  const distributionIds = new Set<string>()
  const seasonIds = new Set<string>()

  for (const receipt of journal.receipts) {
    if (!receipt.distributionId.trim() || distributionIds.has(receipt.distributionId)) return false
    if (!receipt.seasonId.trim() || seasonIds.has(receipt.seasonId)) return false
    if (receipt.companyId !== journal.companyId) return false
    if (!isSafeInteger(receipt.seasonNetProfit)) return false
    if (!receipt.policyVersion.trim()) return false
    if (!isPositiveSafeInteger(receipt.totalOutstandingHeldUnits)) return false
    if (!isPositiveSafeInteger(receipt.totalDividendAmount)) return false
    if (!isNonNegativeSafeInteger(receipt.companyMoneyBefore)) return false
    if (!isNonNegativeSafeInteger(receipt.companyMoneyAfter)) return false
    if (receipt.companyMoneyBefore - receipt.companyMoneyAfter !== receipt.totalDividendAmount) return false
    if (!receipt.allocations.length || !receipt.allocations.every(receiptAllocationIsValid)) return false
    if (receipt.allocations.reduce((sum, item) => sum + item.heldUnits, 0) !== receipt.totalOutstandingHeldUnits) return false
    if (receipt.allocations.reduce((sum, item) => sum + item.amount, 0) !== receipt.totalDividendAmount) return false

    const allocationActors = new Set<string>()
    for (const allocation of receipt.allocations) {
      if (allocationActors.has(allocation.actorId)) return false
      allocationActors.add(allocation.actorId)
    }

    distributionIds.add(receipt.distributionId)
    seasonIds.add(receipt.seasonId)
  }

  return true
}

export const createDividendSettlementJournal = (companyId: string): DividendSettlementJournal => ({
  companyId,
  receipts: [],
})

export const calculateDividendCapacity = (
  seasonNetProfit: number,
  issuingCompanyMoney: number,
  policy: DividendPolicy = DIVIDEND_POLICY_V1,
): DividendCapacity | null => {
  if (!isSafeInteger(seasonNetProfit) || !isNonNegativeSafeInteger(issuingCompanyMoney) || !policyIsValid(policy)) {
    return null
  }

  const positiveSeasonNetProfit = Math.max(0, seasonNetProfit)
  const profitCapacityBig =
    (BigInt(positiveSeasonNetProfit) * BigInt(policy.payoutBasisPoints)) / BASIS_POINTS_DENOMINATOR
  if (profitCapacityBig > MAX_SAFE_INTEGER_BIGINT) return null
  const profitBasedCapacity = Number(profitCapacityBig)
  const companyMoneyAboveReserve = Math.max(0, issuingCompanyMoney - policy.minimumCompanyReserve)

  return {
    policyVersion: policy.version,
    positiveSeasonNetProfit,
    profitBasedCapacity,
    companyMoneyAboveReserve,
    totalDistributableAmount: Math.min(profitBasedCapacity, companyMoneyAboveReserve),
  }
}

interface AggregateHolding {
  actorId: string
  heldUnits: number
}

const aggregateOutstandingHoldings = (equityState: CompanyEquityState): AggregateHolding[] => {
  const byActor = new Map<string, number>()
  for (const holding of equityState.holdings) {
    byActor.set(holding.actorId, (byActor.get(holding.actorId) ?? 0) + holding.units)
  }
  return [...byActor.entries()]
    .map(([actorId, heldUnits]) => ({ actorId, heldUnits }))
    .sort((left, right) => actorIdCompare(left.actorId, right.actorId))
}

interface AllocationDraft extends DividendAllocation {
  remainder: bigint
}

export const allocateDividendProportionally = (
  totalDividendAmount: number,
  holdings: AggregateHolding[],
): DividendAllocation[] | null => {
  if (!isPositiveSafeInteger(totalDividendAmount) || !holdings.length) return null
  if (holdings.some(item => !item.actorId.trim() || !isPositiveSafeInteger(item.heldUnits))) return null

  const totalHeldUnits = holdings.reduce((sum, item) => sum + item.heldUnits, 0)
  if (!isPositiveSafeInteger(totalHeldUnits)) return null

  const totalDividendBig = BigInt(totalDividendAmount)
  const totalHeldBig = BigInt(totalHeldUnits)
  const drafts: AllocationDraft[] = holdings
    .map(item => {
      const numerator = totalDividendBig * BigInt(item.heldUnits)
      return {
        actorId: item.actorId,
        heldUnits: item.heldUnits,
        amount: Number(numerator / totalHeldBig),
        remainder: numerator % totalHeldBig,
      }
    })
    .sort((left, right) => actorIdCompare(left.actorId, right.actorId))

  let assigned = drafts.reduce((sum, item) => sum + item.amount, 0)
  let remaining = totalDividendAmount - assigned
  if (!isNonNegativeSafeInteger(remaining) || remaining >= drafts.length) return null

  const remainderOrder = [...drafts].sort((left, right) => {
    if (left.remainder > right.remainder) return -1
    if (left.remainder < right.remainder) return 1
    return actorIdCompare(left.actorId, right.actorId)
  })
  for (let index = 0; index < remaining; index += 1) remainderOrder[index].amount += 1

  assigned = drafts.reduce((sum, item) => sum + item.amount, 0)
  if (assigned !== totalDividendAmount) return null

  return drafts.map(({ remainder: _remainder, ...allocation }) => allocation)
}

const blocked = (
  reason: DividendSettlementBlockReason,
  equityState: CompanyEquityState,
  personalAccounts: PersonalFundsAccountState[],
  issuingCompanyMoney: number,
  journal: DividendSettlementJournal,
): DividendSettlementResult => ({
  settled: false,
  reason,
  equityState,
  personalAccounts,
  issuingCompanyMoney,
  journal,
})

const receiptMatchesRequest = (
  receipt: DividendDistributionReceipt,
  request: DividendDistributionRequest,
): boolean =>
  receipt.distributionId === request.distributionId &&
  receipt.companyId === request.companyId &&
  receipt.seasonId === request.seasonId &&
  receipt.seasonNetProfit === request.seasonNetProfit

export const settleEndOfSeasonDividend = (
  request: DividendDistributionRequest,
  equityState: CompanyEquityState,
  personalAccounts: PersonalFundsAccountState[],
  issuingCompanyMoney: number,
  journal: DividendSettlementJournal,
  policy: DividendPolicy = DIVIDEND_POLICY_V1,
): DividendSettlementResult => {
  if (
    !request.distributionId.trim() ||
    !request.companyId.trim() ||
    !request.seasonId.trim() ||
    !isSafeInteger(request.seasonNetProfit) ||
    !journalIsValid(journal)
  ) {
    return blocked('InvalidRequest', equityState, personalAccounts, issuingCompanyMoney, journal)
  }
  if (!policyIsValid(policy)) return blocked('InvalidPolicy', equityState, personalAccounts, issuingCompanyMoney, journal)
  if (journal.companyId !== request.companyId || equityState.companyId !== request.companyId) {
    return blocked('CompanyMismatch', equityState, personalAccounts, issuingCompanyMoney, journal)
  }

  const priorReceipt = journal.receipts.find(receipt => receipt.distributionId === request.distributionId)
  if (priorReceipt) {
    if (!receiptMatchesRequest(priorReceipt, request)) {
      return blocked('DistributionIdConflict', equityState, personalAccounts, issuingCompanyMoney, journal)
    }
    return {
      settled: true,
      replayed: true,
      equityState,
      personalAccounts,
      issuingCompanyMoney,
      journal,
      receipt: {
        ...priorReceipt,
        allocations: priorReceipt.allocations.map(allocation => ({ ...allocation })),
      },
    }
  }

  if (journal.receipts.some(receipt => receipt.seasonId === request.seasonId)) {
    return blocked('SeasonAlreadySettled', equityState, personalAccounts, issuingCompanyMoney, journal)
  }
  if (!isNonNegativeSafeInteger(issuingCompanyMoney)) {
    return blocked('InvalidCompanyMoney', equityState, personalAccounts, issuingCompanyMoney, journal)
  }
  if (!validateCompanyEquityIntegrity(equityState).valid) {
    return blocked('InvalidEquityState', equityState, personalAccounts, issuingCompanyMoney, journal)
  }

  const accountIndexByActor = new Map<string, number>()
  for (let index = 0; index < personalAccounts.length; index += 1) {
    const account = personalAccounts[index]
    if (accountIndexByActor.has(account.actorId)) {
      return blocked('DuplicatePersonalAccount', equityState, personalAccounts, issuingCompanyMoney, journal)
    }
    accountIndexByActor.set(account.actorId, index)
    if (!validatePersonalFundsIntegrity(account).valid) {
      return blocked('InvalidPersonalFundsState', equityState, personalAccounts, issuingCompanyMoney, journal)
    }
  }

  const holdings = aggregateOutstandingHoldings(equityState)
  if (!holdings.length) return blocked('NoOutstandingShareholders', equityState, personalAccounts, issuingCompanyMoney, journal)
  if (holdings.some(holding => !accountIndexByActor.has(holding.actorId))) {
    return blocked('MissingShareholderAccount', equityState, personalAccounts, issuingCompanyMoney, journal)
  }

  const capacity = calculateDividendCapacity(request.seasonNetProfit, issuingCompanyMoney, policy)
  if (!capacity) return blocked('UnsafeArithmetic', equityState, personalAccounts, issuingCompanyMoney, journal)
  if (capacity.totalDistributableAmount <= 0) {
    return blocked('NoDistributableAmount', equityState, personalAccounts, issuingCompanyMoney, journal)
  }

  const allocationDrafts = allocateDividendProportionally(capacity.totalDistributableAmount, holdings)
  if (!allocationDrafts) return blocked('UnsafeArithmetic', equityState, personalAccounts, issuingCompanyMoney, journal)

  const nextCompanyMoney = issuingCompanyMoney - capacity.totalDistributableAmount
  if (!isNonNegativeSafeInteger(nextCompanyMoney) || nextCompanyMoney < policy.minimumCompanyReserve) {
    return blocked('UnsafeArithmetic', equityState, personalAccounts, issuingCompanyMoney, journal)
  }

  const nextAccounts = personalAccounts.map(account => ({
    ...account,
    entries: account.entries.map(entry => ({ ...entry })),
  }))
  const finalAllocations: DividendAllocation[] = []

  for (const allocation of allocationDrafts) {
    if (allocation.amount === 0) {
      finalAllocations.push({ ...allocation })
      continue
    }
    const accountIndex = accountIndexByActor.get(allocation.actorId)
    if (accountIndex === undefined) {
      return blocked('AtomicMutationFailed', equityState, personalAccounts, issuingCompanyMoney, journal)
    }
    const credit = creditPersonalFunds(
      nextAccounts[accountIndex],
      allocation.amount,
      'DividendIncome',
      request.companyId,
    )
    if (!credit.changed || !validatePersonalFundsIntegrity(credit.state).valid) {
      return blocked('AtomicMutationFailed', equityState, personalAccounts, issuingCompanyMoney, journal)
    }
    nextAccounts[accountIndex] = credit.state
    finalAllocations.push({
      ...allocation,
      personalLedgerTransactionId: credit.entry.transactionId,
    })
  }

  if (finalAllocations.reduce((sum, item) => sum + item.amount, 0) !== capacity.totalDistributableAmount) {
    return blocked('AtomicMutationFailed', equityState, personalAccounts, issuingCompanyMoney, journal)
  }

  const totalOutstandingHeldUnits = holdings.reduce((sum, holding) => sum + holding.heldUnits, 0)
  if (!isPositiveSafeInteger(totalOutstandingHeldUnits)) {
    return blocked('UnsafeArithmetic', equityState, personalAccounts, issuingCompanyMoney, journal)
  }

  const receipt: DividendDistributionReceipt = {
    distributionId: request.distributionId,
    companyId: request.companyId,
    seasonId: request.seasonId,
    seasonNetProfit: request.seasonNetProfit,
    policyVersion: policy.version,
    totalOutstandingHeldUnits,
    totalDividendAmount: capacity.totalDistributableAmount,
    companyMoneyBefore: issuingCompanyMoney,
    companyMoneyAfter: nextCompanyMoney,
    allocations: finalAllocations,
  }
  const nextJournal = cloneJournal(journal)
  nextJournal.receipts.push(receipt)

  return {
    settled: true,
    replayed: false,
    equityState,
    personalAccounts: nextAccounts,
    issuingCompanyMoney: nextCompanyMoney,
    journal: nextJournal,
    receipt,
  }
}
