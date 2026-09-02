import { describe, expect, it } from 'vitest'
import { createInitialCompanyState } from '../src/state/gameState'
import {
  completeEmployeeOnboarding,
  EMPLOYEE_CANDIDATES,
  hireEmployee,
  processSalaryCycle,
} from '../src/systems/employeeSystem'

describe('RBATCH-018 / ISSUE-024 — employee model and catalog', () => {
  it('provides a deterministic first courier candidate with explicit costs', () => {
    expect(EMPLOYEE_CANDIDATES).toHaveLength(1)
    expect(EMPLOYEE_CANDIDATES[0]).toMatchObject({
      employeeId: 'courier-001',
      role: 'Courier',
    })
    expect(EMPLOYEE_CANDIDATES[0].hireCost).toBeGreaterThanOrEqual(0)
    expect(EMPLOYEE_CANDIDATES[0].salaryPerCycle).toBeGreaterThanOrEqual(0)
  })

  it('starts a new company with no employees and no processed payroll cycles', () => {
    const company = createInitialCompanyState()
    expect(company.employees).toEqual([])
    expect(company.payroll).toEqual({ lastProcessedCycle: 0 })
  })
})

describe('RBATCH-018 / ISSUE-032 — hiring and onboarding', () => {
  it('hires an affordable candidate exactly once into onboarding', () => {
    const company = createInitialCompanyState()
    const candidate = EMPLOYEE_CANDIDATES[0]
    company.money = candidate.hireCost

    const result = hireEmployee(company, candidate.employeeId)
    expect(result.hired).toBe(true)
    if (!result.hired) return

    expect(result.company.money).toBe(0)
    expect(result.company.employees).toEqual([
      {
        employeeId: candidate.employeeId,
        name: candidate.name,
        role: candidate.role,
        status: 'Onboarding',
        salaryPerCycle: candidate.salaryPerCycle,
      },
    ])
    expect(company.employees).toEqual([])
  })

  it('rejects a duplicate hire without changing company state', () => {
    const company = createInitialCompanyState()
    const candidate = EMPLOYEE_CANDIDATES[0]
    company.money = candidate.hireCost * 2
    const first = hireEmployee(company, candidate.employeeId)
    expect(first.hired).toBe(true)
    if (!first.hired) return

    const duplicate = hireEmployee(first.company, candidate.employeeId)
    expect(duplicate).toMatchObject({ hired: false, reason: 'already-hired' })
    expect(duplicate.company).toBe(first.company)
  })

  it('rejects hiring when company cannot afford the candidate', () => {
    const company = createInitialCompanyState()
    const candidate = EMPLOYEE_CANDIDATES[0]
    company.money = Math.max(0, candidate.hireCost - 1)

    expect(hireEmployee(company, candidate.employeeId)).toMatchObject({
      hired: false,
      reason: 'not-enough-money',
    })
  })

  it('rejects unknown candidates', () => {
    expect(hireEmployee(createInitialCompanyState(), 'missing')).toMatchObject({
      hired: false,
      reason: 'unknown-candidate',
    })
  })

  it('completes onboarding and activates the hired employee', () => {
    const company = createInitialCompanyState()
    const candidate = EMPLOYEE_CANDIDATES[0]
    company.money = candidate.hireCost
    const hired = hireEmployee(company, candidate.employeeId)
    expect(hired.hired).toBe(true)
    if (!hired.hired) return

    const activated = completeEmployeeOnboarding(hired.company, candidate.employeeId)
    expect(activated.activated).toBe(true)
    if (!activated.activated) return
    expect(activated.employee.status).toBe('Active')
    expect(activated.company.employees[0].status).toBe('Active')
  })

  it('does not duplicate activation for an already-active employee', () => {
    const company = createInitialCompanyState()
    const candidate = EMPLOYEE_CANDIDATES[0]
    company.money = candidate.hireCost
    const hired = hireEmployee(company, candidate.employeeId)
    if (!hired.hired) throw new Error('fixture hire failed')
    const activated = completeEmployeeOnboarding(hired.company, candidate.employeeId)
    if (!activated.activated) throw new Error('fixture onboarding failed')

    expect(completeEmployeeOnboarding(activated.company, candidate.employeeId)).toMatchObject({
      activated: false,
      reason: 'already-active',
    })
  })
})

describe('RBATCH-018 / ISSUE-026 — deterministic salary cycles', () => {
  const activeCompany = () => {
    const company = createInitialCompanyState()
    const candidate = EMPLOYEE_CANDIDATES[0]
    company.money = candidate.hireCost + candidate.salaryPerCycle * 5
    const hired = hireEmployee(company, candidate.employeeId)
    if (!hired.hired) throw new Error('fixture hire failed')
    const activated = completeEmployeeOnboarding(hired.company, candidate.employeeId)
    if (!activated.activated) throw new Error('fixture onboarding failed')
    return activated.company
  }

  it('charges only active employees', () => {
    const company = activeCompany()
    const before = company.money
    const salary = company.employees[0].salaryPerCycle

    const result = processSalaryCycle(company, 1)
    expect(result.processed).toBe(true)
    if (!result.processed) return
    expect(result.totalSalary).toBe(salary)
    expect(result.company.money).toBe(before - salary)
    expect(result.company.payroll.lastProcessedCycle).toBe(1)
    expect(result.chargedEmployeeIds).toEqual(['courier-001'])
  })

  it('does not charge employees who are still onboarding', () => {
    const company = createInitialCompanyState()
    const candidate = EMPLOYEE_CANDIDATES[0]
    company.money = candidate.hireCost
    const hired = hireEmployee(company, candidate.employeeId)
    if (!hired.hired) throw new Error('fixture hire failed')

    const result = processSalaryCycle(hired.company, 1)
    expect(result.processed).toBe(true)
    if (!result.processed) return
    expect(result.totalSalary).toBe(0)
    expect(result.chargedEmployeeIds).toEqual([])
    expect(result.company.payroll.lastProcessedCycle).toBe(1)
  })

  it('prevents duplicate processing of the same cycle', () => {
    const company = activeCompany()
    const first = processSalaryCycle(company, 1)
    if (!first.processed) throw new Error('fixture payroll failed')

    const duplicate = processSalaryCycle(first.company, 1)
    expect(duplicate).toMatchObject({ processed: false, reason: 'already-processed' })
    expect(duplicate.company.money).toBe(first.company.money)
  })

  it('rejects skipped salary cycles', () => {
    expect(processSalaryCycle(activeCompany(), 2)).toMatchObject({
      processed: false,
      reason: 'out-of-sequence',
    })
  })

  it('rejects invalid salary cycle identifiers', () => {
    expect(processSalaryCycle(activeCompany(), 0)).toMatchObject({
      processed: false,
      reason: 'invalid-cycle',
    })
  })

  it('keeps the cycle unprocessed when salaries cannot be afforded', () => {
    const company = activeCompany()
    company.money = 0
    const result = processSalaryCycle(company, 1)
    expect(result).toMatchObject({ processed: false, reason: 'not-enough-money' })
    expect(result.company.payroll.lastProcessedCycle).toBe(0)
  })
})
