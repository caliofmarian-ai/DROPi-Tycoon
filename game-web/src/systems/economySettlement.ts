import { BALANCING } from '../config/balancing'
import type { CompanyState, OrderState } from '../types/game'

export type SettlementOutcome =
  | { applied: true; company: CompanyState; order: OrderState }
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
 * - Preserves unrelated company progression fields
 * - No Phaser dependency
 */
export const settleDeliveryOutcome = (
  previousOrder: OrderState,
  nextOrder: OrderState,
  company: CompanyState,
): SettlementOutcome => {
  if (previousOrder.orderId !== nextOrder.orderId) {
    return { applied: false, reason: 'Previous and next order IDs do not match' }
  }

  if (previousOrder.status !== 'PickedUp') {
    return { applied: false, reason: 'Transition did not originate from PickedUp' }
  }

  if (nextOrder.status !== 'Completed' && nextOrder.status !== 'Failed') {
    return { applied: false, reason: 'Transition target is not a terminal state' }
  }

  if (previousOrder.economySettled || nextOrder.economySettled) {
    return { applied: false, reason: 'Order settlement already applied' }
  }

  if (!Number.isSafeInteger(previousOrder.reward) || previousOrder.reward < 0) {
    return { applied: false, reason: 'Previous order reward must be a non-negative safe integer' }
  }

  if (!Number.isSafeInteger(nextOrder.reward) || nextOrder.reward < 0) {
    return { applied: false, reason: 'Order reward must be a non-negative safe integer' }
  }

  if (previousOrder.reward !== nextOrder.reward) {
    return { applied: false, reason: 'Order reward must remain unchanged across settlement' }
  }

  if (previousOrder.reward !== BALANCING.ORDER_REWARD) {
    return { applied: false, reason: 'Order reward must match the approved prototype reward' }
  }

  if (!Number.isSafeInteger(company.money) || company.money < 0) {
    return { applied: false, reason: 'Company money must be a non-negative safe integer' }
  }

  if (!Number.isSafeInteger(company.reputation)) {
    return { applied: false, reason: 'Company reputation must be a safe integer' }
  }

  if (nextOrder.status === 'Completed') {
    const money = company.money + nextOrder.reward
    if (!Number.isSafeInteger(money) || money < 0) {
      return { applied: false, reason: 'Settlement money result is invalid' }
    }
    const rawReputation = company.reputation + BALANCING.REPUTATION_ON_SUCCESS
    const reputation = Math.min(
      BALANCING.REPUTATION_MAX,
      Math.max(BALANCING.REPUTATION_MIN, rawReputation),
    )
    return {
      applied: true,
      company: { ...company, money, reputation },
      order: { ...nextOrder, economySettled: true },
    }
  }

  // nextOrder.status === 'Failed'
  const rawReputation = company.reputation + BALANCING.REPUTATION_ON_FAILURE
  const reputation = Math.min(
    BALANCING.REPUTATION_MAX,
    Math.max(BALANCING.REPUTATION_MIN, rawReputation),
  )
  return {
    applied: true,
    company: { ...company, money: company.money, reputation },
    order: { ...nextOrder, economySettled: true },
  }
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
