import { INTERNAL_TREASURY_PRICING_POLICY_V1 } from '../config/treasuryShareSettlement'
import type { CompanyEquityState } from '../types/equity'
import type { PersonalFundsAccountState } from '../types/personalFinance'
import type {
  InternalTreasuryPricingPolicy,
  InternalTreasuryPurchaseQuote,
  InternalTreasuryPurchaseRequest,
  InternalTreasuryQuoteResult,
  TreasurySharePurchaseReceipt,
  TreasuryShareSettlementBlockReason,
  TreasuryShareSettlementJournal,
  TreasuryShareSettlementResult,
} from '../types/treasuryShareSettlement'
import type { CompanyValuationBreakdown } from '../types/valuation'
import {
  allocateEquityFromTreasury,
  getActorEquityUnits,
  validateCompanyEquityIntegrity,
} from './equityLedgerSystem'
import {
  debitPersonalFunds,
  validatePersonalFundsIntegrity,
} from './personalFinanceSystem'

const isPositiveSafeInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const isNonNegativeSafeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0
const isNonNegativeFinite = (value: number): boolean => Number.isFinite(value) && value >= 0
const roundReference = (value: number): number => Math.round((value + Number.EPSILON) * 10_000) / 10_000

const cloneJournal = (journal: TreasuryShareSettlementJournal): TreasuryShareSettlementJournal => ({
  companyId: journal.companyId,
  receipts: journal.receipts.map(receipt => ({ ...receipt })),
})

const journalIsValid = (journal: TreasuryShareSettlementJournal): boolean => {
  if (!journal.companyId.trim()) return false
  const ids = new Set<string>()
  for (const receipt of journal.receipts) {
    if (!receipt.purchaseId.trim() || receipt.companyId !== journal.companyId || ids.has(receipt.purchaseId)) return false
    if (!receipt.buyerActorId.trim() || !isPositiveSafeInteger(receipt.units)) return false
    if (!receipt.valuationPolicyVersion.trim() || !receipt.pricingPolicyVersion.trim()) return false
    if (!isNonNegativeFinite(receipt.referenceEquityUnitValue)) return false
    if (!isPositiveSafeInteger(receipt.totalPrice)) return false
    if (!receipt.personalLedgerTransactionId.trim()) return false
    if (!isNonNegativeSafeInteger(receipt.companyMoneyBefore)) return false
    if (!isNonNegativeSafeInteger(receipt.companyMoneyAfter)) return false
    if (receipt.companyMoneyAfter - receipt.companyMoneyBefore !== receipt.totalPrice) return false
    if (!isNonNegativeSafeInteger(receipt.buyerInternalUnitsAfter)) return false
    if (!isNonNegativeSafeInteger(receipt.internalTreasuryUnitsAfter)) return false
    ids.add(receipt.purchaseId)
  }
  return true
}

const policyIsValid = (policy: InternalTreasuryPricingPolicy): boolean =>
  Boolean(policy.version.trim()) &&
  Number.isFinite(policy.referenceValueMultiplier) &&
  policy.referenceValueMultiplier > 0 &&
  isPositiveSafeInteger(policy.minimumTotalPrice)

export const createTreasuryShareSettlementJournal = (
  companyId: string,
): TreasuryShareSettlementJournal => ({
  companyId,
  receipts: [],
})

