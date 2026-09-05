import type { CompanyState, WorldState } from '../types/game'
import type { AudioCue } from './audioSystem'
import { attemptDelivery, attemptPickup } from './orderSystem'
import { applyOrderAcceptanceRequest } from './orderAcceptance'
import { settleDeliveryOutcome } from './economySettlement'
import { createNextOrder, pickupPointForOrder } from './orderGeneration'
import {
  isDeliveryMission, loadParcel, resolveActiveTransport, TRANSPORT_PROFILES, unloadParcel,
  type CargoLoad, type DeliveryMission,
} from './urbanLogistics'
import {
  cargoForPlayer, MARKETPLACE_LISTINGS, missionForOrder, parcelForOrder, prepareMarketplaceOrder,
} from './urbanMarketplace'
import { URBAN_HQ, URBAN_MERCHANT, inInteractionRange } from '../world/urbanWorld'
import { findWorldRoutePoint } from '../world/worldLayout'
import { CITY_MERCHANTS, getCityRouteDistance } from '../world/city'

export interface UrbanMerchantProfile {
  profileId: string
  worldActorId: string
  businessName: string
  pickupLocation: string
  buildingId: string
}

/** Digital profiles are tied to physical merchants, not anonymous remote pickup buttons. */
export const URBAN_MERCHANT_PROFILES: readonly UrbanMerchantProfile[] = CITY_MERCHANTS.map(merchant => ({
  profileId: merchant.merchantId, worldActorId: merchant.npcId, businessName: merchant.name,
  pickupLocation: merchant.pickupLocation, buildingId: merchant.buildingId,
}))

export interface UrbanOrderListing {
  listingId: string
  merchantProfileId: string
  merchant: UrbanMerchantProfile
  orderId: string
  pickupLocation: string
  destination: string
  reward: number
}

export const getUrbanOrderListing = (world: WorldState): UrbanOrderListing | null => {
  const existingWork = world.activeOrder.status === 'Accepted' || world.activeOrder.status === 'PickedUp'
  const order = existingWork ? world.activeOrder : prepareMarketplaceOrder(world, world.urban?.activeTransport ?? 'walking')
  if (!order) return null
  const merchant = URBAN_MERCHANT_PROFILES.find(profile => profile.pickupLocation === order.pickupLocation)
  if (!merchant || findWorldRoutePoint(order.destination)?.kind !== 'delivery' ||
      !Number.isFinite(getCityRouteDistance(order.pickupLocation, order.destination))) return null
  return {
    listingId: MARKETPLACE_LISTINGS.find(listing => listing.merchantId === merchant.profileId)!.listingId,
    merchantProfileId: merchant.profileId,
    merchant,
    orderId: order.orderId,
    pickupLocation: order.pickupLocation,
    destination: order.destination,
    reward: order.reward,
  }
}

export const getUrbanCargo = (world: WorldState): CargoLoad =>
  cargoForPlayer(world, world.urban?.activeTransport ?? 'walking')

export const getUrbanDeliveryMission = (world: WorldState): DeliveryMission =>
  missionForOrder(world.activeOrder, world.urban?.activeTransport ?? 'walking')

export const getUrbanRouteDistance = (world: WorldState): number => {
  const order = world.activeOrder.status === 'Available'
    ? prepareMarketplaceOrder(world, world.urban?.activeTransport ?? 'walking')
    : world.activeOrder
  if (!order) return Infinity
  const pickup = findWorldRoutePoint(order.pickupLocation)
  const destination = findWorldRoutePoint(order.destination)
  if (pickup?.kind !== 'pickup' || destination?.kind !== 'delivery') return Infinity
  return getCityRouteDistance(pickup.label, destination.label)
}

export const isUrbanRouteWithinTransportRange = (world: WorldState): boolean =>
  getUrbanRouteDistance(world) <= TRANSPORT_PROFILES[world.urban?.activeTransport ?? 'walking'].range

export interface UrbanObjective {
  point: { x: number; y: number }
  title: string
  action: string
}

export const getUrbanObjective = (world: WorldState): UrbanObjective => {
  const order = world.activeOrder
  const listing = getUrbanOrderListing(world)
  // Restored cargo and accepted work take precedence over the new tutorial.
  if (order.status === 'Accepted') {
    return {
      point: pickupPointForOrder(order),
      title: `Collect at ${listing?.merchant.businessName ?? 'the merchant'}`,
      action: 'Pick up parcel',
    }
  }
  if (order.status === 'PickedUp') {
    const destination = findWorldRoutePoint(order.destination)
    return {
      point: destination ?? URBAN_HQ,
      title: destination ? `Deliver to ${destination.displayName}` : 'Verify delivery at HQ',
      action: 'Deliver parcel',
    }
  }
  if (!world.urban?.merchantOnboarded) {
    return { point: URBAN_MERCHANT, title: 'Meet Mara at the corner shop', action: 'Meet merchant' }
  }
  return {
    point: URBAN_HQ,
    title: listing ? `HQ board · ${listing.merchant.businessName}` : 'Return to HQ',
    action: listing ? `Accept $${listing.reward} job` : 'Check local board',
  }
}

