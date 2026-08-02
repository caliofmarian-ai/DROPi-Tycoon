import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import {
  attemptDelivery,
  attemptPickup,
  flagAcceptRequested,
  requestOrderAcceptance,
  transitionCreatedToAvailable,
} from '../src/systems/orderSystem'
import { canAfford, settleDeliveryOutcome } from '../src/systems/economySettlement'
import { selectDeliveryIntentFromTap } from '../src/utils/deliveryIntent'

describe('order system', () => {
  it('allows Created to Available', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Created'

    expect(transitionCreatedToAvailable(state.activeOrder).status).toBe('Available')
  })

  it('blocks acceptance when order is not Available', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Created'
    state.activeOrder.acceptRequested = true

    const accepted = requestOrderAcceptance(state.activeOrder, state.player)

    expect(accepted.order.status).toBe('Created')
    expect(accepted.player.currentOrder).toBe('')
  })

  it('requires accept request before Available to Accepted', () => {
    const state = createInitialWorldState()

    const accepted = requestOrderAcceptance(state.activeOrder, state.player)

    expect(accepted.order.status).toBe('Available')
    expect(accepted.order.acceptRequested).toBe(false)
  })

  it('accepts order only through the allowed transition', () => {
    const state = createInitialWorldState()

    state.activeOrder = flagAcceptRequested(state.activeOrder)
    const accepted = requestOrderAcceptance(state.activeOrder, state.player)

    expect(accepted.order.status).toBe('Accepted')
    expect(accepted.order.acceptRequested).toBe(false)
    expect(accepted.player.currentOrder).toBe('ORDER-001')
  })

  it('blocks pickup when player is too far away', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Accepted'

    const pickedUp = attemptPickup(state.activeOrder, state.player, {
      distanceToPackage: 64,
      expectedPickupLocation: 'PickupZone',
      pickupRadius: state.pickupRadius,
    })

    expect(pickedUp.order.status).toBe('Accepted')
    expect(pickedUp.player.carryingPackage).toBe(false)
  })

  it('blocks pickup when pickup location is not the approved one', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Accepted'

    const pickedUp = attemptPickup(state.activeOrder, state.player, {
      distanceToPackage: 16,
      expectedPickupLocation: 'WrongZone',
      pickupRadius: state.pickupRadius,
    })

    expect(pickedUp.order.status).toBe('Accepted')
    expect(pickedUp.player.carryingPackage).toBe(false)
  })

  it('updates CarryingPackage on Accepted to PickedUp', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Accepted'

    const pickedUp = attemptPickup(state.activeOrder, state.player, {
      distanceToPackage: 16,
      expectedPickupLocation: 'PickupZone',
      pickupRadius: state.pickupRadius,
    })

    expect(pickedUp.order.status).toBe('PickedUp')
    expect(pickedUp.player.carryingPackage).toBe(true)
  })

  it('protects terminal states from outbound transitions', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Completed'

    const pickedUp = attemptPickup(state.activeOrder, state.player, {
      distanceToPackage: 16,
      expectedPickupLocation: 'PickupZone',
      pickupRadius: state.pickupRadius,
    })

    expect(pickedUp.order.status).toBe('Completed')
    expect(pickedUp.player.carryingPackage).toBe(false)
  })

  it('does not auto-complete after pickup', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Accepted'

    const pickedUp = attemptPickup(state.activeOrder, state.player, {
      distanceToPackage: 16,
      expectedPickupLocation: 'PickupZone',
      pickupRadius: state.pickupRadius,
    })

    expect(pickedUp.order.status).not.toBe('Completed')
    expect(pickedUp.order.status).toBe('PickedUp')
  })
})

// Helper to build a PickedUp world state ready for delivery tests
const buildPickedUpState = () => {
  const state = createInitialWorldState()
  state.activeOrder.status = 'PickedUp'
  state.player.carryingPackage = true
  state.player.currentOrder = state.activeOrder.orderId
  return state
}

const validDeliveryContext = (state: ReturnType<typeof buildPickedUpState>) => ({
  selectedDestination: state.activeOrder.destination,
  distanceToDestination: 16,
  deliveryRadius: state.deliveryRadius,
  orderConditionsMet: true,
})

