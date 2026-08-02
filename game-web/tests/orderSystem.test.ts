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
  state.activeOrder.economySettled = false
  return state.activeOrder
}

const freshCompany = () => createInitialCompanyState()

const buildCompletedOrder = (order: ReturnType<typeof buildPickedUpOrder>) => ({
  ...order,
  status: 'Completed' as const,
  economySettled: false,
})

const buildFailedOrder = (order: ReturnType<typeof buildPickedUpOrder>) => ({
  ...order,
  status: 'Failed' as const,
  economySettled: false,
})

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
  it('settlement inputs are not mutated', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildCompletedOrder(previousOrder)
    const company = freshCompany()
    const previousSnapshot = { ...previousOrder }
    const nextSnapshot = { ...nextOrder }
    const companySnapshot = { ...company }
    const result = settleDeliveryOutcome(previousOrder, nextOrder, company)
    expect(result.applied).toBe(true)
    expect(previousOrder).toEqual(previousSnapshot)
    expect(nextOrder).toEqual(nextSnapshot)
    expect(company).toEqual(companySnapshot)
  })

  it('a valid PickedUp to Completed settlement applies once', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildCompletedOrder(previousOrder)
    const company = freshCompany()
    const result = settleDeliveryOutcome(previousOrder, nextOrder, company)
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.money).toBe(100)
      expect(result.company.reputation).toBe(52)
      expect(result.order.status).toBe('Completed')
      expect(result.order.economySettled).toBe(true)
    }
  })

  it('the same order cannot be settled again after the settled marker is stored', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildCompletedOrder(previousOrder)
    const company = freshCompany()
    const first = settleDeliveryOutcome(previousOrder, nextOrder, company)
    expect(first.applied).toBe(true)
    if (!first.applied) return
    const second = settleDeliveryOutcome(first.order, first.order, first.company)
    expect(second.applied).toBe(false)
  })

  it('repeated integration/update processing cannot pay twice', () => {
    const applySettlementOnTransition = (
      previousOrder: ReturnType<typeof buildPickedUpOrder>,
      deliveredOrder: ReturnType<typeof buildPickedUpOrder>,
      company: ReturnType<typeof freshCompany>,
    ) => {
      if (deliveredOrder.status === previousOrder.status) {
        return { order: deliveredOrder, company }
      }
      const settlement = settleDeliveryOutcome(previousOrder, deliveredOrder, company)
      if (settlement.applied) {
        return { order: settlement.order, company: settlement.company }
      }
      return { order: deliveredOrder, company }
    }

    const initialOrder = buildPickedUpOrder()
    const transitionOrder = buildCompletedOrder(initialOrder)
    const firstFrame = applySettlementOnTransition(initialOrder, transitionOrder, freshCompany())
    const secondFrame = applySettlementOnTransition(
      firstFrame.order,
      firstFrame.order,
      firstFrame.company,
    )
    expect(firstFrame.company.money).toBe(100)
    expect(secondFrame.company.money).toBe(100)
    expect(secondFrame.order.economySettled).toBe(true)
  })

  it('mismatched order.status and transition state are rejected', () => {
    const previousOrder = { ...buildPickedUpOrder(), status: 'Available' as const }
    const nextOrder = buildCompletedOrder(buildPickedUpOrder())
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(false)
  })

  it('mismatched previous-order and next-order IDs are rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = { ...buildCompletedOrder(previousOrder), orderId: 'ORDER-999' }
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(false)
  })

  it('a transition that does not originate from PickedUp is rejected', () => {
    const previousOrder = { ...buildPickedUpOrder(), status: 'Accepted' as const }
    const nextOrder = buildCompletedOrder(buildPickedUpOrder())
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(false)
  })

  it('a non-terminal target is rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = { ...previousOrder, status: 'PickedUp' as const }
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(false)
  })
})

describe('RBATCH-009 — failed delivery settlement', () => {
  it('PickedUp to Failed leaves money at 0 and reputation at 45', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildFailedOrder(previousOrder)
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(true)
    if (!result.applied) return
    expect(result.company.money).toBe(0)
    expect(result.company.reputation).toBe(45)
    expect(result.order.economySettled).toBe(true)
  })

  it('failure never deducts existing money', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildFailedOrder(previousOrder)
    const result = settleDeliveryOutcome(previousOrder, nextOrder, { money: 75, reputation: 50 })
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.money).toBe(75)
    }
  })

  it('reputation clamps at 0 on failure', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildFailedOrder(previousOrder)
    const result = settleDeliveryOutcome(previousOrder, nextOrder, { money: 0, reputation: 3 })
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company.reputation).toBe(0)
    }
  })
})

