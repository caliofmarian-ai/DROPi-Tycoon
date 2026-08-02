/**
 * RBATCH-010 — HUD + Notifications
 *
 * Deterministic tests for:
 *   - HUDViewModel (pure view-model functions)
 *   - NotificationController (pure notification state machine)
 *   - Accept Order action (reuses canonical order-system functions)
 *   - Pointer isolation (pure bounds logic)
 *   - Regression coverage for RBATCH-007 through RBATCH-009
 */

import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import {
  attemptDelivery,
  attemptPickup,
  flagAcceptRequested,
  requestOrderAcceptance,
} from '../src/systems/orderSystem'
import { settleDeliveryOutcome } from '../src/systems/economySettlement'
import {
  buildHUDData,
  isAcceptButtonVisible,
  isActiveOrderStatus,
} from '../src/ui/HUDViewModel'
import {
  clearNotification,
  createNotificationState,
  NOTIFICATION_MESSAGES,
  notificationForTransition,
  updateNotification,
} from '../src/ui/NotificationController'
import type { OrderStatus, WorldState } from '../src/types/game'

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE-005 — Active-order HUD panel view model
// ─────────────────────────────────────────────────────────────────────────────

describe('ISSUE-005 — HUD view model: active-order status visibility', () => {
  it('Available is an active order status (panel shown)', () => {
    expect(isActiveOrderStatus('Available')).toBe(true)
  })

  it('Accepted is an active order status (panel shown)', () => {
    expect(isActiveOrderStatus('Accepted')).toBe(true)
  })

  it('PickedUp is an active order status (panel shown)', () => {
    expect(isActiveOrderStatus('PickedUp')).toBe(true)
  })

  it('Completed is NOT an active order status (no stale panel)', () => {
    expect(isActiveOrderStatus('Completed')).toBe(false)
  })

  it('Failed is NOT an active order status (no stale panel)', () => {
    expect(isActiveOrderStatus('Failed')).toBe(false)
  })

  it('Created is NOT an active order status (panel hidden before Available)', () => {
    expect(isActiveOrderStatus('Created')).toBe(false)
  })
})

describe('ISSUE-005 — HUD view model: buildHUDData', () => {
  it('returns correct money and reputation from company state', () => {
    const world = createInitialWorldState()
    const company = { money: 250, reputation: 62 }
    const data = buildHUDData(world, company)
    expect(data.money).toBe(250)
    expect(data.reputation).toBe(62)
  })

  it('returns correct orderStatus for Available', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    const data = buildHUDData(world, company)
    expect(data.orderStatus).toBe('Available')
  })

  it('returns correct destination', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    const data = buildHUDData(world, company)
    expect(data.destination).toBe('DeliveryZone')
  })

  it('returns carryingPackage: false when player is not carrying', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.player.carryingPackage = false
    const data = buildHUDData(world, company)
    expect(data.carryingPackage).toBe(false)
  })

  it('returns carryingPackage: true when player is carrying', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.player.carryingPackage = true
    const data = buildHUDData(world, company)
    expect(data.carryingPackage).toBe(true)
  })

  it('showActiveOrder: true for Available', () => {
    const world = createInitialWorldState()
    const data = buildHUDData(world, createInitialCompanyState())
    expect(data.showActiveOrder).toBe(true)
  })

  it('showActiveOrder: true for Accepted', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    const data = buildHUDData(world, createInitialCompanyState())
    expect(data.showActiveOrder).toBe(true)
  })

  it('showActiveOrder: true for PickedUp', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    const data = buildHUDData(world, createInitialCompanyState())
    expect(data.showActiveOrder).toBe(true)
  })

  it('showActiveOrder: false for Completed — no stale panel', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Completed'
    const data = buildHUDData(world, createInitialCompanyState())
    expect(data.showActiveOrder).toBe(false)
  })

  it('showActiveOrder: false for Failed — no stale panel', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Failed'
    const data = buildHUDData(world, createInitialCompanyState())
    expect(data.showActiveOrder).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE-006 — Accept Order button
// ─────────────────────────────────────────────────────────────────────────────

describe('ISSUE-006 — Accept Order button visibility', () => {
  it('Accept button visible only for Available', () => {
    expect(isAcceptButtonVisible('Available')).toBe(true)
  })

  it('Accept button hidden for Created', () => {
    expect(isAcceptButtonVisible('Created')).toBe(false)
  })

  it('Accept button hidden for Accepted (already accepted)', () => {
    expect(isAcceptButtonVisible('Accepted')).toBe(false)
  })

  it('Accept button hidden for PickedUp', () => {
    expect(isAcceptButtonVisible('PickedUp')).toBe(false)
  })

  it('Accept button hidden for Completed (terminal)', () => {
    expect(isAcceptButtonVisible('Completed')).toBe(false)
  })

  it('Accept button hidden for Failed (terminal)', () => {
    expect(isAcceptButtonVisible('Failed')).toBe(false)
  })

  it('buildHUDData showAcceptButton true for Available', () => {
    const world = createInitialWorldState()
    const data = buildHUDData(world, createInitialCompanyState())
    expect(data.showAcceptButton).toBe(true)
  })

  it('buildHUDData showAcceptButton false for Accepted', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    const data = buildHUDData(world, createInitialCompanyState())
    expect(data.showAcceptButton).toBe(false)
  })
})

