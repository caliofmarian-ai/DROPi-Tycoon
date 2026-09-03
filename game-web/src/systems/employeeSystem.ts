import { BALANCING } from '../config/balancing'
import { canAfford } from './economySettlement'
import type {
  CompanyState,
  EmployeeRole,
  EmployeeState,
  EmploymentStatus,
  FinancialState,
} from '../types/game'

export interface EmployeeCandidate {
  employeeId: string
  name: string
  role: EmployeeRole
  hireCost: number
  salaryPerCycle: number
}

export const EMPLOYEE_CANDIDATES: readonly EmployeeCandidate[] = [
  {
    employeeId: 'courier-001',
    name: 'Alex',
    role: 'Courier',
    hireCost: BALANCING.FIRST_COURIER_HIRE_COST,
    salaryPerCycle: BALANCING.FIRST_COURIER_SALARY_PER_CYCLE,
  },
] as const

export type HireEmployeeResult =
  | { hired: true; company: CompanyState; employee: EmployeeState; candidate: EmployeeCandidate; message: string }
  | { hired: false; company: CompanyState; candidate: EmployeeCandidate | null; reason: 'unknown-candidate' | 'already-hired' | 'not-enough-money' | 'invalid-state'; message: string }

export type OnboardingResult =
  | { activated: true; company: CompanyState; employee: EmployeeState; message: string }
  | { activated: false; company: CompanyState; employee: EmployeeState | null; reason: 'unknown-employee' | 'already-active' | 'invalid-status'; message: string }

export type SalaryCycleResult =
  | { processed: true; company: CompanyState; cycleId: number; totalSalary: number; chargedEmployeeIds: string[]; message: string }
  | { processed: false; company: CompanyState; cycleId: number; totalSalary: number; chargedEmployeeIds: string[]; reason: 'invalid-cycle' | 'already-processed' | 'out-of-sequence' | 'not-enough-money' | 'invalid-state'; message: string }

const isValidMoney = (value: number): boolean => Number.isSafeInteger(value) && value >= 0
const isValidSalary = (value: number): boolean => Number.isSafeInteger(value) && value >= 0
const findEmployee = (company: CompanyState, employeeId: string): EmployeeState | null =>
  company.employees.find((employee) => employee.employeeId === employeeId) ?? null

const financialsFor = (company: CompanyState): FinancialState =>
  company.financials ?? {
    lastProcessedDay: 0,
    totalRevenue: 0,
    totalOperatingExpenses: 0,
    totalSalaryExpenses: 0,
  }

export const getEmployeeCandidate = (employeeId: string): EmployeeCandidate | null =>
  EMPLOYEE_CANDIDATES.find((candidate) => candidate.employeeId === employeeId) ?? null

export const hireEmployee = (company: CompanyState, employeeId: string): HireEmployeeResult => {
  const candidate = getEmployeeCandidate(employeeId)
  if (!candidate) return { hired: false, company, candidate: null, reason: 'unknown-candidate', message: 'Employee candidate is not available.' }
  if (!isValidMoney(company.money) || !isValidMoney(candidate.hireCost) || !isValidSalary(candidate.salaryPerCycle)) {
    return { hired: false, company, candidate, reason: 'invalid-state', message: 'Company or employee cost data is invalid.' }
  }
  if (findEmployee(company, employeeId)) return { hired: false, company, candidate, reason: 'already-hired', message: `${candidate.name} is already part of the company.` }
  if (!canAfford(company.money, candidate.hireCost)) return { hired: false, company, candidate, reason: 'not-enough-money', message: `Not enough money. Hiring ${candidate.name} costs ${candidate.hireCost}.` }

  const money = company.money - candidate.hireCost
  if (!isValidMoney(money)) return { hired: false, company, candidate, reason: 'invalid-state', message: 'Hiring result is invalid.' }

  const employee: EmployeeState = {
    employeeId: candidate.employeeId,
    name: candidate.name,
    role: candidate.role,
    status: 'Onboarding',
    salaryPerCycle: candidate.salaryPerCycle,
  }

  return {
    hired: true,
    candidate,
    employee,
    company: { ...company, money, employees: [...company.employees, employee], payroll: { ...company.payroll }, financials: { ...financialsFor(company) } },
    message: `${candidate.name} hired. Complete onboarding to activate this employee.`,
  }
}

