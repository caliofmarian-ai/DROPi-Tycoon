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
  'electric-scooter-light-parcel-delivery',
  'motorcycle-light-parcel-delivery',
  'car-light-parcel-delivery',
  'delivery-van-light-parcel-delivery',
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
 * so walking, bicycle and the first road-vehicle eligibility contracts use that cost
 * until the economy domain exposes differentiated execution costs. We intentionally
 * do not invent a second consumption scale in the capability domain.
 */
export const createEconomyBackedCapabilityPolicy = (
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityPolicy => ({
  version: CAPABILITY_POLICY_VERSION,
  policyId: `economy-backed:${economyPolicy.policyId}`,
  starterWalkingWorkCapacityUnits: economyPolicy.starterDeliveryCapacityCost,
  bicycleWorkCapacityUnits: economyPolicy.starterDeliveryCapacityCost,
})

const createAdvancedDeliveryWorkActivityDefinitions = (
  economyPolicy: PlayerEconomyPolicy,
): readonly WorkActivityDefinition[] => [
  {
    id: 'electric-scooter-light-parcel-delivery',
    label: 'Electric scooter / light-parcel delivery',
    requirements: [
      { kind: 'capability', capabilityId: 'ElectricScooterOperation', label: 'Electric Scooter Operation' },
      { kind: 'theory', evidenceId: 'powered-two-wheel-theory', label: 'Powered two-wheel theory' },
      { kind: 'practicalTraining', evidenceId: 'powered-two-wheel-practical', label: 'Powered two-wheel practice' },
      { kind: 'qualification', evidenceId: 'powered-two-wheel-qualification', label: 'Powered two-wheel qualification' },
      { kind: 'employment', label: 'Active delivery employment' },
      { kind: 'employerPermission', permissionId: 'electric-scooter-light-delivery', label: 'Electric scooter delivery authorization' },
      { kind: 'equipment', equipmentId: 'ElectricScooter', label: 'Electric Scooter' },
      { kind: 'vehicleClass', vehicleClass: 'ElectricScooter', label: 'Electric Scooter' },
      { kind: 'cargoCapability', cargoCapabilityId: 'light-parcel', label: 'Light-parcel handling' },
      { kind: 'workCapacity', minimumUnits: economyPolicy.starterDeliveryCapacityCost, label: 'Electric scooter delivery Work Capacity' },
      { kind: 'shiftAvailability', label: 'Current shift availability' },
    ],
  },
  {
    id: 'motorcycle-light-parcel-delivery',
    label: 'Motorcycle / light-parcel delivery',
    requirements: [
      { kind: 'capability', capabilityId: 'MotorcycleOperation', label: 'Motorcycle Operation' },
      { kind: 'theory', evidenceId: 'powered-two-wheel-theory', label: 'Powered two-wheel theory' },
      { kind: 'practicalTraining', evidenceId: 'powered-two-wheel-practical', label: 'Powered two-wheel practice' },
      { kind: 'qualification', evidenceId: 'powered-two-wheel-qualification', label: 'Powered two-wheel qualification' },
      { kind: 'practicalTraining', evidenceId: 'motorcycle-practical', label: 'Motorcycle handling practice' },
      { kind: 'qualification', evidenceId: 'motorcycle-qualification', label: 'Motorcycle qualification' },
      { kind: 'employment', label: 'Active delivery employment' },
      { kind: 'employerPermission', permissionId: 'motorcycle-light-delivery', label: 'Motorcycle delivery authorization' },
      { kind: 'equipment', equipmentId: 'Motorcycle', label: 'Motorcycle' },
      { kind: 'vehicleClass', vehicleClass: 'Motorcycle', label: 'Motorcycle' },
      { kind: 'cargoCapability', cargoCapabilityId: 'light-parcel', label: 'Light-parcel handling' },
      { kind: 'workCapacity', minimumUnits: economyPolicy.starterDeliveryCapacityCost, label: 'Motorcycle delivery Work Capacity' },
      { kind: 'shiftAvailability', label: 'Current shift availability' },
    ],
  },
  {
    id: 'car-light-parcel-delivery',
    label: 'Car / light-parcel delivery',
    requirements: [
      { kind: 'capability', capabilityId: 'CarOperation', label: 'Car Operation' },
      { kind: 'theory', evidenceId: 'road-vehicle-theory', label: 'Road vehicle theory' },
      { kind: 'practicalTraining', evidenceId: 'car-operation-practical', label: 'Car operation practice' },
      { kind: 'qualification', evidenceId: 'car-operation-qualification', label: 'Car operation qualification' },
      { kind: 'employment', label: 'Active delivery employment' },
      { kind: 'employerPermission', permissionId: 'car-light-delivery', label: 'Car delivery authorization' },
      { kind: 'equipment', equipmentId: 'Car', label: 'Car' },
      { kind: 'vehicleClass', vehicleClass: 'Car', label: 'Car' },
      { kind: 'cargoCapability', cargoCapabilityId: 'light-parcel', label: 'Light-parcel handling' },
      { kind: 'workCapacity', minimumUnits: economyPolicy.starterDeliveryCapacityCost, label: 'Car delivery Work Capacity' },
      { kind: 'shiftAvailability', label: 'Current shift availability' },
    ],
  },
  {
    id: 'delivery-van-light-parcel-delivery',
    label: 'Delivery van / light-parcel delivery',
    requirements: [
      { kind: 'capability', capabilityId: 'DeliveryVanOperation', label: 'Delivery Van Operation' },
      { kind: 'theory', evidenceId: 'road-vehicle-theory', label: 'Road vehicle theory' },
      { kind: 'practicalTraining', evidenceId: 'car-operation-practical', label: 'Car operation practice' },
      { kind: 'qualification', evidenceId: 'car-operation-qualification', label: 'Car operation qualification' },
      { kind: 'practicalTraining', evidenceId: 'van-cargo-practical', label: 'Van cargo-handling practice' },
      { kind: 'supervisedExperience', evidenceId: 'road-delivery-supervised', label: 'Supervised road-delivery experience', minimumUnits: 1 },
      { kind: 'qualification', evidenceId: 'delivery-van-qualification', label: 'Delivery van qualification' },
      { kind: 'employment', label: 'Active delivery employment' },
      { kind: 'employerPermission', permissionId: 'delivery-van-light-delivery', label: 'Delivery van authorization' },
      { kind: 'equipment', equipmentId: 'DeliveryVan', label: 'Delivery Van' },
      { kind: 'vehicleClass', vehicleClass: 'DeliveryVan', label: 'Delivery Van' },
      { kind: 'cargoCapability', cargoCapabilityId: 'light-parcel', label: 'Light-parcel handling' },
      { kind: 'workCapacity', minimumUnits: economyPolicy.starterDeliveryCapacityCost, label: 'Delivery van Work Capacity' },
      { kind: 'shiftAvailability', label: 'Current shift availability' },
    ],
  },
]

export const createEconomyBackedWorkActivityDefinitions = (
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): readonly WorkActivityDefinition[] => [
  ...createWorkActivityDefinitions(createEconomyBackedCapabilityPolicy(economyPolicy)),
  ...createAdvancedDeliveryWorkActivityDefinitions(economyPolicy),
]

/**
 * Maps only facts that already exist in Player Economy:
 * - active LightDeliveryEmployee -> current starter light-delivery employer authorization;
 * - starter smartphone -> smartphone equipment availability;
 * - LightDeliveryEmployee -> light-document handling for the starter role.
 *
 * Bicycle and advanced road-vehicle facts are never inferred from starter employment.
 * Their employer authorization, equipment/vehicle availability and light-parcel handling
 * must be supplied explicitly by the owning runtime.
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

export const evaluateElectricScooterCourierWorkAccess = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityEvaluation =>
  evaluatePlayerWorkAccess(
    evidence,
    'electric-scooter-light-parcel-delivery',
    economyState,
    facts,
    economyPolicy,
  )

export const evaluateMotorcycleCourierWorkAccess = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityEvaluation =>
  evaluatePlayerWorkAccess(
    evidence,
    'motorcycle-light-parcel-delivery',
    economyState,
    facts,
    economyPolicy,
  )

export const evaluateCarCourierWorkAccess = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityEvaluation =>
  evaluatePlayerWorkAccess(
    evidence,
    'car-light-parcel-delivery',
    economyState,
    facts,
    economyPolicy,
  )

export const evaluateDeliveryVanCourierWorkAccess = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CapabilityEvaluation =>
  evaluatePlayerWorkAccess(
    evidence,
    'delivery-van-light-parcel-delivery',
    economyState,
    facts,
    economyPolicy,
  )
