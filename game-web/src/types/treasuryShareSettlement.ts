import type { BusinessCompanyId, EconomicActorId } from './business'
import type { CompanyEquityState } from './equity'
import type { PersonalFundsAccountState } from './personalFinance'

export interface InternalTreasuryPricingPolicy {
  version: string
  /** Multiplier applied to the valuation reference basis before whole-money settlement rounding. */
  referenceValueMultiplier: number
  /** Minimum paid transaction amount in whole Personal Money units. */
  minimumTotalPrice: number
}

export interface InternalTreasuryPurchaseRequest {
  purchaseId: string
  companyId: BusinessCompanyId
  buyerActorId: EconomicActorId
  units: number
}

export interface InternalTreasuryPurchaseQuote {
  companyId: BusinessCompanyId
  buyerActorId: EconomicActorId
  units: number
  valuationPolicyVersion: string
  pricingPolicyVersion: string
  referenceEquityUnitValue: number
  referenceValueMultiplier: number
  /** Pre-rounding reference subtotal used only to explain the quote. */
  referenceSubtotal: number
  /** Whole Personal Money amount that must be paid atomically. */
  totalPrice: number
}

export type InternalTreasuryQuoteBlockReason =
  | 'InvalidPricingPolicy'
  | 'InvalidValuation'
  | 'CompanyMismatch'
  | 'InvalidUnits'
  | 'InternalMembershipRequired'
  | 'InsufficientTreasury'
  | 'UnsafePrice'

export type InternalTreasuryQuoteResult =
  | { quoted: true; quote: InternalTreasuryPurchaseQuote }
  | { quoted: false; reason: InternalTreasuryQuoteBlockReason }

export interface TreasurySharePurchaseReceipt {
  purchaseId: string
  companyId: BusinessCompanyId
  buyerActorId: EconomicActorId
  units: number
  valuationPolicyVersion: string
  pricingPolicyVersion: string
  referenceEquityUnitValue: number
  totalPrice: number
  personalLedgerTransactionId: string
  companyMoneyBefore: number
  companyMoneyAfter: number
  buyerInternalUnitsAfter: number
  internalTreasuryUnitsAfter: number
}

export interface TreasuryShareSettlementJournal {
  companyId: BusinessCompanyId
  receipts: TreasurySharePurchaseReceipt[]
}

export type TreasuryShareSettlementBlockReason =
  | 'InvalidRequest'
  | 'PurchaseIdConflict'
  | 'CompanyMismatch'
  | 'BuyerAccountMismatch'
  | 'InvalidCompanyMoney'
  | 'InvalidEquityState'
  | 'InvalidPersonalFundsState'
  | InternalTreasuryQuoteBlockReason
  | 'InsufficientPersonalFunds'
  | 'UnsafeCompanyMoneyCredit'
  | 'AtomicMutationFailed'

export type TreasuryShareSettlementResult =
  | {
      settled: true
      replayed: boolean
      equityState: CompanyEquityState
      buyerFunds: PersonalFundsAccountState
      issuingCompanyMoney: number
      journal: TreasuryShareSettlementJournal
      receipt: TreasurySharePurchaseReceipt
    }
  | {
      settled: false
      reason: TreasuryShareSettlementBlockReason
      equityState: CompanyEquityState
      buyerFunds: PersonalFundsAccountState
      issuingCompanyMoney: number
      journal: TreasuryShareSettlementJournal
    }
