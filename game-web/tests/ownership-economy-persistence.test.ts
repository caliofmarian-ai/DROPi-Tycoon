import { describe, expect, it } from 'vitest'
import { PROTOTYPE_GOVERNANCE_POLICY } from '../src/config/governance'
import {
  createSaveGame,
  decodeSave,
  isCanonicalAutosaveEvent,
  restoreGameSessionFromSave,
  serializeGameSession,
} from '../src/persistence/saveSystem'
import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../src/state/gameState'
import {
  LOCAL_PLAYER_ACTOR_ID,
  LOCAL_PLAYER_COMPANY_ID,
  createInitialOwnershipEconomyState,
  executeSessionExecutiveAppointment,
  settleSessionEndOfSeasonDividend,
  settleSessionInternalTreasuryPurchase,
  validateOwnershipEconomyIntegrity,
} from '../src/systems/ownershipEconomySystem'
import { setEquityMemberActive } from '../src/systems/equityLedgerSystem'
import {
  castGovernanceBallot,
  openExecutiveAppointmentProposal,
  resolveGovernanceProposal,
} from '../src/systems/governanceSystem'
import { createPersonalFundsAccount, creditPersonalFunds } from '../src/systems/personalFinanceSystem'
import type { GameSessionState } from '../src/types/game'
import type { CompanyValuationBreakdown } from '../src/types/valuation'

const makeSession = (): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
  ownershipEconomy: createInitialOwnershipEconomyState(),
})

const valuation = (): CompanyValuationBreakdown => ({
  companyId: LOCAL_PLAYER_COMPANY_ID,
  policyVersion: 'test-valuation-v1',
  grossTangibleValue: 10_000,
  liabilityDeduction: 0,
  netTangibleValue: 10_000,
  sustainableEarningsValue: 0,
  marketStrengthIndex: 0,
  marketStrengthValue: 0,
  strategicCapabilityIndex: 0,
  strategicCapabilityValue: 0,
  growthAdjustment: 0,
  riskDeduction: 0,
  totalReferenceValuation: 10_000,
  referenceEquityUnitValue: 1,
})

const fundPlayer = (session: GameSessionState, amount = 2_000): GameSessionState => {
  const ownership = session.ownershipEconomy!
  const account = ownership.personalAccounts[0]
  const credit = creditPersonalFunds(account, amount, 'OtherGameplayIncome')
  if (!credit.changed) throw new Error('Expected player funding credit.')
  return {
    ...session,
    ownershipEconomy: {
      ...ownership,
      personalAccounts: [credit.state, ...ownership.personalAccounts.slice(1)],
    },
  }
}

const buyShares = (session: GameSessionState, units = 100) => {
  const result = settleSessionInternalTreasuryPurchase(
    session,
    {
      purchaseId: `purchase-${units}`,
      companyId: LOCAL_PLAYER_COMPANY_ID,
      buyerActorId: LOCAL_PLAYER_ACTOR_ID,
      units,
    },
    valuation(),
  )
  if (!result.settled) throw new Error(`Expected share purchase, got ${result.reason}`)
  return result
}

