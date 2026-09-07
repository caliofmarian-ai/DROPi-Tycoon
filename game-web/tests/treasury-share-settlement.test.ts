import { describe, expect, it } from 'vitest'
import { INTERNAL_TREASURY_PRICING_POLICY_V1 } from '../src/config/treasuryShareSettlement'
import {
  allocateEquityFromTreasury,
  createInitialCompanyEquityState,
  getActorEquityUnits,
  reconcileEquityMemberExit,
  setEquityMemberActive,
} from '../src/systems/equityLedgerSystem'
import {
  createPersonalFundsAccount,
  creditPersonalFunds,
} from '../src/systems/personalFinanceSystem'
import {
  createTreasuryShareSettlementJournal,
  quoteInternalTreasuryPurchase,
  settleInternalTreasuryPurchase,
} from '../src/systems/treasuryShareSettlementSystem'
import type { CompanyEquityState } from '../src/types/equity'
import type { PersonalFundsAccountState } from '../src/types/personalFinance'
import type { CompanyValuationBreakdown } from '../src/types/valuation'

const COMPANY = 'company:dropi-local'
const FOUNDER = 'actor:founder'
const DEPARTING = 'actor:departing'
const BUYER = 'actor:buyer'

const valuation = (referenceEquityUnitValue = 2, companyId = COMPANY): CompanyValuationBreakdown => ({
  companyId,
  policyVersion: 'valuation-v1',
  grossTangibleValue: 0,
  liabilityDeduction: 0,
  netTangibleValue: 0,
  sustainableEarningsValue: 0,
  marketStrengthIndex: 0,
  marketStrengthValue: 0,
  strategicCapabilityIndex: 0,
  strategicCapabilityValue: 0,
  growthAdjustment: 0,
  riskDeduction: 0,
  totalReferenceValuation: referenceEquityUnitValue * 10_000,
  referenceEquityUnitValue,
})

const activeBuyerEquity = (): CompanyEquityState =>
  setEquityMemberActive(createInitialCompanyEquityState(COMPANY, FOUNDER), BUYER, true)

const fundedBuyer = (amount = 1_000): PersonalFundsAccountState => {
  const credit = creditPersonalFunds(
    createPersonalFundsAccount(BUYER),
    amount,
    'OtherGameplayIncome',
  )
  if (!credit.changed) throw new Error('Test setup failed to fund buyer.')
  return credit.state
}

const request = (purchaseId = 'purchase:001', units = 40) => ({
  purchaseId,
  companyId: COMPANY,
  buyerActorId: BUYER,
  units,
})

