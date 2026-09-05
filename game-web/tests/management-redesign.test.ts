import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createInitialCompanyState } from '../src/state/gameState'
import { completeEmployeeOnboarding, EMPLOYEE_CANDIDATES, hireEmployee } from '../src/systems/employeeSystem'
import { purchaseVehicle, VEHICLE_CATALOG } from '../src/systems/vehicleSystem'
import { buildEmployeeCards, buildFleetCards, buildManagementOverview, pageItems } from '../src/ui/managementViewModel'
import {
  buildCompanyDashboardLayout, buildFinanceDashboardLayout, buildManagementCards,
  buildManagementLayout, buildStaffCardLayout, buildVehicleCardLayout,
} from '../src/ui/managementLayout'
import { rectInsideViewport, SUPPORTED_ANDROID_VIEWPORTS, type LayoutRect } from '../src/ui/mobileViewport'

const overlaps = (a: LayoutRect, b: LayoutRect) =>
  a.left < b.left + b.width && b.left < a.left + a.width &&
  a.top < b.top + b.height && b.top < a.top + a.height

const disjoint = (rects: LayoutRect[]) => {
  for (let a = 0; a < rects.length; a++) {
    for (let b = a + 1; b < rects.length; b++) expect(overlaps(rects[a], rects[b])).toBe(false)
  }
}

describe('Management data comes only from the active company and authoritative catalogs', () => {
  it('shows honest empty counts, money, level and reputation for a new company', () => {
    expect(buildManagementOverview(createInitialCompanyState())).toMatchObject({
      money: 0, level: 1, reputation: 50, employees: 0, activeEmployees: 0,
      fleet: 0, latestReview: null, reviews: { count: 0, averageRating: 0 },
    })
    expect(buildFleetCards(createInitialCompanyState()).every((vehicle) => !vehicle.canPurchase && !vehicle.owned)).toBe(true)
  })

  it('uses saved progression and latest actual review without mutating or inventing HQ progression', () => {
    const company = createInitialCompanyState()
    company.companyName = 'Saved company'
    company.money = 1234567
    company.level = 7
    company.reputation = 83
    company.employees = [
      { employeeId: 'saved', name: 'Sam', status: 'Active', role: 'Courier', salaryPerCycle: 47 },
      { employeeId: 'onboarding', name: 'Jo', status: 'Onboarding', role: 'Courier', salaryPerCycle: 19 },
    ]
    company.reviews = [
      { orderId: 'first', rating: 5, message: 'Great!', sentiment: 'Positive', reputationImpact: 2 },
      { orderId: 'last', rating: 1, message: 'Not delivered.', sentiment: 'Negative', reputationImpact: -5 },
    ]
    company.purchasedUpgradeLevels.Bicycle = 1
    const before = structuredClone(company)
    const overview = buildManagementOverview(company)
    expect(overview).toMatchObject({ name: 'Saved company', money: 1234567, level: 7,
      reputation: 83, employees: 2, activeEmployees: 1, fleet: 1, reviews: { count: 2, averageRating: 3 },
      latestReview: { orderId: 'last', message: 'Not delivered.' } })
    expect(company).toEqual(before)
    expect(buildEmployeeCards(company)[0]).toMatchObject({ name: 'Sam', salaryPerCycle: 47, status: 'Active' })
  })

  it.each(VEHICLE_CATALOG)('enables $name only at its real price, disables it after purchase', (definition) => {
    const poor = { ...createInitialCompanyState(), money: definition.purchaseCost - 1 }
    expect(buildFleetCards(poor).find((card) => card.typeId === definition.typeId)?.canPurchase).toBe(false)
    const rich = { ...poor, money: definition.purchaseCost }
    const card = buildFleetCards(rich).find((item) => item.typeId === definition.typeId)!
    expect(card).toMatchObject({ ...definition, affordable: true, canPurchase: true, owned: false })
    const result = purchaseVehicle(rich, definition.typeId)
    expect(result.purchased).toBe(true)
    expect(buildFleetCards(result.company).find((item) => item.typeId === definition.typeId))
      .toMatchObject({ owned: true, canPurchase: false })
  })

  it('preserves the legacy Bicycle ownership compatibility contract', () => {
    const company = createInitialCompanyState()
    company.purchasedUpgradeLevels.Bicycle = 1
    expect(buildFleetCards(company)[0]).toMatchObject({ owned: true, canPurchase: false })
    expect(buildManagementOverview(company).fleet).toBe(1)
    expect(company.vehicles).toHaveLength(0)
  })

  it('uses actual hire/onboarding/active states and disables unaffordable hiring', () => {
    const candidate = EMPLOYEE_CANDIDATES[0]
    const company = createInitialCompanyState()
    expect(buildEmployeeCards(company)[0]).toMatchObject({ status: 'Candidate', canAct: false, hireCost: candidate.hireCost })
    company.money = candidate.hireCost
    expect(buildEmployeeCards(company)[0].canAct).toBe(true)
    const hire = hireEmployee(company, candidate.employeeId)
    expect(buildEmployeeCards(hire.company)[0]).toMatchObject({ status: 'Onboarding', hired: true, canAct: true })
    const active = completeEmployeeOnboarding(hire.company, candidate.employeeId)
    expect(buildEmployeeCards(active.company)[0]).toMatchObject({ status: 'Active', canAct: false })
    expect(buildEmployeeCards(active.company)).toHaveLength(1)
  })

  it('pages every catalog entry exactly once and clamps after responsive page-size changes', () => {
    const items = [...VEHICLE_CATALOG]
    expect([...pageItems(items, 0, 2).items, ...pageItems(items, 1, 2).items]).toEqual(items)
    expect(pageItems(items, 3, 2)).toMatchObject({ page: 1, hasNext: false, hasPrevious: true })
    expect(pageItems([], 99, 2)).toMatchObject({ page: 0, items: [], hasNext: false, hasPrevious: false })
  })
})

