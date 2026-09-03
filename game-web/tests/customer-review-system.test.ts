import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../src/state/gameState'
import {
  appendCustomerReview,
  buildCustomerReviewForOrder,
} from '../src/systems/customerReviewSystem'
import { settleDeliveryOutcome } from '../src/systems/economySettlement'
import {
  decodeSave,
  restoreGameSessionFromSave,
  serializeGameSession,
} from '../src/persistence/saveSystem'

describe('RBATCH-020 / ISSUE-030 — deterministic customer reviews', () => {
  it('builds a positive five-star review for a settled completed order', () => {
    const order = createInitialWorldState().activeOrder
    order.status = 'Completed'
    order.economySettled = true

    expect(buildCustomerReviewForOrder(order)).toEqual({
      orderId: order.orderId,
      rating: 5,
      sentiment: 'Positive',
      message: 'Fast and reliable delivery.',
      reputationImpact: BALANCING.REPUTATION_ON_SUCCESS,
    })
  })

  it('builds a negative one-star review for a settled failed order', () => {
    const order = createInitialWorldState().activeOrder
    order.status = 'Failed'
    order.economySettled = true

    expect(buildCustomerReviewForOrder(order)).toEqual({
      orderId: order.orderId,
      rating: 1,
      sentiment: 'Negative',
      message: 'The delivery did not reach the expected destination.',
      reputationImpact: BALANCING.REPUTATION_ON_FAILURE,
    })
  })

  it('does not generate a review before authoritative settlement', () => {
    const company = createInitialCompanyState()
    const order = createInitialWorldState().activeOrder
    order.status = 'Completed'
    order.economySettled = false

    const result = appendCustomerReview(company, order)
    expect(result.generated).toBe(false)
    if (result.generated) return
    expect(result.reason).toBe('order-not-settled')
    expect(result.company.reviews).toEqual([])
  })

  it('prevents duplicate review records for the same order', () => {
    const company = createInitialCompanyState()
    const order = createInitialWorldState().activeOrder
    order.status = 'Completed'
    order.economySettled = true

    const first = appendCustomerReview(company, order)
    expect(first.generated).toBe(true)
    if (!first.generated) return

    const second = appendCustomerReview(first.company, order)
    expect(second.generated).toBe(false)
    if (second.generated) return
    expect(second.reason).toBe('already-reviewed')
    expect(second.company.reviews).toHaveLength(1)
  })
})

describe('RBATCH-020 — one authoritative reputation settlement', () => {
  it('creates the success review while applying reputation exactly once', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    const completed = { ...world.activeOrder, status: 'Completed' as const }
    const company = createInitialCompanyState()

    const result = settleDeliveryOutcome(world.activeOrder, completed, company)
    expect(result.applied).toBe(true)
    if (!result.applied) return

    expect(result.company.reputation).toBe(
      company.reputation + BALANCING.REPUTATION_ON_SUCCESS,
    )
    expect(result.company.reviews).toHaveLength(1)
    expect(result.company.reviews[0].reputationImpact).toBe(
      BALANCING.REPUTATION_ON_SUCCESS,
    )

    const duplicate = settleDeliveryOutcome(result.order, result.order, result.company)
    expect(duplicate.applied).toBe(false)
    expect(result.company.reviews).toHaveLength(1)
  })

  it('creates the failure review while applying the existing failure penalty once', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    const failed = { ...world.activeOrder, status: 'Failed' as const }
    const company = createInitialCompanyState()

    const result = settleDeliveryOutcome(world.activeOrder, failed, company)
    expect(result.applied).toBe(true)
    if (!result.applied) return

    expect(result.company.reputation).toBe(
      company.reputation + BALANCING.REPUTATION_ON_FAILURE,
    )
    expect(result.company.reviews).toHaveLength(1)
    expect(result.company.reviews[0]).toMatchObject({
      sentiment: 'Negative',
      reputationImpact: BALANCING.REPUTATION_ON_FAILURE,
    })
  })
})

describe('RBATCH-020 — review persistence contract', () => {
  it('persists and restores generated reviews through the existing save-v2 slot', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    const completed = { ...world.activeOrder, status: 'Completed' as const }
    const initialCompany = createInitialCompanyState()
    const settlement = settleDeliveryOutcome(world.activeOrder, completed, initialCompany)
    expect(settlement.applied).toBe(true)
    if (!settlement.applied) return

    const session = {
      world: createInitialWorldState(),
      company: settlement.company,
      settings: createInitialGameSettingsState(),
    }
    const decoded = decodeSave(serializeGameSession(session))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return

    expect(decoded.save.company.reviews).toHaveLength(1)
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.reviews).toEqual(settlement.company.reviews)
  })

  it('repairs malformed and duplicate persisted review rows', () => {
    const company = createInitialCompanyState()
    const raw = JSON.stringify({
      formatVersion: 2,
      company: {
        companyName: company.companyName,
        money: company.money,
        level: company.level,
        reputation: company.reputation,
        purchasedUpgradeLevels: company.purchasedUpgradeLevels,
        employees: [],
        payroll: { lastProcessedCycle: 0 },
        reviews: [
          {
            orderId: 'ORDER-001',
            rating: 5,
            sentiment: 'Positive',
            message: 'Good',
            reputationImpact: 2,
          },
          {
            orderId: 'ORDER-001',
            rating: 1,
            sentiment: 'Negative',
            message: 'Duplicate',
            reputationImpact: -5,
          },
          {
            orderId: '',
            rating: 99,
            sentiment: 'Unknown',
            message: '',
            reputationImpact: 'bad',
          },
        ],
      },
      settings: { tutorialCompleted: false },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.company.reviews).toHaveLength(1)
    expect(decoded.save.company.reviews?.[0].orderId).toBe('ORDER-001')
  })

  it('does not add an empty reviews array to the serialized shape', () => {
    const session = {
      world: createInitialWorldState(),
      company: createInitialCompanyState(),
      settings: createInitialGameSettingsState(),
    }
    const parsed = JSON.parse(serializeGameSession(session)) as {
      company: Record<string, unknown>
    }
    expect(parsed.company).not.toHaveProperty('reviews')
  })
})

describe('RBATCH-020 — implementation boundary', () => {
  it('contains no random review generation and delegates reputation to settlement', () => {
    const reviewSource = readFileSync(
      new URL('../src/systems/customerReviewSystem.ts', import.meta.url),
      'utf8',
    )
    const settlementSource = readFileSync(
      new URL('../src/systems/economySettlement.ts', import.meta.url),
      'utf8',
    )

    expect(reviewSource).not.toContain('Math.random')
    expect(reviewSource).not.toContain('Date.now')
    expect(settlementSource).toContain('appendCustomerReview')
    expect(settlementSource).toContain('REPUTATION_ON_SUCCESS')
    expect(settlementSource).toContain('REPUTATION_ON_FAILURE')
  })
})
