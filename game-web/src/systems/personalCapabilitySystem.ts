import type {
  CompanyState,
  HQDepartmentId,
  PersonalCapabilityFamily,
  PersonalCapabilityId,
  PersonalProgressionState,
  VehicleTypeId,
} from '../types/game'
import { PERSONAL_CAPABILITY_IDS } from '../types/game'

export type PersonalCapabilityAvailability = 'Available' | 'Future'
export type PersonalCapabilityStatus = 'Learned' | 'Available' | 'Blocked' | 'Future'

export interface PersonalCapabilityPrerequisites {
  capabilityIds?: readonly PersonalCapabilityId[]
  minimumProgressionPoints?: number
  requiredHQDepartments?: readonly HQDepartmentId[]
}

export interface PersonalCapabilityDefinition {
  id: PersonalCapabilityId
  label: string
  family: PersonalCapabilityFamily
  availability: PersonalCapabilityAvailability
  prerequisites: PersonalCapabilityPrerequisites
}

/**
 * Replaceable progression tuning lives with the graph, not in UI scenes.
 * Values here are prototype balancing data, not permanent canon.
 */
export const PERSONAL_CAPABILITY_DEFINITIONS: readonly PersonalCapabilityDefinition[] = [
  {
    id: 'DeliveryAppLiteracy', label: 'Delivery App Literacy', family: 'Foundation', availability: 'Available', prerequisites: {},
  },
  {
    id: 'WalkingCourierFundamentals', label: 'Walking Courier Fundamentals', family: 'Foundation', availability: 'Available',
    prerequisites: { capabilityIds: ['DeliveryAppLiteracy'] },
  },
  {
    id: 'BicycleOperation', label: 'Bicycle Operation', family: 'Bicycle', availability: 'Available',
    prerequisites: { capabilityIds: ['WalkingCourierFundamentals'], minimumProgressionPoints: 1 },
  },
  {
    id: 'BicycleMaintenance', label: 'Bicycle Maintenance', family: 'Technical', availability: 'Future',
    prerequisites: { capabilityIds: ['BicycleOperation'], requiredHQDepartments: ['Maintenance'], minimumProgressionPoints: 2 },
  },
  {
    id: 'ElectricScooterOperation', label: 'Electric Scooter Operation', family: 'PoweredTwoWheel', availability: 'Future',
    prerequisites: { capabilityIds: ['WalkingCourierFundamentals'], minimumProgressionPoints: 2 },
  },
  {
    id: 'MotorcycleOperation', label: 'Motorcycle Operation', family: 'PoweredTwoWheel', availability: 'Future',
    prerequisites: { capabilityIds: ['ElectricScooterOperation'], minimumProgressionPoints: 3 },
  },
  {
    id: 'CarOperation', label: 'Car Operation', family: 'RoadVehicle', availability: 'Future',
    prerequisites: { capabilityIds: ['WalkingCourierFundamentals'], minimumProgressionPoints: 3 },
  },
  {
    id: 'DeliveryVanOperation', label: 'Delivery Van Operation', family: 'RoadVehicle', availability: 'Future',
    prerequisites: { capabilityIds: ['CarOperation'], minimumProgressionPoints: 4 },
  },
  {
    id: 'DispatchOperations', label: 'Dispatch Operations', family: 'Operations', availability: 'Future',
    prerequisites: { capabilityIds: ['DeliveryAppLiteracy'], minimumProgressionPoints: 2 },
  },
  {
    id: 'WarehouseOperations', label: 'Warehouse Operations', family: 'Operations', availability: 'Future',
    prerequisites: { capabilityIds: ['WalkingCourierFundamentals'], minimumProgressionPoints: 3 },
  },
  {
    id: 'Entrepreneurship', label: 'Entrepreneurship', family: 'Business', availability: 'Future',
    prerequisites: { capabilityIds: ['DeliveryAppLiteracy'], minimumProgressionPoints: 3 },
  },
  {
    id: 'VehicleMaintenance', label: 'Vehicle Maintenance', family: 'Technical', availability: 'Future',
    prerequisites: { capabilityIds: ['BicycleMaintenance'], requiredHQDepartments: ['Maintenance'], minimumProgressionPoints: 4 },
  },
  {
    id: 'DroneTheory', label: 'Drone Theory', family: 'Drone', availability: 'Future',
    prerequisites: { capabilityIds: ['DeliveryAppLiteracy'], minimumProgressionPoints: 5 },
  },
  {
    id: 'DroneOperation', label: 'Drone Operation', family: 'Drone', availability: 'Future',
    prerequisites: { capabilityIds: ['DroneTheory'], minimumProgressionPoints: 6 },
  },
  {
    id: 'AirCargoOperations', label: 'Air Cargo Operations', family: 'Air', availability: 'Future',
    prerequisites: { capabilityIds: ['WarehouseOperations'], minimumProgressionPoints: 8 },
  },
  {
    id: 'MaritimeCargoOperations', label: 'Maritime Cargo Operations', family: 'Maritime', availability: 'Future',
    prerequisites: { capabilityIds: ['WarehouseOperations'], minimumProgressionPoints: 8 },
  },
  {
    id: 'RailCargoOperations', label: 'Rail Cargo Operations', family: 'Rail', availability: 'Future',
    prerequisites: { capabilityIds: ['WarehouseOperations'], minimumProgressionPoints: 8 },
  },
] as const

