import { PERSONAL_CAPABILITY_IDS, type PersonalCapabilityId } from '../types/game'
import {
  CAPABILITY_DEFINITIONS,
  PROTOTYPE_CAPABILITY_POLICY,
  createWorkActivityDefinitions,
  type CapabilityPolicy,
} from './capabilityCatalog'
import type {
  CapabilityBlocker,
  CapabilityDefinition,
  CapabilityEvaluation,
  CapabilityEvidenceState,
  CapabilityRequirement,
  CapabilityRuntimeContext,
  WorkActivityDefinition,
} from './capabilityModel'

const includes = (values: readonly string[] | undefined, expected: string): boolean =>
  values?.includes(expected) ?? false

const isPersonalCapabilityId = (value: string): value is PersonalCapabilityId =>
  PERSONAL_CAPABILITY_IDS.some(id => id === value)

const blockerForRequirement = (
  requirement: CapabilityRequirement,
  state: CapabilityEvidenceState,
  context: CapabilityRuntimeContext,
  activityId?: string,
): CapabilityBlocker | null => {
  switch (requirement.kind) {
    case 'capability':
      return state.learnedCapabilityIds.includes(requirement.capabilityId)
        ? null
        : { code: 'capability-missing', message: `Capability required: ${requirement.label}.` }
    case 'theory':
      return state.theoryIds.includes(requirement.evidenceId)
        ? null
        : { code: 'training-required', message: `Training required: ${requirement.label}.` }
    case 'practicalTraining':
      return state.practicalTrainingIds.includes(requirement.evidenceId)
        ? null
        : { code: 'training-required', message: `Training required: ${requirement.label}.` }
    case 'supervisedExperience':
      return (state.supervisedExperienceById[requirement.evidenceId] ?? 0) >= requirement.minimumUnits
        ? null
        : { code: 'training-required', message: `Supervised experience required: ${requirement.label}.` }
    case 'qualification':
      return state.qualificationIds.includes(requirement.evidenceId)
        ? null
        : { code: 'qualification-missing', message: `Qualification missing: ${requirement.label}.` }
    case 'equipment':
      return includes(context.availableEquipmentIds, requirement.equipmentId)
        ? null
        : { code: 'wrong-equipment', message: `Wrong or unavailable equipment: ${requirement.label}.` }
    case 'vehicleClass':
      return includes(context.availableVehicleClasses, requirement.vehicleClass)
        ? null
        : { code: 'vehicle-unavailable', message: `Required vehicle is not owned or available: ${requirement.label}.` }
    case 'cargoCapability':
      return includes(context.cargoCapabilityIds, requirement.cargoCapabilityId)
        ? null
        : { code: 'cargo-capability-insufficient', message: `Insufficient cargo capability: ${requirement.label}.` }
    case 'infrastructure':
      return includes(context.availableInfrastructureIds, requirement.infrastructureId)
        ? null
        : { code: 'facility-unavailable', message: `Company facility unavailable: ${requirement.label}.` }
    case 'employment':
      return context.economy?.isEmployee()
        ? null
        : { code: 'employment-required', message: 'Active employment is required for this activity.' }
    case 'employerPermission':
      return includes(context.employerPermissionIds, requirement.permissionId)
        ? null
        : { code: 'employer-authorization-missing', message: `Employer authorization missing: ${requirement.label}.` }
    case 'companyCapability':
      return includes(context.companyCapabilityIds, requirement.companyCapabilityId)
        ? null
        : { code: 'company-capability-missing', message: `Company capability unavailable: ${requirement.label}.` }
    case 'worldAccess':
      return includes(context.worldAccessIds, requirement.worldAccessId)
        ? null
        : { code: 'world-access-unavailable', message: `World access unavailable: ${requirement.label}.` }
    case 'workCapacity':
      return context.economy?.hasWorkCapacity(requirement.minimumUnits)
        ? null
        : { code: 'insufficient-work-capacity', message: 'Insufficient Work Capacity.' }
    case 'personalFunds':
      return context.economy?.hasPersonalFunds(requirement.minimumMinor)
        ? null
        : { code: 'personal-funds-insufficient', message: 'Insufficient Personal Money for this requirement.' }
    case 'shiftAvailability':
      return activityId !== undefined && context.isActivityAvailableDuringCurrentShift?.(activityId)
        ? null
        : { code: 'activity-unavailable-current-shift', message: 'Activity unavailable during the current shift.' }
  }
}

