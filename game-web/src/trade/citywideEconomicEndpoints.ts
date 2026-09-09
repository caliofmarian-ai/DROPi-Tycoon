import type {
  EconomicNodeCityEndpointRef,
  EconomicNodeCityEndpointRole,
  EconomicNodeLocation,
} from '../production/production'
import type {
  DemandRequirement,
  LogisticsOpportunity,
  SupplyOffer,
} from './regionalSupplyDemand'

export type CitywideEconomicEndpointRole = 'supply-origin' | 'demand-destination'

/**
 * One locality-owned snapshot of semantic economic endpoints.
 * Different localities supply different authorities; there is no universal Brăila route catalogue here.
 */
export interface CitywideEconomicEndpointAuthority {
  localityId: string
  sourceCheckpoint: string
  endpoints: readonly EconomicNodeCityEndpointRef[]
}

/** Structural identity consumed by citywide delivery selection without taking mission ownership. */
export interface CitywideEconomicEndpointIdentity {
  endpointId: string
  localityId: string
  sourceCheckpoint: string
  districtId: string
  areaId?: string
}

/** Inspectable binding between one real economic cause and one locality-owned semantic endpoint. */
export interface GovernedCitywideEconomicEndpoint extends CitywideEconomicEndpointIdentity {
  worldInstanceId: string
  sourceLocalityId: string
  role: CitywideEconomicEndpointRole
  worldEndpointId: string
  locationRef: string
  roadRef?: string
}

export interface GeographicallyBoundLogisticsOpportunity {
  opportunity: LogisticsOpportunity
  localityId: string
  sourceCheckpoint: string
  origin: GovernedCitywideEconomicEndpoint
  destination: GovernedCitywideEconomicEndpoint
}

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const validPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const validNonNegativeNumber = (value: number): boolean => Number.isFinite(value) && value >= 0

const sameOptional = (left: string | undefined, right: string | undefined): boolean => left === right

const cloneEndpointRef = (ref: EconomicNodeCityEndpointRef): EconomicNodeCityEndpointRef => ({ ...ref })

export const createCitywideEconomicEndpointAuthority = (input: {
  localityId: string
  sourceCheckpoint: string
  endpoints: readonly EconomicNodeCityEndpointRef[]
}): CitywideEconomicEndpointAuthority => {
  if (!validId(input.localityId) || !validId(input.sourceCheckpoint)) {
    throw new Error('Invalid citywide locality authority identity')
  }
  const seen = new Set<string>()
  const endpoints = input.endpoints.map(endpoint => {
    if (endpoint.localityId !== input.localityId || endpoint.sourceCheckpoint !== input.sourceCheckpoint) {
      throw new Error('Citywide endpoint belongs to a different locality authority')
    }
    if (!validId(endpoint.worldEndpointId) || !validId(endpoint.districtId) || !validId(endpoint.locationRef)) {
      throw new Error('Invalid citywide endpoint identity')
    }
    if (seen.has(endpoint.worldEndpointId)) throw new Error('Duplicate citywide world endpoint identity')
    seen.add(endpoint.worldEndpointId)
    return cloneEndpointRef(endpoint)
  })
  return {
    localityId: input.localityId,
    sourceCheckpoint: input.sourceCheckpoint,
    endpoints,
  }
}

const authorityEndpoint = (input: {
  authority: CitywideEconomicEndpointAuthority
  ref: EconomicNodeCityEndpointRef
  expectedRole: EconomicNodeCityEndpointRole
}): EconomicNodeCityEndpointRef => {
  const { authority, ref, expectedRole } = input
  if (ref.localityId !== authority.localityId || ref.sourceCheckpoint !== authority.sourceCheckpoint) {
    throw new Error('Economic node city endpoint authority mismatch')
  }
  if (ref.role !== expectedRole) throw new Error(`Citywide endpoint role mismatch:${ref.worldEndpointId}:${expectedRole}`)
  const governed = authority.endpoints.find(endpoint => endpoint.worldEndpointId === ref.worldEndpointId)
  if (!governed) throw new Error(`Unknown governed citywide endpoint:${ref.worldEndpointId}`)
  if (governed.role !== expectedRole || governed.districtId !== ref.districtId ||
      !sameOptional(governed.areaId, ref.areaId) || governed.locationRef !== ref.locationRef ||
      !sameOptional(governed.roadRef, ref.roadRef)) {
    throw new Error('Economic node city endpoint does not match locality authority')
  }
  return governed
}

const validatedLocation = (input: {
  location: EconomicNodeLocation
  authority: CitywideEconomicEndpointAuthority
  expectedRole: EconomicNodeCityEndpointRole
}): EconomicNodeCityEndpointRef => {
  const { location, authority, expectedRole } = input
  if (!location.localityId || location.localityId !== authority.localityId) {
    throw new Error('Economic node locality does not match citywide authority')
  }
  const ref = location.cityEndpoint
  if (!ref) throw new Error('Economic node has no governed city endpoint identity')
  if (ref.localityId !== location.localityId) throw new Error('Economic node city endpoint locality mismatch')
  return authorityEndpoint({ authority, ref, expectedRole })
}

