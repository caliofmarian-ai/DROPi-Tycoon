import type { OrderStatus } from '../types/game'

/**
 * Canonical notification messages for delivery lifecycle transitions.
 * These are the player-facing feedback strings required by REQ-105..REQ-108.
 */
export const NOTIFICATION_MESSAGES = {
  accepted: 'Order accepted! Head to the pickup zone.',
  pickedUp: 'Package collected! Deliver to DeliveryZone.',
  completed: 'Delivery successful +100 money',
  failed: 'Delivery failed. Reputation \u22125.',
} as const

/**
 * Returns the notification message for a canonical state transition, or null for
 * non-notifiable or invalid transitions. Pure function — no Phaser dependency.
 *
 * Covered transitions:
 *   Available  → Accepted  : order accepted
 *   Accepted   → PickedUp  : package collected
 *   PickedUp   → Completed : delivery successful
 *   PickedUp   → Failed    : delivery failed
 */
export const notificationForTransition = (from: OrderStatus, to: OrderStatus): string | null => {
  if (from === 'Available' && to === 'Accepted') return NOTIFICATION_MESSAGES.accepted
  if (from === 'Accepted' && to === 'PickedUp') return NOTIFICATION_MESSAGES.pickedUp
  if (from === 'PickedUp' && to === 'Completed') return NOTIFICATION_MESSAGES.completed
  if (from === 'PickedUp' && to === 'Failed') return NOTIFICATION_MESSAGES.failed
  return null
}

export interface NotificationState {
  /** The message currently queued for display, or null when none. */
  message: string | null
  /** Whether a notification is active and should be displayed. */
  active: boolean
  /**
   * The last order status observed by the controller.
   * Transitions are detected by comparing incoming status to this field.
   */
  trackedStatus: OrderStatus
}

/**
 * Create the initial notification state for a given starting order status.
 */
export const createNotificationState = (initialStatus: OrderStatus): NotificationState => ({
  message: null,
  active: false,
  trackedStatus: initialStatus,
})

/**
 * Advance notification state when the order status may have changed.
 *
 * - If `newStatus` equals the currently tracked status, no new notification is
 *   produced (idempotent — safe to call on every update frame).
 * - If `newStatus` is a canonical notifiable transition target, a new message is
 *   produced and the tracked status advances.
 * - If `newStatus` is different but no notification is defined for the transition,
 *   the tracked status advances without a message.
 *
 * Returns `{ state, newMessage }`.  `newMessage` is non-null only when a
 * notification should be displayed.
 */
export const updateNotification = (
  current: NotificationState,
  newStatus: OrderStatus,
): { state: NotificationState; newMessage: string | null } => {
  if (newStatus === current.trackedStatus) {
    return { state: current, newMessage: null }
  }
  const message = notificationForTransition(current.trackedStatus, newStatus)
  return {
    state: {
      message,
      active: message !== null,
      trackedStatus: newStatus,
    },
    newMessage: message,
  }
}

/**
 * Clears the active notification (e.g. after the display timer expires).
 */
export const clearNotification = (current: NotificationState): NotificationState => ({
  ...current,
  message: null,
  active: false,
})
