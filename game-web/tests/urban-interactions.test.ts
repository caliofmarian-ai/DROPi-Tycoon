import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { BICYCLE_ORDER_ROUTE_TEMPLATES, createOrderForSequence, ORDER_ROUTE_TEMPLATES } from '../src/systems/orderGeneration'
import {
  getUrbanCargo, getUrbanDeliveryMission, getUrbanObjective, getUrbanOrderListing,
  getUrbanRouteDistance, isUrbanRouteWithinTransportRange, performUrbanInteraction, URBAN_MERCHANT_PROFILES,
} from '../src/systems/urbanInteractions'
import { isCargoLoad, isDeliveryMission } from '../src/systems/urbanLogistics'
import { LOCAL_LISTING, LOCAL_MERCHANT, prepareMarketplaceOrder } from '../src/systems/urbanMarketplace'
import { findWorldRoutePoint } from '../src/world/worldLayout'
import { CITY_MERCHANTS, CITY_ROAD_NETWORK, findCityRoute, getCityRouteDistance } from '../src/world/city'
import { findRoadRoute } from '../src/world/cityNavigation'
import { inInteractionRange, isUrbanWalkable, moveUrbanPlayer, URBAN_HQ, URBAN_MERCHANT } from '../src/world/urbanWorld'
import { getHQGrowth, HQ_EXPANSION_POINT } from '../src/world/urbanPresentation'
import type { WorldState } from '../src/types/game'

const walkTo = (source: WorldState, ...waypoints: { x: number; y: number }[]): WorldState => {
  const world = { ...source, player: { ...source.player } }
  for (const target of waypoints) {
    let steps = 0
    while (Math.hypot(target.x - world.player.x, target.y - world.player.y) > 8 && steps++ < 2000) {
      Object.assign(world.player, moveUrbanPlayer(
        world.player,
        { x: target.x - world.player.x, y: target.y - world.player.y },
        0.05, 150,
      ))
    }
    expect(steps).toBeLessThan(2000)
  }
  return world
}

