import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import {
  assignVehicleToEmployee,
  calculateDailyEmployeeDeliveryRevenue,
  getAssignedVehicleForEmployee,
  getVehicleUsageState,
  unassignVehicleFromEmployee,
} from '../src/systems/employeeFleetSystem'
import { availableActiveTransports, resolveActiveTransport } from '../src/systems/activeTransportSystem'
import { buildFinancialReport, processDailyOperatingExpense } from '../src/systems/financialSystem'
import { decodeSave, restoreGameSessionFromSave, serializeGameSession } from '../src/persistence/saveSystem'

const productiveCompany = () => {
  const company = createInitialCompanyState()
  company.money = 100
  company.employees = [
    { employeeId: 'courier-001', name: 'Alex', role: 'Courier', status: 'Active', salaryPerCycle: 25 },
  ]
  company.vehicles = [
    { vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' },
    { vehicleId: 'VEHICLE-ELECTRICSCOOTER-001', typeId: 'ElectricScooter' },
  ]
  company.purchasedUpgradeLevels.Bicycle = 1
  return company
}

describe('Issue #346 — employee vehicle assignment', () => {
  it('blocks assigning the transport the player is actively using', () => {
    const company = productiveCompany()
    const result = assignVehicleToEmployee(company, 'bicycle', 'courier-001', 'VEHICLE-BICYCLE-001')
    expect(result).toMatchObject({ assigned: false, reason: 'vehicle-player-active' })
    expect(company.vehicles[0]).not.toHaveProperty('assignedEmployeeId')
  })

  it('assigns an idle company Bicycle to Alex after the player switches to the Scooter', () => {
    const company = productiveCompany()
    const result = assignVehicleToEmployee(company, 'scooter', 'courier-001', 'VEHICLE-BICYCLE-001')
    expect(result.assigned).toBe(true)
    if (!result.assigned) return

    expect(result.company.vehicles[0]).toEqual({
      vehicleId: 'VEHICLE-BICYCLE-001',
      typeId: 'Bicycle',
      assignedEmployeeId: 'courier-001',
    })
    expect(getAssignedVehicleForEmployee(result.company, 'courier-001')?.vehicleId).toBe('VEHICLE-BICYCLE-001')
    expect(getVehicleUsageState(result.company, 'scooter', 'VEHICLE-BICYCLE-001')).toBe('EmployeeAssigned')
    expect(getVehicleUsageState(result.company, 'scooter', 'VEHICLE-ELECTRICSCOOTER-001')).toBe('PlayerActive')
  })

  it('prevents employee-assigned vehicles from being selected by the player', () => {
    const company = productiveCompany()
    const assigned = assignVehicleToEmployee(company, 'scooter', 'courier-001', 'VEHICLE-BICYCLE-001')
    expect(assigned.assigned).toBe(true)
    if (!assigned.assigned) return

    expect(resolveActiveTransport(assigned.company, 'bicycle')).toBe('walking')
    expect(availableActiveTransports(assigned.company)).toEqual(['walking', 'scooter'])
  })

  it('releases the assigned vehicle back to the available company fleet', () => {
    const company = productiveCompany()
    const assigned = assignVehicleToEmployee(company, 'scooter', 'courier-001', 'VEHICLE-BICYCLE-001')
    expect(assigned.assigned).toBe(true)
    if (!assigned.assigned) return

    const released = unassignVehicleFromEmployee(assigned.company, 'VEHICLE-BICYCLE-001')
    expect(released.unassigned).toBe(true)
    if (!released.unassigned) return
    expect(released.company.vehicles[0]).toEqual({ vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' })
    expect(resolveActiveTransport(released.company, 'bicycle')).toBe('bicycle')
  })
})

describe('Issue #346 — productive employee delivery economy', () => {
  it('generates deterministic courier revenue only with an Active Courier and assigned vehicle', () => {
    const company = productiveCompany()
    expect(calculateDailyEmployeeDeliveryRevenue(company)).toBe(0)

    const assigned = assignVehicleToEmployee(company, 'scooter', 'courier-001', 'VEHICLE-BICYCLE-001')
    expect(assigned.assigned).toBe(true)
    if (!assigned.assigned) return
    expect(calculateDailyEmployeeDeliveryRevenue(assigned.company)).toBe(
      BALANCING.EMPLOYEE_COURIER_BICYCLE_REVENUE_PER_DAY,
    )

    assigned.company.employees[0].status = 'Onboarding'
    expect(calculateDailyEmployeeDeliveryRevenue(assigned.company)).toBe(0)
  })

  it('settles employee delivery income separately from operating and maintenance costs', () => {
    const company = productiveCompany()
    const assigned = assignVehicleToEmployee(company, 'scooter', 'courier-001', 'VEHICLE-BICYCLE-001')
    expect(assigned.assigned).toBe(true)
    if (!assigned.assigned) return

    const result = processDailyOperatingExpense(assigned.company, 1)
    expect(result.processed).toBe(true)
    if (!result.processed) return

    const revenue = BALANCING.EMPLOYEE_COURIER_BICYCLE_REVENUE_PER_DAY
    const operating = BALANCING.DAILY_BASE_OPERATING_EXPENSE + BALANCING.DAILY_ACTIVE_EMPLOYEE_OPERATING_EXPENSE
    const maintenance = BALANCING.BICYCLE_MAINTENANCE_COST_PER_DAY + BALANCING.ELECTRIC_SCOOTER_MAINTENANCE_COST_PER_DAY
    expect(result.employeeDeliveryRevenue).toBe(revenue)
    expect(result.company.money).toBe(100 + revenue - operating - maintenance)
    expect(result.company.financials.totalRevenue).toBe(revenue)
    expect(result.company.financials.totalEmployeeDeliveryRevenue).toBe(revenue)

    const report = buildFinancialReport(result.company)
    expect(report.employeeDeliveryIncome).toBe(revenue)
    expect(report.playerDeliveryIncome).toBe(0)
    expect(report.maintenanceExpenses).toBe(maintenance)
  })

  it('persists employee assignment and its revenue ledger through Save v2', () => {
    const company = productiveCompany()
    const assigned = assignVehicleToEmployee(company, 'scooter', 'courier-001', 'VEHICLE-BICYCLE-001')
    expect(assigned.assigned).toBe(true)
    if (!assigned.assigned) return
    const day = processDailyOperatingExpense(assigned.company, 1)
    expect(day.processed).toBe(true)
    if (!day.processed) return

    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'scooter' }
    const raw = serializeGameSession({ world, company: day.company, settings: createInitialGameSettingsState() })
    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.vehicles.find((vehicle) => vehicle.typeId === 'Bicycle')).toMatchObject({
      assignedEmployeeId: 'courier-001',
    })
    expect(restored.company.financials.totalEmployeeDeliveryRevenue).toBe(
      BALANCING.EMPLOYEE_COURIER_BICYCLE_REVENUE_PER_DAY,
    )
    expect(restored.world.urban?.activeTransport).toBe('scooter')
  })
})
