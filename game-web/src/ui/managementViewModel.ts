import type { CompanyState } from '../types/game'
import { EMPLOYEE_CANDIDATES } from '../systems/employeeSystem'
import { buildCustomerReviewSummary } from '../systems/customerReviewSystem'
import { ownsVehicleType, reconcileLegacyBicycleOwnership, VEHICLE_CATALOG } from '../systems/vehicleSystem'

/** All displayed progression belongs to the existing company, never to demo fixtures. */
export const buildManagementOverview = (company: CompanyState) => {
  const reconciled = reconcileLegacyBicycleOwnership(company)
  const reviews = buildCustomerReviewSummary(company.reviews)
  return {
    name: company.companyName,
    money: company.money,
    level: company.level,
    reputation: company.reputation,
    employees: company.employees.length,
    activeEmployees: company.employees.filter((employee) => employee.status === 'Active').length,
    fleet: reconciled.vehicles.length,
    reviews,
    latestReview: company.reviews.at(-1) ?? null,
  }
}

export const buildFleetCards = (company: CompanyState) =>
  VEHICLE_CATALOG.map((definition) => {
    const owned = ownsVehicleType(company, definition.typeId)
    const affordable = Number.isSafeInteger(company.money) && company.money >= definition.purchaseCost
    return { ...definition, owned, affordable, canPurchase: !owned && affordable }
  })

export const buildEmployeeCards = (company: CompanyState) => [
  ...company.employees.map((employee) => ({
    ...employee, hireCost: 0, canAct: employee.status === 'Onboarding', hired: true,
  })),
  ...EMPLOYEE_CANDIDATES.filter((candidate) =>
    !company.employees.some((employee) => employee.employeeId === candidate.employeeId),
  ).map((candidate) => ({
    ...candidate, status: 'Candidate' as const,
    canAct: Number.isSafeInteger(company.money) && company.money >= candidate.hireCost, hired: false,
  })),
]

export const pageItems = <T>(items: readonly T[], requestedPage: number, pageSize: number) => {
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1
  const pageCount = Math.max(1, Math.ceil(items.length / size))
  const page = Math.min(pageCount - 1, Math.max(0, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 0))
  return { page, pageCount, items: items.slice(page * size, (page + 1) * size),
    hasPrevious: page > 0, hasNext: page < pageCount - 1 }
}

export const pageAfterResize = (page: number, previousSize: number, nextSize: number): number =>
  Math.floor(page * previousSize / Math.max(1, nextSize))
