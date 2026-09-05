import { BALANCING } from '../config/balancing'
import { canAfford } from './economySettlement'
import { calculateDailyVehicleMaintenanceExpense } from './vehicleSystem'
import type { CompanyState, FinancialState } from '../types/game'

export interface FinancialReport {
  income: number
  operatingExpenses: number
  salaryExpenses: number
  maintenanceExpenses: number
  totalExpenses: number
  netResult: number
  cashBalance: number
  lastProcessedDay: number
  lastSalaryCycle: number
}

export type DailyExpenseResult =
  | {
      processed: true
      company: CompanyState
      dayId: number
      amount: number
      maintenanceAmount: number
      activeEmployeeCount: number
      message: string
    }
  | {
      processed: false
      company: CompanyState
      dayId: number
      amount: number
      maintenanceAmount: number
      activeEmployeeCount: number
      reason: 'invalid-day' | 'already-processed' | 'out-of-sequence' | 'not-enough-money' | 'invalid-state'
      message: string
    }

const emptyFinancialState = (): FinancialState => ({
  lastProcessedDay: 0,
  totalRevenue: 0,
  totalOperatingExpenses: 0,
  totalSalaryExpenses: 0,
  totalMaintenanceExpenses: 0,
})

const financialsFor = (company: CompanyState): FinancialState =>
  company.financials ?? emptyFinancialState()

const validNonNegativeInteger = (value: number): boolean =>
  Number.isSafeInteger(value) && value >= 0

export const calculateDailyOperatingExpense = (company: CompanyState): number => {
  const activeEmployeeCount = company.employees.filter((employee) => employee.status === 'Active').length
  return (
    BALANCING.DAILY_BASE_OPERATING_EXPENSE +
    activeEmployeeCount * BALANCING.DAILY_ACTIVE_EMPLOYEE_OPERATING_EXPENSE
  )
}

export const processDailyOperatingExpense = (
  company: CompanyState,
  dayId: number,
): DailyExpenseResult => {
  const activeEmployeeCount = company.employees.filter((employee) => employee.status === 'Active').length
  const amount = calculateDailyOperatingExpense(company)
  const maintenanceAmount = calculateDailyVehicleMaintenanceExpense(company)
  const totalCost = amount + maintenanceAmount
  const financials = financialsFor(company)

  if (!Number.isSafeInteger(dayId) || dayId <= 0) {
    return { processed: false, company, dayId, amount, maintenanceAmount, activeEmployeeCount, reason: 'invalid-day', message: 'Operating day identifier must be a positive integer.' }
  }

  if (
    !validNonNegativeInteger(company.money) ||
    !validNonNegativeInteger(financials.lastProcessedDay) ||
    !validNonNegativeInteger(financials.totalRevenue) ||
    !validNonNegativeInteger(financials.totalOperatingExpenses) ||
    !validNonNegativeInteger(financials.totalSalaryExpenses) ||
    !validNonNegativeInteger(financials.totalMaintenanceExpenses) ||
    !validNonNegativeInteger(amount) ||
    !validNonNegativeInteger(maintenanceAmount)
  ) {
    return { processed: false, company, dayId, amount, maintenanceAmount, activeEmployeeCount, reason: 'invalid-state', message: 'Company financial state is invalid.' }
  }

  if (dayId <= financials.lastProcessedDay) {
    return { processed: false, company, dayId, amount, maintenanceAmount, activeEmployeeCount, reason: 'already-processed', message: `Operating day ${dayId} was already processed.` }
  }

  if (dayId !== financials.lastProcessedDay + 1) {
    return { processed: false, company, dayId, amount, maintenanceAmount, activeEmployeeCount, reason: 'out-of-sequence', message: `Operating day ${financials.lastProcessedDay + 1} must be processed next.` }
  }

  if (!canAfford(company.money, totalCost)) {
    return { processed: false, company, dayId, amount, maintenanceAmount, activeEmployeeCount, reason: 'not-enough-money', message: `Company needs ${totalCost} to close operating day ${dayId}.` }
  }

  const totalOperatingExpenses = financials.totalOperatingExpenses + amount
  const totalMaintenanceExpenses = financials.totalMaintenanceExpenses + maintenanceAmount
  if (!validNonNegativeInteger(totalOperatingExpenses) || !validNonNegativeInteger(totalMaintenanceExpenses)) {
    return { processed: false, company, dayId, amount, maintenanceAmount, activeEmployeeCount, reason: 'invalid-state', message: 'Operating expense result is invalid.' }
  }

  return {
    processed: true,
    dayId,
    amount,
    maintenanceAmount,
    activeEmployeeCount,
    company: {
      ...company,
      money: company.money - totalCost,
      financials: {
        ...financials,
        lastProcessedDay: dayId,
        totalOperatingExpenses,
        totalMaintenanceExpenses,
      },
    },
    message:
      maintenanceAmount > 0
        ? `Operating day ${dayId} closed. Expenses: ${amount}. Vehicle maintenance: ${maintenanceAmount}.`
        : `Operating day ${dayId} closed. Expenses: ${amount}.`,
  }
}

export const buildFinancialReport = (company: CompanyState): FinancialReport => {
  const financials = financialsFor(company)
  const totalExpenses =
    financials.totalOperatingExpenses + financials.totalSalaryExpenses + financials.totalMaintenanceExpenses
  return {
    income: financials.totalRevenue,
    operatingExpenses: financials.totalOperatingExpenses,
    salaryExpenses: financials.totalSalaryExpenses,
    maintenanceExpenses: financials.totalMaintenanceExpenses,
    totalExpenses,
    netResult: financials.totalRevenue - totalExpenses,
    cashBalance: company.money,
    lastProcessedDay: financials.lastProcessedDay,
    lastSalaryCycle: company.payroll.lastProcessedCycle,
  }
}