export const quoteInternalTreasuryPurchase = (
  equityState: CompanyEquityState,
  valuation: CompanyValuationBreakdown,
  buyerActorId: string,
  units: number,
  policy: InternalTreasuryPricingPolicy = INTERNAL_TREASURY_PRICING_POLICY_V1,
): InternalTreasuryQuoteResult => {
  if (!policyIsValid(policy)) return { quoted: false, reason: 'InvalidPricingPolicy' }
  if (
    !valuation.policyVersion.trim() ||
    !isNonNegativeFinite(valuation.totalReferenceValuation) ||
    !isNonNegativeFinite(valuation.referenceEquityUnitValue)
  ) {
    return { quoted: false, reason: 'InvalidValuation' }
  }
  if (equityState.companyId !== valuation.companyId) return { quoted: false, reason: 'CompanyMismatch' }
  if (!isPositiveSafeInteger(units)) return { quoted: false, reason: 'InvalidUnits' }
  if (!equityState.activeMemberActorIds.includes(buyerActorId)) {
    return { quoted: false, reason: 'InternalMembershipRequired' }
  }

  const internalPool = equityState.pools.find(pool => pool.poolId === 'InternalMember')
  if (!internalPool || internalPool.treasuryUnits < units) {
    return { quoted: false, reason: 'InsufficientTreasury' }
  }

  const rawSubtotal = valuation.referenceEquityUnitValue * units * policy.referenceValueMultiplier
  if (!Number.isFinite(rawSubtotal) || rawSubtotal < 0) return { quoted: false, reason: 'UnsafePrice' }

  const totalPrice = Math.max(policy.minimumTotalPrice, Math.ceil(rawSubtotal))
  if (!isPositiveSafeInteger(totalPrice)) return { quoted: false, reason: 'UnsafePrice' }

  const quote: InternalTreasuryPurchaseQuote = {
    companyId: equityState.companyId,
    buyerActorId,
    units,
    valuationPolicyVersion: valuation.policyVersion,
    pricingPolicyVersion: policy.version,
    referenceEquityUnitValue: valuation.referenceEquityUnitValue,
    referenceValueMultiplier: policy.referenceValueMultiplier,
    referenceSubtotal: roundReference(rawSubtotal),
    totalPrice,
  }
  return { quoted: true, quote }
}

const receiptMatchesRequest = (
  receipt: TreasurySharePurchaseReceipt,
  request: InternalTreasuryPurchaseRequest,
): boolean =>
  receipt.purchaseId === request.purchaseId &&
  receipt.companyId === request.companyId &&
  receipt.buyerActorId === request.buyerActorId &&
  receipt.units === request.units

const blocked = (
  reason: TreasuryShareSettlementBlockReason,
  equityState: CompanyEquityState,
  buyerFunds: PersonalFundsAccountState,
  issuingCompanyMoney: number,
  journal: TreasuryShareSettlementJournal,
): TreasuryShareSettlementResult => ({
  settled: false,
  reason,
  equityState,
  buyerFunds,
  issuingCompanyMoney,
  journal,
})

