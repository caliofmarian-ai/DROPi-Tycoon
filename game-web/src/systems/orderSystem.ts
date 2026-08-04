import type { DeliveryContext, OrderState, PickupContext, PlayerState } from '../types/game'

export const transitionCreatedToAvailable = (order: OrderState): OrderState =>
  order.status === 'Created' ? { ...order, status: 'Available' } : order

/**
 * Canonical acceptance eligibility for a specific requested order.
 * Used by both UI visibility and transactional acceptance.
 */
export const isOrderAcceptanceEligible = (
  order: OrderState,
  player: PlayerState,
  requestedOrderId: string,
): boolean =>
  order.status === 'Available' &&
  requestedOrderId === order.orderId &&
  !player.carryingPackage &&
  (player.currentOrder === '' || player.currentOrder === order.orderId)

export const requestOrderAcceptance = (
  order: OrderState,
  player: PlayerState,
  requestedOrderId = order.orderId,
): { order: OrderState; player: PlayerState; accepted: boolean } => {
  if (!order.acceptRequested) {
    return { order, player, accepted: false }
  }

  if (!isOrderAcceptanceEligible(order, player, requestedOrderId)) {
    return {
      order: {
        ...order,
        acceptRequested: false,
      },
      player,
      accepted: false,
    }
  }

  return {
    order: {
      ...order,
      status: 'Accepted',
      acceptRequested: false,
    },
    player: {
      ...player,
      currentOrder: order.orderId,
    },
    accepted: true,
  }
}

export const flagAcceptRequested = (order: OrderState): OrderState =>
  order.status === 'Available' ? { ...order, acceptRequested: true } : order

export const attemptPickup = (
  order: OrderState,
  player: PlayerState,
  context: PickupContext,
): { order: OrderState; player: PlayerState } => {
  const isTerminal = order.status === 'Completed' || order.status === 'Failed'
  const canPickup =
    order.status === 'Accepted' &&
    !isTerminal &&
    !player.carryingPackage &&
    order.pickupLocation === context.expectedPickupLocation &&
    context.distanceToPackage < context.pickupRadius

  if (!canPickup) {
    return { order, player }
  }

  return {
    order: {
      ...order,
      status: 'PickedUp',
    },
    player: {
      ...player,
      carryingPackage: true,
    },
  }
}

export const attemptDelivery = (
  order: OrderState,
  player: PlayerState,
  context: DeliveryContext,
): { order: OrderState; player: PlayerState } => {
  const isTerminal = order.status === 'Completed' || order.status === 'Failed'
  const hasSelectedDestination = context.selectedDestination.trim().length > 0

  const canDeliver =
    order.status === 'PickedUp' &&
    !isTerminal &&
    player.carryingPackage &&
    player.currentOrder === order.orderId &&
    hasSelectedDestination &&
    context.orderConditionsMet &&
    context.distanceToDestination <= context.deliveryRadius

  if (!canDeliver) {
    return { order, player }
  }

  const isCorrectDestination = context.selectedDestination === order.destination

  return {
    order: {
      ...order,
      status: isCorrectDestination ? 'Completed' : 'Failed',
    },
    player: {
      ...player,
      carryingPackage: false,
      currentOrder: '',
    },
  }
}