export const completeEmployeeOnboarding = (company: CompanyState, employeeId: string): OnboardingResult => {
  const employee = findEmployee(company, employeeId)
  if (!employee) return { activated: false, company, employee: null, reason: 'unknown-employee', message: 'Employee is not part of the company.' }
  if (employee.status === 'Active') return { activated: false, company, employee, reason: 'already-active', message: `${employee.name} is already active.` }
  if (employee.status !== 'Onboarding') return { activated: false, company, employee, reason: 'invalid-status', message: 'Employee onboarding state is invalid.' }

  const activatedEmployee: EmployeeState = { ...employee, status: 'Active' }
  return {
    activated: true,
    employee: activatedEmployee,
    company: {
      ...company,
      employees: company.employees.map((item) => item.employeeId === employeeId ? activatedEmployee : item),
      payroll: { ...company.payroll },
      financials: { ...financialsFor(company) },
    },
    message: `${employee.name} completed onboarding and is now active.`,
  }
}

const salaryEligible = (status: EmploymentStatus): boolean => status === 'Active'

export const processSalaryCycle = (company: CompanyState, cycleId: number): SalaryCycleResult => {
  const eligibleEmployees = company.employees.filter((employee) => salaryEligible(employee.status))
  const chargedEmployeeIds = eligibleEmployees.map((employee) => employee.employeeId)
  const totalSalary = eligibleEmployees.reduce((total, employee) => total + employee.salaryPerCycle, 0)
  const financials = financialsFor(company)

  if (!Number.isSafeInteger(cycleId) || cycleId <= 0) return { processed: false, company, cycleId, totalSalary, chargedEmployeeIds, reason: 'invalid-cycle', message: 'Salary cycle identifier must be a positive integer.' }
  if (!isValidMoney(company.money) || !Number.isSafeInteger(company.payroll.lastProcessedCycle) || company.payroll.lastProcessedCycle < 0 || eligibleEmployees.some((employee) => !isValidSalary(employee.salaryPerCycle)) || !Number.isSafeInteger(totalSalary) || totalSalary < 0 || !isValidMoney(financials.totalSalaryExpenses)) {
    return { processed: false, company, cycleId, totalSalary, chargedEmployeeIds, reason: 'invalid-state', message: 'Payroll state is invalid.' }
  }
  if (cycleId <= company.payroll.lastProcessedCycle) return { processed: false, company, cycleId, totalSalary, chargedEmployeeIds, reason: 'already-processed', message: `Salary cycle ${cycleId} was already processed.` }
  if (cycleId !== company.payroll.lastProcessedCycle + 1) return { processed: false, company, cycleId, totalSalary, chargedEmployeeIds, reason: 'out-of-sequence', message: `Salary cycle ${company.payroll.lastProcessedCycle + 1} must be processed next.` }
  if (!canAfford(company.money, totalSalary)) return { processed: false, company, cycleId, totalSalary, chargedEmployeeIds, reason: 'not-enough-money', message: `Company needs ${totalSalary} to process salary cycle ${cycleId}.` }

  const totalSalaryExpenses = financials.totalSalaryExpenses + totalSalary
  if (!isValidMoney(totalSalaryExpenses)) return { processed: false, company, cycleId, totalSalary, chargedEmployeeIds, reason: 'invalid-state', message: 'Payroll financial result is invalid.' }

  return {
    processed: true,
    cycleId,
    totalSalary,
    chargedEmployeeIds,
    company: {
      ...company,
      money: company.money - totalSalary,
      employees: company.employees.map((employee) => ({ ...employee })),
      payroll: { lastProcessedCycle: cycleId },
      financials: { ...financials, totalSalaryExpenses },
    },
    message: `Salary cycle ${cycleId} processed. Total salaries: ${totalSalary}.`,
  }
}