export const settleInternalTreasuryPurchase = (
  request: InternalTreasuryPurchaseRequest,
  equityState: CompanyEquityState,
  buyerFunds: PersonalFundsAccountState,
  issuingCompanyMoney: number,
  valuation: CompanyValuationBreakdown,
  journal: TreasuryShareSettlementJournal,
  policy: InternalTreasuryPricingPolicy = INTERNAL_TREASURY_PRICING_POLICY_V1,
): TreasuryShareSettlementResult => {
  if (
    !request.purchaseId.trim() ||
    !request.companyId.trim() ||
    !request.buyerActorId.trim() ||
    !isPositiveSafeInteger(request.units) ||
    !journalIsValid(journal)
  ) {
    return blocked('InvalidRequest', equityState, buyerFunds, issuingCompanyMoney, journal)
  }
  if (journal.companyId !== request.companyId) {
    return blocked('CompanyMismatch', equityState, buyerFunds, issuingCompanyMoney, journal)
  }

  const priorReceipt = journal.receipts.find(receipt => receipt.purchaseId === request.purchaseId)
  if (priorReceipt) {
    if (!receiptMatchesRequest(priorReceipt, request)) {
      return blocked('PurchaseIdConflict', equityState, buyerFunds, issuingCompanyMoney, journal)
    }
    return {
      settled: true,
      replayed: true,
      equityState,
      buyerFunds,
      issuingCompanyMoney,
      journal,
      receipt: { ...priorReceipt },
    }
  }

  if (
    equityState.companyId !== request.companyId ||
    valuation.companyId !== request.companyId
  ) {
    return blocked('CompanyMismatch', equityState, buyerFunds, issuingCompanyMoney, journal)
  }
  if (buyerFunds.actorId !== request.buyerActorId) {
    return blocked('BuyerAccountMismatch', equityState, buyerFunds, issuingCompanyMoney, journal)
  }
  if (!isNonNegativeSafeInteger(issuingCompanyMoney)) {
    return blocked('InvalidCompanyMoney', equityState, buyerFunds, issuingCompanyMoney, journal)
  }
  if (!validateCompanyEquityIntegrity(equityState).valid) {
    return blocked('InvalidEquityState', equityState, buyerFunds, issuingCompanyMoney, journal)
  }
  if (!validatePersonalFundsIntegrity(buyerFunds).valid) {
    return blocked('InvalidPersonalFundsState', equityState, buyerFunds, issuingCompanyMoney, journal)
  }

  const quoteResult = quoteInternalTreasuryPurchase(
    equityState,
    valuation,
    request.buyerActorId,
    request.units,
    policy,
  )
  if (!quoteResult.quoted) {
    return blocked(quoteResult.reason, equityState, buyerFunds, issuingCompanyMoney, journal)
  }
  const { quote } = quoteResult

  if (buyerFunds.balance < quote.totalPrice) {
    return blocked('InsufficientPersonalFunds', equityState, buyerFunds, issuingCompanyMoney, journal)
  }
  const nextCompanyMoney = issuingCompanyMoney + quote.totalPrice
  if (!isNonNegativeSafeInteger(nextCompanyMoney)) {
    return blocked('UnsafeCompanyMoneyCredit', equityState, buyerFunds, issuingCompanyMoney, journal)
  }

  const personalDebit = debitPersonalFunds(
    buyerFunds,
    quote.totalPrice,
    'EquityPurchase',
    request.companyId,
  )
  if (!personalDebit.changed) {
    return blocked(
      personalDebit.reason === 'InsufficientPersonalFunds' ? 'InsufficientPersonalFunds' : 'AtomicMutationFailed',
      equityState,
      buyerFunds,
      issuingCompanyMoney,
      journal,
    )
  }

  const equityAllocation = allocateEquityFromTreasury(
    equityState,
    request.buyerActorId,
    'InternalMember',
    request.units,
  )
  if (!equityAllocation.changed) {
    return blocked('AtomicMutationFailed', equityState, buyerFunds, issuingCompanyMoney, journal)
  }

  if (
    !validatePersonalFundsIntegrity(personalDebit.state).valid ||
    !validateCompanyEquityIntegrity(equityAllocation.state).valid
  ) {
    return blocked('AtomicMutationFailed', equityState, buyerFunds, issuingCompanyMoney, journal)
  }

  const internalPool = equityAllocation.state.pools.find(pool => pool.poolId === 'InternalMember')!
  const receipt: TreasurySharePurchaseReceipt = {
    purchaseId: request.purchaseId,
    companyId: request.companyId,
    buyerActorId: request.buyerActorId,
    units: request.units,
    valuationPolicyVersion: quote.valuationPolicyVersion,
    pricingPolicyVersion: quote.pricingPolicyVersion,
    referenceEquityUnitValue: quote.referenceEquityUnitValue,
    totalPrice: quote.totalPrice,
    personalLedgerTransactionId: personalDebit.entry.transactionId,
    companyMoneyBefore: issuingCompanyMoney,
    companyMoneyAfter: nextCompanyMoney,
    buyerInternalUnitsAfter: getActorEquityUnits(
      equityAllocation.state,
      request.buyerActorId,
      'InternalMember',
    ),
    internalTreasuryUnitsAfter: internalPool.treasuryUnits,
  }

  const nextJournal = cloneJournal(journal)
  nextJournal.receipts.push(receipt)

  return {
    settled: true,
    replayed: false,
    equityState: equityAllocation.state,
    buyerFunds: personalDebit.state,
    issuingCompanyMoney: nextCompanyMoney,
    journal: nextJournal,
    receipt,
  }
}