describe('delivery system — BATCH-008', () => {
  it('correct destination changes PickedUp to Completed', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.order.status).toBe('Completed')
  })

  it('wrong destination changes PickedUp to Failed', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      selectedDestination: 'DeliveryPoint',
    })
    expect(result.order.status).toBe('Failed')
  })

  it('successful completion clears CarryingPackage', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.player.carryingPackage).toBe(false)
  })

  it('failure clears CarryingPackage', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      selectedDestination: 'DeliveryPoint',
    })
    expect(result.player.carryingPackage).toBe(false)
  })

  it('completion clears currentOrder reference', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.player.currentOrder).toBe('')
  })

  it('failure clears currentOrder reference', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      selectedDestination: 'DeliveryPoint',
    })
    expect(result.player.currentOrder).toBe('')
  })

  it('delivery outside radius leaves order PickedUp', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      distanceToDestination: 200,
    })
    expect(result.order.status).toBe('PickedUp')
    expect(result.player.carryingPackage).toBe(true)
  })

  it('delivery with mismatched currentOrder is rejected', () => {
    const state = buildPickedUpState()
    state.player.currentOrder = 'DIFFERENT-ORDER'
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.order.status).toBe('PickedUp')
  })

  it('delivery without carried package is rejected', () => {
    const state = buildPickedUpState()
    state.player.carryingPackage = false
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.order.status).toBe('PickedUp')
  })

  it('delivery before PickedUp is rejected', () => {
    const state = createInitialWorldState()
    state.activeOrder.status = 'Accepted'
    state.player.carryingPackage = false
    state.player.currentOrder = state.activeOrder.orderId
    const result = attemptDelivery(state.activeOrder, state.player, {
      selectedDestination: state.activeOrder.destination,
      distanceToDestination: 16,
      deliveryRadius: state.deliveryRadius,
      orderConditionsMet: true,
    })
    expect(result.order.status).toBe('Accepted')
  })

  it('delivery with unfulfilled order conditions or empty selected destination is rejected', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      orderConditionsMet: false,
    })
    expect(result.order.status).toBe('PickedUp')
    expect(result.player.carryingPackage).toBe(true)
    expect(result.player.currentOrder).toBe(state.activeOrder.orderId)

    const emptyDestinationResult = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      selectedDestination: '   ',
    })
    expect(emptyDestinationResult.order.status).toBe('PickedUp')
    expect(emptyDestinationResult.player.carryingPackage).toBe(true)
    expect(emptyDestinationResult.player.currentOrder).toBe(state.activeOrder.orderId)
  })

  it('Completed cannot transition again', () => {
    const state = buildPickedUpState()
    state.activeOrder.status = 'Completed'
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.order.status).toBe('Completed')
  })

  it('Failed cannot transition again', () => {
    const state = buildPickedUpState()
    state.activeOrder.status = 'Failed'
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      selectedDestination: state.activeOrder.destination,
    })
    expect(result.order.status).toBe('Failed')
  })

  it('reward field is present on order and equals canonical value', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.order).toHaveProperty('reward', BALANCING.ORDER_REWARD)
    expect(result.player).not.toHaveProperty('money')
    expect(result.player).not.toHaveProperty('reputation')
  })

  it('delivery exactly at radius boundary (distance === deliveryRadius) completes order', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      distanceToDestination: state.deliveryRadius,
    })
    expect(result.order.status).toBe('Completed')
  })
})

const DELIVERY_POINTS_TEST = [
  { x: 120, y: 490, label: 'PickupZone' },
  { x: 580, y: 470, label: 'DeliveryZone' },
  { x: 660, y: 510, label: 'DeliveryPoint' },
]
const TAP_RADIUS = 36

