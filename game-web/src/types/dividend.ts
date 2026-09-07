import type { BusinessCompanyId, EconomicActorId } from './business'
import type { CompanyEquityState } from './equity'
import type { PersonalFundsAccountState } from './personalFinance'

export interface DividendPolicy {
  version: string
  /** Whole basis points of positive season net profit eligible for dividend distribution. */
  payoutBasisPoints: number
  /** Company Money that must remain after any dividend settlement. */
  minimumCompanyReserve: number
}

export interface DividendDistributionRequest {
  distributionId: string
  companyId: BusinessCompanyId
  seasonId: string
  /** Signed whole Company Money units. Only positive profit can create dividend capacity. */
  seasonNetProfit: number
}

export interface DividendCapacity {
  policyVersion: string
  positiveSeasonNetProfit: number
  profitBasedCapacity: number
  companyMoneyAboveReserve: number
  totalDistributableAmount: number
}

export interface DividendAllocation {
  actorId: EconomicActorId
  heldUnits: number
  amount: number
  personalLedgerTransactionId?: string
}

export interface DividendDistributionReceipt {
  distributionId: string
  companyId: BusinessCompanyId
  seasonId: string
  seasonNetProfit: number
  policyVersion: string
  totalOutstandingHeldUnits: number
  totalDividendAmount: number
  companyMoneyBefore: number
  companyMoneyAfter: number
  allocations: DividendAllocation[]
}

export interface DividendSettlementJournal {
  companyId: BusinessCompanyId
  receipts: DividendDistributionReceipt[]
}

export type DividendSettlementBlockReason =
  | 'InvalidRequest'
  | 'InvalidPolicy'
  | 'CompanyMismatch'
  | 'InvalidCompanyMoney'
  | 'InvalidEquityState'
  | 'InvalidPersonalFundsState'
  | 'DuplicatePersonalAccount'
  | 'MissingShareholderAccount'
  | 'NoOutstandingShareholders'
  | 'NoDistributableAmount'
  | 'UnsafeArithmetic'
  | 'DistributionIdConflict'
  | 'SeasonAlreadySettled'
  | 'AtomicMutationFailed'

export type DividendSettlementResult =
  | {
      settled: true
      replayed: boolean
      equityState: CompanyEquityState
      personalAccounts: PersonalFundsAccountState[]
      issuingCompanyMoney: number
      journal: DividendSettlementJournal
      receipt: DividendDistributionReceipt
    }
  | {
      settled: false
      reason: DividendSettlementBlockReason
      equityState: CompanyEquityState
      personalAccounts: PersonalFundsAccountState[]
      issuingCompanyMoney: number
      journal: DividendSettlementJournal
    }
