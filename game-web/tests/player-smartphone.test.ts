import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import {
  SMARTPHONE_FUTURE_APPS,
  SMARTPHONE_LIVE_APPS,
  buildSmartphoneSnapshot,
  smartphoneLayout,
} from '../src/ui/PlayerSmartphone'
import { SUPPORTED_ANDROID_VIEWPORTS } from '../src/ui/mobileViewport'
import { TOUCH_TARGET_MIN_PX } from '../src/ui/theme'

const source = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('issue #349 / #367 player smartphone foundation', () => {
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

  it('projects only existing authoritative mission, map and company state into the phone', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
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

    const snapshot = buildSmartphoneSnapshot(world, company, {
      point: { x: world.player.x + 30, y: world.player.y + 40 },
      title: 'Collect at Corner Shop',
      action: 'Pick up parcel',
    })

    expect(snapshot.delivery.lines).toContain('Status: Accepted')
    expect(snapshot.delivery.lines).toContain('Objective: Collect at Corner Shop')
    expect(snapshot.delivery.lines).toContain('Cargo: Parcel in hand')
    expect(snapshot.assets.lines).toContain('Company Money: $1,234')
    expect(snapshot.assets.lines).toContain('Employees: 1 active / 1 total')
    expect(snapshot.assets.lines).toContain('Fleet: 1 owned / 1 assigned')
    expect(snapshot.assets.lines).toContain('HQ: 2 departments built')
    expect(snapshot.map.lines).toContain('Transport: Walking')
    expect(snapshot.map.lines).toContain('Distance: 50u')

    const playerFacingProjection = JSON.stringify(snapshot)
    expect(playerFacingProjection).not.toContain('employee-private-id')
    expect(playerFacingProjection).not.toContain('vehicle-private-id')
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

  it('keeps physical company actions out of the smartphone interaction surface', () => {
    const phoneSource = source('../src/ui/PlayerSmartphone.ts')

    expect(phoneSource).not.toContain("scene.start('CompanyManagement')")
    expect(phoneSource).not.toContain("scene.start('EmployeeManagement')")
    expect(phoneSource).not.toContain("scene.start('VehicleFleet')")
    expect(phoneSource).not.toContain('constructDepartment(')
  })
})