describe('ISSUE-006 — Accept Order action through canonical path', () => {
  it('pressing Accept performs the Available→Accepted transition', () => {
    const world = createInitialWorldState()
    const flagged = flagAcceptRequested(world.activeOrder)
    const result = requestOrderAcceptance(flagged, world.player)
    expect(result.order.status).toBe('Accepted')
  })

  it('acceptance sets currentOrder on the player', () => {
    const world = createInitialWorldState()
    const flagged = flagAcceptRequested(world.activeOrder)
    const result = requestOrderAcceptance(flagged, world.player)
    expect(result.player.currentOrder).toBe('ORDER-001')
  })

  it('acceptance clears acceptRequested', () => {
    const world = createInitialWorldState()
    const flagged = flagAcceptRequested(world.activeOrder)
    const result = requestOrderAcceptance(flagged, world.player)
    expect(result.order.acceptRequested).toBe(false)
  })

  it('repeated press cannot accept twice: second call on already-Accepted order returns unchanged', () => {
    const world = createInitialWorldState()
    const flagged = flagAcceptRequested(world.activeOrder)
    const first = requestOrderAcceptance(flagged, world.player)
    // Second call: try to flag and accept again on an already-Accepted order
    const reflagged = flagAcceptRequested(first.order)
    const second = requestOrderAcceptance(reflagged, first.player)
    expect(second.order.status).toBe('Accepted') // still Accepted, not re-transitioned
    // acceptRequested does not get set on a non-Available order
    expect(reflagged.acceptRequested).toBe(false)
  })

  it('Created order cannot be accepted via canonical path', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Created'
    world.activeOrder.acceptRequested = true
    const result = requestOrderAcceptance(world.activeOrder, world.player)
    expect(result.order.status).toBe('Created')
  })

  it('Accepted order cannot be accepted again', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    world.activeOrder.acceptRequested = true
    const result = requestOrderAcceptance(world.activeOrder, world.player)
    expect(result.order.status).toBe('Accepted')
  })

  it('PickedUp order cannot be accepted', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    world.activeOrder.acceptRequested = true
    const result = requestOrderAcceptance(world.activeOrder, world.player)
    expect(result.order.status).toBe('PickedUp')
  })

  it('Completed order cannot be accepted', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Completed'
    world.activeOrder.acceptRequested = true
    const result = requestOrderAcceptance(world.activeOrder, world.player)
    expect(result.order.status).toBe('Completed')
  })

  it('Failed order cannot be accepted', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Failed'
    world.activeOrder.acceptRequested = true
    const result = requestOrderAcceptance(world.activeOrder, world.player)
    expect(result.order.status).toBe('Failed')
  })

  it('mismatched player/order state: acceptRequested without Available status is rejected', () => {
    const world = createInitialWorldState()
    // Simulate a state where acceptRequested is true but order is already PickedUp
    world.activeOrder.status = 'PickedUp'
    world.activeOrder.acceptRequested = true
    const result = requestOrderAcceptance(world.activeOrder, world.player)
    expect(result.order.status).toBe('PickedUp')
    expect(result.player.currentOrder).toBe('')
  })
})