describe('pure urban merchant listings and physical logistics', () => {
  it('grows HQ equipment and staffing from company state without granting assets', () => {
    const company = createInitialCompanyState()
    expect(getHQGrowth(company)).toEqual({ level: 1, tier: 1, staffCount: 0, ownsBicycle: false })
    company.level = 3
    company.employees.push({
      employeeId: 'hq-courier', name: 'Rae', role: 'Courier', status: 'Active', salaryPerCycle: 10,
    })
    company.vehicles.push({ vehicleId: 'hq-bicycle', typeId: 'Bicycle' })
    const before = structuredClone(company)
    expect(getHQGrowth(company)).toEqual({ level: 3, tier: 3, staffCount: 1, ownsBicycle: true })
    expect(company).toEqual(before)
    company.vehicles = []
    company.purchasedUpgradeLevels.Bicycle = 1
    expect(getHQGrowth(company).ownsBicycle).toBe(true)
    company.level = 7
    expect(getHQGrowth(company)).toEqual({ level: 7, tier: 3, staffCount: 1, ownsBicycle: true })
  })

  it('anchors the future droneport marker at HQ without claiming another building footprint', () => {
    expect(HQ_EXPANSION_POINT).toEqual(URBAN_HQ)
    expect(inInteractionRange(HQ_EXPANSION_POINT, URBAN_HQ, 160)).toBe(true)
    expect(isUrbanWalkable(HQ_EXPANSION_POINT.x, HQ_EXPANSION_POINT.y)).toBe(true)
    const reached = walkTo(createInitialWorldState(), HQ_EXPANSION_POINT)
    expect(inInteractionRange(reached.player, HQ_EXPANSION_POINT)).toBe(true)
  })

  it('links a real merchant actor/profile/listing to demand only after the in-world introduction', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    expect(getUrbanOrderListing(world)).toBeNull()
    expect(performUrbanInteraction(world, company).world.activeOrder.status).toBe('Available')
    const introduced = performUrbanInteraction(
      { ...world, player: { ...world.player, ...URBAN_MERCHANT } }, company,
    )
    const listing = getUrbanOrderListing(introduced.world)!
    expect(listing.merchantProfileId).toBe('mara-market')
    expect(listing.merchant.worldActorId).toBe(LOCAL_MERCHANT.npcId)
    expect(listing.listingId).toBe(LOCAL_LISTING.listingId)
    expect(listing.orderId).toBe(world.activeOrder.orderId)
    expect(listing.pickupLocation).toBe(listing.merchant.pickupLocation)
    expect(listing.reward).toBe(world.activeOrder.reward)
    expect(findWorldRoutePoint(listing.pickupLocation)?.kind).toBe('pickup')
    expect(introduced.world.activeOrder.status).toBe('Available')
  })

  it.each([1, 2, 3])('links offer %i to its physical merchant while preserving both endpoints', sequence => {
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.activeOrder = createOrderForSequence(sequence)
    const original = structuredClone(world.activeOrder)
    const listing = getUrbanOrderListing(world)!
    expect(URBAN_MERCHANT_PROFILES).toContain(listing.merchant)
    expect(listing.pickupLocation).toBe(original.pickupLocation)
    expect(listing.destination).toBe(world.activeOrder.destination)
    expect(listing.merchant.worldActorId).toBe(sequence === 1 ? LOCAL_MERCHANT.npcId : `merchant:${original.pickupLocation}`)
    expect(world.activeOrder).toEqual(original)
    expect(prepareMarketplaceOrder(world)).toMatchObject({
      orderId: original.orderId, reward: original.reward, destination: original.destination,
      pickupLocation: original.pickupLocation,
    })
    expect(getUrbanRouteDistance(world)).toBe([1040, 260, 60][sequence - 1])
    expect(isUrbanRouteWithinTransportRange(world)).toBe(true)
  })

  it('rejects unknown merchants rather than silently replacing them, and rejects invalid destinations', () => {
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.activeOrder.pickupLocation = 'DigitalOnlyMerchant'
    expect(getUrbanOrderListing(world)).toBeNull()
    const accepted = performUrbanInteraction(world, createInitialCompanyState())
    expect(accepted.world.activeOrder.status).toBe('Available')
    expect(accepted.world.activeOrder.pickupLocation).toBe('DigitalOnlyMerchant')
    world.activeOrder.pickupLocation = LOCAL_MERCHANT.pickupLocation
    world.activeOrder.destination = 'CommercialPickup'
    expect(getUrbanOrderListing(world)).toBeNull()
    expect(isUrbanRouteWithinTransportRange(world)).toBe(false)
    expect(performUrbanInteraction(world, createInitialCompanyState()).world.activeOrder.status).toBe('Available')
  })

  it('does not turn fallback map coordinates or another order identity into a valid pickup', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.activeOrder.status = 'Accepted'
    world.player.currentOrder = world.activeOrder.orderId
    Object.assign(world.player, URBAN_MERCHANT)
    world.activeOrder.pickupLocation = 'UnknownPickup'
    expect(performUrbanInteraction(world, company).world.activeOrder.status).toBe('Accepted')
    world.activeOrder.pickupLocation = 'PickupZone'
    world.player.currentOrder = 'ORDER-999'
    expect(performUrbanInteraction(world, company).world.player.carryingPackage).toBe(false)
  })

  it('walks the connected streets through introduction, HQ acceptance, pickup and paid delivery', () => {
    const company = createInitialCompanyState()
    let world = createInitialWorldState()
    world = walkTo(world, { x: 800, y: 270 }, { x: 800, y: 910 }, URBAN_MERCHANT)
    world = performUrbanInteraction(world, company).world
    expect(world.urban?.merchantOnboarded).toBe(true)
    world = walkTo(world, { x: 800, y: 910 }, { x: 800, y: 270 }, URBAN_HQ)
    world = performUrbanInteraction(world, company).world
    expect(world.activeOrder.status).toBe('Accepted')
    expect(getUrbanCargo(world).parcels).toHaveLength(0)
    world = walkTo(world, { x: 800, y: 270 }, { x: 800, y: 910 }, URBAN_MERCHANT)
    expect(world.activeOrder.status).toBe('Accepted')
    world = performUrbanInteraction(world, company).world
    expect(world.activeOrder.status).toBe('PickedUp')
    expect(isCargoLoad(getUrbanCargo(world))).toBe(true)
    expect(getUrbanCargo(world).parcels).toHaveLength(1)
    const mission = getUrbanDeliveryMission(world)
    expect(isDeliveryMission(mission)).toBe(true)
    expect(mission.legs[0].mode).toBe('terrestrial')
    expect(mission.parcels[0].parcelId).toBe(getUrbanCargo(world).parcels[0].parcelId)
    world = walkTo(world, { x: 800, y: 910 }, { x: 800, y: 290 }, findWorldRoutePoint(world.activeOrder.destination)!)
    expect(world.activeOrder.status).toBe('PickedUp')
    const delivered = performUrbanInteraction(world, company)
    expect(delivered.settled).toBe(true)
    expect(delivered.company.money).toBe(company.money + world.activeOrder.reward)
    expect(getUrbanCargo(delivered.world).parcels).toHaveLength(0)
    expect(getUrbanOrderListing(delivered.world)?.orderId).not.toBe(mission.orderId)
  })

  it('rejects duplicate cargo at pickup and missing cargo at delivery', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.activeOrder.status = 'Accepted'
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = true
    Object.assign(world.player, URBAN_MERCHANT)
    const duplicate = performUrbanInteraction(world, company)
    expect(duplicate.world.activeOrder.status).toBe('Accepted')
    world.activeOrder.status = 'PickedUp'
    world.player.carryingPackage = false
    Object.assign(world.player, findWorldRoutePoint(world.activeOrder.destination))
    const missing = performUrbanInteraction(world, company)
    expect(missing.settled).toBe(false)
    expect(missing.company.money).toBe(company.money)
  })

  it.each(CITY_MERCHANTS)('walks to $name and its customer through the paid marketplace loop', merchant => {
    const sequence = ORDER_ROUTE_TEMPLATES.findIndex(route => route.pickupLocation === merchant.pickupLocation) + 1
    expect(sequence).toBeGreaterThan(0)
    const company = createInitialCompanyState()
    let world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.activeOrder = createOrderForSequence(sequence)
    const order = { ...world.activeOrder }
    world = performUrbanInteraction(world, company).world
    expect(world.activeOrder.status).toBe('Accepted')
    const approach = findRoadRoute(CITY_ROAD_NETWORK, URBAN_HQ, merchant.position)!
    world = walkTo(world, ...approach.points)
    const picked = performUrbanInteraction(world, company)
    expect(picked.world.activeOrder.status).toBe('PickedUp')
    expect(getUrbanOrderListing(picked.world)?.merchantProfileId).toBe(merchant.merchantId)
    const customer = findWorldRoutePoint(order.destination)!
    expect(getUrbanObjective(picked.world).title).toContain(customer.displayName)
    const route = findCityRoute(order.pickupLocation, order.destination)!
    world = walkTo(picked.world, ...route.points)
    const delivered = performUrbanInteraction(world, company)
    expect(delivered.settled).toBe(true)
    expect(delivered.company.money).toBe(company.money + order.reward)
    expect(delivered.company.reviews).toHaveLength(1)
    expect(delivered.world.player.carryingPackage).toBe(false)
    expect(delivered.world.activeOrder.pickupLocation).not.toBe(order.pickupLocation)
    expect(delivered.world.activeOrder.destination).not.toBe(order.destination)
    const duplicate = performUrbanInteraction(delivered.world, delivered.company)
    expect(duplicate.settled).toBe(false)
    expect(duplicate.company.money).toBe(delivered.company.money)
  })

  it('does not settle cargo from an unknown physical merchant', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.activeOrder.status = 'PickedUp'
    world.activeOrder.pickupLocation = 'missing-shop'
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = true
    Object.assign(world.player, findWorldRoutePoint(world.activeOrder.destination))
    const before = structuredClone(world)
    const result = performUrbanInteraction(world, company)
    expect(result.settled).toBe(false)
    expect(result.world.activeOrder.status).toBe('PickedUp')
    expect(result.world.player.carryingPackage).toBe(true)
    expect(result.company).toEqual(company)
    expect(world).toEqual(before)
  })

  it('lets restored legitimate cargo finish before onboarding even after parking a bicycle', () => {
    const sequence = BICYCLE_ORDER_ROUTE_TEMPLATES.findIndex(route =>
      getCityRouteDistance(route.pickupLocation, route.destination) > 1800) + 1
    expect(sequence).toBeGreaterThan(0)
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.activeOrder = { ...createOrderForSequence(sequence, 'bicycle'), status: 'PickedUp' }
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = true
    Object.assign(world.player, findWorldRoutePoint(world.activeOrder.destination))
    expect(isUrbanRouteWithinTransportRange(world)).toBe(false)
    const result = performUrbanInteraction(world, company)
    expect(result.settled).toBe(true)
    expect(result.company.money).toBe(company.money + world.activeOrder.reward)
    expect(result.world.urban?.merchantOnboarded).toBe(false)
    expect(result.world.activeOrder.status).toBe('Available')
  })
})