export interface UrbanInteractionResult {
  world: WorldState
  company: CompanyState
  message: string
  cue?: AudioCue
  settled: boolean
}

/** Every entry point uses the same proximity, cargo and exactly-once economy transaction. */
export const performUrbanInteraction = (
  source: WorldState,
  company: CompanyState,
): UrbanInteractionResult => {
  const world: WorldState = {
    ...source,
    urban: {
      merchantOnboarded: source.urban?.merchantOnboarded ?? false,
      activeTransport: resolveActiveTransport(company, source.urban?.activeTransport),
    },
    pendingDeliveryDestination: '',
  }
  const result = (message: string, cue?: AudioCue): UrbanInteractionResult =>
    ({ world, company, message, cue, settled: false })
  const order = world.activeOrder
  const objective = getUrbanObjective(world)
  if (order.status === 'Accepted' && inInteractionRange(world.player, objective.point)) {
    if (findWorldRoutePoint(order.pickupLocation)?.kind !== 'pickup' ||
        world.player.currentOrder !== order.orderId) return result('HQ needs to verify this order before pickup.')
    const cargo = loadParcel(getUrbanCargo(world), parcelForOrder(order))
    if (!cargo.ok || !isDeliveryMission(getUrbanDeliveryMission(world))) {
      return result('No cargo space. Finish your current parcel first.')
    }
    if (!isUrbanRouteWithinTransportRange(world)) return result('This route exceeds your transport range. Change transport at HQ.')
    const picked = attemptPickup(order, world.player, {
      expectedPickupLocation: order.pickupLocation,
      distanceToPackage: Math.hypot(world.player.x - objective.point.x, world.player.y - objective.point.y),
      pickupRadius: 48.001,
    })
    world.activeOrder = picked.order
    world.player = picked.player
    if (picked.order.status !== 'PickedUp') return result('Finish carrying your current parcel first.')
    return result('Parcel collected! Follow the gold marker to your customer.', 'positive')
  }
  if (order.status === 'PickedUp' && inInteractionRange(world.player, objective.point)) {
    if (!getUrbanOrderListing(world) || !isDeliveryMission(getUrbanDeliveryMission(world))) {
      return result('HQ needs to verify this delivery route.')
    }
    const cargo = unloadParcel(getUrbanCargo(world), parcelForOrder(order).parcelId)
    if (!cargo.ok) return result('Collect your parcel from the merchant first.')
    const delivered = attemptDelivery(order, world.player, {
      selectedDestination: order.destination,
      distanceToDestination: Math.hypot(world.player.x - objective.point.x, world.player.y - objective.point.y),
      deliveryRadius: 48,
      orderConditionsMet: findWorldRoutePoint(order.destination)?.kind === 'delivery',
    })
    const settlement = settleDeliveryOutcome(order, delivered.order, company)
    if (!settlement.applied) return result('Bring your parcel to the marked customer.')
    world.activeOrder = createNextOrder(settlement.order, world.urban!.activeTransport)
    world.player = delivered.player
    return {
      world,
      company: settlement.company,
      message: `Delivered! +$${order.reward} · Return to HQ for your next job.`,
      cue: 'delivery-success',
      settled: true,
    }
  }
  if (!world.urban!.merchantOnboarded && inInteractionRange(world.player, URBAN_MERCHANT)) {
    world.urban = { ...world.urban!, merchantOnboarded: true }
    return result('Mara: My shop profile is linked to the local board! Find real pickup jobs at HQ.', 'positive')
  }
  if (inInteractionRange(world.player, URBAN_HQ)) {
    if (!world.urban!.merchantOnboarded) return result('HQ: Meet Mara at the corner shop first. Follow the marker.')
    if (order.status === 'Available') {
      const prepared = prepareMarketplaceOrder(world, world.urban!.activeTransport)
      if (!prepared) return result('HQ: No eligible listing. Check the route, transport range and cargo capacity.')
      const accepted = applyOrderAcceptanceRequest({ ...world, activeOrder: prepared }, prepared.orderId)
      return {
        world: accepted.worldState, company, settled: false,
        message: accepted.accepted
          ? `Job accepted from ${URBAN_MERCHANT_PROFILES.find(profile => profile.pickupLocation === prepared.pickupLocation)!.businessName}! Collect the parcel in person.`
          : 'Finish your current job first.',
        cue: accepted.accepted ? 'order-accepted' : undefined,
      }
    }
    return result('HQ: Finish your delivery first. You can change transport here with T.')
  }
  return result('Move closer to the gold marker, then use E / Action.')
}
