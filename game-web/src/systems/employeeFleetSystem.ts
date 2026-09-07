import { BALANCING } from '../config/balancing'
import type {
  ActiveTransport,
  CompanyState,
  EmployeeState,
  OwnedVehicleState,
  VehicleTypeId,
} from '../types/game'

export type VehicleUsageState = 'PlayerActive' | 'EmployeeAssigned' | 'Available'

export interface EmployeeDeliveryRevenueLine {
  employeeId: string
  employeeName: string
  vehicleId: string
  vehicleTypeId: VehicleTypeId
  revenue: number
}

export type AssignVehicleResult =
  | { assigned: true; company: CompanyState; employee: EmployeeState; vehicle: OwnedVehicleState; message: string }
  | {
      assigned: false
      company: CompanyState
      reason:
        | 'unknown-employee'
        | 'employee-not-active'
        | 'incompatible-role'
        | 'employee-already-assigned'
        | 'unknown-vehicle'
        | 'vehicle-player-active'
        | 'vehicle-already-assigned'
      message: string
    }

export type UnassignVehicleResult =
  | { unassigned: true; company: CompanyState; vehicle: OwnedVehicleState; employee: EmployeeState | null; message: string }
  | { unassigned: false; company: CompanyState; reason: 'unknown-vehicle' | 'vehicle-not-assigned'; message: string }

const ACTIVE_TRANSPORT_VEHICLE_TYPES: Readonly<Partial<Record<ActiveTransport, VehicleTypeId>>> = {
  bicycle: 'Bicycle',
  scooter: 'ElectricScooter',
  motorcycle: 'Motorcycle',
  van: 'DeliveryVan',
}

const COURIER_COMPATIBLE_VEHICLES: readonly VehicleTypeId[] = [
  'Bicycle',
  'ElectricScooter',
  'Motorcycle',
  'DeliveryVan',
]

const vehicleTypeForTransport = (transport: ActiveTransport | undefined): VehicleTypeId | null =>
  transport ? ACTIVE_TRANSPORT_VEHICLE_TYPES[transport] ?? null : null

export const getAssignedVehicleForEmployee = (
  company: CompanyState,
  employeeId: string,
): OwnedVehicleState | null =>
  company.vehicles.find((vehicle) => vehicle.assignedEmployeeId === employeeId) ?? null

export const isVehicleAssigned = (vehicle: OwnedVehicleState): boolean =>
  typeof vehicle.assignedEmployeeId === 'string' && vehicle.assignedEmployeeId.length > 0

export const isVehicleTypeAvailableToPlayer = (
  company: CompanyState,
  typeId: VehicleTypeId,
): boolean => {
  const explicitVehicles = company.vehicles.filter((vehicle) => vehicle.typeId === typeId)
  if (explicitVehicles.length === 0) {
    return typeId === 'Bicycle' && company.purchasedUpgradeLevels.Bicycle > 0
  }
  return explicitVehicles.some((vehicle) => !isVehicleAssigned(vehicle))
}

export const getVehicleUsageState = (
  company: CompanyState,
  activeTransport: ActiveTransport | undefined,
  vehicleId: string,
): VehicleUsageState | null => {
  const vehicle = company.vehicles.find((item) => item.vehicleId === vehicleId)
  if (!vehicle) return null
  if (vehicle.assignedEmployeeId) return 'EmployeeAssigned'
  return vehicleTypeForTransport(activeTransport) === vehicle.typeId ? 'PlayerActive' : 'Available'
}

export const assignVehicleToEmployee = (
  company: CompanyState,
  activeTransport: ActiveTransport | undefined,
  employeeId: string,
  vehicleId: string,
): AssignVehicleResult => {
  const employee = company.employees.find((item) => item.employeeId === employeeId)
  if (!employee) {
    return { assigned: false, company, reason: 'unknown-employee', message: 'Employee is not part of the company.' }
  }
  if (employee.status !== 'Active') {
    return { assigned: false, company, reason: 'employee-not-active', message: `${employee.name} must complete onboarding before field assignment.` }
  }
  if (employee.role !== 'Courier') {
    return { assigned: false, company, reason: 'incompatible-role', message: `${employee.name} is not eligible for a courier vehicle assignment.` }
  }
  if (getAssignedVehicleForEmployee(company, employeeId)) {
    return { assigned: false, company, reason: 'employee-already-assigned', message: `${employee.name} already has an assigned company vehicle.` }
  }

  const vehicle = company.vehicles.find((item) => item.vehicleId === vehicleId)
  if (!vehicle) {
    return { assigned: false, company, reason: 'unknown-vehicle', message: 'Vehicle is not part of the company fleet.' }
  }
  if (!COURIER_COMPATIBLE_VEHICLES.includes(vehicle.typeId)) {
    return { assigned: false, company, reason: 'incompatible-role', message: 'Vehicle is not compatible with courier field work.' }
  }
  if (vehicle.assignedEmployeeId) {
    return { assigned: false, company, reason: 'vehicle-already-assigned', message: 'Vehicle is already assigned to another employee.' }
  }
  if (vehicleTypeForTransport(activeTransport) === vehicle.typeId) {
    return {
      assigned: false,
      company,
      reason: 'vehicle-player-active',
      message: 'Switch the player to another transport before assigning this vehicle to an employee.',
    }
  }

  const assignedVehicle: OwnedVehicleState = { ...vehicle, assignedEmployeeId: employee.employeeId }
  return {
    assigned: true,
    employee,
    vehicle: assignedVehicle,
    company: {
      ...company,
      vehicles: company.vehicles.map((item) => item.vehicleId === vehicleId ? assignedVehicle : { ...item }),
    },
    message: `${vehicle.typeId} assigned to ${employee.name}. Field delivery work is now active.`,
  }
}

