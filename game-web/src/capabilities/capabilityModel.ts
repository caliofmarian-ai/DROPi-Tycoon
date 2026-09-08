import type {
  PersonalCapabilityFamily,
  PersonalCapabilityId,
  PersonalProgressionState,
} from '../types/game'
import { STARTER_PERSONAL_CAPABILITY_IDS } from '../systems/personalCapabilitySystem'

export const CAPABILITY_EVIDENCE_STATE_VERSION = 1 as const

export interface CapabilityEvidenceState {
  version: typeof CAPABILITY_EVIDENCE_STATE_VERSION
  learnedCapabilityIds: PersonalCapabilityId[]
  theoryIds: string[]
  practicalTrainingIds: string[]
  qualificationIds: string[]
  supervisedExperienceById: Record<string, number>
}

/**
 * Narrow integration port for Agent 3's player-economy aggregate.
 * The capability domain queries these facts but never owns Personal Money,
 * employment state or Work Capacity mutation.
 */
export interface CapabilityEconomyPort {
  isEmployee(): boolean
  hasWorkCapacity(requiredUnits: number): boolean
  hasPersonalFunds(requiredMinor: number): boolean
}

export interface CapabilityRuntimeContext {
  economy?: CapabilityEconomyPort
  availableEquipmentIds?: readonly string[]
  availableVehicleClasses?: readonly string[]
  cargoCapabilityIds?: readonly string[]
  availableInfrastructureIds?: readonly string[]
  employerPermissionIds?: readonly string[]
  companyCapabilityIds?: readonly string[]
  worldAccessIds?: readonly string[]
  isActivityAvailableDuringCurrentShift?: (activityId: string) => boolean
}

export type CapabilityRequirement =
  | { kind: 'capability'; capabilityId: PersonalCapabilityId; label: string }
  | { kind: 'theory'; evidenceId: string; label: string }
  | { kind: 'practicalTraining'; evidenceId: string; label: string }
  | { kind: 'supervisedExperience'; evidenceId: string; label: string; minimumUnits: number }
  | { kind: 'qualification'; evidenceId: string; label: string }
  | { kind: 'equipment'; equipmentId: string; label: string }
  | { kind: 'vehicleClass'; vehicleClass: string; label: string }
  | { kind: 'cargoCapability'; cargoCapabilityId: string; label: string }
  | { kind: 'infrastructure'; infrastructureId: string; label: string }
  | { kind: 'employment'; label: string }
  | { kind: 'employerPermission'; permissionId: string; label: string }
  | { kind: 'companyCapability'; companyCapabilityId: string; label: string }
  | { kind: 'worldAccess'; worldAccessId: string; label: string }
  | { kind: 'workCapacity'; minimumUnits: number; label: string }
  | { kind: 'personalFunds'; minimumMinor: number; label: string }
  | { kind: 'shiftAvailability'; label: string }

export interface CapabilityDefinition {
  id: PersonalCapabilityId
  label: string
  family: PersonalCapabilityFamily
  acquisitionRequirements: readonly CapabilityRequirement[]
}

export interface WorkActivityDefinition {
  id: string
  label: string
  requirements: readonly CapabilityRequirement[]
}

export type CapabilityBlockerCode =
  | 'capability-missing'
  | 'training-required'
  | 'qualification-missing'
  | 'wrong-equipment'
  | 'vehicle-unavailable'
  | 'cargo-capability-insufficient'
  | 'facility-unavailable'
  | 'employment-required'
  | 'employer-authorization-missing'
  | 'company-capability-missing'
  | 'world-access-unavailable'
  | 'insufficient-work-capacity'
  | 'personal-funds-insufficient'
  | 'activity-unavailable-current-shift'
  | 'unknown-capability'
  | 'unknown-activity'

export interface CapabilityBlocker {
  code: CapabilityBlockerCode
  message: string
}

export interface CapabilityEvaluation {
  eligible: boolean
  blockers: CapabilityBlocker[]
}

export const createStarterCapabilityEvidence = (): CapabilityEvidenceState => ({
  version: CAPABILITY_EVIDENCE_STATE_VERSION,
  learnedCapabilityIds: [...STARTER_PERSONAL_CAPABILITY_IDS],
  theoryIds: [],
  practicalTrainingIds: [],
  qualificationIds: [],
  supervisedExperienceById: {},
})

/**
 * Existing Save v2 learned capability IDs remain earned history. This adapter does not
 * reinterpret old progression points and does not revoke previously earned capability.
 */
export const capabilityEvidenceFromPersonalProgression = (
  state: Pick<PersonalProgressionState, 'learnedCapabilityIds'>,
): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [...new Set<PersonalCapabilityId>([
    ...STARTER_PERSONAL_CAPABILITY_IDS,
    ...state.learnedCapabilityIds,
  ])],
})
