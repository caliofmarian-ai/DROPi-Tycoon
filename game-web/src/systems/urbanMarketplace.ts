import type { OrderState, WorldState } from '../types/game'
import { findWorldRoutePoint } from '../world/worldLayout'
import { CITY_MERCHANTS, getCityRouteDistance } from '../world/city'
import {
  isDeliveryMission, loadParcel, TRANSPORT_PROFILES,
  type CargoLoad, type DeliveryMission, type GroundTransport, type Parcel,
} from './urbanLogistics'

export const LOCAL_MERCHANT = CITY_MERCHANTS.find(merchant => merchant.merchantId === 'mara-market')!

export const LOCAL_LISTING = {
  listingId: 'mara-neighborhood-essentials',
  merchantId: LOCAL_MERCHANT.merchantId,
  productName: 'Neighborhood essentials',
  cargoUnits: 1,
} as const

/** Physical identity and digital listings share one stable merchant identifier. */
export const marketplaceMerchant = (world: WorldState) => ({
  ...LOCAL_MERCHANT,
  active: world.urban?.merchantOnboarded === true,
  listings: world.urban?.merchantOnboarded === true ? [LOCAL_LISTING] : [],
})

export const MARKETPLACE_LISTINGS = CITY_MERCHANTS.map(merchant => merchant.merchantId === LOCAL_MERCHANT.merchantId
  ? LOCAL_LISTING
  : {
    listingId: `${merchant.merchantId}-local-goods`, merchantId: merchant.merchantId,
    productName: `${merchant.name} goods`, cargoUnits: 1,
  })

export const marketplaceMerchants = (world: WorldState) => CITY_MERCHANTS.map(merchant => ({
  ...merchant,
  active: world.urban?.merchantOnboarded === true,
  listings: world.urban?.merchantOnboarded === true
    ? MARKETPLACE_LISTINGS.filter(listing => listing.merchantId === merchant.merchantId) : [],
}))

export const parcelForOrder = (order: OrderState): Parcel => ({
  parcelId: `${order.orderId}:parcel-1`,
  orderId: order.orderId,
  cargoUnits: LOCAL_LISTING.cargoUnits,
})

export const missionForOrder = (order: OrderState, transport: GroundTransport): DeliveryMission => {
  const parcel = parcelForOrder(order)
  return {
    missionId: `${order.orderId}:mission`,
    orderId: order.orderId,
    parcels: [parcel],
    legs: [{
      legId: `${order.orderId}:local-leg`,
      mode: 'terrestrial',
      transport,
      carrier: { kind: 'player', playerId: 'local-player' },
      from: order.pickupLocation,
      to: order.destination,
      parcelIds: [parcel.parcelId],
    }],
  }
}

/** Existing single-order runtime projects into the extensible parcel-load contract. */
export const cargoForPlayer = (world: WorldState, transport: GroundTransport): CargoLoad => ({
  capacity: TRANSPORT_PROFILES[transport].cargoCapacity,
  parcels: world.player.carryingPackage ? [parcelForOrder(world.activeOrder)] : [],
})

export const prepareMarketplaceOrder = (
  world: WorldState, transport: GroundTransport = 'walking',
): OrderState | null => {
  if (!world.urban?.merchantOnboarded || world.activeOrder.status !== 'Available') return null
  const order = world.activeOrder
  const merchant = CITY_MERCHANTS.find(candidate => candidate.pickupLocation === order.pickupLocation)
  const pickup = findWorldRoutePoint(order.pickupLocation)
  const destination = findWorldRoutePoint(order.destination)
  if (!merchant || pickup?.kind !== 'pickup' || destination?.kind !== 'delivery') return null
  const distance = getCityRouteDistance(pickup.label, destination.label)
  if (distance > TRANSPORT_PROFILES[transport].range) return null
  if (!loadParcel(cargoForPlayer(world, transport), parcelForOrder(order)).ok) return null
  return isDeliveryMission(missionForOrder(order, transport)) ? { ...order } : null
}
