import type {
  EconomicNodeCityEndpointRef,
  EconomicNodeLocation,
} from '../production/production'
import { WORLD_ROUTE_POINTS, type WorldRoutePoint } from '../world/worldLayout'
import type {
  DemandRequirement,
  LogisticsOpportunity,
  SupplyOffer,
} from './regionalSupplyDemand'

export type CitywideEconomicEndpointRole = 'supply-origin' | 'demand-destination'

/** Structural identity consumed by citywide delivery selection without taking mission ownership. */
export interface CitywideEconomicEndpointIdentity {
  endpointId: string
  districtId: string
  areaId?: string
}

/**
 * Inspectable DT-07 binding between a real economic cause and governed playable-city identity.
 * Coordinates are deliberately absent so #614 may rescale Brăila without rewriting economic causes.
 */
export interface GovernedCitywideEconomicEndpoint extends CitywideEconomicEndpointIdentity {
  worldInstanceId: string
  role: CitywideEconomicEndpointRole
  locationRef: string
  roadRef: string
  routeLabel: string
}

export interface GeographicallyBoundLogisticsOpportunity {
  opportunity: LogisticsOpportunity
  origin: GovernedCitywideEconomicEndpoint
  destination: GovernedCitywideEconomicEndpoint
}

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const validPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const validNonNegativeNumber = (value: number): boolean => Number.isFinite(value) && value >= 0

const routePoint = (routeLabel: string, expectedKind: WorldRoutePoint['kind']): WorldRoutePoint => {
  if (!validId(routeLabel)) throw new Error('Invalid citywide route label')
  const route = WORLD_ROUTE_POINTS.find(candidate => candidate.label === routeLabel)
  if (!route) throw new Error(`Unknown governed citywide route:${routeLabel}`)
  if (route.kind !== expectedKind) {
    throw new Error(`Citywide route role mismatch:${routeLabel}:${expectedKind}`)
  }
  return route
}

/**
 * Creates a semantic city binding from the existing governed Brăila route catalogue.
 * This helper creates no demand, inventory, mission, geometry or route-distance classification.
 */
export const governedBrailaEconomicCityEndpointRef = (
  routeLabel: string,
  expectedKind: WorldRoutePoint['kind'],
): EconomicNodeCityEndpointRef => {
  const route = routePoint(routeLabel, expectedKind)
  return {
    routeLabel: route.label,
    districtId: route.zoneId,
    areaId: route.label,
    locationRef: route.buildingId,
    roadRef: route.roadId,
  }
}

const validatedCityEndpoint = (
  location: EconomicNodeLocation,
  expectedKind: WorldRoutePoint['kind'],
): { ref: EconomicNodeCityEndpointRef; route: WorldRoutePoint } => {
  const ref = location.cityEndpoint
  if (!ref) throw new Error('Economic node has no governed city endpoint identity')
  const route = routePoint(ref.routeLabel, expectedKind)
  if (ref.districtId !== route.zoneId || ref.areaId !== route.label ||
      ref.locationRef !== route.buildingId || ref.roadRef !== route.roadId) {
    throw new Error('Economic node city endpoint does not match governed world identity')
  }
  return { ref, route }
}

const endpointFromLocation = (input: {
  endpointId: string
  location: EconomicNodeLocation
  role: CitywideEconomicEndpointRole
  expectedKind: WorldRoutePoint['kind']
}): GovernedCitywideEconomicEndpoint => {
  if (!validId(input.endpointId) || !validId(input.location.worldInstanceId)) {
    throw new Error('Invalid citywide economic endpoint identity')
  }
  const { ref } = validatedCityEndpoint(input.location, input.expectedKind)
  return {
    endpointId: input.endpointId,
    districtId: ref.districtId,
    ...(ref.areaId ? { areaId: ref.areaId } : {}),
    worldInstanceId: input.location.worldInstanceId,
    role: input.role,
    locationRef: ref.locationRef,
    roadRef: ref.roadRef,
    routeLabel: ref.routeLabel,
  }
}

