import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import {
  ACTIVE_TRANSPORT_LABELS,
  availableActiveTransports,
  nextActiveTransport,
  resolveActiveTransport,
} from '../src/systems/activeTransportSystem'
import { purchaseVehicle } from '../src/systems/vehicleSystem'
import { decodeSave, restoreGameSessionFromSave, serializeGameSession } from '../src/persistence/saveSystem'
import { urbanHUDLayout } from '../src/ui/UrbanHUD'

const buy = (company: ReturnType<typeof createInitialCompanyState>, typeId: 'Bicycle' | 'ElectricScooter' | 'Motorcycle' | 'DeliveryVan') => {
  company.money = 100_000
  const result = purchaseVehicle(company, typeId)
  expect(result.purchased).toBe(true)
  if (!result.purchased) throw new Error(`Expected ${typeId} purchase to succeed`)
  return result.company
}

describe('#324 authoritative active fleet selection', () => {
  it('exposes only walking plus actually-owned transports in stable progression order', () => {
    let company = createInitialCompanyState()
    expect(availableActiveTransports(company)).toEqual(['walking'])
    company = buy(company, 'ElectricScooter')
    expect(availableActiveTransports(company)).toEqual(['walking', 'scooter'])
    company = buy(company, 'Bicycle')
    company = buy(company, 'DeliveryVan')
    expect(availableActiveTransports(company)).toEqual(['walking', 'bicycle', 'scooter', 'van'])
  })

  it('cycles through owned fleet and never selects an unowned vehicle', () => {
    let company = createInitialCompanyState()
    company = buy(company, 'Bicycle')
    company = buy(company, 'ElectricScooter')
    company = buy(company, 'Motorcycle')
    expect(nextActiveTransport(company, 'walking')).toBe('bicycle')
    expect(nextActiveTransport(company, 'bicycle')).toBe('scooter')
    expect(nextActiveTransport(company, 'scooter')).toBe('motorcycle')
    expect(nextActiveTransport(company, 'motorcycle')).toBe('walking')
    expect(resolveActiveTransport(company, 'van')).toBe('walking')
  })

  it('uses player-readable labels for every selectable transport', () => {
    expect(ACTIVE_TRANSPORT_LABELS).toEqual({
      walking: 'Walking',
      bicycle: 'Bicycle',
      scooter: 'Electric Scooter',
      motorcycle: 'Motorcycle',
      van: 'Delivery Van',
    })
  })

  it('persists an owned scooter selection through Save v2 without changing format version', () => {
    let company = createInitialCompanyState()
    company = buy(company, 'ElectricScooter')
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'scooter' }
    const raw = serializeGameSession({
      world,
      company,
      settings: { tutorialCompleted: false, soundEnabled: true },
    })
    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.save.formatVersion).toBe(2)
    expect(decoded.save.urban?.activeTransport).toBe('scooter')
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.world.urban?.activeTransport).toBe('scooter')
  })

  it('repairs unsupported or unowned saved transports safely to walking', () => {
    const company = createInitialCompanyState()
    expect(resolveActiveTransport(company, 'scooter')).toBe('walking')
    expect(resolveActiveTransport(company, 'car')).toBe('walking')
    expect(resolveActiveTransport(company, '__proto__')).toBe('walking')
    expect(resolveActiveTransport(company, null)).toBe('walking')
  })
})

describe('#324 Android landscape viewport reclamation', () => {
  it('keeps mission and directional controls materially smaller at the owner screenshot aspect', () => {
    const layout = urbanHUDLayout(740, 360)
    expect(layout.objective.width).toBeLessThanOrEqual(360)
    expect(layout.objective.height).toBeLessThanOrEqual(52)
    expect(layout.pad.size * 3).toBeLessThanOrEqual(108)
    expect(layout.minimap.width).toBeLessThanOrEqual(100)
    expect(layout.action.width).toBeLessThanOrEqual(150)
  })
})
