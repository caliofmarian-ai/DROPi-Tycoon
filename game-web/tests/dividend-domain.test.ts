import { describe, expect, it } from 'vitest'
import { DIVIDEND_POLICY_V1 } from '../src/config/dividends'
import {
  allocateDividendProportionally,
  calculateDividendCapacity,
  createDividendSettlementJournal,
  settleEndOfSeasonDividend,
} from '../src/systems/dividendSystem'
import {
  allocateEquityFromTreasury,
  createInitialCompanyEquityState,
  setEquityMemberActive,
} from '../src/systems/equityLedgerSystem'
import { createPersonalFundsAccount } from '../src/systems/personalFinanceSystem'
import type { CompanyEquityState } from '../src/types/equity'
import type { PersonalFundsAccountState } from '../src/types/personalFinance'

const COMPANY = 'company:dropi-local'
const OTHER_COMPANY = 'company:other'
const FOUNDER = 'actor:founder'
const INTERNAL = 'actor:internal'
const EXTERNAL = 'actor:external'
const MIXED = 'actor:mixed'

const request = (distributionId = 'dividend:season-1', seasonId = 'season:1', seasonNetProfit = 400) => ({
  distributionId,
  companyId: COMPANY,
  seasonId,
  seasonNetProfit,
})

const allocate = (
  state: CompanyEquityState,
  actorId: string,
  poolId: 'InternalMember' | 'ExternalMarket',
  units: number,
): CompanyEquityState => {
  const result = allocateEquityFromTreasury(state, actorId, poolId, units)
  if (!result.changed) throw new Error(`Test allocation failed: ${result.reason}`)
  return result.state
}

const twoHolderEquity = (): CompanyEquityState => {
  let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
  equity = setEquityMemberActive(equity, INTERNAL, true)
  equity = allocate(equity, INTERNAL, 'InternalMember', 100)
  equity = allocate(equity, EXTERNAL, 'ExternalMarket', 300)
  return equity
}

const accounts = (...actorIds: string[]): PersonalFundsAccountState[] =>
  actorIds.map(actorId => createPersonalFundsAccount(actorId))

const accountFor = (states: PersonalFundsAccountState[], actorId: string): PersonalFundsAccountState => {
  const account = states.find(item => item.actorId === actorId)
  if (!account) throw new Error(`Missing test account ${actorId}`)
  return account
}

