import { describe, expect, it } from 'vitest'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import {
  createNotificationState,
  updateNotification,
} from '../src/ui/NotificationController'

const transition = (
  from: 'Available' | 'Accepted' | 'PickedUp',
  to: 'Accepted' | 'PickedUp' | 'Completed',
  sequence: number,
): string | null => {
  const order = createOrderForSequence(sequence)
  const state = createNotificationState(from)
  return updateNotification(state, to, order).newMessage
}

describe('generated-order contextual notifications', () => {
  it('names the generated pickup location on acceptance', () => {
    expect(transition('Available', 'Accepted', 2)).toBe(
      'Order accepted! Head to CommercialPickup.',
    )
  })

  it('names DeliveryPoint when the generated route targets DeliveryPoint', () => {
    expect(transition('Accepted', 'PickedUp', 2)).toBe(
      'Package collected! Deliver to DeliveryPoint.',
    )
  })

  it('names DeliveryZone for a route targeting DeliveryZone', () => {
    expect(transition('Accepted', 'PickedUp', 3)).toBe(
      'Package collected! Deliver to DeliveryZone.',
    )
  })

  it('uses the actual order reward in completion feedback', () => {
    expect(transition('PickedUp', 'Completed', 1)).toBe(
      'Delivery successful +100 money',
    )
  })
})