describe('Responsive management surfaces have distinct content and 48px action bounds', () => {
  const viewports = [...SUPPORTED_ANDROID_VIEWPORTS, { width: 360, height: 740 }, { width: 740, height: 360 }]
  it.each(viewports)('prevents card, art, identity, bar, price, and action collisions at $width × $height', ({ width, height }) => {
    const catalog = buildManagementCards(width, height)
    disjoint([catalog.header, ...catalog.cards, ...catalog.navigation, catalog.pageLabel])
    for (const card of catalog.cards) {
      const boxes = buildVehicleCardLayout(card)
      const contents = [boxes.art, boxes.identity, ...boxes.capabilities, boxes.economics, boxes.purchase]
      disjoint(contents)
      for (const box of contents) {
        expect(rectInsideViewport(box, width, height)).toBe(true)
        expect(box.left).toBeGreaterThanOrEqual(card.left)
        expect(box.top).toBeGreaterThanOrEqual(card.top)
        expect(box.left + box.width).toBeLessThanOrEqual(card.left + card.width + 0.001)
        expect(box.top + box.height).toBeLessThanOrEqual(card.top + card.height + 0.001)
      }
    }
    const company = buildCompanyDashboardLayout(width, height)
    disjoint([company.header, company.hq, ...company.stats, company.review, ...company.navigation])
    for (const box of [company.hq, ...company.stats, company.review]) {
      expect(rectInsideViewport(box, width, height)).toBe(true)
      expect(box.height).toBeGreaterThanOrEqual(80)
    }
    const staff = buildStaffCardLayout(catalog.body)
    disjoint([staff.avatar, staff.identity, staff.salary, staff.action])
    const finance = buildFinanceDashboardLayout(width, height)
    disjoint([finance.header, ...finance.metrics, finance.operations, finance.action, ...finance.navigation])
    for (const action of [...catalog.navigation, staff.action, finance.action, ...buildManagementLayout(width, height).navigation]) {
      expect(action.width).toBeGreaterThanOrEqual(48)
      expect(action.height).toBeGreaterThanOrEqual(48)
      expect(rectInsideViewport(action, width, height)).toBe(true)
    }
  })

  it('management scenes use measured text and clear old display objects on every reflow', () => {
    for (const scene of ['CompanyManagement', 'VehicleFleet', 'EmployeeManagement', 'CustomerReviews', 'FinancialReport']) {
      const source = readFileSync(new URL(`../src/scenes/${scene}Scene.ts`, import.meta.url), 'utf8')
      expect(source).toContain('this.children.removeAll(true)')
      expect(source).toContain('fitText(')
      expect(source).toContain('drawManagementHeader(')
      expect(source).toContain('drawManagementFooter(')
      expect(source).toContain('this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)')
      expect(source).not.toContain('createInitialCompanyState')
    }
  })
})