export const unassignVehicleFromEmployee = (
  company: CompanyState,
  vehicleId: string,
): UnassignVehicleResult => {
  const vehicle = company.vehicles.find((item) => item.vehicleId === vehicleId)
  if (!vehicle) {
    return { unassigned: false, company, reason: 'unknown-vehicle', message: 'Vehicle is not part of the company fleet.' }
  }
  if (!vehicle.assignedEmployeeId) {
    return { unassigned: false, company, reason: 'vehicle-not-assigned', message: 'Vehicle is already available in the fleet.' }
  }
  const employee = company.employees.find((item) => item.employeeId === vehicle.assignedEmployeeId) ?? null
  const releasedVehicle: OwnedVehicleState = { vehicleId: vehicle.vehicleId, typeId: vehicle.typeId }
  return {
    unassigned: true,
    employee,
    vehicle: releasedVehicle,
    company: {
      ...company,
      vehicles: company.vehicles.map((item) => item.vehicleId === vehicleId ? releasedVehicle : { ...item }),
    },
    message: employee
      ? `${vehicle.typeId} released from ${employee.name} and returned to the available fleet.`
      : `${vehicle.typeId} returned to the available fleet.`,
  }
}

export const releaseEmployeeVehicleAssignments = (
  company: CompanyState,
  employeeId: string,
): CompanyState => ({
  ...company,
  vehicles: company.vehicles.map((vehicle) =>
    vehicle.assignedEmployeeId === employeeId
      ? { vehicleId: vehicle.vehicleId, typeId: vehicle.typeId }
      : { ...vehicle },
  ),
})

const baseCourierRevenueForVehicle = (typeId: VehicleTypeId): number => {
  switch (typeId) {
    case 'Bicycle': return BALANCING.EMPLOYEE_COURIER_BICYCLE_REVENUE_PER_DAY
    case 'ElectricScooter': return BALANCING.EMPLOYEE_COURIER_ELECTRIC_SCOOTER_REVENUE_PER_DAY
    case 'Motorcycle': return BALANCING.EMPLOYEE_COURIER_MOTORCYCLE_REVENUE_PER_DAY
    case 'DeliveryVan': return BALANCING.EMPLOYEE_COURIER_DELIVERY_VAN_REVENUE_PER_DAY
  }
}

export const buildEmployeeDeliveryRevenueLines = (
  company: CompanyState,
): EmployeeDeliveryRevenueLine[] => {
  const levelBonus = Math.min(
    BALANCING.EMPLOYEE_COURIER_LEVEL_BONUS_CAP,
    Math.max(0, company.level - 1) * BALANCING.EMPLOYEE_COURIER_LEVEL_BONUS_PER_DAY,
  )

  return company.vehicles.flatMap((vehicle) => {
    if (!vehicle.assignedEmployeeId) return []
    const employee = company.employees.find((item) => item.employeeId === vehicle.assignedEmployeeId)
    if (!employee || employee.status !== 'Active' || employee.role !== 'Courier') return []
    return [{
      employeeId: employee.employeeId,
      employeeName: employee.name,
      vehicleId: vehicle.vehicleId,
      vehicleTypeId: vehicle.typeId,
      revenue: baseCourierRevenueForVehicle(vehicle.typeId) + levelBonus,
    }]
  })
}

export const calculateDailyEmployeeDeliveryRevenue = (company: CompanyState): number =>
  buildEmployeeDeliveryRevenueLines(company).reduce((total, line) => total + line.revenue, 0)
