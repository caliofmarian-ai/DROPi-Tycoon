import type { OrderState, PickupContext, PlayerState } from '../types/game'

export const transitionCreatedToAvailable = (order: OrderState): OrderState =>
  order.status === 'Created' ? { ...order, status: 'Available' } : order

export const requestOrderAcceptance = (
  order: OrderState,
  player: PlayerState,
): { order: OrderState; player: PlayerState } => {
  if (order.status !== 'Available' || !order.acceptRequested) {
    return { order, player }
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
