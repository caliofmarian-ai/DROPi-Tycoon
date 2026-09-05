import { describe, expect, it } from 'vitest'
import { createInitialWorldState } from '../src/state/gameState'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import {
  cargoForPlayer, LOCAL_MERCHANT, marketplaceMerchant, missionForOrder,
  parcelForOrder, prepareMarketplaceOrder,
} from '../src/systems/urbanMarketplace'
import { isDeliveryMission, loadParcel, unloadParcel } from '../src/systems/urbanLogistics'
import { URBAN_MERCHANT } from '../src/world/urbanWorld'

describe('physical merchant to digital marketplace', () => {
  it('exposes no listings or dispatchable order until onboarded', () => {
    const world = createInitialWorldState()
    expect(marketplaceMerchant(world)).toMatchObject({ active: false, listings: [] })
    expect(prepareMarketplaceOrder(world)).toBeNull()
    expect(LOCAL_MERCHANT.position).toEqual(URBAN_MERCHANT)
  })

  it('activates a listing linked to the shop and generates work at that same merchant', () => {
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
      expect(order.pickupLocation).toBe(merchant.pickupLocation)
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
})
