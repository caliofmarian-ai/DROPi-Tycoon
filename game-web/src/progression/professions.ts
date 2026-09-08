import type { PersonalCapabilityId } from '../types/game'

export const PROFESSION_IDS = [
  'WalkingCourier',
  'BicycleCourier',
  'PoweredTwoWheelCourier',
  'RoadCourier',
  'DispatchOperator',
  'WarehouseSorter',
  'MaintenanceTechnician',
  'Entrepreneur',
] as const

export type ProfessionId = (typeof PROFESSION_IDS)[number]

export interface ProfessionDefinition {
  id: ProfessionId
  label: string
  representativeCapabilityIds: readonly PersonalCapabilityId[]
}

/**
 * A profession is a career identity/intent, not a permission shortcut. Actual work
 * remains gated by the capability engine plus current equipment, employer, world,
 * facility, cargo and Work Capacity facts.
 */
export const PROFESSION_DEFINITIONS: readonly ProfessionDefinition[] = [
  { id: 'WalkingCourier', label: 'Walking Courier', representativeCapabilityIds: ['WalkingCourierFundamentals'] },
  { id: 'BicycleCourier', label: 'Bicycle Courier', representativeCapabilityIds: ['BicycleOperation'] },
  { id: 'PoweredTwoWheelCourier', label: 'Powered Two-Wheel Courier', representativeCapabilityIds: ['ElectricScooterOperation'] },
  { id: 'RoadCourier', label: 'Car / Van Courier', representativeCapabilityIds: ['CarOperation', 'DeliveryVanOperation'] },
  { id: 'DispatchOperator', label: 'Dispatch / Route Operator', representativeCapabilityIds: ['DispatchOperations'] },
  { id: 'WarehouseSorter', label: 'Warehouse / Sorting Worker', representativeCapabilityIds: ['WarehouseOperations'] },
  { id: 'MaintenanceTechnician', label: 'Maintenance Technician', representativeCapabilityIds: ['BicycleMaintenance', 'VehicleMaintenance'] },
  { id: 'Entrepreneur', label: 'Entrepreneur', representativeCapabilityIds: ['Entrepreneurship'] },
] as const

export interface ProfessionHistoryEntry {
  professionId: ProfessionId
  changeOrdinal: number
}

export interface PersonalCareerState {
  activeProfessionId: ProfessionId
  history: ProfessionHistoryEntry[]
}

export const createStarterCareerState = (): PersonalCareerState => ({
  activeProfessionId: 'WalkingCourier',
  history: [{ professionId: 'WalkingCourier', changeOrdinal: 0 }],
})

const isProfessionId = (value: string): value is ProfessionId =>
  PROFESSION_IDS.some(id => id === value)

export type ChangeProfessionResult =
  | { changed: true; state: PersonalCareerState }
  | { changed: false; state: PersonalCareerState; reason: 'unknown-profession' | 'invalid-change-ordinal' }

/**
 * Career switching changes only career state. It never grants/revokes capability,
 * changes employer, creates company ownership or rewrites earned history.
 */
export const changeProfession = (
  state: PersonalCareerState,
  professionId: string,
  changeOrdinal: number,
): ChangeProfessionResult => {
  if (!isProfessionId(professionId)) return { changed: false, state, reason: 'unknown-profession' }
  const lastOrdinal = state.history.at(-1)?.changeOrdinal ?? -1
  if (!Number.isSafeInteger(changeOrdinal) || changeOrdinal < lastOrdinal) {
    return { changed: false, state, reason: 'invalid-change-ordinal' }
  }
  if (state.activeProfessionId === professionId) {
    return { changed: true, state: { ...state, history: [...state.history] } }
  }
  return {
    changed: true,
    state: {
      activeProfessionId: professionId,
      history: [...state.history, { professionId, changeOrdinal }],
    },
  }
}
