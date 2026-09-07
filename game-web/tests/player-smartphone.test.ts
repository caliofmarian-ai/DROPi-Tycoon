import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import {
  SMARTPHONE_FUTURE_APPS,
  buildSmartphoneSnapshot,
  smartphoneLayout,
} from '../src/ui/PlayerSmartphone'
import { TOUCH_TARGET_MIN_PX } from '../src/ui/theme'

const source = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('issue #349 player smartphone foundation', () => {
  it('keeps the phone visibly inside compact Android landscape while preserving world context around it', () => {
    const layout = smartphoneLayout(740, 360)

    expect(layout.shell.left).toBeGreaterThan(0)
    expect(layout.shell.top).toBeGreaterThan(0)
    expect(layout.shell.width).toBeLessThan(740)
    expect(layout.shell.height).toBeLessThan(360)
    expect(layout.close.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
    expect(layout.live.buttonHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
    expect(layout.future.tileHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
    expect(layout.content.width).toBeGreaterThan(200)
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
