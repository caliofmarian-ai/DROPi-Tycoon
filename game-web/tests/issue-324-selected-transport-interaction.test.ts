import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { performUrbanInteraction } from '../src/systems/urbanInteractions'

/** Regression: Action previously normalized every non-bicycle transport back to Walking. */
describe('#324 interaction transport preservation', () => {
  it.each([
    ['scooter', 'ElectricScooter'],
    ['motorcycle', 'Motorcycle'],
    ['van', 'DeliveryVan'],
  ] as const)('keeps owned %s selected when Action is used away from an objective', (transport, typeId) => {
    const company = createInitialCompanyState()
    company.vehicles = [{ vehicleId: `owned-${transport}`, typeId }]
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: transport }
    world.player.x = 3000
    world.player.y = 2200

    const result = performUrbanInteraction(world, company)
    expect(result.world.urban?.activeTransport).toBe(transport)
  })
})
