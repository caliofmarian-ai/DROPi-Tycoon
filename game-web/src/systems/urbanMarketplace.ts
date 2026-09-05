import type { OrderState, WorldState } from '../types/game'
import { URBAN_MERCHANT, URBAN_ROADS } from '../world/urbanWorld'
import { findWorldRoutePoint } from '../world/worldLayout'
import {
  isDeliveryMission, TRANSPORT_PROFILES,
  type CargoLoad, type DeliveryMission, type GroundTransport, type Parcel,
} from './urbanLogistics'

export const LOCAL_MERCHANT = {
  merchantId: 'mara-market',
  npcId: 'mara',
  buildingId: 'storage-3',
  name: "Mara's Market",
  position: URBAN_MERCHANT,
  pickupLocation: 'PickupZone',
} as const

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
  const merchant = marketplaceMerchant(world)
  if (!merchant.active || merchant.listings.length === 0 || world.activeOrder.status !== 'Available') return null
  const destination = findWorldRoutePoint(world.activeOrder.destination)
  const pickup = findWorldRoutePoint(merchant.pickupLocation)
  const spine = URBAN_ROADS.find(road => road.id === 'central-vertical')
  if (!destination || destination.kind !== 'delivery' || !pickup || !spine) return null
  // Current endpoints sit on horizontal lanes connected by the central avenue.
  const distance = pickup.y === destination.y ? Math.abs(pickup.x - destination.x) :
    Math.abs(pickup.x - spine.x) + Math.abs(pickup.y - destination.y) + Math.abs(destination.x - spine.x)
  if (distance > TRANSPORT_PROFILES[transport].range) return null
  const order = { ...world.activeOrder, pickupLocation: merchant.pickupLocation }
  return isDeliveryMission(missionForOrder(order, transport)) ? order : null
}