describe('end-of-season dividend domain', () => {
  it('calculates capacity from positive season profit while protecting Company Money reserve', () => {
    expect(calculateDividendCapacity(400, 1_000)).toEqual({
      policyVersion: DIVIDEND_POLICY_V1.version,
      positiveSeasonNetProfit: 400,
      profitBasedCapacity: 100,
      companyMoneyAboveReserve: 900,
      totalDistributableAmount: 100,
    })

    expect(calculateDividendCapacity(4_000, 150)).toMatchObject({
      profitBasedCapacity: 1_000,
      companyMoneyAboveReserve: 50,
      totalDistributableAmount: 50,
    })
  })

  it('creates no dividend capacity from a loss or zero profit', () => {
    expect(calculateDividendCapacity(-500, 1_000)?.totalDistributableAmount).toBe(0)
    expect(calculateDividendCapacity(0, 1_000)?.totalDistributableAmount).toBe(0)
  })

  it('keeps the protected reserve even when profit could support a larger payout', () => {
    const result = settleEndOfSeasonDividend(
      request('dividend:reserve', 'season:reserve', 10_000),
      twoHolderEquity(),
      accounts(INTERNAL, EXTERNAL),
      130,
      createDividendSettlementJournal(COMPANY),
    )
    expect(result.settled).toBe(true)
    if (!result.settled) return
    expect(result.receipt.totalDividendAmount).toBe(30)
    expect(result.issuingCompanyMoney).toBe(100)
  })

  it('excludes treasury-held shares and pays only actual outstanding shareholder holdings', () => {
    const equity = twoHolderEquity()
    expect(equity.pools.find(pool => pool.poolId === 'InternalMember')?.treasuryUnits).toBe(5_000)
    expect(equity.pools.find(pool => pool.poolId === 'ExternalMarket')?.treasuryUnits).toBe(4_600)

    const result = settleEndOfSeasonDividend(
      request(),
      equity,
      accounts(INTERNAL, EXTERNAL),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(result.settled).toBe(true)
    if (!result.settled) return
    expect(result.receipt.totalOutstandingHeldUnits).toBe(400)
    expect(result.receipt.allocations).toEqual([
      expect.objectContaining({ actorId: EXTERNAL, heldUnits: 300, amount: 75 }),
      expect.objectContaining({ actorId: INTERNAL, heldUnits: 100, amount: 25 }),
    ])
    expect(accountFor(result.personalAccounts, INTERNAL).balance).toBe(25)
    expect(accountFor(result.personalAccounts, EXTERNAL).balance).toBe(75)
    expect(result.issuingCompanyMoney).toBe(900)
  })

  it('gives Internal and External units the same baseline economic dividend right', () => {
    let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    equity = setEquityMemberActive(equity, INTERNAL, true)
    equity = allocate(equity, INTERNAL, 'InternalMember', 100)
    equity = allocate(equity, EXTERNAL, 'ExternalMarket', 100)

    const result = settleEndOfSeasonDividend(
      request('dividend:equal-rights', 'season:equal-rights'),
      equity,
      accounts(INTERNAL, EXTERNAL),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(result.settled).toBe(true)
    if (!result.settled) return
    expect(accountFor(result.personalAccounts, INTERNAL).balance).toBe(50)
    expect(accountFor(result.personalAccounts, EXTERNAL).balance).toBe(50)
  })

  it('aggregates one actor holding both pools into one Personal Money dividend credit', () => {
    let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    equity = setEquityMemberActive(equity, MIXED, true)
    equity = allocate(equity, MIXED, 'InternalMember', 100)
    equity = allocate(equity, MIXED, 'ExternalMarket', 300)

    const result = settleEndOfSeasonDividend(
      request('dividend:mixed', 'season:mixed'),
      equity,
      accounts(MIXED),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(result.settled).toBe(true)
    if (!result.settled) return
    expect(result.receipt.allocations).toHaveLength(1)
    expect(result.receipt.allocations[0]).toMatchObject({ actorId: MIXED, heldUnits: 400, amount: 100 })
    const mixedAccount = accountFor(result.personalAccounts, MIXED)
    expect(mixedAccount.balance).toBe(100)
    expect(mixedAccount.entries).toHaveLength(1)
    expect(mixedAccount.entries[0]).toMatchObject({
      delta: 100,
      reason: 'DividendIncome',
      companyId: COMPANY,
    })
  })

  it('uses deterministic largest-remainder allocation and conserves every whole Personal Money unit', () => {
    const allocations = allocateDividendProportionally(2, [
      { actorId: 'actor:c', heldUnits: 1 },
      { actorId: 'actor:a', heldUnits: 1 },
      { actorId: 'actor:b', heldUnits: 1 },
    ])
    expect(allocations).toEqual([
      { actorId: 'actor:a', heldUnits: 1, amount: 1 },
      { actorId: 'actor:b', heldUnits: 1, amount: 1 },
      { actorId: 'actor:c', heldUnits: 1, amount: 0 },
    ])
    expect(allocations?.reduce((sum, item) => sum + item.amount, 0)).toBe(2)
  })

  it('debits Company Money by exactly the sum of Personal Money credits', () => {
    const result = settleEndOfSeasonDividend(
      request(),
      twoHolderEquity(),
      accounts(INTERNAL, EXTERNAL),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(result.settled).toBe(true)
    if (!result.settled) return
    const credited = result.personalAccounts.reduce((sum, account) => sum + account.balance, 0)
    expect(credited).toBe(100)
    expect(result.receipt.totalDividendAmount).toBe(credited)
    expect(result.receipt.companyMoneyBefore - result.receipt.companyMoneyAfter).toBe(credited)
  })

  it('replays the same distribution exactly once without another company debit or personal credit', () => {
    const first = settleEndOfSeasonDividend(
      request(),
      twoHolderEquity(),
      accounts(INTERNAL, EXTERNAL),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(first.settled).toBe(true)
    if (!first.settled) return

    const replay = settleEndOfSeasonDividend(
      request(),
      first.equityState,
      first.personalAccounts,
      first.issuingCompanyMoney,
      first.journal,
      { version: 'changed-after-settlement', payoutBasisPoints: 10_000, minimumCompanyReserve: 0 },
    )
    expect(replay.settled).toBe(true)
    if (!replay.settled) return
    expect(replay.replayed).toBe(true)
    expect(replay.receipt).toEqual(first.receipt)
    expect(replay.personalAccounts).toEqual(first.personalAccounts)
    expect(replay.issuingCompanyMoney).toBe(first.issuingCompanyMoney)
    expect(replay.journal.receipts).toHaveLength(1)
  })

  it('rejects conflicting reuse of a distribution ID', () => {
    const first = settleEndOfSeasonDividend(
      request(),
      twoHolderEquity(),
      accounts(INTERNAL, EXTERNAL),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(first.settled).toBe(true)
    if (!first.settled) return

    const conflict = settleEndOfSeasonDividend(
      request('dividend:season-1', 'season:1', 401),
      first.equityState,
      first.personalAccounts,
      first.issuingCompanyMoney,
      first.journal,
    )
    expect(conflict).toMatchObject({ settled: false, reason: 'DistributionIdConflict' })
  })

  it('rejects a second distribution ID for an already settled season', () => {
    const first = settleEndOfSeasonDividend(
      request(),
      twoHolderEquity(),
      accounts(INTERNAL, EXTERNAL),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(first.settled).toBe(true)
    if (!first.settled) return

    const duplicateSeason = settleEndOfSeasonDividend(
      request('dividend:another-id', 'season:1'),
      first.equityState,
      first.personalAccounts,
      first.issuingCompanyMoney,
      first.journal,
    )
    expect(duplicateSeason).toMatchObject({ settled: false, reason: 'SeasonAlreadySettled' })
  })

  it('fails atomically when a shareholder Personal Money account is missing', () => {
    const equity = twoHolderEquity()
    const originalAccounts = accounts(INTERNAL)
    const journal = createDividendSettlementJournal(COMPANY)
    const result = settleEndOfSeasonDividend(request(), equity, originalAccounts, 1_000, journal)

    expect(result).toMatchObject({ settled: false, reason: 'MissingShareholderAccount' })
    expect(result.equityState).toBe(equity)
    expect(result.personalAccounts).toBe(originalAccounts)
    expect(result.issuingCompanyMoney).toBe(1_000)
    expect(result.journal).toBe(journal)
  })

  it('fails atomically on duplicate or forged Personal Money accounts', () => {
    const equity = twoHolderEquity()
    const internal = createPersonalFundsAccount(INTERNAL)
    const external = createPersonalFundsAccount(EXTERNAL)
    const duplicate = settleEndOfSeasonDividend(
      request('dividend:duplicate-account', 'season:duplicate-account'),
      equity,
      [internal, external, createPersonalFundsAccount(INTERNAL)],
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(duplicate).toMatchObject({ settled: false, reason: 'DuplicatePersonalAccount' })

    const forged: PersonalFundsAccountState = { ...internal, balance: 99 }
    const forgedResult = settleEndOfSeasonDividend(
      request('dividend:forged', 'season:forged'),
      equity,
      [forged, external],
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(forgedResult).toMatchObject({ settled: false, reason: 'InvalidPersonalFundsState' })
    expect(forgedResult.issuingCompanyMoney).toBe(1_000)
  })

  it('fails atomically on corrupted equity supply integrity', () => {
    const equity = twoHolderEquity()
    const corrupted: CompanyEquityState = {
      ...equity,
      pools: equity.pools.map(pool =>
        pool.poolId === 'ExternalMarket' ? { ...pool, treasuryUnits: pool.treasuryUnits - 1 } : { ...pool },
      ),
    }
    const result = settleEndOfSeasonDividend(
      request('dividend:corrupt-equity', 'season:corrupt-equity'),
      corrupted,
      accounts(INTERNAL, EXTERNAL),
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(result).toMatchObject({ settled: false, reason: 'InvalidEquityState' })
    expect(result.issuingCompanyMoney).toBe(1_000)
  })

  it('rejects no-profit, reserve-blocked, invalid-money, invalid-policy and company-mismatch settlements', () => {
    const equity = twoHolderEquity()
    const personal = accounts(INTERNAL, EXTERNAL)
    const journal = createDividendSettlementJournal(COMPANY)

    expect(settleEndOfSeasonDividend(request('dividend:loss', 'season:loss', -1), equity, personal, 1_000, journal))
      .toMatchObject({ settled: false, reason: 'NoDistributableAmount' })
    expect(settleEndOfSeasonDividend(request('dividend:reserve-zero', 'season:reserve-zero', 400), equity, personal, 100, journal))
      .toMatchObject({ settled: false, reason: 'NoDistributableAmount' })
    expect(settleEndOfSeasonDividend(request('dividend:bad-money', 'season:bad-money'), equity, personal, -1, journal))
      .toMatchObject({ settled: false, reason: 'InvalidCompanyMoney' })
    expect(settleEndOfSeasonDividend(
      request('dividend:bad-policy', 'season:bad-policy'),
      equity,
      personal,
      1_000,
      journal,
      { version: 'bad', payoutBasisPoints: 10_001, minimumCompanyReserve: 0 },
    )).toMatchObject({ settled: false, reason: 'InvalidPolicy' })

    expect(settleEndOfSeasonDividend(
      { ...request('dividend:other-company', 'season:other-company'), companyId: OTHER_COMPANY },
      equity,
      personal,
      1_000,
      journal,
    )).toMatchObject({ settled: false, reason: 'CompanyMismatch' })
  })

  it('rejects a distribution when all shares remain in treasury', () => {
    const equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    const result = settleEndOfSeasonDividend(
      request('dividend:no-holders', 'season:no-holders'),
      equity,
      [],
      1_000,
      createDividendSettlementJournal(COMPANY),
    )
    expect(result).toMatchObject({ settled: false, reason: 'NoOutstandingShareholders' })
  })
})
