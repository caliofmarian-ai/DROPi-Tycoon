import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
} from '../economy/playerEconomy'
import {
  CAPABILITY_POLICY_VERSION,
  createWorkActivityDefinitions,
  type CapabilityPolicy,
} from './capabilityCatalog'
import { evaluateWorkActivity } from './capabilityEngine'
import type {
  CapabilityEconomyPort,
  CapabilityEvaluation,
  CapabilityEvidenceState,
  CapabilityRuntimeContext,
  WorkActivityDefinition,
} from './capabilityModel'

export const PLAYER_WORK_ACTIVITY_IDS = [
  'walking-light-document-delivery',
  'bicycle-light-parcel-delivery',
] as const

export type PlayerWorkActivityId = (typeof PLAYER_WORK_ACTIVITY_IDS)[number]

/**
 * Physical/access facts remain outside Player Economy authority. The adapter only
 * derives facts that are already explicit in the active employment record.
 */
export interface PlayerWorkAccessFacts {
  availableEquipmentIds?: readonly string[]
  availableVehicleClasses?: readonly string[]
  cargoCapabilityIds?: readonly string[]
  employerPermissionIds?: readonly string[]
  companyCapabilityIds?: readonly string[]
  worldAccessIds?: readonly string[]
  isActivityAvailableDuringCurrentShift?: (activityId: string) => boolean
}

const unique = (values: readonly string[]): string[] => [...new Set(values)]

const isActiveLightDeliveryEmployee = (state: PlayerEconomyState): boolean =>
  state.employment?.status === 'Active' && state.employment.roleId === 'LightDeliveryEmployee'

/**
 * Read-only Player Economy integration. No money, employment, wage or Work Capacity
 * mutation is possible through this port.
 */
export const createPlayerEconomyCapabilityPort = (
  state: PlayerEconomyState,
): CapabilityEconomyPort => ({
  isEmployee: () => state.employment?.status === 'Active',
  hasWorkCapacity: requiredUnits =>
    Number.isSafeInteger(requiredUnits) &&
    requiredUnits > 0 &&
    Number.isSafeInteger(state.workCapacity.current) &&
    state.workCapacity.current >= requiredUnits,
  hasPersonalFunds: requiredMinor =>
    Number.isSafeInteger(requiredMinor) &&
    requiredMinor >= 0 &&
    Number.isSafeInteger(state.personalMoney.balanceMinor) &&
    state.personalMoney.balanceMinor >= requiredMinor,
})

/**
 * Capability work access must use the same Work Capacity scale as productive work.
 * Player Economy currently exposes one authoritative basic-delivery capacity cost,
 * so both walking and bicycle access use that cost until the economy domain exposes
 * a differentiated bicycle execution cost. We intentionally do not invent a second
 * consumption scale in the capability domain.
 */
export const createEconomyBackedCapabilityPolicy = (
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityPolicy => ({
  version: CAPABILITY_POLICY_VERSION,
  policyId: `economy-backed:${economyPolicy.policyId}`,
  starterWalkingWorkCapacityUnits: economyPolicy.starterDeliveryCapacityCost,
  bicycleWorkCapacityUnits: economyPolicy.starterDeliveryCapacityCost,
})

export const createEconomyBackedWorkActivityDefinitions = (
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): readonly WorkActivityDefinition[] =>
  createWorkActivityDefinitions(createEconomyBackedCapabilityPolicy(economyPolicy))

/**
 * Maps only facts that already exist in Player Economy:
 * - active LightDeliveryEmployee -> current light-delivery employer authorization;
 * - starter smartphone -> smartphone equipment availability;
 * - LightDeliveryEmployee -> light-document handling for the starter role.
 *
 * Bicycle equipment, Bicycle vehicle availability, light-parcel handling and bicycle
 * employer authorization must still be supplied explicitly by the owning runtime.
 */
export const createPlayerEconomyWorkAccessContext = (
  state: PlayerEconomyState,
  facts: PlayerWorkAccessFacts = {},
): CapabilityRuntimeContext => {
  const starterRole = isActiveLightDeliveryEmployee(state)
  const smartphone = state.employment?.smartphoneAvailable === true

  return {
    economy: createPlayerEconomyCapabilityPort(state),
    availableEquipmentIds: unique([
      ...(facts.availableEquipmentIds ?? []),
      ...(smartphone ? ['smartphone'] : []),
    ]),
    availableVehicleClasses: [...(facts.availableVehicleClasses ?? [])],
    cargoCapabilityIds: unique([
      ...(facts.cargoCapabilityIds ?? []),
      ...(starterRole ? ['light-document'] : []),
    ]),
    employerPermissionIds: unique([
      ...(facts.employerPermissionIds ?? []),
      ...(starterRole ? ['light-delivery'] : []),
    ]),
    companyCapabilityIds: [...(facts.companyCapabilityIds ?? [])],
    worldAccessIds: [...(facts.worldAccessIds ?? [])],
    isActivityAvailableDuringCurrentShift: facts.isActivityAvailableDuringCurrentShift,
  }
}

export const evaluatePlayerWorkAccess = (
  evidence: CapabilityEvidenceState,
  activityId: PlayerWorkActivityId,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityEvaluation =>
  evaluateWorkActivity(
    evidence,
    activityId,
    createPlayerEconomyWorkAccessContext(economyState, facts),
    createEconomyBackedWorkActivityDefinitions(economyPolicy),
  )

export const evaluateWalkingCourierWorkAccess = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityEvaluation =>
  evaluatePlayerWorkAccess(
    evidence,
    'walking-light-document-delivery',
    economyState,
    facts,
    economyPolicy,
  )

export const evaluateBicycleCourierWorkAccess = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityEvaluation =>
  evaluatePlayerWorkAccess(
    evidence,
    'bicycle-light-parcel-delivery',
    economyState,
    facts,
    economyPolicy,
  )