export const STARTER_PERSONAL_CAPABILITY_IDS: readonly PersonalCapabilityId[] = [
  'DeliveryAppLiteracy',
  'WalkingCourierFundamentals',
] as const

export const createInitialPersonalProgressionState = (): PersonalProgressionState => ({
  experiencePoints: 0,
  progressionPoints: 0,
  learnedCapabilityIds: [...STARTER_PERSONAL_CAPABILITY_IDS],
})

export const getPersonalCapabilityDefinition = (id: PersonalCapabilityId): PersonalCapabilityDefinition => {
  const definition = PERSONAL_CAPABILITY_DEFINITIONS.find(item => item.id === id)
  if (!definition) throw new Error(`Missing personal capability definition: ${id}`)
  return definition
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isPersonalCapabilityId = (value: unknown): value is PersonalCapabilityId =>
  typeof value === 'string' && PERSONAL_CAPABILITY_IDS.some(id => id === value)

export const sanitizePersonalProgression = (
  value: unknown,
): { personalProgression: PersonalProgressionState; repaired: boolean } => {
  const defaults = createInitialPersonalProgressionState()
  if (value === undefined) return { personalProgression: defaults, repaired: false }
  if (!isRecord(value)) return { personalProgression: defaults, repaired: true }

  let repaired = false
  const experiencePoints = typeof value.experiencePoints === 'number' && Number.isSafeInteger(value.experiencePoints) && value.experiencePoints >= 0
    ? value.experiencePoints
    : (repaired = true, defaults.experiencePoints)
  const progressionPoints = typeof value.progressionPoints === 'number' && Number.isSafeInteger(value.progressionPoints) && value.progressionPoints >= 0
    ? value.progressionPoints
    : (repaired = true, defaults.progressionPoints)

  const learnedCapabilityIds: PersonalCapabilityId[] = [...STARTER_PERSONAL_CAPABILITY_IDS]
  const seen = new Set<PersonalCapabilityId>(learnedCapabilityIds)
  if (!Array.isArray(value.learnedCapabilityIds)) {
    repaired = true
  } else {
    value.learnedCapabilityIds.forEach(rawId => {
      if (!isPersonalCapabilityId(rawId)) {
        repaired = true
        return
      }
      if (seen.has(rawId)) return
      seen.add(rawId)
      learnedCapabilityIds.push(rawId)
    })
    for (const starterId of STARTER_PERSONAL_CAPABILITY_IDS) {
      if (!value.learnedCapabilityIds.includes(starterId)) repaired = true
    }
  }

  return { personalProgression: { experiencePoints, progressionPoints, learnedCapabilityIds }, repaired }
}

export const hasPersonalProgressionActivity = (state: PersonalProgressionState): boolean => {
  const defaults = createInitialPersonalProgressionState()
  if (state.experiencePoints !== defaults.experiencePoints || state.progressionPoints !== defaults.progressionPoints) return true
  if (state.learnedCapabilityIds.length !== defaults.learnedCapabilityIds.length) return true
  return defaults.learnedCapabilityIds.some(id => !state.learnedCapabilityIds.includes(id))
}

export interface PersonalCapabilityEvaluationContext {
  company?: CompanyState
}

export interface PersonalCapabilityEvaluation {
  capabilityId: PersonalCapabilityId
  status: PersonalCapabilityStatus
  missingCapabilityIds: PersonalCapabilityId[]
  missingProgressionPoints: number
  missingHQDepartments: HQDepartmentId[]
}

export const evaluatePersonalCapability = (
  state: PersonalProgressionState,
  capabilityId: PersonalCapabilityId,
  context: PersonalCapabilityEvaluationContext = {},
): PersonalCapabilityEvaluation => {
  const definition = getPersonalCapabilityDefinition(capabilityId)
  if (state.learnedCapabilityIds.includes(capabilityId)) {
    return { capabilityId, status: 'Learned', missingCapabilityIds: [], missingProgressionPoints: 0, missingHQDepartments: [] }
  }

  const missingCapabilityIds = (definition.prerequisites.capabilityIds ?? [])
    .filter(requiredId => !state.learnedCapabilityIds.includes(requiredId))
  const requiredPoints = definition.prerequisites.minimumProgressionPoints ?? 0
  const missingProgressionPoints = Math.max(0, requiredPoints - state.progressionPoints)
  const builtDepartments = new Set(context.company?.hq.constructedDepartments ?? [])
  const missingHQDepartments = (definition.prerequisites.requiredHQDepartments ?? [])
    .filter(departmentId => !builtDepartments.has(departmentId))

  if (definition.availability === 'Future') {
    return { capabilityId, status: 'Future', missingCapabilityIds, missingProgressionPoints, missingHQDepartments }
  }

  const blocked = missingCapabilityIds.length > 0 || missingProgressionPoints > 0 || missingHQDepartments.length > 0
  return {
    capabilityId,
    status: blocked ? 'Blocked' : 'Available',
    missingCapabilityIds,
    missingProgressionPoints,
    missingHQDepartments,
  }
}

export type LearnPersonalCapabilityResult =
  | { learned: true; state: PersonalProgressionState }
  | { learned: false; state: PersonalProgressionState; evaluation: PersonalCapabilityEvaluation }

/** Pure qualification transition. Progression points are thresholds in this slice, not spent currency. */
export const learnPersonalCapability = (
  state: PersonalProgressionState,
  capabilityId: PersonalCapabilityId,
  context: PersonalCapabilityEvaluationContext = {},
): LearnPersonalCapabilityResult => {
  const evaluation = evaluatePersonalCapability(state, capabilityId, context)
  if (evaluation.status === 'Learned') return { learned: true, state: { ...state, learnedCapabilityIds: [...state.learnedCapabilityIds] } }
  if (evaluation.status !== 'Available') return { learned: false, state, evaluation }
  return {
    learned: true,
    state: { ...state, learnedCapabilityIds: [...state.learnedCapabilityIds, capabilityId] },
  }
}

export const REQUIRED_PERSONAL_CAPABILITY_BY_VEHICLE: Readonly<Partial<Record<VehicleTypeId, PersonalCapabilityId>>> = {
  Bicycle: 'BicycleOperation',
  ElectricScooter: 'ElectricScooterOperation',
  Motorcycle: 'MotorcycleOperation',
  DeliveryVan: 'DeliveryVanOperation',
}

/** Eligibility query only. Current gameplay is not locked by this function until a later governed integration slice. */
export const hasPersonalCapabilityForVehicle = (
  state: PersonalProgressionState,
  vehicleTypeId: VehicleTypeId,
): boolean => {
  const required = REQUIRED_PERSONAL_CAPABILITY_BY_VEHICLE[vehicleTypeId]
  return required === undefined || state.learnedCapabilityIds.includes(required)
}
