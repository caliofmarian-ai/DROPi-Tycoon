import { describe, expect, it } from 'vitest'
import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../src/state/gameState'
import {
  createSaveGame,
  decodeSave,
  restoreGameSessionFromSave,
} from '../src/persistence/saveSystem'
import { BALANCING } from '../src/config/balancing'
import { purchaseVehicle } from '../src/systems/vehicleSystem'
import type { GameSessionState } from '../src/types/game'

const makeSession = (): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
})

describe('RBATCH-022 — fleet Save v2 compatibility', () => {
  it('persists and restores explicit fleet ownership without changing Save format version', () => {
    const session = makeSession()
    session.company.money = BALANCING.ELECTRIC_SCOOTER_COST + 50
    const purchase = purchaseVehicle(session.company, 'ElectricScooter')
    expect(purchase.purchased).toBe(true)
    if (!purchase.purchased) return
    session.company = purchase.company

    const saved = createSaveGame(session)
    expect(saved.formatVersion).toBe(2)
    expect(saved.company.vehicles).toEqual([
      { vehicleId: 'VEHICLE-ELECTRICSCOOTER-001', typeId: 'ElectricScooter' },
    ])

    const decoded = decodeSave(JSON.stringify(saved))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.vehicles).toEqual(saved.company.vehicles)
    expect(restored.company.money).toBe(50)
  })

  it('repairs a pre-RBATCH-022 v2 save by adding fleet defaults without rejecting it', () => {
    const session = makeSession()
    const oldV2 = createSaveGame(session)
    const raw = JSON.stringify({
      ...oldV2,
      company: {
        ...oldV2.company,
        vehicles: undefined,
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.company.vehicles).toEqual([])
  })

  it('maps historical Bicycle ownership into the fleet when loading an older v2 save', () => {
    const session = makeSession()
    const oldV2 = createSaveGame(session)
    const raw = JSON.stringify({
      ...oldV2,
      company: {
        ...oldV2.company,
        purchasedUpgradeLevels: {
          ...oldV2.company.purchasedUpgradeLevels,
          Bicycle: 1,
        },
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.save.company.vehicles).toEqual([
      { vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' },
    ])

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(restored.company.vehicles[0]?.typeId).toBe('Bicycle')
    expect(restored.world.player.movementSpeed).toBe(BALANCING.BICYCLE_MOVEMENT_SPEED)
  })

  it('drops duplicate and malformed fleet rows during repair', () => {
    const session = makeSession()
    const save = createSaveGame(session)
    const raw = JSON.stringify({
      ...save,
      company: {
        ...save.company,
        vehicles: [
          { vehicleId: 'vehicle-1', typeId: 'Motorcycle' },
          { vehicleId: 'vehicle-1', typeId: 'DeliveryVan' },
          { vehicleId: 'vehicle-2', typeId: 'Motorcycle' },
          { vehicleId: '', typeId: 'Unknown' },
        ],
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.company.vehicles).toEqual([
      { vehicleId: 'vehicle-1', typeId: 'Motorcycle' },
    ])
  })
})
