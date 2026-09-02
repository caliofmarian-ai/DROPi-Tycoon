import type { OrderState, OrderStatus } from '../types/game'

/**
 * Canonical fallback notification messages for delivery lifecycle transitions.
 * Context-aware scene calls can substitute the current pickup/destination/reward.
 */
export const NOTIFICATION_MESSAGES = {
  accepted: 'Order accepted! Head to the pickup zone.',
  pickedUp: 'Package collected! Deliver to DeliveryZone.',
  completed: 'Delivery successful +100 money',
  failed: 'Delivery failed. Reputation \u22125.',
} as const

export type NotificationOrderContext = Pick<
  OrderState,
  'pickupLocation' | 'destination' | 'reward'
>

export const notificationForTransition = (from: OrderStatus, to: OrderStatus): string | null => {
  if (from === 'Available' && to === 'Accepted') return NOTIFICATION_MESSAGES.accepted
  if (from === 'Accepted' && to === 'PickedUp') return NOTIFICATION_MESSAGES.pickedUp
  if (from === 'PickedUp' && to === 'Completed') return NOTIFICATION_MESSAGES.completed
  if (from === 'PickedUp' && to === 'Failed') return NOTIFICATION_MESSAGES.failed
  return null
}

export const notificationForOrderTransition = (
  from: OrderStatus,
  to: OrderStatus,
  order?: NotificationOrderContext,
): string | null => {
  if (!order) return notificationForTransition(from, to)
  if (from === 'Available' && to === 'Accepted') {
    return `Order accepted! Head to ${order.pickupLocation}.`
  }
  if (from === 'Accepted' && to === 'PickedUp') {
    return `Package collected! Deliver to ${order.destination}.`
  }
  if (from === 'PickedUp' && to === 'Completed') {
    return `Delivery successful +${order.reward} money`
  }
  if (from === 'PickedUp' && to === 'Failed') return NOTIFICATION_MESSAGES.failed
  return null
}

export interface NotificationState {
  message: string | null
  active: boolean
  trackedStatus: OrderStatus
}

export const createNotificationState = (initialStatus: OrderStatus): NotificationState => ({
  message: null,
  active: false,
  trackedStatus: initialStatus,
})

export const updateNotification = (
  current: NotificationState,
  newStatus: OrderStatus,
  order?: NotificationOrderContext,
): { state: NotificationState; newMessage: string | null } => {
  if (newStatus === current.trackedStatus) {
    return { state: current, newMessage: null }
  }
  const message = notificationForOrderTransition(current.trackedStatus, newStatus, order)
  return {
    state: {
      message,
      active: message !== null,
      trackedStatus: newStatus,
    },
    newMessage: message,
  }
}

export const clearNotification = (current: NotificationState): NotificationState => ({
  ...current,
  message: null,
  active: false,
})