describe('delivery intent selection — stale intent', () => {
  it('tapping a delivery marker registers that marker as intent', () => {
    const intent = selectDeliveryIntentFromTap(580, 470, DELIVERY_POINTS_TEST, TAP_RADIUS)
    expect(intent).toBe('DeliveryZone')
  })

  it('tapping ordinary ground returns empty string (no intent)', () => {
    const intent = selectDeliveryIntentFromTap(300, 300, DELIVERY_POINTS_TEST, TAP_RADIUS)
    expect(intent).toBe('')
  })

  it('tapping ordinary ground after a marker clears previous intent', () => {
    let intent = selectDeliveryIntentFromTap(580, 470, DELIVERY_POINTS_TEST, TAP_RADIUS)
    expect(intent).toBe('DeliveryZone')
    intent = selectDeliveryIntentFromTap(300, 300, DELIVERY_POINTS_TEST, TAP_RADIUS)
    expect(intent).toBe('')
  })

  it('tapping PickupZone does not register delivery intent', () => {
    const intent = selectDeliveryIntentFromTap(120, 490, DELIVERY_POINTS_TEST, TAP_RADIUS)
    expect(intent).toBe('')
  })

  it('tapping exactly at the tap radius boundary registers the marker', () => {
    const intent = selectDeliveryIntentFromTap(580 + TAP_RADIUS, 470, DELIVERY_POINTS_TEST, TAP_RADIUS)
    expect(intent).toBe('DeliveryZone')
  })

  it('tapping just outside the tap radius boundary does not register the marker', () => {
    const intent = selectDeliveryIntentFromTap(580 + TAP_RADIUS + 1, 470, DELIVERY_POINTS_TEST, TAP_RADIUS)
    expect(intent).toBe('')
  })
})

// ─── RBATCH-009: Economy settlement tests ───────────────────────────────────

const buildPickedUpOrder = () => {
  const state = createInitialWorldState()
  state.activeOrder.status = 'PickedUp'
  return state.activeOrder
}

const freshCompany = () => createInitialCompanyState()

describe('RBATCH-009 — initial state', () => {
  it('initial company money is 0', () => {
    expect(freshCompany().money).toBe(0)
  })

  it('initial reputation is 50', () => {
    expect(freshCompany().reputation).toBe(50)
  })

  it('initial order reward is 100', () => {
    expect(buildPickedUpOrder().reward).toBe(100)
  })
})

describe('RBATCH-009 — successful delivery settlement', () => {
  it('PickedUp to Completed adds 100 money', () => {
    const order = buildPickedUpOrder()
    const company = freshCompany()
    const result = settleDeliveryOutcome('PickedUp', 'Completed', order, company)
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.money).toBe(100)
    }
  })

  it('PickedUp to Completed changes reputation from 50 to 52', () => {
    const order = buildPickedUpOrder()
    const company = freshCompany()
    const result = settleDeliveryOutcome('PickedUp', 'Completed', order, company)
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.reputation).toBe(52)
    }
  })

  it('reputation clamps at 100 on success', () => {
    const order = buildPickedUpOrder()
    const result = settleDeliveryOutcome('PickedUp', 'Completed', order, { money: 0, reputation: 99 })
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.reputation).toBe(100)
    }
  })

  it('reputation does not exceed 100 when already at max', () => {
    const order = buildPickedUpOrder()
    const result = settleDeliveryOutcome('PickedUp', 'Completed', order, { money: 0, reputation: 100 })
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.reputation).toBe(100)
    }
  })
})

describe('RBATCH-009 — failed delivery settlement', () => {
  it('PickedUp to Failed leaves money at 0', () => {
    const order = buildPickedUpOrder()
    const company = freshCompany()
    const result = settleDeliveryOutcome('PickedUp', 'Failed', order, company)
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.money).toBe(0)
    }
  })

  it('PickedUp to Failed changes reputation from 50 to 45', () => {
    const order = buildPickedUpOrder()
    const company = freshCompany()
    const result = settleDeliveryOutcome('PickedUp', 'Failed', order, company)
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.reputation).toBe(45)
    }
  })

  it('failure never makes money negative', () => {
    const order = buildPickedUpOrder()
    const result = settleDeliveryOutcome('PickedUp', 'Failed', order, { money: 0, reputation: 50 })
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.money).toBeGreaterThanOrEqual(0)
    }
  })

  it('reputation clamps at 0 on failure', () => {
    const order = buildPickedUpOrder()
    const result = settleDeliveryOutcome('PickedUp', 'Failed', order, { money: 0, reputation: 3 })
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.reputation).toBe(0)
    }
  })

  it('reputation does not go below 0 when already at zero', () => {
    const order = buildPickedUpOrder()
    const result = settleDeliveryOutcome('PickedUp', 'Failed', order, { money: 0, reputation: 0 })
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.reputation).toBe(0)
    }
  })
})

