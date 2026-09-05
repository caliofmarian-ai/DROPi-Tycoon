import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { settleDeliveryOutcome } from '../src/systems/economySettlement'
import { processSalaryCycle } from '../src/systems/employeeSystem'
import {
  buildFinancialReport,
  calculateDailyOperatingExpense,
  processDailyOperatingExpense,
} from '../src/systems/financialSystem'
import { calculateDailyVehicleMaintenanceExpense } from '../src/systems/vehicleSystem'
import {
  createSaveGame,
  decodeSave,
  restoreGameSessionFromSave,
  serializeGameSession,
} from '../src/persistence/saveSystem'
import { createInitialGameSettingsState } from '../src/state/gameState'

describe('RBATCH-019 — initial financial state', () => {
  it('starts with zero tracked income and expenses', () => {
    expect(createInitialCompanyState().financials).toEqual({
      lastProcessedDay: 0,
      totalRevenue: 0,
      totalOperatingExpenses: 0,
      totalSalaryExpenses: 0,
      totalMaintenanceExpenses: 0,
    })
  })

  it('calculates the base daily cost with no active employees', () => {
    expect(calculateDailyOperatingExpense(createInitialCompanyState())).toBe(
      BALANCING.DAILY_BASE_OPERATING_EXPENSE,
    )
  })

  it('adds only active employees to the operating cost', () => {
    const company = createInitialCompanyState()
    company.employees = [
      { employeeId: 'active', name: 'A', role: 'Courier', status: 'Active', salaryPerCycle: 25 },
      { employeeId: 'onboarding', name: 'B', role: 'Courier', status: 'Onboarding', salaryPerCycle: 25 },
    ]

    expect(calculateDailyOperatingExpense(company)).toBe(
      BALANCING.DAILY_BASE_OPERATING_EXPENSE +
        BALANCING.DAILY_ACTIVE_EMPLOYEE_OPERATING_EXPENSE,
    )
  })
})

describe('ISSUE-025 — deterministic daily expenses', () => {
  it('processes the next operating day exactly once', () => {
    const company = createInitialCompanyState()
    company.money = 100

    const result = processDailyOperatingExpense(company, 1)
    expect(result.processed).toBe(true)
    if (!result.processed) return

    expect(result.amount).toBe(BALANCING.DAILY_BASE_OPERATING_EXPENSE)
    expect(result.company.money).toBe(100 - BALANCING.DAILY_BASE_OPERATING_EXPENSE)
    expect(result.company.financials.lastProcessedDay).toBe(1)
    expect(result.company.financials.totalOperatingExpenses).toBe(
      BALANCING.DAILY_BASE_OPERATING_EXPENSE,
    )
    expect(company.money).toBe(100)
    expect(company.financials.lastProcessedDay).toBe(0)
  })

  it('rejects duplicate processing without charging twice', () => {
    const company = createInitialCompanyState()
    company.money = 100
    const first = processDailyOperatingExpense(company, 1)
    expect(first.processed).toBe(true)
    if (!first.processed) return

    const second = processDailyOperatingExpense(first.company, 1)
    expect(second.processed).toBe(false)
    if (second.processed) return
    expect(second.reason).toBe('already-processed')
    expect(second.company.money).toBe(first.company.money)
    expect(second.company.financials.totalOperatingExpenses).toBe(
      first.company.financials.totalOperatingExpenses,
    )
  })

  it('rejects an out-of-sequence day', () => {
    const company = createInitialCompanyState()
    company.money = 100
    const result = processDailyOperatingExpense(company, 2)
    expect(result.processed).toBe(false)
    if (result.processed) return
    expect(result.reason).toBe('out-of-sequence')
    expect(result.company.financials.lastProcessedDay).toBe(0)
  })

  it('does not advance the day when cash is insufficient', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.DAILY_BASE_OPERATING_EXPENSE - 1
    const snapshot = structuredClone(company)

    const result = processDailyOperatingExpense(company, 1)
    expect(result.processed).toBe(false)
    if (result.processed) return
    expect(result.reason).toBe('not-enough-money')
    expect(result.company).toEqual(snapshot)
    expect(company).toEqual(snapshot)
  })
})

describe('ISSUE-027 — authoritative financial report', () => {
  it('derives total expenses and net result instead of storing another profit field', () => {
    const company = createInitialCompanyState()
    company.money = 145
    company.financials = {
      lastProcessedDay: 2,
      totalRevenue: 300,
      totalOperatingExpenses: 30,
      totalSalaryExpenses: 50,
      totalMaintenanceExpenses: 0,
    }
    company.payroll.lastProcessedCycle = 2

    expect(buildFinancialReport(company)).toEqual({
      income: 300,
      operatingExpenses: 30,
      salaryExpenses: 50,
      maintenanceExpenses: 0,
      totalExpenses: 80,
      netResult: 220,
      cashBalance: 145,
      lastProcessedDay: 2,
      lastSalaryCycle: 2,
    })
    expect(company).not.toHaveProperty('profit')
  })

  it('records successful delivery revenue exactly through settlement', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    const completed = { ...world.activeOrder, status: 'Completed' as const }
    const company = createInitialCompanyState()

    const result = settleDeliveryOutcome(world.activeOrder, completed, company)
    expect(result.applied).toBe(true)
    if (!result.applied) return
    expect(result.company.financials.totalRevenue).toBe(BALANCING.ORDER_REWARD)

    const duplicate = settleDeliveryOutcome(result.order, result.order, result.company)
    expect(duplicate.applied).toBe(false)
    expect(result.company.financials.totalRevenue).toBe(BALANCING.ORDER_REWARD)
  })

  it('does not record failed deliveries as revenue', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    const failed = { ...world.activeOrder, status: 'Failed' as const }
    const company = createInitialCompanyState()

    const result = settleDeliveryOutcome(world.activeOrder, failed, company)
    expect(result.applied).toBe(true)
    if (!result.applied) return
    expect(result.company.financials.totalRevenue).toBe(0)
  })

  it('reports payroll expense produced by the existing salary system', () => {
    const company = createInitialCompanyState()
    company.money = 100
    company.employees = [
      { employeeId: 'courier-001', name: 'Alex', role: 'Courier', status: 'Active', salaryPerCycle: 25 },
    ]

    const payroll = processSalaryCycle(company, 1)
    expect(payroll.processed).toBe(true)
    if (!payroll.processed) return
    expect(payroll.company.financials.totalSalaryExpenses).toBe(25)
    expect(buildFinancialReport(payroll.company).salaryExpenses).toBe(25)
  })
})

