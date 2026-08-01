import { describe, expect, it } from 'vitest'
import { createInitialWorldState } from '../src/state/gameState'
import {
  attemptDelivery,
  attemptPickup,
  flagAcceptRequested,
  requestOrderAcceptance,
  transitionCreatedToAvailable,
} from '../src/systems/orderSystem'

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
      selectedDestination: 'WrongZone',
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
      selectedDestination: 'WrongZone',
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
      selectedDestination: 'WrongZone',
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

  it('delivery with unfulfilled order conditions is rejected', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, {
      ...validDeliveryContext(state),
      orderConditionsMet: false,
    })
    expect(result.order.status).toBe('PickedUp')
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

  it('no reward, Money, or reputation fields are introduced by delivery', () => {
    const state = buildPickedUpState()
    const result = attemptDelivery(state.activeOrder, state.player, validDeliveryContext(state))
    expect(result.order).not.toHaveProperty('reward')
    expect(result.order).not.toHaveProperty('money')
    expect(result.order).not.toHaveProperty('reputation')
    expect(result.player).not.toHaveProperty('money')
    expect(result.player).not.toHaveProperty('reputation')
  })
})
