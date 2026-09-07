import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { createInitialOwnershipEconomyState } from '../src/systems/ownershipEconomySystem'
import {
  SMARTPHONE_FUTURE_APPS,
  SMARTPHONE_LIVE_APPS,
  buildSmartphoneSnapshot,
  smartphoneLayout,
} from '../src/ui/PlayerSmartphone'
import { SUPPORTED_ANDROID_VIEWPORTS } from '../src/ui/mobileViewport'
import { TOUCH_TARGET_MIN_PX } from '../src/ui/theme'

const source = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8')

const objectiveFor = (world: ReturnType<typeof createInitialWorldState>) => ({
  point: { x: world.player.x + 30, y: world.player.y + 40 },
  title: 'Collect at Corner Shop',
  action: 'Pick up parcel',
})

describe('issue #349 / #367 / #392 player smartphone foundation', () => {
  it.each(SUPPORTED_ANDROID_VIEWPORTS)(
    'keeps the complete phone inside the supported Android viewport $width x $height',
    ({ width, height }) => {
      const layout = smartphoneLayout(width, height)
      const shellRight = layout.shell.left + layout.shell.width
      const shellBottom = layout.shell.top + layout.shell.height
      const liveWidth = (layout.live.width - (SMARTPHONE_LIVE_APPS.length - 1) * layout.live.gap) /
        SMARTPHONE_LIVE_APPS.length
      const futureRows = Math.ceil(SMARTPHONE_FUTURE_APPS.length / layout.future.columns)
      const futureBottom = layout.future.top + futureRows * layout.future.tileHeight +
        Math.max(0, futureRows - 1) * layout.future.gap

      expect(layout.portrait).toBe(width < height)
      expect(layout.shell.left).toBeGreaterThanOrEqual(0)
      expect(layout.shell.top).toBeGreaterThanOrEqual(0)
      expect(shellRight).toBeLessThanOrEqual(width)
      expect(shellBottom).toBeLessThanOrEqual(height)

      expect(layout.close.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
      expect(layout.close.x - layout.close.width / 2).toBeGreaterThanOrEqual(layout.shell.left)
      expect(layout.close.x + layout.close.width / 2).toBeLessThanOrEqual(shellRight)
      expect(layout.live.buttonHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
      expect(liveWidth).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
      expect(layout.future.tileHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
      expect(futureBottom).toBeLessThanOrEqual(shellBottom)

      expect(layout.content.left).toBeGreaterThanOrEqual(layout.shell.left)
      expect(layout.content.top).toBeGreaterThanOrEqual(layout.shell.top)
      expect(layout.content.left + layout.content.width).toBeLessThanOrEqual(shellRight)
      expect(layout.content.top + layout.content.height).toBeLessThanOrEqual(shellBottom)
      expect(layout.content.width).toBeGreaterThan(200)
      expect(layout.content.height).toBeGreaterThanOrEqual(120)
    },
  )

  it('uses stacked portrait geometry instead of forcing the landscape minimum width', () => {
    const portrait = smartphoneLayout(360, 640)
    const landscape = smartphoneLayout(640, 360)

    expect(portrait.shell.width).toBe(344)
    expect(portrait.live.width).toBe(portrait.content.width)
    expect(portrait.future.width).toBe(portrait.content.width)
    expect(portrait.content.top).toBeGreaterThan(portrait.future.top)
    expect(landscape.live.left + landscape.live.width).toBeLessThan(landscape.content.left)
  })

  it('shows safe legacy-materialized ownership defaults without changing Company Money', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    const ownership = createInitialOwnershipEconomyState()
    company.money = 1234

    const snapshot = buildSmartphoneSnapshot(world, company, ownership, objectiveFor(world))

    expect(snapshot.assets.heading).toBe('MONEY & OWNERSHIP')
    expect(snapshot.assets.lines).toContain('Company Money: $1,234')
    expect(snapshot.assets.lines).toContain('Personal Money: $0')
    expect(snapshot.assets.lines).toContain('Your shares: 0 internal · 0 external')
    expect(snapshot.assets.lines).toContain('Treasury shares: 5100 internal · 4900 external')
    expect(snapshot.assets.lines).toContain('Dividends received: $0')
    expect(snapshot.assets.lines).toContain('Founder: You · Executive: You')
  })

  it('projects populated Personal Money, holdings and dividend income from authoritative ownership state', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    const ownership = createInitialOwnershipEconomyState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.activeOrder.status = 'Accepted'
    world.player.carryingPackage = true
    company.money = 1234
    company.employees.push({
      employeeId: 'employee-private-id', name: 'Alex', role: 'Courier', status: 'Active', salaryPerCycle: 30,
    })
    company.vehicles.push({
      vehicleId: 'vehicle-private-id', typeId: 'Bicycle', assignedEmployeeId: 'employee-private-id',
    })
    company.hq.constructedDepartments = ['Core', 'Maintenance']

    ownership.personalAccounts[0] = {
      actorId: ownership.playerActorId,
      balance: 280,
      entries: [{
        transactionId: 'dividend-private-id',
        sequence: 1,
        actorId: ownership.playerActorId,
        delta: 280,
        reason: 'DividendIncome',
        companyId: ownership.companyId,
      }],
    }
    ownership.equity.holdings = [
      { actorId: ownership.playerActorId, poolId: 'InternalMember', units: 125 },
      { actorId: ownership.playerActorId, poolId: 'ExternalMarket', units: 40 },
    ]
    ownership.equity.pools = ownership.equity.pools.map(pool => ({
      ...pool,
      treasuryUnits: pool.poolId === 'InternalMember' ? 4975 : 4860,
    }))

    const snapshot = buildSmartphoneSnapshot(world, company, ownership, objectiveFor(world))

    expect(snapshot.delivery.lines).toContain('Status: Accepted')
    expect(snapshot.delivery.lines).toContain('Objective: Collect at Corner Shop')
    expect(snapshot.delivery.lines).toContain('Cargo: Parcel in hand')
    expect(snapshot.assets.lines).toContain('Company Money: $1,234')
    expect(snapshot.assets.lines).toContain('Personal Money: $280')
    expect(snapshot.assets.lines).toContain('Your shares: 125 internal · 40 external')
    expect(snapshot.assets.lines).toContain('Treasury shares: 4975 internal · 4860 external')
    expect(snapshot.assets.lines).toContain('Dividends received: $280')
    expect(snapshot.assets.lines).toContain('Founder: You · Executive: You')
    expect(snapshot.assets.lines).toContain('Rep 0 · Team 1/1 active')
    expect(snapshot.assets.lines).toContain('Fleet 1 owned/1 assigned · HQ 2 depts')
    expect(snapshot.map.lines).toContain('Transport: Walking')
    expect(snapshot.map.lines).toContain('Distance: 50u')

    const playerFacingProjection = JSON.stringify(snapshot)
    expect(playerFacingProjection).not.toContain('employee-private-id')
    expect(playerFacingProjection).not.toContain('vehicle-private-id')
    expect(playerFacingProjection).not.toContain(ownership.playerActorId)
    expect(playerFacingProjection).not.toContain(ownership.companyId)
    expect(playerFacingProjection).not.toContain('dividend-private-id')
  })

  it('keeps unavailable systems visibly future instead of pretending they are online', () => {
    expect(SMARTPHONE_FUTURE_APPS).toEqual([
      'Communications',
      'Training',
      'Marketplace',
      'Weather / News',
      'Investments',
      'Drone Ops',
    ])
  })

  it('implements the phone as a fixed HUD overlay rather than a state-resetting scene', () => {
    const hudSource = source('../src/ui/UrbanHUD.ts')
    const phoneSource = source('../src/ui/PlayerSmartphone.ts')
    const worldSource = source('../src/scenes/GameWorldScene.ts')

    expect(hudSource).toContain('new PlayerSmartphoneOverlay(scene, layer)')
    expect(hudSource).toContain('togglePhone(): void')
    expect(hudSource).toContain('return this.open || this.smartphone.isOpen()')
    expect(phoneSource).not.toContain("scene.start('PlayerSmartphone')")
    expect(phoneSource).not.toContain('scene.restart(')
    expect(worldSource).not.toContain("'PlayerSmartphone'")
  })

  it('keeps the phone ownership surface read-only and physical company actions at HQ', () => {
    const phoneSource = source('../src/ui/PlayerSmartphone.ts')

    expect(phoneSource).not.toContain("scene.start('CompanyManagement')")
    expect(phoneSource).not.toContain("scene.start('EmployeeManagement')")
    expect(phoneSource).not.toContain("scene.start('VehicleFleet')")
    expect(phoneSource).not.toContain('settleSessionInternalTreasuryPurchase(')
    expect(phoneSource).not.toContain('executeSessionExecutiveAppointment(')
    expect(phoneSource).not.toContain('constructDepartment(')
  })
})