describe('RBATCH-009 — numeric safety and overflow', () => {
  it('fractional reward is rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = { ...buildCompletedOrder(previousOrder), reward: 0.5 }
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(false)
  })

  it('fractional money is rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildCompletedOrder(previousOrder)
    const result = settleDeliveryOutcome(previousOrder, nextOrder, { money: 0.5, reputation: 50 })
    expect(result.applied).toBe(false)
  })

  it('fractional reputation is rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildCompletedOrder(previousOrder)
    const result = settleDeliveryOutcome(previousOrder, nextOrder, { money: 0, reputation: 50.5 })
    expect(result.applied).toBe(false)
  })

  it('unsafe integers are rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildCompletedOrder(previousOrder)
    const unsafeRewardResult = settleDeliveryOutcome(
      previousOrder,
      { ...nextOrder, reward: Number.MAX_SAFE_INTEGER + 1 },
      freshCompany(),
    )
    const unsafeMoneyResult = settleDeliveryOutcome(previousOrder, nextOrder, {
      money: Number.MAX_SAFE_INTEGER + 1,
      reputation: 50,
    })
    const unsafeReputationResult = settleDeliveryOutcome(previousOrder, nextOrder, {
      money: 0,
      reputation: Number.MAX_SAFE_INTEGER + 1,
    })
    expect(unsafeRewardResult.applied).toBe(false)
    expect(unsafeMoneyResult.applied).toBe(false)
    expect(unsafeReputationResult.applied).toBe(false)
  })

  it('an addition that would exceed Number.MAX_SAFE_INTEGER is rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = { ...buildCompletedOrder(previousOrder), reward: 1 }
    const result = settleDeliveryOutcome(previousOrder, nextOrder, {
      money: Number.MAX_SAFE_INTEGER,
      reputation: 50,
    })
    expect(result.applied).toBe(false)
  })

  it('finite inputs that overflow to Infinity are rejected', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = { ...buildCompletedOrder(previousOrder), reward: Number.MAX_VALUE }
    const result = settleDeliveryOutcome(previousOrder, nextOrder, {
      money: Number.MAX_VALUE,
      reputation: 50,
    })
    expect(result.applied).toBe(false)
  })

  it('no invalid settlement changes company or order state', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = { ...buildCompletedOrder(previousOrder), reward: 0.5 }
    const company = freshCompany()
    const previousSnapshot = { ...previousOrder }
    const nextSnapshot = { ...nextOrder }
    const companySnapshot = { ...company }
    const result = settleDeliveryOutcome(previousOrder, nextOrder, company)
    expect(result.applied).toBe(false)
    expect(previousOrder).toEqual(previousSnapshot)
    expect(nextOrder).toEqual(nextSnapshot)
    expect(company).toEqual(companySnapshot)
  })
})

describe('RBATCH-009 — clamping and canonical outcomes', () => {
  it('success still produces Money 100 and Reputation 52', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildCompletedOrder(previousOrder)
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company).toEqual({ money: 100, reputation: 52 })
    }
  })

  it('failure still produces Money 0 and Reputation 45', () => {
    const previousOrder = buildPickedUpOrder()
    const nextOrder = buildFailedOrder(previousOrder)
    const result = settleDeliveryOutcome(previousOrder, nextOrder, freshCompany())
    expect(result.applied).toBe(true)
    if (result.applied) {
      expect(result.company).toEqual({ money: 0, reputation: 45 })
    }
  })

  it('reputation still clamps at 100 and 0', () => {
    const previousOrder = buildPickedUpOrder()
    const successOrder = buildCompletedOrder(previousOrder)
    const failOrder = buildFailedOrder(previousOrder)
    const successResult = settleDeliveryOutcome(previousOrder, successOrder, { money: 0, reputation: 99 })
    const failResult = settleDeliveryOutcome(previousOrder, failOrder, { money: 0, reputation: 3 })
    expect(successResult.applied).toBe(true)
    expect(failResult.applied).toBe(true)
    if (successResult.applied) {
      expect(successResult.company.reputation).toBe(100)
    }
    if (failResult.applied) {
      expect(failResult.company.reputation).toBe(0)
    }
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