describe('#390 ownership economy Save v2 compatibility', () => {
  it('materializes deterministic zero-invention ownership for an older Save v2 while preserving Company Money', () => {
    const raw = JSON.stringify({
      formatVersion: 2,
      company: {
        companyName: 'Legacy Current Company',
        money: 4_321,
        level: 3,
        reputation: 71,
        purchasedUpgradeLevels: { DeliverySpeed: 0, Capacity: 0, Efficiency: 0, Bicycle: 0 },
        employees: [],
        payroll: { lastProcessedCycle: 0 },
      },
      settings: { tutorialCompleted: true, soundEnabled: true },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.save).not.toHaveProperty('ownershipEconomy')

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.money).toBe(4_321)
    expect(restored.ownershipEconomy).toMatchObject({
      playerActorId: LOCAL_PLAYER_ACTOR_ID,
      companyId: LOCAL_PLAYER_COMPANY_ID,
      personalAccounts: [{ actorId: LOCAL_PLAYER_ACTOR_ID, balance: 0, entries: [] }],
    })
    expect(restored.ownershipEconomy!.equity.holdings).toEqual([])
    expect(restored.ownershipEconomy!.equity.pools.map(pool => pool.treasuryUnits)).toEqual([5_100, 4_900])
    expect(restored.ownershipEconomy!.treasuryShareJournal.receipts).toEqual([])
    expect(restored.ownershipEconomy!.dividendJournal.receipts).toEqual([])
    expect(restored.ownershipEconomy!.governance.proposals).toEqual([])
  })

  it('keeps v1 migration compatible and never derives Company Money from ownership defaults', () => {
    const decoded = decodeSave(JSON.stringify({
      formatVersion: 1,
      company: {
        companyName: 'DROPi Legacy',
        money: 900,
        level: 2,
        reputation: 61,
        purchasedUpgradeLevels: { DeliverySpeed: 0, Capacity: 0, Efficiency: 0, Bicycle: 0 },
      },
      settings: { tutorialCompleted: true },
    }))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.migratedFrom).toBe(1)
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.money).toBe(900)
    expect(restored.ownershipEconomy!.personalAccounts[0].balance).toBe(0)
  })

  it('omits untouched ownership state but round-trips active ownership state exactly', () => {
    expect(createSaveGame(makeSession())).not.toHaveProperty('ownershipEconomy')

    const purchased = buyShares(fundPlayer(makeSession()), 125)
    const raw = serializeGameSession(purchased.session)
    expect(JSON.parse(raw)).toHaveProperty('ownershipEconomy')

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.money).toBe(purchased.session.company.money)
    expect(restored.ownershipEconomy).toEqual(purchased.session.ownershipEconomy)
    expect(validateOwnershipEconomyIntegrity(restored.ownershipEconomy!).valid).toBe(true)
  })

  it('repairs cross-company or forged Personal Money ownership payloads to deterministic defaults', () => {
    const purchased = buyShares(fundPlayer(makeSession()), 100)
    const save = createSaveGame(purchased.session)

    const crossCompany = decodeSave(JSON.stringify({
      ...save,
      ownershipEconomy: { ...save.ownershipEconomy!, companyId: 'company:forged:999' },
    }))
    expect(crossCompany.kind).toBe('valid')
    if (crossCompany.kind !== 'valid') return
    expect(crossCompany.repaired).toBe(true)
    expect(crossCompany.save.ownershipEconomy?.equity.holdings).toEqual([])

    const forged = createInitialOwnershipEconomyState()
    forged.personalAccounts[0] = { actorId: LOCAL_PLAYER_ACTOR_ID, balance: 999, entries: [] }
    const forgedResult = decodeSave(JSON.stringify({ ...createSaveGame(makeSession()), ownershipEconomy: forged }))
    expect(forgedResult.kind).toBe('valid')
    if (forgedResult.kind !== 'valid') return
    expect(forgedResult.repaired).toBe(true)
    expect(forgedResult.save.ownershipEconomy?.personalAccounts[0].balance).toBe(0)
  })

  it('recognizes the additive ownership economy autosave event', () => {
    expect(isCanonicalAutosaveEvent('ownership-economy-changed')).toBe(true)
  })
})

