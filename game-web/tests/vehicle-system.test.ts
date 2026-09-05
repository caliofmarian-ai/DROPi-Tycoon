import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState } from '../src/state/gameState'
import { purchaseUpgrade } from '../src/systems/upgradeSystem'
import {
  ownsVehicleType,
  purchaseVehicle,
  reconcileLegacyBicycleOwnership,
  selectActiveVehiclePresentation,
  VEHICLE_CATALOG,
} from '../src/systems/vehicleSystem'

describe('RBATCH-022 — vehicle catalog and ownership', () => {
  it('uses the canonical Phase-2 vehicle families with centralized costs', () => {
    expect(VEHICLE_CATALOG.map((vehicle) => vehicle.typeId)).toEqual([
      'Bicycle',
      'ElectricScooter',
      'Motorcycle',
      'DeliveryVan',
    ])
    expect(VEHICLE_CATALOG.map((vehicle) => vehicle.purchaseCost)).toEqual([
      BALANCING.BICYCLE_COST,
      BALANCING.ELECTRIC_SCOOTER_COST,
      BALANCING.MOTORCYCLE_COST,
      BALANCING.DELIVERY_VAN_COST,
    ])
  })

  it('purchases an affordable vehicle exactly once and records explicit ownership', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.ELECTRIC_SCOOTER_COST + 200

    const result = purchaseVehicle(company, 'ElectricScooter')
    expect(result.purchased).toBe(true)
    if (!result.purchased) return

    expect(result.company.money).toBe(200)
    expect(result.company.vehicles).toEqual([
      { vehicleId: 'VEHICLE-ELECTRICSCOOTER-001', typeId: 'ElectricScooter' },
    ])
    expect(ownsVehicleType(result.company, 'ElectricScooter')).toBe(true)

    const duplicate = purchaseVehicle(result.company, 'ElectricScooter')
    expect(duplicate).toMatchObject({ purchased: false, reason: 'already-owned' })
    expect(duplicate.company.money).toBe(200)
  })

  it('rejects unaffordable purchases without mutating company money or fleet', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.DELIVERY_VAN_COST - 1
    const snapshot = JSON.stringify(company)

    const result = purchaseVehicle(company, 'DeliveryVan')
    expect(result).toMatchObject({ purchased: false, reason: 'not-enough-money' })
    expect(JSON.stringify(company)).toBe(snapshot)
  })

  it('maps the historical Bicycle upgrade into explicit fleet ownership without charging again', () => {
    const company = createInitialCompanyState()
    company.money = 500
    company.purchasedUpgradeLevels.Bicycle = 1

    const reconciled = reconcileLegacyBicycleOwnership(company)
    expect(reconciled.money).toBe(500)
    expect(reconciled.vehicles).toEqual([
      { vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' },
    ])

    const attemptedRepurchase = purchaseVehicle(reconciled, 'Bicycle')
    expect(attemptedRepurchase).toMatchObject({ purchased: false, reason: 'already-owned' })
    expect(attemptedRepurchase.company.money).toBe(500)
  })

  it('keeps the old Bicycle upgrade purchase synchronized with the explicit fleet', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.BICYCLE_COST

    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(true)
    if (!result.purchased) return

    expect(result.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(result.company.vehicles).toEqual([
      { vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' },
    ])
  })

  it('buying Bicycle through the fleet also activates the historical movement upgrade flag', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.BICYCLE_COST

    const result = purchaseVehicle(company, 'Bicycle')
    expect(result.purchased).toBe(true)
    if (!result.purchased) return

    expect(result.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(result.company.vehicles).toHaveLength(1)
  })
})

describe('Workstream D — deterministic active-vehicle presentation rule', () => {
  it('presents walking when no personal delivery vehicle is owned', () => {
    const company = createInitialCompanyState()
    expect(selectActiveVehiclePresentation(company)).toBeNull()
  })

  it('prefers the highest-tier owned vehicle: van over motorcycle over scooter over bicycle', () => {
    const company = createInitialCompanyState()
    company.vehicles = [
      { vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' },
      { vehicleId: 'VEHICLE-ELECTRICSCOOTER-001', typeId: 'ElectricScooter' },
    ]
    expect(selectActiveVehiclePresentation(company)).toBe('ElectricScooter')

    company.vehicles.push({ vehicleId: 'VEHICLE-MOTORCYCLE-001', typeId: 'Motorcycle' })
    expect(selectActiveVehiclePresentation(company)).toBe('Motorcycle')

    company.vehicles.push({ vehicleId: 'VEHICLE-DELIVERYVAN-001', typeId: 'DeliveryVan' })
    expect(selectActiveVehiclePresentation(company)).toBe('DeliveryVan')
  })

  it('presents the Bicycle when it is the only owned vehicle', () => {
    const company = createInitialCompanyState()
    company.vehicles = [{ vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' }]
    expect(selectActiveVehiclePresentation(company)).toBe('Bicycle')
  })
})

describe('Workstream D — GameWorldScene binds the drawn player visual, not a placeholder cube', () => {
  const gameWorldSource = readFileSync(
    new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
    'utf8',
  )

  it('no longer preloads or references the placeholder player cube textures', () => {
    expect(gameWorldSource).not.toContain('player_character_idle')
    expect(gameWorldSource).not.toContain('player_character_move')
  })

  it('creates the code-drawn player visual and binds the active-vehicle presentation', () => {
    expect(gameWorldSource).toContain('createPlayerVisual(')
    expect(gameWorldSource).toContain('selectActiveVehiclePresentation(this.companyState)')
    expect(gameWorldSource).toContain('this.playerVisual.setState(')
  })

  it('drives facing/moving feedback from the drawn visual instead of texture swaps', () => {
    expect(gameWorldSource).not.toContain('.setTexture(')
    expect(gameWorldSource).toContain('this.playerVisual.setFacing(')
    expect(gameWorldSource).toContain('this.playerVisual.setMoving(')
  })
})

describe('Workstream F — GameWorldScene plays procedural audio cues for order lifecycle', () => {
  const gameWorldSource = readFileSync(
    new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
    'utf8',
  )

  it('imports the shared audio controller and unlocks it on the first tap', () => {
    expect(gameWorldSource).toContain("import { getAudioController, type AudioCue } from '../systems/audioSystem'")
    expect(gameWorldSource).toContain('getAudioController().unlock()')
  })

  it('maps order status transitions to order-accepted/delivery-success/delivery-failure cues', () => {
    expect(gameWorldSource).toContain("'order-accepted'")
    expect(gameWorldSource).toContain("'delivery-success'")
    expect(gameWorldSource).toContain("'delivery-failure'")
    expect(gameWorldSource).toContain('getAudioController().play(cue)')
  })

  it('syncs the controller enabled state from the persisted sound setting on scene create', () => {
    expect(gameWorldSource).toContain('getAudioController().setEnabled(session.settings.soundEnabled)')
  })
})