describe('RBATCH-009 — non-terminal transitions do not change economy', () => {
  const statuses: Array<'Created' | 'Available' | 'Accepted' | 'PickedUp'> = [
    'Created', 'Available', 'Accepted', 'PickedUp',
  ]

  for (const status of statuses) {
    it(`${status} without terminal target does not apply settlement`, () => {
      const order = { ...buildPickedUpOrder(), status }
      const company = freshCompany()
      const result = settleDeliveryOutcome(status as any, 'PickedUp' as any, order, company)
      expect(result.applied).toBe(false)
    })
  }

  it('Completed cannot generate another settlement', () => {
    const order = { ...buildPickedUpOrder(), status: 'Completed' as const }
    const result = settleDeliveryOutcome('Completed', 'Completed', order, freshCompany())
    expect(result.applied).toBe(false)
  })

  it('Failed cannot generate another settlement', () => {
    const order = { ...buildPickedUpOrder(), status: 'Failed' as const }
    const result = settleDeliveryOutcome('Failed', 'Completed', order, freshCompany())
    expect(result.applied).toBe(false)
  })

  it('an invalid transition (Available to Completed) does not change economy', () => {
    const order = buildPickedUpOrder()
    const result = settleDeliveryOutcome('Available', 'Completed', order, freshCompany())
    expect(result.applied).toBe(false)
  })
})

describe('RBATCH-009 — repeated-frame safety', () => {
  it('calling settleDeliveryOutcome with the same terminal transition a second time does not apply', () => {
    const order = buildPickedUpOrder()
    const company = freshCompany()
    // First settlement
    const first = settleDeliveryOutcome('PickedUp', 'Completed', order, company)
    expect(first.applied).toBe(true)

    // Simulating a second call using the now-terminal order (status is already Completed)
    const terminalOrder = { ...order, status: 'Completed' as const }
    const second = settleDeliveryOutcome('Completed', 'Completed', terminalOrder, first.applied ? first.company : company)
    expect(second.applied).toBe(false)
  })
})

describe('RBATCH-009 — affordability helper', () => {
  it('returns true when money equals cost', () => {
    expect(canAfford(100, 100)).toBe(true)
  })

  it('returns true when money exceeds cost', () => {
    expect(canAfford(150, 100)).toBe(true)
  })

  it('returns false when money is below cost', () => {
    expect(canAfford(50, 100)).toBe(false)
  })

  it('returns false for negative money', () => {
    expect(canAfford(-1, 0)).toBe(false)
  })

  it('returns false for NaN money', () => {
    expect(canAfford(NaN, 100)).toBe(false)
  })

  it('returns false for Infinity money', () => {
    expect(canAfford(Infinity, 100)).toBe(false)
  })

  it('returns false for NaN cost', () => {
    expect(canAfford(100, NaN)).toBe(false)
  })

  it('returns false for Infinity cost', () => {
    expect(canAfford(100, Infinity)).toBe(false)
  })

  it('returns false for negative cost', () => {
    expect(canAfford(100, -1)).toBe(false)
  })

  it('returns true for zero cost with any non-negative money', () => {
    expect(canAfford(0, 0)).toBe(true)
  })
})

describe('RBATCH-009 — RBATCH-008 delivery behavior preserved', () => {
  it('carryingPackage still clears on successful completion', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.order.status).toBe('Completed')
    expect(result.player.carryingPackage).toBe(false)
  })

  it('carryingPackage still clears on failure', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      selectedDestination: 'DeliveryPoint',
    })
    expect(result.order.status).toBe('Failed')
    expect(result.player.carryingPackage).toBe(false)
  })

  it('currentOrder still clears on completion', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.player.currentOrder).toBe('')
  })

  it('currentOrder still clears on failure', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      selectedDestination: 'DeliveryPoint',
    })
    expect(result.player.currentOrder).toBe('')
  })
})