const evaluateRequirements = (
  requirements: readonly CapabilityRequirement[],
  state: CapabilityEvidenceState,
  context: CapabilityRuntimeContext,
  activityId?: string,
): CapabilityEvaluation => {
  const blockers = requirements
    .map(requirement => blockerForRequirement(requirement, state, context, activityId))
    .filter((blocker): blocker is CapabilityBlocker => blocker !== null)
  return { eligible: blockers.length === 0, blockers }
}

export const evaluateCapabilityAcquisition = (
  state: CapabilityEvidenceState,
  capabilityId: string,
  context: CapabilityRuntimeContext = {},
  definitions: readonly CapabilityDefinition[] = CAPABILITY_DEFINITIONS,
): CapabilityEvaluation => {
  if (!isPersonalCapabilityId(capabilityId)) {
    return { eligible: false, blockers: [{ code: 'unknown-capability', message: 'This capability is not available.' }] }
  }
  if (state.learnedCapabilityIds.includes(capabilityId)) return { eligible: true, blockers: [] }
  const definition = definitions.find(item => item.id === capabilityId)
  if (!definition) {
    return { eligible: false, blockers: [{ code: 'unknown-capability', message: 'This capability is not available.' }] }
  }
  return evaluateRequirements(definition.acquisitionRequirements, state, context)
}

export const evaluateWorkActivity = (
  state: CapabilityEvidenceState,
  activityId: string,
  context: CapabilityRuntimeContext,
  activities: readonly WorkActivityDefinition[] = createWorkActivityDefinitions(),
): CapabilityEvaluation => {
  const activity = activities.find(item => item.id === activityId)
  if (!activity) {
    return { eligible: false, blockers: [{ code: 'unknown-activity', message: 'This work activity is not available.' }] }
  }
  return evaluateRequirements(activity.requirements, state, context, activity.id)
}

export type EarnCapabilityResult =
  | { earned: true; state: CapabilityEvidenceState }
  | { earned: false; state: CapabilityEvidenceState; evaluation: CapabilityEvaluation }

export const earnCapability = (
  state: CapabilityEvidenceState,
  capabilityId: string,
  context: CapabilityRuntimeContext = {},
  definitions: readonly CapabilityDefinition[] = CAPABILITY_DEFINITIONS,
): EarnCapabilityResult => {
  const evaluation = evaluateCapabilityAcquisition(state, capabilityId, context, definitions)
  if (!evaluation.eligible || !isPersonalCapabilityId(capabilityId)) {
    return { earned: false, state, evaluation }
  }
  if (state.learnedCapabilityIds.includes(capabilityId)) {
    return { earned: true, state: { ...state, learnedCapabilityIds: [...state.learnedCapabilityIds] } }
  }
  return {
    earned: true,
    state: { ...state, learnedCapabilityIds: [...state.learnedCapabilityIds, capabilityId] },
  }
}

const addEvidence = (values: readonly string[], evidenceId: string): string[] =>
  values.includes(evidenceId) ? [...values] : [...values, evidenceId]

export const completeTheory = (
  state: CapabilityEvidenceState,
  evidenceId: string,
): CapabilityEvidenceState => ({ ...state, theoryIds: addEvidence(state.theoryIds, evidenceId) })

export const completePracticalTraining = (
  state: CapabilityEvidenceState,
  evidenceId: string,
): CapabilityEvidenceState => ({ ...state, practicalTrainingIds: addEvidence(state.practicalTrainingIds, evidenceId) })

export const awardQualification = (
  state: CapabilityEvidenceState,
  evidenceId: string,
): CapabilityEvidenceState => ({ ...state, qualificationIds: addEvidence(state.qualificationIds, evidenceId) })

export const recordSupervisedExperience = (
  state: CapabilityEvidenceState,
  evidenceId: string,
  units: number,
): CapabilityEvidenceState => {
  if (!Number.isSafeInteger(units) || units <= 0) return state
  const current = state.supervisedExperienceById[evidenceId] ?? 0
  const next = current + units
  if (!Number.isSafeInteger(next)) return state
  return {
    ...state,
    supervisedExperienceById: { ...state.supervisedExperienceById, [evidenceId]: next },
  }
}

export interface CapabilityConfigurationValidation {
  valid: boolean
  errors: string[]
}