const endpointFromLocation = (input: {
  endpointId: string
  location: EconomicNodeLocation
  authority: CitywideEconomicEndpointAuthority
  role: CitywideEconomicEndpointRole
  expectedRole: EconomicNodeCityEndpointRole
}): GovernedCitywideEconomicEndpoint => {
  if (!validId(input.endpointId) || !validId(input.location.worldInstanceId)) {
    throw new Error('Invalid citywide economic endpoint identity')
  }
  const ref = validatedLocation({
    location: input.location,
    authority: input.authority,
    expectedRole: input.expectedRole,
  })
  return {
    endpointId: input.endpointId,
    localityId: input.authority.localityId,
    sourceCheckpoint: input.authority.sourceCheckpoint,
    districtId: ref.districtId,
    ...(ref.areaId ? { areaId: ref.areaId } : {}),
    worldInstanceId: input.location.worldInstanceId,
    sourceLocalityId: ref.localityId,
    role: input.role,
    worldEndpointId: ref.worldEndpointId,
    locationRef: ref.locationRef,
    ...(ref.roadRef ? { roadRef: ref.roadRef } : {}),
  }
}

/** Real available stock may become an origin only through its own locality's governed authority. */
export const bindSupplyOfferToCitywideEndpoint = (input: {
  supply: SupplyOffer
  authority: CitywideEconomicEndpointAuthority
}): GovernedCitywideEconomicEndpoint => {
  if (!validId(input.supply.supplyId) || !validId(input.supply.sourceNodeId) ||
      !validId(input.supply.location.worldInstanceId) || !validPositiveInteger(input.supply.availableQuantity)) {
    throw new Error('Citywide supply endpoint requires real available stock')
  }
  return endpointFromLocation({
    endpointId: input.supply.sourceNodeId,
    location: input.supply.location,
    authority: input.authority,
    role: 'supply-origin',
    expectedRole: 'pickup',
  })
}

/** A positive real deficit may become a destination only through its own locality's governed authority. */
export const bindDemandRequirementToCitywideEndpoint = (input: {
  demand: DemandRequirement
  authority: CitywideEconomicEndpointAuthority
}): GovernedCitywideEconomicEndpoint => {
  if (!validId(input.demand.demandId) || !validId(input.demand.destinationNodeId) ||
      !validId(input.demand.location.worldInstanceId) || !validPositiveInteger(input.demand.requiredQuantity)) {
    throw new Error('Citywide demand endpoint requires a real positive deficit')
  }
  return endpointFromLocation({
    endpointId: input.demand.destinationNodeId,
    location: input.demand.location,
    authority: input.authority,
    role: 'demand-destination',
    expectedRole: 'delivery',
  })
}

export const citywideEconomicEndpointIdentity = (
  endpoint: GovernedCitywideEconomicEndpoint,
): CitywideEconomicEndpointIdentity => ({
  endpointId: endpoint.endpointId,
  localityId: endpoint.localityId,
  sourceCheckpoint: endpoint.sourceCheckpoint,
  districtId: endpoint.districtId,
  ...(endpoint.areaId ? { areaId: endpoint.areaId } : {}),
})

const validateOpportunityCause = (input: {
  opportunity: LogisticsOpportunity
  supply: SupplyOffer
  demand: DemandRequirement
  authority: CitywideEconomicEndpointAuthority
}): void => {
  const { opportunity, supply, demand, authority } = input
  if (!validId(opportunity.opportunityId) || !validPositiveInteger(opportunity.quantity) ||
      !validNonNegativeNumber(opportunity.demandPressure) || !validNonNegativeNumber(opportunity.economicValueSignal)) {
    throw new Error('Invalid citywide logistics opportunity')
  }
  if (opportunity.supplyId !== supply.supplyId || opportunity.demandId !== demand.demandId ||
      opportunity.sourceNodeId !== supply.sourceNodeId || opportunity.destinationNodeId !== demand.destinationNodeId) {
    throw new Error('Citywide logistics opportunity does not match authoritative supply/demand nodes')
  }
  if (supply.sourceNodeId === demand.destinationNodeId || opportunity.sourceNodeId === opportunity.destinationNodeId) {
    throw new Error('Citywide logistics endpoints must be distinct')
  }
  if (opportunity.productId !== supply.productId || opportunity.productId !== demand.productId) {
    throw new Error('Citywide logistics opportunity product mismatch')
  }
  if (opportunity.worldInstanceId !== supply.location.worldInstanceId ||
      opportunity.worldInstanceId !== demand.location.worldInstanceId) {
    throw new Error('Citywide logistics opportunity world mismatch')
  }
  if (supply.location.localityId !== authority.localityId || demand.location.localityId !== authority.localityId) {
    throw new Error('Citywide logistics opportunity locality mismatch')
  }
  if (opportunity.quantity > supply.availableQuantity || opportunity.quantity > demand.requiredQuantity) {
    throw new Error('Citywide logistics opportunity exceeds current real supply/demand')
  }
}

/**
 * Couples an existing causal logistics opportunity to one locality-owned endpoint snapshot.
 * The adapter creates no demand, inventory, geometry, route catalogue, mission or money.
 */
export const bindLogisticsOpportunityToCitywideEndpoints = (input: {
  opportunity: LogisticsOpportunity
  supply: SupplyOffer
  demand: DemandRequirement
  authority: CitywideEconomicEndpointAuthority
}): GeographicallyBoundLogisticsOpportunity => {
  validateOpportunityCause(input)
  const origin = bindSupplyOfferToCitywideEndpoint({ supply: input.supply, authority: input.authority })
  const destination = bindDemandRequirementToCitywideEndpoint({ demand: input.demand, authority: input.authority })
  return {
    opportunity: { ...input.opportunity },
    localityId: input.authority.localityId,
    sourceCheckpoint: input.authority.sourceCheckpoint,
    origin,
    destination,
  }
}
