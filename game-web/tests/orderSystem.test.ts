import { describe, expect, it } from 'vitest'
import { createInitialWorldState } from '../src/state/gameState'
import {
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