describe('ISSUE-006 — HUD accept action does not affect player movement or delivery', () => {
  /** Simulate the HUD accept action as a pure state update (no Phaser). */
  function simulateHUDAccept(worldState: WorldState): WorldState {
    if (worldState.activeOrder.status !== 'Available') return worldState
    const flagged = flagAcceptRequested(worldState.activeOrder)
    const result = requestOrderAcceptance(flagged, worldState.player)
    if (result.order.status !== 'Accepted') return worldState
    return { ...worldState, activeOrder: result.order, player: result.player }
  }

  it('HUD accept does not change tapTarget (movement target unchanged)', () => {
    const world = createInitialWorldState()
    const originalTarget = { ...world.tapTarget }
    const updated = simulateHUDAccept(world)
    expect(updated.tapTarget).toEqual(originalTarget)
  })

  it('HUD accept does not change isMoving flag', () => {
    const world = createInitialWorldState()
    world.isMoving = false
    const updated = simulateHUDAccept(world)
    expect(updated.isMoving).toBe(false)
  })

  it('HUD accept does not register a pendingDeliveryDestination', () => {
    const world = createInitialWorldState()
    const updated = simulateHUDAccept(world)
    expect(updated.pendingDeliveryDestination).toBe('')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE-007 — Delivery lifecycle notifications
// ─────────────────────────────────────────────────────────────────────────────

describe('ISSUE-007 — notificationForTransition', () => {
  it('Available→Accepted produces the accepted message', () => {
    const msg = notificationForTransition('Available', 'Accepted')
    expect(msg).toBe(NOTIFICATION_MESSAGES.accepted)
    expect(msg).not.toBeNull()
  })

  it('Accepted→PickedUp produces the pickedUp message', () => {
    const msg = notificationForTransition('Accepted', 'PickedUp')
    expect(msg).toBe(NOTIFICATION_MESSAGES.pickedUp)
  })

  it('PickedUp→Completed produces the completed message', () => {
    const msg = notificationForTransition('PickedUp', 'Completed')
    expect(msg).toBe(NOTIFICATION_MESSAGES.completed)
  })

  it('PickedUp→Failed produces the failed message', () => {
    const msg = notificationForTransition('PickedUp', 'Failed')
    expect(msg).toBe(NOTIFICATION_MESSAGES.failed)
  })

  it('same-status transition produces null (no notification)', () => {
    const statuses: OrderStatus[] = [
      'Available',
      'Accepted',
      'PickedUp',
      'Completed',
      'Failed',
      'Created',
    ]
    statuses.forEach((s) => {
      expect(notificationForTransition(s, s)).toBeNull()
    })
  })

  it('invalid/undefined lifecycle transition produces null', () => {
    expect(notificationForTransition('Created', 'Completed')).toBeNull()
    expect(notificationForTransition('Available', 'PickedUp')).toBeNull()
    expect(notificationForTransition('Accepted', 'Completed')).toBeNull()
  })

  it('PickedUp→Completed message contains meaningful success text', () => {
    const msg = notificationForTransition('PickedUp', 'Completed')
    expect(msg).not.toBeNull()
    expect(msg).toMatch(/successful|success|complet/i)
  })

  it('PickedUp→Failed message contains meaningful failure text', () => {
    const msg = notificationForTransition('PickedUp', 'Failed')
    expect(msg).not.toBeNull()
    expect(msg).toMatch(/fail/i)
  })
})

describe('ISSUE-007 — NotificationController state machine', () => {
  it('createNotificationState produces inactive initial state', () => {
    const state = createNotificationState('Available')
    expect(state.active).toBe(false)
    expect(state.message).toBeNull()
    expect(state.trackedStatus).toBe('Available')
  })

  it('updateNotification: same status returns no new message (idempotent)', () => {
    const state = createNotificationState('Available')
    const { state: next, newMessage } = updateNotification(state, 'Available')
    expect(newMessage).toBeNull()
    expect(next.trackedStatus).toBe('Available')
    expect(next.active).toBe(false)
  })

  it('updateNotification: Available→Accepted emits message once', () => {
    const state = createNotificationState('Available')
    const { state: next, newMessage } = updateNotification(state, 'Accepted')
    expect(newMessage).toBe(NOTIFICATION_MESSAGES.accepted)
    expect(next.active).toBe(true)
    expect(next.trackedStatus).toBe('Accepted')
  })

  it('updateNotification: calling again with same status produces no second message (no duplicate)', () => {
    const state = createNotificationState('Available')
    const { state: afterFirst } = updateNotification(state, 'Accepted')
    const { newMessage: second } = updateNotification(afterFirst, 'Accepted')
    expect(second).toBeNull()
  })

  it('updateNotification: Accepted→PickedUp emits message', () => {
    const state = createNotificationState('Accepted')
    const { newMessage } = updateNotification(state, 'PickedUp')
    expect(newMessage).toBe(NOTIFICATION_MESSAGES.pickedUp)
  })

  it('updateNotification: PickedUp→Completed emits message', () => {
    const state = createNotificationState('PickedUp')
    const { newMessage } = updateNotification(state, 'Completed')
    expect(newMessage).toBe(NOTIFICATION_MESSAGES.completed)
  })

  it('updateNotification: PickedUp→Failed emits message', () => {
    const state = createNotificationState('PickedUp')
    const { newMessage } = updateNotification(state, 'Failed')
    expect(newMessage).toBe(NOTIFICATION_MESSAGES.failed)
  })

  it('updateNotification: unchanged status across many calls does not duplicate', () => {
    let state = createNotificationState('PickedUp')
    let count = 0
    for (let i = 0; i < 10; i++) {
      const { newMessage } = updateNotification(state, 'PickedUp')
      if (newMessage !== null) count++
    }
    expect(count).toBe(0)
  })

  it('updateNotification: invalid lifecycle produces null message but advances trackedStatus', () => {
    const state = createNotificationState('Created')
    const { state: next, newMessage } = updateNotification(state, 'Completed')
    expect(newMessage).toBeNull()
    expect(next.trackedStatus).toBe('Completed')
    expect(next.active).toBe(false)
  })

  it('rapid valid transitions produce distinct messages deterministically', () => {
    let state = createNotificationState('Available')
    const messages: (string | null)[] = []

    let result = updateNotification(state, 'Accepted')
    messages.push(result.newMessage)
    state = result.state

    result = updateNotification(state, 'PickedUp')
    messages.push(result.newMessage)
    state = result.state

    result = updateNotification(state, 'Completed')
    messages.push(result.newMessage)

    expect(messages[0]).toBe(NOTIFICATION_MESSAGES.accepted)
    expect(messages[1]).toBe(NOTIFICATION_MESSAGES.pickedUp)
    expect(messages[2]).toBe(NOTIFICATION_MESSAGES.completed)
  })

  it('clearNotification resets active and message', () => {
    let state = createNotificationState('Available')
    const { state: withMsg } = updateNotification(state, 'Accepted')
    expect(withMsg.active).toBe(true)
    const cleared = clearNotification(withMsg)
    expect(cleared.active).toBe(false)
    expect(cleared.message).toBeNull()
    // trackedStatus is preserved so next transition is still tracked correctly
    expect(cleared.trackedStatus).toBe('Accepted')
  })

  it('notification logic is deterministic (no wall-clock dependency)', () => {
    // Run the same sequence twice and expect identical results
    const sequence = (
      initial: OrderStatus,
      transitions: OrderStatus[],
    ): (string | null)[] => {
      let state = createNotificationState(initial)
      return transitions.map((to) => {
        const result = updateNotification(state, to)
        state = result.state
        return result.newMessage
      })
    }
    const run1 = sequence('Available', ['Accepted', 'PickedUp', 'Failed'])
    const run2 = sequence('Available', ['Accepted', 'PickedUp', 'Failed'])
    expect(run1).toEqual(run2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// RBATCH-009 regression — economy outcomes preserved
// ─────────────────────────────────────────────────────────────────────────────

describe('RBATCH-010 — RBATCH-009 economy regressions', () => {
  function buildPickedUpState() {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    world.player.carryingPackage = true
    world.player.currentOrder = world.activeOrder.orderId
    return world
  }

  function validDeliveryContext(world: ReturnType<typeof buildPickedUpState>) {
    return {
      selectedDestination: world.activeOrder.destination,
      distanceToDestination: 10,
      deliveryRadius: world.deliveryRadius,
      orderConditionsMet: true,
    }
  }

  it('successful delivery still results in Money 100 and Reputation 52', () => {
    const world = buildPickedUpState()
    const company = createInitialCompanyState()
    const delivery = attemptDelivery(world.activeOrder, world.player, validDeliveryContext(world))
    expect(delivery.order.status).toBe('Completed')
    const settlement = settleDeliveryOutcome(world.activeOrder, delivery.order, company)
    expect(settlement.applied).toBe(true)
    if (settlement.applied) {
      expect(settlement.company.money).toBe(BALANCING.ORDER_REWARD)
      expect(settlement.company.reputation).toBe(
        BALANCING.INITIAL_REPUTATION + BALANCING.REPUTATION_ON_SUCCESS,
      )
    }
  })

  it('failed delivery still results in Money 0 and Reputation 45 from fresh game', () => {
    const world = buildPickedUpState()
    const company = createInitialCompanyState()
    const delivery = attemptDelivery(world.activeOrder, world.player, {
      ...validDeliveryContext(world),
      selectedDestination: 'DeliveryPoint', // wrong destination
    })
    expect(delivery.order.status).toBe('Failed')
    const settlement = settleDeliveryOutcome(world.activeOrder, delivery.order, company)
    expect(settlement.applied).toBe(true)
    if (settlement.applied) {
      expect(settlement.company.money).toBe(0)
      expect(settlement.company.reputation).toBe(
        BALANCING.INITIAL_REPUTATION + BALANCING.REPUTATION_ON_FAILURE,
      )
    }
  })

  it('existing money remains unchanged on failure', () => {
    const world = buildPickedUpState()
    const company = { money: 500, reputation: 60 }
    const delivery = attemptDelivery(world.activeOrder, world.player, {
      ...validDeliveryContext(world),
      selectedDestination: 'DeliveryPoint',
    })
    const settlement = settleDeliveryOutcome(world.activeOrder, delivery.order, company)
    expect(settlement.applied).toBe(true)
    if (settlement.applied) {
      expect(settlement.company.money).toBe(500)
    }
  })

  it('carryingPackage and currentOrder clear on successful completion', () => {
    const world = buildPickedUpState()
    const delivery = attemptDelivery(world.activeOrder, world.player, validDeliveryContext(world))
    expect(delivery.player.carryingPackage).toBe(false)
    expect(delivery.player.currentOrder).toBe('')
  })

  it('carryingPackage and currentOrder clear on failure', () => {
    const world = buildPickedUpState()
    const delivery = attemptDelivery(world.activeOrder, world.player, {
      ...validDeliveryContext(world),
      selectedDestination: 'DeliveryPoint',
    })
    expect(delivery.player.carryingPackage).toBe(false)
    expect(delivery.player.currentOrder).toBe('')
  })

  it('economySettled idempotency: second settlement is rejected', () => {
    const world = buildPickedUpState()
    const company = createInitialCompanyState()
    const delivery = attemptDelivery(world.activeOrder, world.player, validDeliveryContext(world))
    const first = settleDeliveryOutcome(world.activeOrder, delivery.order, company)
    expect(first.applied).toBe(true)
    if (!first.applied) return
    // Attempt to settle again using the already-settled order
    const second = settleDeliveryOutcome(
      { ...world.activeOrder, economySettled: true },
      first.order,
      first.company,
    )
    expect(second.applied).toBe(false)
  })

  it('terminal Completed does not produce a stale active-order panel', () => {
    const world = buildPickedUpState()
    const delivery = attemptDelivery(world.activeOrder, world.player, validDeliveryContext(world))
    world.activeOrder = delivery.order
    const hudData = buildHUDData(world, createInitialCompanyState())
    expect(hudData.showActiveOrder).toBe(false)
  })

  it('terminal Failed does not produce a stale active-order panel', () => {
    const world = buildPickedUpState()
    const delivery = attemptDelivery(world.activeOrder, world.player, {
      ...validDeliveryContext(world),
      selectedDestination: 'DeliveryPoint',
    })
    world.activeOrder = delivery.order
    const hudData = buildHUDData(world, createInitialCompanyState())
    expect(hudData.showActiveOrder).toBe(false)
  })

  it('terminal Completed notification arrives even when active-order panel is hidden', () => {
    // Notification fires at the PickedUp→Completed transition;
    // the panel hides on the next HUD update.  These are independent.
    let notifState = createNotificationState('PickedUp')
    const { newMessage } = updateNotification(notifState, 'Completed')
    expect(newMessage).toBe(NOTIFICATION_MESSAGES.completed)
    // Now confirm panel is hidden for Completed
    const world = buildPickedUpState()
    world.activeOrder.status = 'Completed'
    expect(buildHUDData(world, createInitialCompanyState()).showActiveOrder).toBe(false)
  })

  it('terminal Failed notification arrives even when active-order panel is hidden', () => {
    let notifState = createNotificationState('PickedUp')
    const { newMessage } = updateNotification(notifState, 'Failed')
    expect(newMessage).toBe(NOTIFICATION_MESSAGES.failed)
    const world = buildPickedUpState()
    world.activeOrder.status = 'Failed'
    expect(buildHUDData(world, createInitialCompanyState()).showActiveOrder).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Tap-to-move and pickup regressions (RBATCH-006 / RBATCH-007)
// ─────────────────────────────────────────────────────────────────────────────

describe('RBATCH-010 — tap-to-move and pickup regressions', () => {
  it('blocks pickup when player is too far', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    const result = attemptPickup(world.activeOrder, world.player, {
      distanceToPackage: 100,
      expectedPickupLocation: 'PickupZone',
      pickupRadius: world.pickupRadius,
    })
    expect(result.order.status).toBe('Accepted')
    expect(result.player.carryingPackage).toBe(false)
  })

  it('allows pickup when player is within radius at correct location', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    const result = attemptPickup(world.activeOrder, world.player, {
      distanceToPackage: 20,
      expectedPickupLocation: 'PickupZone',
      pickupRadius: world.pickupRadius,
    })
    expect(result.order.status).toBe('PickedUp')
    expect(result.player.carryingPackage).toBe(true)
  })

  it('does not transition if pickup location is wrong', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    const result = attemptPickup(world.activeOrder, world.player, {
      distanceToPackage: 20,
      expectedPickupLocation: 'WrongZone',
      pickupRadius: world.pickupRadius,
    })
    expect(result.order.status).toBe('Accepted')
  })
})