describe('#390 atomic session ownership economy adapters', () => {
  it('commits a treasury purchase atomically and preserves exactly-once replay after reload', () => {
    const session = fundPlayer(makeSession())
    session.company.money = 500
    const personalBefore = session.ownershipEconomy!.personalAccounts[0].balance
    const purchased = buyShares(session, 100)

    expect(purchased.changed).toBe(true)
    expect(purchased.session.company.money).toBe(500 + purchased.receipt.totalPrice)
    expect(purchased.session.ownershipEconomy!.personalAccounts[0].balance).toBe(personalBefore - purchased.receipt.totalPrice)
    expect(purchased.session.ownershipEconomy!.equity.holdings).toContainEqual({
      actorId: LOCAL_PLAYER_ACTOR_ID,
      poolId: 'InternalMember',
      units: 100,
    })
    expect(purchased.session.ownershipEconomy!.treasuryShareJournal.receipts).toHaveLength(1)

    const decoded = decodeSave(serializeGameSession(purchased.session))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    const restored = restoreGameSessionFromSave(decoded.save)
    const replay = settleSessionInternalTreasuryPurchase(
      restored,
      {
        purchaseId: 'purchase-100',
        companyId: LOCAL_PLAYER_COMPANY_ID,
        buyerActorId: LOCAL_PLAYER_ACTOR_ID,
        units: 100,
      },
      valuation(),
    )
    expect(replay.settled).toBe(true)
    if (!replay.settled) return
    expect(replay.replayed).toBe(true)
    expect(replay.changed).toBe(false)
    expect(replay.session.company.money).toBe(restored.company.money)
    expect(replay.session.ownershipEconomy!.treasuryShareJournal.receipts).toHaveLength(1)
  })

  it('commits end-of-season dividends across Company Money, Personal Money and journal together', () => {
    const purchased = buyShares(fundPlayer(makeSession()), 100)
    purchased.session.company.money = 1_000
    const personalBefore = purchased.session.ownershipEconomy!.personalAccounts[0].balance

    const result = settleSessionEndOfSeasonDividend(purchased.session, {
      distributionId: 'distribution-1',
      companyId: LOCAL_PLAYER_COMPANY_ID,
      seasonId: 'season-1',
      seasonNetProfit: 800,
    })
    expect(result.settled).toBe(true)
    if (!result.settled) return
    expect(result.receipt.totalDividendAmount).toBe(200)
    expect(result.session.company.money).toBe(800)
    expect(result.session.ownershipEconomy!.personalAccounts[0].balance).toBe(personalBefore + 200)
    expect(result.session.ownershipEconomy!.dividendJournal.receipts).toHaveLength(1)
    expect(validateOwnershipEconomyIntegrity(result.session.ownershipEconomy!).valid).toBe(true)
  })

  it('persists governance execution while Founder history remains immutable and replay stays exactly-once', () => {
    const purchased = buyShares(fundPlayer(makeSession()), 100)
    const candidate = 'actor:local:000002'
    let session = purchased.session
    const ownership = session.ownershipEconomy!
    ownership.equity = setEquityMemberActive(ownership.equity, candidate, true)
    ownership.personalAccounts.push(createPersonalFundsAccount(candidate))

    const opened = openExecutiveAppointmentProposal(
      ownership.governance,
      ownership.equity,
      {
        commandId: 'gov-open-1',
        proposalId: 'proposal-1',
        actionId: 'action-1',
        createdByActorId: LOCAL_PLAYER_ACTOR_ID,
        candidateActorId: candidate,
      },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(opened.changed).toBe(true)
    if (!opened.changed) return
    ownership.governance = opened.state

    const voted = castGovernanceBallot(ownership.governance, {
      commandId: 'gov-vote-1', proposalId: 'proposal-1', actorId: LOCAL_PLAYER_ACTOR_ID, choice: 'For',
    })
    expect(voted.changed).toBe(true)
    if (!voted.changed) return
    ownership.governance = voted.state

    const resolved = resolveGovernanceProposal(
      ownership.governance,
      { commandId: 'gov-resolve-1', proposalId: 'proposal-1' },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(resolved.changed).toBe(true)
    if (!resolved.changed) return
    ownership.governance = resolved.state
    session = { ...session, ownershipEconomy: ownership }

    const executed = executeSessionExecutiveAppointment(session, {
      commandId: 'gov-execute-1', proposalId: 'proposal-1',
    })
    expect(executed.executed).toBe(true)
    if (!executed.executed) return
    expect(executed.session.ownershipEconomy!.equity.executiveActorId).toBe(candidate)
    expect(executed.session.ownershipEconomy!.equity.founderActorId).toBe(LOCAL_PLAYER_ACTOR_ID)

    const decoded = decodeSave(serializeGameSession(executed.session))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.ownershipEconomy!.equity.executiveActorId).toBe(candidate)
    expect(restored.ownershipEconomy!.equity.founderActorId).toBe(LOCAL_PLAYER_ACTOR_ID)

    const replay = executeSessionExecutiveAppointment(restored, {
      commandId: 'gov-execute-1', proposalId: 'proposal-1',
    })
    expect(replay.executed).toBe(true)
    if (!replay.executed) return
    expect(replay.duplicate).toBe(true)
    expect(replay.changed).toBe(false)
  })

  it('never invents free shares in the legacy local ownership baseline', () => {
    const ownership = createInitialOwnershipEconomyState()
    expect(ownership.equity.holdings).toEqual([])
    expect(ownership.equity.pools).toEqual([
      { poolId: 'InternalMember', totalUnits: 5_100, treasuryUnits: 5_100 },
      { poolId: 'ExternalMarket', totalUnits: 4_900, treasuryUnits: 4_900 },
    ])
    expect(ownership.equity.activeMemberActorIds).toEqual([LOCAL_PLAYER_ACTOR_ID])
  })
})
