import type { OwnershipEconomyState } from '../types/ownershipEconomy'
import {
  LOCAL_PLAYER_ACTOR_ID,
  LOCAL_PLAYER_COMPANY_ID,
  cloneOwnershipEconomyState,
  createInitialOwnershipEconomyState,
  sanitizeOwnershipEconomyState,
} from './ownershipEconomySystem'

export const hasOwnershipEconomyActivity = (value: OwnershipEconomyState | undefined): boolean => {
  const state = sanitizeOwnershipEconomyState(value).state
  const initial = createInitialOwnershipEconomyState()

  if (state.playerActorId !== LOCAL_PLAYER_ACTOR_ID || state.companyId !== LOCAL_PLAYER_COMPANY_ID) return true
  if (state.equity.executiveActorId !== initial.equity.executiveActorId) return true
  if (state.equity.holdings.length > 0) return true
  if (state.equity.activeMemberActorIds.length !== 1 || state.equity.activeMemberActorIds[0] !== LOCAL_PLAYER_ACTOR_ID) return true
  if (state.equity.pools.some((pool, index) => pool.treasuryUnits !== initial.equity.pools[index]?.treasuryUnits)) return true
  if (state.personalAccounts.length !== 1) return true
  if (state.personalAccounts[0].actorId !== LOCAL_PLAYER_ACTOR_ID) return true
  if (state.personalAccounts[0].balance !== 0 || state.personalAccounts[0].entries.length > 0) return true
  if (state.treasuryShareJournal.receipts.length > 0) return true
  if (state.dividendJournal.receipts.length > 0) return true
  if (state.governance.proposals.length > 0 || state.governance.receipts.length > 0) return true
  return false
}

export const cloneOwnershipEconomyForSave = (
  value: OwnershipEconomyState | undefined,
): OwnershipEconomyState => cloneOwnershipEconomyState(sanitizeOwnershipEconomyState(value).state)