describe('RBATCH-019 — compatible financial persistence', () => {
  it('persists financial activity when present and restores it', () => {
    const session = {
      world: createInitialWorldState(),
      company: createInitialCompanyState(),
      settings: createInitialGameSettingsState(),
    }
    session.company.money = 175
    session.company.financials = {
      lastProcessedDay: 3,
      totalRevenue: 300,
      totalOperatingExpenses: 30,
      totalSalaryExpenses: 25,
      totalMaintenanceExpenses: 0,
    }

    const raw = serializeGameSession(session)
    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.save.company.financials).toEqual(session.company.financials)

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.financials).toEqual(session.company.financials)
  })

  it('keeps zero financials out of the serialized shape for additive save-v2 compatibility', () => {
    const session = {
      world: createInitialWorldState(),
      company: createInitialCompanyState(),
      settings: createInitialGameSettingsState(),
    }
    expect(createSaveGame(session).company).not.toHaveProperty('financials')
  })

  it('repairs an older save-v2 payload that has no financial section', () => {
    const company = createInitialCompanyState()
    const raw = JSON.stringify({
      formatVersion: 2,
      company: {
        companyName: company.companyName,
        money: 100,
        level: company.level,
        reputation: company.reputation,
        purchasedUpgradeLevels: company.purchasedUpgradeLevels,
        employees: [],
        payroll: { lastProcessedCycle: 0 },
      },
      settings: { tutorialCompleted: false },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.company.financials).toEqual({
      lastProcessedDay: 0,
      totalRevenue: 0,
      totalOperatingExpenses: 0,
      totalSalaryExpenses: 0,
      totalMaintenanceExpenses: 0,
    })
  })
})

describe('RBATCH-023 / ISSUE-029 — vehicle maintenance cost tracking', () => {
  it('charges no maintenance for a fleet-less company', () => {
    const company = createInitialCompanyState()
    expect(calculateDailyVehicleMaintenanceExpense(company)).toBe(0)
  })

  it('sums centralized per-vehicle maintenance across the owned fleet', () => {
    const company = createInitialCompanyState()
    company.vehicles = [
      { vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' },
      { vehicleId: 'VEHICLE-MOTORCYCLE-001', typeId: 'Motorcycle' },
    ]
    expect(calculateDailyVehicleMaintenanceExpense(company)).toBe(
      BALANCING.BICYCLE_MAINTENANCE_COST_PER_DAY + BALANCING.MOTORCYCLE_MAINTENANCE_COST_PER_DAY,
    )
  })

  it('charges maintenance together with operating expenses in a single day-close, exactly once', () => {
    const company = createInitialCompanyState()
    company.money = 100
    company.vehicles = [{ vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' }]

    const result = processDailyOperatingExpense(company, 1)
    expect(result.processed).toBe(true)
    if (!result.processed) return

    expect(result.maintenanceAmount).toBe(BALANCING.BICYCLE_MAINTENANCE_COST_PER_DAY)
    expect(result.company.money).toBe(
      100 - BALANCING.DAILY_BASE_OPERATING_EXPENSE - BALANCING.BICYCLE_MAINTENANCE_COST_PER_DAY,
    )
    expect(result.company.financials.totalMaintenanceExpenses).toBe(
      BALANCING.BICYCLE_MAINTENANCE_COST_PER_DAY,
    )

    const duplicate = processDailyOperatingExpense(result.company, 1)
    expect(duplicate.processed).toBe(false)
    if (duplicate.processed) return
    expect(duplicate.company.financials.totalMaintenanceExpenses).toBe(
      BALANCING.BICYCLE_MAINTENANCE_COST_PER_DAY,
    )
  })

  it('blocks the day close when the combined operating and maintenance cost is unaffordable', () => {
    const company = createInitialCompanyState()
    company.vehicles = [{ vehicleId: 'VEHICLE-VAN-001', typeId: 'DeliveryVan' }]
    company.money = BALANCING.DAILY_BASE_OPERATING_EXPENSE + BALANCING.DELIVERY_VAN_MAINTENANCE_COST_PER_DAY - 1
    const snapshot = structuredClone(company)

    const result = processDailyOperatingExpense(company, 1)
    expect(result.processed).toBe(false)
    if (result.processed) return
    expect(result.reason).toBe('not-enough-money')
    expect(company).toEqual(snapshot)
  })

  it('reports maintenance as a recognizable expense category in the financial report', () => {
    const company = createInitialCompanyState()
    company.financials = {
      lastProcessedDay: 1,
      totalRevenue: 100,
      totalOperatingExpenses: 10,
      totalSalaryExpenses: 0,
      totalMaintenanceExpenses: 4,
    }
    const report = buildFinancialReport(company)
    expect(report.maintenanceExpenses).toBe(4)
    expect(report.totalExpenses).toBe(14)
    expect(report.netResult).toBe(86)
  })
})