/** Real available stock may become a citywide origin only when the owning node already has governed world identity. */
export const bindSupplyOfferToCitywideEndpoint = (input: {
  supply: SupplyOffer
}): GovernedCitywideEconomicEndpoint => {
  if (!validId(input.supply.supplyId) || !validId(input.supply.sourceNodeId) ||
      !validId(input.supply.location.worldInstanceId) || !validPositiveInteger(input.supply.availableQuantity)) {
    throw new Error('Citywide supply endpoint requires real available stock')
  }
  return endpointFromLocation({
    endpointId: input.supply.sourceNodeId,
    location: input.supply.location,
    role: 'supply-origin',
    expectedKind: 'pickup',
  })
}

/** A positive real deficit may become a citywide destination only when the owning node already has governed world identity. */
export const bindDemandRequirementToCitywideEndpoint = (input: {
  demand: DemandRequirement
}): GovernedCitywideEconomicEndpoint => {
  if (!validId(input.demand.demandId) || !validId(input.demand.destinationNodeId) ||
      !validId(input.demand.location.worldInstanceId) || !validPositiveInteger(input.demand.requiredQuantity)) {
    throw new Error('Citywide demand endpoint requires a real positive deficit')
  }
  return endpointFromLocation({
    endpointId: input.demand.destinationNodeId,
    location: input.demand.location,
    role: 'demand-destination',
    expectedKind: 'delivery',
  })
}

/** Returns exactly the structural endpoint identity expected by the mission-side #615 distribution port. */
export const citywideEconomicEndpointIdentity = (
  endpoint: GovernedCitywideEconomicEndpoint,
): CitywideEconomicEndpointIdentity => ({
  endpointId: endpoint.endpointId,
  districtId: endpoint.districtId,
  ...(endpoint.areaId ? { areaId: endpoint.areaId } : {}),
})

const validateOpportunityCause = (input: {
  opportunity: LogisticsOpportunity
  supply: SupplyOffer
  demand: DemandRequirement
}): void => {
  const { opportunity, supply, demand } = input
  if (!validId(opportunity.opportunityId) || !validPositiveInteger(opportunity.quantity) ||
      !validNonNegativeNumber(opportunity.demandPressure) || !validNonNegativeNumber(opportunity.economicValueSignal)) {
    throw new Error('Invalid citywide logistics opportunity')
  }
  if (opportunity.supplyId !== supply.supplyId || opportunity.demandId !== demand.demandId ||
      opportunity.sourceNodeId !== supply.sourceNodeId || opportunity.destinationNodeId !== demand.destinationNodeId) {
    throw new Error('Citywide logistics opportunity does not match authoritative supply/demand nodes')
  }
  if (supply.sourceNodeId === demand.destinationNodeId ||
      opportunity.sourceNodeId === opportunity.destinationNodeId) {
    throw new Error('Citywide logistics endpoints must be distinct')
  }
  if (opportunity.productId !== supply.productId || opportunity.productId !== demand.productId) {
    throw new Error('Citywide logistics opportunity product mismatch')
  }
  if (opportunity.worldInstanceId !== supply.location.worldInstanceId ||
      opportunity.worldInstanceId !== demand.location.worldInstanceId) {
    throw new Error('Citywide logistics opportunity world mismatch')
  }
  if (opportunity.quantity > supply.availableQuantity || opportunity.quantity > demand.requiredQuantity) {
    throw new Error('Citywide logistics opportunity exceeds current real supply/demand')
  }
}

/**
 * Couples an existing causal logistics opportunity to governed city endpoint identities.
 * No coordinates or distance class are copied: #614 remains spatial authority and #615 selection stays DT-09-owned.
 */
export const bindLogisticsOpportunityToCitywideEndpoints = (input: {
  opportunity: LogisticsOpportunity
  supply: SupplyOffer
  demand: DemandRequirement
}): GeographicallyBoundLogisticsOpportunity => {
  validateOpportunityCause(input)
  const origin = bindSupplyOfferToCitywideEndpoint({ supply: input.supply })
  const destination = bindDemandRequirementToCitywideEndpoint({ demand: input.demand })
  return {
    opportunity: { ...input.opportunity },
    origin,
    destination,
  }
}
