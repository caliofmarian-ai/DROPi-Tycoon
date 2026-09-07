import { describe, expect, it } from 'vitest'
import {
  createPersonalFundsAccount,
  creditPersonalFunds,
  debitPersonalFunds,
  sanitizePersonalFundsAccount,
  validatePersonalFundsIntegrity,
} from '../src/systems/personalFinanceSystem'

describe('personal finance domain', () => {
  it('starts a person with a separate zero Personal Money balance', () => {
    const account = createPersonalFundsAccount('actor:marian')
    expect(account.balance).toBe(0)
    expect(account.entries).toEqual([])
    expect(validatePersonalFundsIntegrity(account).valid).toBe(true)
  })

  it('credits wages to the person with an explicit company counterparty', () => {
    const account = createPersonalFundsAccount('actor:worker')
    const result = creditPersonalFunds(account, 125, 'WageIncome', 'company:alpha')
    expect(result.changed).toBe(true)
    if (!result.changed) return

    expect(result.state.balance).toBe(125)
    expect(result.entry).toMatchObject({
      transactionId: 'personal:actor:worker:tx:1',
      sequence: 1,
      delta: 125,
      reason: 'WageIncome',
      companyId: 'company:alpha',
    })
    expect(validatePersonalFundsIntegrity(result.state).valid).toBe(true)
  })

  it('credits dividends as personal income rather than Company Money', () => {
    const account = createPersonalFundsAccount('actor:investor')
    const result = creditPersonalFunds(account, 40, 'DividendIncome', 'company:beta')
    expect(result.changed).toBe(true)
    if (!result.changed) return
    expect(result.state.balance).toBe(40)
    expect(result.entry.reason).toBe('DividendIncome')
  })

  it('debits a future equity purchase from Personal Money', () => {
    const account = createPersonalFundsAccount('actor:member')
    const funded = creditPersonalFunds(account, 1_000, 'WageIncome', 'company:employer')
    expect(funded.changed).toBe(true)
    if (!funded.changed) return

    const purchase = debitPersonalFunds(funded.state, 600, 'EquityPurchase', 'company:target')
    expect(purchase.changed).toBe(true)
    if (!purchase.changed) return

    expect(purchase.state.balance).toBe(400)
    expect(purchase.entry.delta).toBe(-600)
    expect(purchase.entry.companyId).toBe('company:target')
    expect(validatePersonalFundsIntegrity(purchase.state).valid).toBe(true)
  })

  it('blocks equity purchase when personal funds are insufficient', () => {
    const account = createPersonalFundsAccount('actor:member')
    const result = debitPersonalFunds(account, 1, 'EquityPurchase', 'company:target')
    expect(result).toMatchObject({ changed: false, reason: 'InsufficientPersonalFunds' })
    expect(result.state.balance).toBe(0)
  })

  it('does not allow expense reasons to be used as credits', () => {
    const account = createPersonalFundsAccount('actor:a')
    const result = creditPersonalFunds(account, 10, 'EquityPurchase', 'company:x')
    expect(result).toMatchObject({ changed: false, reason: 'InvalidReasonDirection' })
  })

  it('does not allow income reasons to be used as debits', () => {
    const account = createPersonalFundsAccount('actor:a')
    const funded = creditPersonalFunds(account, 10, 'WageIncome', 'company:x')
    expect(funded.changed).toBe(true)
    if (!funded.changed) return
    const result = debitPersonalFunds(funded.state, 5, 'DividendIncome', 'company:x')
    expect(result).toMatchObject({ changed: false, reason: 'InvalidReasonDirection' })
  })

  it('requires positive whole money units', () => {
    const account = createPersonalFundsAccount('actor:a')
    expect(creditPersonalFunds(account, 0, 'WageIncome').changed).toBe(false)
    expect(creditPersonalFunds(account, 1.5, 'WageIncome').changed).toBe(false)
    expect(debitPersonalFunds(account, -1, 'PersonalExpense').changed).toBe(false)
  })

  it('keeps deterministic contiguous transaction IDs and ledger-derived balance', () => {
    let account = createPersonalFundsAccount('actor:ledger')
    const first = creditPersonalFunds(account, 100, 'WageIncome', 'company:a')
    expect(first.changed).toBe(true)
    if (!first.changed) return
    account = first.state
    const second = creditPersonalFunds(account, 50, 'OtherGameplayIncome')
    expect(second.changed).toBe(true)
    if (!second.changed) return
    account = second.state
    const third = debitPersonalFunds(account, 25, 'TrainingExpense')
    expect(third.changed).toBe(true)
    if (!third.changed) return
    account = third.state

    expect(account.entries.map(entry => entry.sequence)).toEqual([1, 2, 3])
    expect(account.entries.map(entry => entry.transactionId)).toEqual([
      'personal:actor:ledger:tx:1',
      'personal:actor:ledger:tx:2',
      'personal:actor:ledger:tx:3',
    ])
    expect(account.balance).toBe(125)
    expect(validatePersonalFundsIntegrity(account).valid).toBe(true)
  })

  it('detects tampering when stored balance no longer matches the ledger', () => {
    const account = createPersonalFundsAccount('actor:tamper')
    const credited = creditPersonalFunds(account, 100, 'WageIncome')
    expect(credited.changed).toBe(true)
    if (!credited.changed) return

    const tampered = { ...credited.state, balance: 999 }
    const integrity = validatePersonalFundsIntegrity(tampered)
    expect(integrity.valid).toBe(false)
    expect(integrity.errors).toContain('Ledger-derived balance must equal stored Personal Money balance.')
  })

  it('detects a ledger history that would pass through a negative balance', () => {
    const tampered = {
      actorId: 'actor:tamper',
      balance: 0,
      entries: [
        {
          transactionId: 'personal:actor:tamper:tx:1',
          sequence: 1,
          actorId: 'actor:tamper',
          delta: -10,
          reason: 'PersonalExpense' as const,
        },
        {
          transactionId: 'personal:actor:tamper:tx:2',
          sequence: 2,
          actorId: 'actor:tamper',
          delta: 10,
          reason: 'OtherGameplayIncome' as const,
        },
      ],
    }
    const integrity = validatePersonalFundsIntegrity(tampered)
    expect(integrity.valid).toBe(false)
    expect(integrity.errors).toContain('Ledger history cannot produce a negative personal balance.')
  })

  it('sanitizes invalid or foreign-actor account data to a safe empty account', () => {
    const foreign = {
      actorId: 'actor:other',
      balance: 100,
      entries: [],
    }
    const sanitized = sanitizePersonalFundsAccount(foreign, 'actor:expected')
    expect(sanitized.repaired).toBe(true)
    expect(sanitized.state).toEqual(createPersonalFundsAccount('actor:expected'))
  })
})
