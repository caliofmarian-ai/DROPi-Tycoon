import { BALANCING } from '../config/balancing'
import type { CompanyState, OrderState } from '../types/game'

export type SettlementOutcome =
  | { applied: true; company: CompanyState }
  | { applied: false; reason: string }

/**
 * Apply the economic outcome of a delivery transition.
 *
 * Rules (owner-approved for Prototype v0.1):
 * - PickedUp → Completed: adds order reward to money; reputation +2 (clamped 0..100)
 * - PickedUp → Failed: no money change; reputation -5 (clamped 0..100)
 * - Any other transition: rejected, company unchanged
 * - Cannot settle a terminal order more than once (no repeated pay)
 * - Never produces negative money
 * - No Phaser dependency
 */
export const settleDeliveryOutcome = (
  prevStatus: OrderState['status'],
  nextStatus: OrderState['status'],
  order: OrderState,
  company: CompanyState,
): SettlementOutcome => {
  if (prevStatus !== 'PickedUp') {
    return { applied: false, reason: 'Transition did not originate from PickedUp' }
  }

  if (nextStatus !== 'Completed' && nextStatus !== 'Failed') {
    return { applied: false, reason: 'Transition target is not a terminal state' }
  }

  if (!Number.isFinite(order.reward) || order.reward < 0) {
    return { applied: false, reason: 'Order reward is not a valid non-negative finite number' }
  }

  if (!Number.isFinite(company.money) || company.money < 0) {
    return { applied: false, reason: 'Company money is not a valid non-negative finite number' }
  }

  if (!Number.isFinite(company.reputation)) {
    return { applied: false, reason: 'Company reputation is not a finite number' }
  }

  if (nextStatus === 'Completed') {
    const rawMoney = company.money + order.reward
    const money = Math.max(0, rawMoney)
    const rawReputation = company.reputation + BALANCING.REPUTATION_ON_SUCCESS
    const reputation = Math.min(
      BALANCING.REPUTATION_MAX,
      Math.max(BALANCING.REPUTATION_MIN, rawReputation),
    )
    return { applied: true, company: { money, reputation } }
  }

  // nextStatus === 'Failed'
  const rawReputation = company.reputation + BALANCING.REPUTATION_ON_FAILURE
  const reputation = Math.min(
    BALANCING.REPUTATION_MAX,
    Math.max(BALANCING.REPUTATION_MIN, rawReputation),
  )
  return { applied: true, company: { money: company.money, reputation } }
}

/**
 * Returns true only when `money` is a finite, non-negative number that is
 * greater than or equal to `cost`, which must also be finite and non-negative.
 *
 * Does not purchase anything, deduct money, or implement upgrade UI.
 */
export const canAfford = (money: number, cost: number): boolean => {
  if (!Number.isFinite(money) || money < 0) return false
  if (!Number.isFinite(cost) || cost < 0) return false
  return money >= cost
}
