export type HighFootfallKind = 'standard' | 'school' | 'hospital' | 'station-terminal' | 'marketplace' | 'high-footfall'
export type TrafficCautionLevel = 'normal' | 'elevated' | 'strict'

export interface HighFootfallPolicy {
  kind: HighFootfallKind
  additionalPedestrianSlots: number
  requiresControlledCrossing: boolean
  cautionLevel: TrafficCautionLevel
  trafficOfficerEligible: boolean
  vehicleSpeedFactor: number
}

export interface LivingCityActorBudgetInput {
  basePedestrians: number
  footfallKinds: readonly HighFootfallKind[]
  reservedVehicles: number
  reservedCrossingPedestrians: number
  maxActors: number
  maxPedestrians: number
}

export interface LivingCityActorBudget {
  sidewalkPedestrians: number
  crossingPedestrians: number
  vehicles: number
  totalActors: number
  maxActors: number
}

export const HIGH_FOOTFALL_POLICIES: Readonly<Record<HighFootfallKind, HighFootfallPolicy>> = {
  standard: {
    kind: 'standard', additionalPedestrianSlots: 0, requiresControlledCrossing: false,
    cautionLevel: 'normal', trafficOfficerEligible: false, vehicleSpeedFactor: 1,
  },
  school: {
    kind: 'school', additionalPedestrianSlots: 3, requiresControlledCrossing: true,
    cautionLevel: 'strict', trafficOfficerEligible: true, vehicleSpeedFactor: 0.55,
  },
  hospital: {
    kind: 'hospital', additionalPedestrianSlots: 2, requiresControlledCrossing: true,
    cautionLevel: 'strict', trafficOfficerEligible: true, vehicleSpeedFactor: 0.6,
  },
  'station-terminal': {
    kind: 'station-terminal', additionalPedestrianSlots: 4, requiresControlledCrossing: true,
    cautionLevel: 'elevated', trafficOfficerEligible: true, vehicleSpeedFactor: 0.7,
  },
  marketplace: {
    kind: 'marketplace', additionalPedestrianSlots: 2, requiresControlledCrossing: true,
    cautionLevel: 'elevated', trafficOfficerEligible: true, vehicleSpeedFactor: 0.75,
  },
  'high-footfall': {
    kind: 'high-footfall', additionalPedestrianSlots: 3, requiresControlledCrossing: true,
    cautionLevel: 'elevated', trafficOfficerEligible: true, vehicleSpeedFactor: 0.7,
  },
}

const boundedInteger = (value: number, fallback = 0): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback

export const footfallPolicy = (kind: HighFootfallKind): HighFootfallPolicy => HIGH_FOOTFALL_POLICIES[kind]

export const resolveLivingCityActorBudget = (input: LivingCityActorBudgetInput): LivingCityActorBudget => {
  const maxActors = boundedInteger(input.maxActors)
  const maxPedestrians = Math.min(maxActors, boundedInteger(input.maxPedestrians))
  const vehicles = Math.min(maxActors, boundedInteger(input.reservedVehicles))
  const crossingPedestrians = Math.min(
    Math.max(0, maxActors - vehicles),
    boundedInteger(input.reservedCrossingPedestrians),
  )
  const reserved = vehicles + crossingPedestrians
  const availableForSidewalks = Math.max(0, Math.min(maxPedestrians - crossingPedestrians, maxActors - reserved))
  const requestedSidewalks = boundedInteger(input.basePedestrians) + input.footfallKinds.reduce(
    (total, kind) => total + HIGH_FOOTFALL_POLICIES[kind].additionalPedestrianSlots,
    0,
  )
  const sidewalkPedestrians = Math.min(availableForSidewalks, requestedSidewalks)
  return {
    sidewalkPedestrians,
    crossingPedestrians,
    vehicles,
    totalActors: sidewalkPedestrians + crossingPedestrians + vehicles,
    maxActors,
  }
}