const validateRequirement = (
  requirement: CapabilityRequirement,
  knownCapabilityIds: ReadonlySet<PersonalCapabilityId>,
  ownerLabel: string,
): string[] => {
  const errors: string[] = []
  if (requirement.label.trim().length === 0) errors.push(`${ownerLabel} contains a requirement without a player label`)
  if (requirement.kind === 'capability' && !knownCapabilityIds.has(requirement.capabilityId)) {
    errors.push(`${ownerLabel} references unknown capability ${requirement.capabilityId}`)
  }
  if (requirement.kind === 'supervisedExperience' && (!Number.isSafeInteger(requirement.minimumUnits) || requirement.minimumUnits <= 0)) {
    errors.push(`${ownerLabel} has invalid supervised-experience units`)
  }
  if (requirement.kind === 'workCapacity' && (!Number.isSafeInteger(requirement.minimumUnits) || requirement.minimumUnits <= 0)) {
    errors.push(`${ownerLabel} has invalid Work Capacity units`)
  }
  if (requirement.kind === 'personalFunds' && (!Number.isSafeInteger(requirement.minimumMinor) || requirement.minimumMinor < 0)) {
    errors.push(`${ownerLabel} has invalid Personal Money requirement`)
  }
  return errors
}

const findCapabilityCycle = (definitions: readonly CapabilityDefinition[]): PersonalCapabilityId[] | null => {
  const byId = new Map(definitions.map(definition => [definition.id, definition] as const))
  const visited = new Set<PersonalCapabilityId>()
  const active = new Set<PersonalCapabilityId>()
  const stack: PersonalCapabilityId[] = []

  const visit = (id: PersonalCapabilityId): PersonalCapabilityId[] | null => {
    if (active.has(id)) {
      const start = stack.indexOf(id)
      return [...stack.slice(start), id]
    }
    if (visited.has(id)) return null
    visited.add(id)
    active.add(id)
    stack.push(id)
    const definition = byId.get(id)
    for (const requirement of definition?.acquisitionRequirements ?? []) {
      if (requirement.kind !== 'capability' || !byId.has(requirement.capabilityId)) continue
      const cycle = visit(requirement.capabilityId)
      if (cycle) return cycle
    }
    stack.pop()
    active.delete(id)
    return null
  }

  for (const definition of definitions) {
    const cycle = visit(definition.id)
    if (cycle) return cycle
  }
  return null
}

export const validateCapabilityPolicy = (policy: CapabilityPolicy): CapabilityConfigurationValidation => {
  const errors: string[] = []
  if (policy.policyId.trim().length === 0) errors.push('Capability policy requires a policyId')
  if (!Number.isSafeInteger(policy.starterWalkingWorkCapacityUnits) || policy.starterWalkingWorkCapacityUnits <= 0) {
    errors.push('Capability policy has invalid starter walking Work Capacity')
  }
  if (!Number.isSafeInteger(policy.bicycleWorkCapacityUnits) || policy.bicycleWorkCapacityUnits <= 0) {
    errors.push('Capability policy has invalid bicycle Work Capacity')
  }
  return { valid: errors.length === 0, errors }
}

export const validateCapabilityConfiguration = (
  definitions: readonly CapabilityDefinition[] = CAPABILITY_DEFINITIONS,
  activities: readonly WorkActivityDefinition[] = createWorkActivityDefinitions(PROTOTYPE_CAPABILITY_POLICY),
): CapabilityConfigurationValidation => {
  const errors: string[] = []
  const definitionIds = definitions.map(item => item.id)
  const knownCapabilityIds = new Set(definitionIds)
  if (new Set(definitionIds).size !== definitionIds.length) errors.push('Capability definitions contain duplicate IDs')

  const activityIds = activities.map(item => item.id)
  if (new Set(activityIds).size !== activityIds.length) errors.push('Work activity definitions contain duplicate IDs')

  for (const definition of definitions) {
    if (definition.label.trim().length === 0) errors.push(`Capability ${definition.id} requires a player label`)
    for (const requirement of definition.acquisitionRequirements) {
      errors.push(...validateRequirement(requirement, knownCapabilityIds, `Capability ${definition.label}`))
    }
  }
  for (const activity of activities) {
    if (activity.id.trim().length === 0 || activity.label.trim().length === 0) errors.push('Work activity requires stable ID and player label')
    for (const requirement of activity.requirements) {
      errors.push(...validateRequirement(requirement, knownCapabilityIds, `Activity ${activity.label}`))
    }
  }

  const cycle = findCapabilityCycle(definitions)
  if (cycle) errors.push(`Capability prerequisite cycle detected: ${cycle.join(' -> ')}`)
  return { valid: errors.length === 0, errors }
}