describe('Internal treasury share settlement', () => {
  it('quotes deterministically from valuation reference value and governed pricing policy', () => {
    const result = quoteInternalTreasuryPurchase(
      activeBuyerEquity(),
      valuation(2.1),
      BUYER,
      3,
      { version: 'test-policy', referenceValueMultiplier: 1.25, minimumTotalPrice: 1 },
    )

    expect(result).toEqual({
      quoted: true,
      quote: {
        companyId: COMPANY,
        buyerActorId: BUYER,
        units: 3,
        valuationPolicyVersion: 'valuation-v1',
        pricingPolicyVersion: 'test-policy',
        referenceEquityUnitValue: 2.1,
        referenceValueMultiplier: 1.25,
        referenceSubtotal: 7.875,
        totalPrice: 8,
      },
    })
  })

  it('keeps every treasury purchase paid even when reference unit value is zero', () => {
    const result = quoteInternalTreasuryPurchase(activeBuyerEquity(), valuation(0), BUYER, 20)
    expect(result.quoted).toBe(true)
    if (!result.quoted) return
    expect(result.quote.totalPrice).toBe(1)
    expect(result.quote.pricingPolicyVersion).toBe(INTERNAL_TREASURY_PRICING_POLICY_V1.version)
  })

  it('rejects an inactive buyer before producing an Internal treasury quote', () => {
    const equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    expect(quoteInternalTreasuryPurchase(equity, valuation(), BUYER, 1)).toEqual({
      quoted: false,
      reason: 'InternalMembershipRequired',
    })
  })

  it('rejects invalid pricing policy instead of silently creating a free or unsafe quote', () => {
    expect(
      quoteInternalTreasuryPurchase(
        activeBuyerEquity(),
        valuation(),
        BUYER,
        1,
        { version: 'bad', referenceValueMultiplier: 0, minimumTotalPrice: 1 },
      ),
    ).toEqual({ quoted: false, reason: 'InvalidPricingPolicy' })
  })

  it('settles the owner scenario: exit returns shares, another active member pays and acquires them', () => {
    let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    equity = setEquityMemberActive(equity, DEPARTING, true)
    equity = setEquityMemberActive(equity, BUYER, true)
    const allocation = allocateEquityFromTreasury(equity, DEPARTING, 'InternalMember', 100)
    expect(allocation.changed).toBe(true)
    if (!allocation.changed) return

    const afterExit = reconcileEquityMemberExit(allocation.state, DEPARTING)
    expect(getActorEquityUnits(afterExit, DEPARTING, 'InternalMember')).toBe(0)
    expect(afterExit.pools.find(pool => pool.poolId === 'InternalMember')?.treasuryUnits).toBe(5_100)
    expect(getActorEquityUnits(afterExit, BUYER, 'InternalMember')).toBe(0)

    const result = settleInternalTreasuryPurchase(
      request('purchase:owner-scenario', 40),
      afterExit,
      fundedBuyer(),
      500,
      valuation(2),
      createTreasuryShareSettlementJournal(COMPANY),
    )

    expect(result.settled).toBe(true)
    if (!result.settled) return
    expect(result.replayed).toBe(false)
    expect(result.receipt.totalPrice).toBe(80)
    expect(result.buyerFunds.balance).toBe(920)
    expect(result.buyerFunds.entries.at(-1)).toMatchObject({
      delta: -80,
      reason: 'EquityPurchase',
      companyId: COMPANY,
    })
    expect(result.issuingCompanyMoney).toBe(580)
    expect(getActorEquityUnits(result.equityState, BUYER, 'InternalMember')).toBe(40)
    expect(result.equityState.pools.find(pool => pool.poolId === 'InternalMember')?.treasuryUnits).toBe(5_060)
    expect(result.journal.receipts).toHaveLength(1)
  })

  it('replays the same purchase ID without double debit, credit, or share allocation', () => {
    const first = settleInternalTreasuryPurchase(
      request(),
      activeBuyerEquity(),
      fundedBuyer(),
      500,
      valuation(2),
      createTreasuryShareSettlementJournal(COMPANY),
    )
    expect(first.settled).toBe(true)
    if (!first.settled) return

    const replay = settleInternalTreasuryPurchase(
      request(),
      first.equityState,
      first.buyerFunds,
      first.issuingCompanyMoney,
      valuation(9),
      first.journal,
    )

    expect(replay.settled).toBe(true)
    if (!replay.settled) return
    expect(replay.replayed).toBe(true)
    expect(replay.receipt).toEqual(first.receipt)
    expect(replay.buyerFunds).toEqual(first.buyerFunds)
    expect(replay.issuingCompanyMoney).toBe(first.issuingCompanyMoney)
    expect(replay.equityState).toEqual(first.equityState)
    expect(replay.journal.receipts).toHaveLength(1)
  })

  it('rejects conflicting reuse of a purchase ID with different terms', () => {
    const first = settleInternalTreasuryPurchase(
      request(),
      activeBuyerEquity(),
      fundedBuyer(),
      500,
      valuation(),
      createTreasuryShareSettlementJournal(COMPANY),
    )
    expect(first.settled).toBe(true)
    if (!first.settled) return

    const conflict = settleInternalTreasuryPurchase(
      request('purchase:001', 41),
      first.equityState,
      first.buyerFunds,
      first.issuingCompanyMoney,
      valuation(),
      first.journal,
    )
    expect(conflict).toMatchObject({ settled: false, reason: 'PurchaseIdConflict' })
    expect(conflict.buyerFunds).toEqual(first.buyerFunds)
    expect(conflict.equityState).toEqual(first.equityState)
    expect(conflict.issuingCompanyMoney).toBe(first.issuingCompanyMoney)
  })

  it('is atomic when Personal Money is insufficient', () => {
    const equity = activeBuyerEquity()
    const buyer = fundedBuyer(10)
    const journal = createTreasuryShareSettlementJournal(COMPANY)
    const result = settleInternalTreasuryPurchase(request(), equity, buyer, 500, valuation(), journal)

    expect(result).toMatchObject({ settled: false, reason: 'InsufficientPersonalFunds' })
    expect(result.equityState).toBe(equity)
    expect(result.buyerFunds).toBe(buyer)
    expect(result.issuingCompanyMoney).toBe(500)
    expect(result.journal).toBe(journal)
  })

  it('is atomic when requested units exceed Internal treasury availability', () => {
    const equity = activeBuyerEquity()
    const buyer = fundedBuyer(20_000)
    const result = settleInternalTreasuryPurchase(
      request('purchase:too-many', 5_101),
      equity,
      buyer,
      500,
      valuation(),
      createTreasuryShareSettlementJournal(COMPANY),
    )

    expect(result).toMatchObject({ settled: false, reason: 'InsufficientTreasury' })
    expect(getActorEquityUnits(result.equityState, BUYER, 'InternalMember')).toBe(0)
    expect(result.buyerFunds.balance).toBe(20_000)
    expect(result.issuingCompanyMoney).toBe(500)
  })

  it('rejects a buyer account owned by another Economic Actor', () => {
    const wrongAccount = createPersonalFundsAccount('actor:someone-else')
    const result = settleInternalTreasuryPurchase(
      request(),
      activeBuyerEquity(),
      wrongAccount,
      500,
      valuation(),
      createTreasuryShareSettlementJournal(COMPANY),
    )
    expect(result).toMatchObject({ settled: false, reason: 'BuyerAccountMismatch' })
  })

  it('rejects cross-company valuation or journal state', () => {
    const mismatchedValuation = settleInternalTreasuryPurchase(
      request(),
      activeBuyerEquity(),
      fundedBuyer(),
      500,
      valuation(2, 'company:other'),
      createTreasuryShareSettlementJournal(COMPANY),
    )
    expect(mismatchedValuation).toMatchObject({ settled: false, reason: 'CompanyMismatch' })

    const mismatchedJournal = settleInternalTreasuryPurchase(
      request(),
      activeBuyerEquity(),
      fundedBuyer(),
      500,
      valuation(),
      createTreasuryShareSettlementJournal('company:other'),
    )
    expect(mismatchedJournal).toMatchObject({ settled: false, reason: 'CompanyMismatch' })
  })

  it('rejects invalid or overflowing Company Money before any mutation', () => {
    const equity = activeBuyerEquity()
    const buyer = fundedBuyer()
    const journal = createTreasuryShareSettlementJournal(COMPANY)

    const negative = settleInternalTreasuryPurchase(request(), equity, buyer, -1, valuation(), journal)
    expect(negative).toMatchObject({ settled: false, reason: 'InvalidCompanyMoney' })

    const overflow = settleInternalTreasuryPurchase(
      request('purchase:overflow', 1),
      equity,
      buyer,
      Number.MAX_SAFE_INTEGER,
      valuation(),
      journal,
    )
    expect(overflow).toMatchObject({ settled: false, reason: 'UnsafeCompanyMoneyCredit' })
    expect(overflow.equityState).toBe(equity)
    expect(overflow.buyerFunds).toBe(buyer)
  })

  it('rejects corrupted Personal Money state rather than settling against a forged balance', () => {
    const valid = fundedBuyer()
    const corrupted: PersonalFundsAccountState = { ...valid, balance: valid.balance + 500 }
    const result = settleInternalTreasuryPurchase(
      request(),
      activeBuyerEquity(),
      corrupted,
      500,
      valuation(),
      createTreasuryShareSettlementJournal(COMPANY),
    )
    expect(result).toMatchObject({ settled: false, reason: 'InvalidPersonalFundsState' })
  })

  it('rejects corrupted equity state rather than settling against broken supply integrity', () => {
    const valid = activeBuyerEquity()
    const corrupted: CompanyEquityState = {
      ...valid,
      pools: valid.pools.map(pool =>
        pool.poolId === 'InternalMember' ? { ...pool, treasuryUnits: pool.treasuryUnits - 1 } : { ...pool },
      ),
    }
    const result = settleInternalTreasuryPurchase(
      request(),
      corrupted,
      fundedBuyer(),
      500,
      valuation(),
      createTreasuryShareSettlementJournal(COMPANY),
    )
    expect(result).toMatchObject({ settled: false, reason: 'InvalidEquityState' })
  })
})
