import type { BusinessCompanyId, EconomicActorId } from './business'
import type { DividendSettlementJournal } from './dividend'
import type { CompanyEquityState } from './equity'
import type { CompanyGovernanceState } from './governance'
import type { PersonalFundsAccountState } from './personalFinance'
import type { TreasuryShareSettlementJournal } from './treasuryShareSettlement'

/**
 * Persisted local ownership/economy aggregate. Company Money deliberately remains
 * authoritative on CompanyState.money and is never duplicated here.
 */
export interface OwnershipEconomyState {
  playerActorId: EconomicActorId
  companyId: BusinessCompanyId
  equity: CompanyEquityState
  personalAccounts: PersonalFundsAccountState[]
  treasuryShareJournal: TreasuryShareSettlementJournal
  dividendJournal: DividendSettlementJournal
  governance: CompanyGovernanceState
}

export interface OwnershipEconomyIntegrityResult {
  valid: boolean
  errors: string[]
}
