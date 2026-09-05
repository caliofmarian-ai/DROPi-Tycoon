import { describe, expect, it, vi } from 'vitest'
import { createInitialWorldState } from '../src/state/gameState'
import { BICYCLE_ORDER_ROUTE_TEMPLATES, createOrderForSequence, ORDER_ROUTE_TEMPLATES } from '../src/systems/orderGeneration'
import {
  cargoForPlayer, LOCAL_MERCHANT, marketplaceMerchant, missionForOrder,
  parcelForOrder, prepareMarketplaceOrder, marketplaceMerchants, MARKETPLACE_LISTINGS,
} from '../src/systems/urbanMarketplace'
import { isDeliveryMission, loadParcel, unloadParcel } from '../src/systems/urbanLogistics'
import { URBAN_MERCHANT } from '../src/world/urbanWorld'
import * as city from '../src/world/city'

describe('physical merchant to digital marketplace', () => {
  it('exposes no listings or dispatchable order until onboarded', () => {
    const world = createInitialWorldState()
    expect(marketplaceMerchant(world)).toMatchObject({ active: false, listings: [] })
    expect(prepareMarketplaceOrder(world)).toBeNull()
    expect(LOCAL_MERCHANT.position).toEqual(URBAN_MERCHANT)
  })

  it('activates the local merchant network without overwriting generated origins', () => {
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    const merchant = marketplaceMerchant(world)
    expect(merchant.listings[0].merchantId).toBe(merchant.merchantId)
    for (let sequence = 1; sequence <= 6; sequence++) {
      world.activeOrder = createOrderForSequence(sequence)
      const before = structuredClone(world)
      const order = prepareMarketplaceOrder(world)!
      expect(order.orderId).toBe(world.activeOrder.orderId)
      expect(order.reward).toBe(world.activeOrder.reward)
      expect(order.pickupLocation).toBe(world.activeOrder.pickupLocation)
      expect(order.destination).toBe(world.activeOrder.destination)
      expect(world).toEqual(before)
      expect(isDeliveryMission(missionForOrder(order, 'walking'))).toBe(true)
    }
  })

  it('does not rewrite accepted work or dispatch unknown destinations', () => {
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.activeOrder.status = 'Accepted'
    expect(prepareMarketplaceOrder(world)).toBeNull()
    world.activeOrder.status = 'Available'
    world.activeOrder.destination = 'unknown-address'
    expect(prepareMarketplaceOrder(world)).toBeNull()
  })

  it('loads and unloads a mission parcel through transport capacity instead of a fixed boolean limit', () => {
    const world = createInitialWorldState()
    const walking = cargoForPlayer(world, 'walking')
    const parcel = parcelForOrder(world.activeOrder)
    const loaded = loadParcel(walking, parcel)
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    expect(loadParcel(loaded.cargo, { ...parcel, parcelId: 'second' })).toEqual({ ok: false, reason: 'capacity' })
    const unloaded = unloadParcel(loaded.cargo, parcel.parcelId)
    expect(unloaded).toEqual({ ok: true, cargo: walking })
    world.player.carryingPackage = true
    const bicycle = cargoForPlayer(world, 'bicycle')
    expect(bicycle.capacity).toBeGreaterThan(walking.capacity)
    expect(loadParcel(bicycle, { ...parcel, parcelId: 'second' }).ok).toBe(true)
  })

  it('ties all digital listings to physical merchants and preserves every generated walking route', () => {
    const world = createInitialWorldState()
    expect(marketplaceMerchants(world).every(merchant => !merchant.active && merchant.listings.length === 0)).toBe(true)
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    expect(MARKETPLACE_LISTINGS).toHaveLength(8)
    expect(new Set(MARKETPLACE_LISTINGS.map(listing => listing.listingId)).size).toBe(8)
    for (const merchant of marketplaceMerchants(world)) {
      expect(merchant.active).toBe(true)
      expect(merchant.listings).toHaveLength(1)
      expect(merchant.listings[0].merchantId).toBe(merchant.merchantId)
      expect(city.findCityLocation(merchant.pickupLocation)?.buildingId).toBe(merchant.buildingId)
    }
    for (let sequence = 1; sequence <= ORDER_ROUTE_TEMPLATES.length; sequence++) {
      world.activeOrder = createOrderForSequence(sequence)
      expect(prepareMarketplaceOrder(world)).toEqual(world.activeOrder)
    }
  })

  it('rejects unknown or wrong-kind origins, unreachable routes, occupied cargo and over-range work', () => {
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    for (const pickupLocation of ['DigitalOnlyMerchant', 'DeliveryZone', '']) {
      world.activeOrder.pickupLocation = pickupLocation
      expect(prepareMarketplaceOrder(world)).toBeNull()
    }
    world.activeOrder = createOrderForSequence(1)
    const disconnected = vi.spyOn(city, 'getCityRouteDistance').mockReturnValue(Infinity)
    try { expect(prepareMarketplaceOrder(world)).toBeNull() } finally { disconnected.mockRestore() }
    world.player.carryingPackage = true
    expect(prepareMarketplaceOrder(world)).toBeNull()
    world.player.carryingPackage = false
    const longRoute = BICYCLE_ORDER_ROUTE_TEMPLATES.findIndex(route =>
      city.getCityRouteDistance(route.pickupLocation, route.destination) > 1800)
    expect(longRoute).toBeGreaterThanOrEqual(0)
    world.activeOrder = createOrderForSequence(longRoute + 1, 'bicycle')
    expect(prepareMarketplaceOrder(world, 'walking')).toBeNull()
    expect(prepareMarketplaceOrder(world, 'bicycle')).toEqual(world.activeOrder)
  })
})
