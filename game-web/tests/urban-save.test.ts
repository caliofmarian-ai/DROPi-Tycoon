import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import { createSaveGame, decodeSave, restoreGameSessionFromSave, serializeGameSession } from '../src/persistence/saveSystem'
import type { GameSessionState } from '../src/types/game'

const session = (): GameSessionState => ({
  company: createInitialCompanyState(), settings: createInitialGameSettingsState(), world: createInitialWorldState(),
})
const defaults = { merchantOnboarded: false, activeTransport: 'walking' }

describe('additive urban Save v2 progress', () => {
  it('does not mark an absent optional urban section as damaged', () => {
    const game = session()
    const decoded = decodeSave(JSON.stringify({ ...createSaveGame(game), company: game.company }))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(false)
    expect(decoded.save.urban).toEqual(defaults)
  })

  it('round-trips urban progress and company state while regenerating transient world state', () => {
    const game = session()
    game.company.money = 325
    game.company.level = 4
    game.company.reputation = 71
    game.company.purchasedUpgradeLevels.Bicycle = 1
    game.company.vehicles = [{ vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' }]
    game.company.employees = [{ employeeId: 'e', name: 'Courier', role: 'Courier', status: 'Active', salaryPerCycle: 25 }]
    game.company.payroll.lastProcessedCycle = 3
    game.company.financials.totalRevenue = 900
    game.company.reviews = [{ orderId: 'ORDER-001', rating: 5, sentiment: 'Positive', message: 'Great', reputationImpact: 2 }]
    game.settings.tutorialCompleted = true
    game.world.urban = { merchantOnboarded: true, activeTransport: 'bicycle' }
    game.world.player.x = 999
    game.world.activeOrder.status = 'PickedUp'
    const snapshot = structuredClone(game)
    const raw = serializeGameSession(game)
    const parsed = JSON.parse(raw)
    expect(parsed.formatVersion).toBe(2)
    expect(parsed.urban).toEqual(game.world.urban)
    expect(parsed).not.toHaveProperty('world')
    expect(parsed).not.toHaveProperty('player')
    expect(parsed).not.toHaveProperty('activeOrder')
    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(false)
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company).toEqual(game.company)
    expect(restored.settings).toEqual(game.settings)
    expect(restored.world.urban).toEqual(game.world.urban)
    expect(restored.world.player.x).toBe(createInitialWorldState().player.x)
    expect(restored.world.activeOrder).toEqual(createInitialWorldState().activeOrder)
    expect(game).toEqual(snapshot)
    expect(restored.world.urban).not.toBe(decoded.save.urban)
  })

  it.each([1, 2])('migrates older v%i saves to unonboarded walking without losing supported progression', (formatVersion) => {
    const game = session()
    game.company.companyName = 'Legacy'
    game.company.money = 1234
    game.company.level = 3
    game.company.purchasedUpgradeLevels.Bicycle = 1
    game.settings.tutorialCompleted = true
    const decoded = decodeSave(JSON.stringify({ ...createSaveGame(game), formatVersion }))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.urban).toEqual(defaults)
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.world.urban).toEqual(defaults)
    expect(restored.company).toMatchObject({
      companyName: 'Legacy', money: 1234, level: 3, purchasedUpgradeLevels: { Bicycle: 1 },
    })
    expect(restored.settings.tutorialCompleted).toBe(true)
    expect(restored.company.vehicles).toEqual([{ vehicleId: 'VEHICLE-BICYCLE-001', typeId: 'Bicycle' }])
  })

  it.each([null, [], true, 'bicycle', {}, { merchantOnboarded: 'yes', activeTransport: 'drone' },
    { merchantOnboarded: 1, activeTransport: null }, { merchantOnboarded: false, activeTransport: 'constructor' }])(
    'repairs malformed urban fields %j independently of canonical progression', (urban) => {
      const game = session()
      game.company.money = 500
      const decoded = decodeSave(JSON.stringify({ ...createSaveGame(game), urban }))
      expect(decoded.kind).toBe('valid')
      if (decoded.kind !== 'valid') return
      expect(decoded.repaired).toBe(true)
      expect(decoded.save.urban).toEqual(defaults)
      expect(decoded.save.company.money).toBe(500)
    },
  )

  it('repairs only malformed fields and refuses an unowned bicycle at every save boundary', () => {
    const game = session()
    game.world.urban = { merchantOnboarded: true, activeTransport: 'bicycle' }
    expect(createSaveGame(game).urban).toEqual({ merchantOnboarded: true, activeTransport: 'walking' })
    const rawSave = { ...createSaveGame(game), urban: game.world.urban }
    expect(restoreGameSessionFromSave(rawSave).world.urban?.activeTransport).toBe('walking')
    const decoded = decodeSave(JSON.stringify(rawSave))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.urban).toEqual({ merchantOnboarded: true, activeTransport: 'walking' })
    expect(game.world.urban.activeTransport).toBe('bicycle')
    game.company.vehicles = [{ vehicleId: 'bike', typeId: 'Bicycle' }]
    expect(createSaveGame(game).urban?.activeTransport).toBe('bicycle')
    const fleetDecode = decodeSave(serializeGameSession(game))
    expect(fleetDecode.kind).toBe('valid')
    if (fleetDecode.kind === 'valid') expect(restoreGameSessionFromSave(fleetDecode.save).world.urban?.activeTransport).toBe('bicycle')
  })

  it('keeps explicit walking selected even when a bicycle is owned', () => {
    const game = session()
    game.company.purchasedUpgradeLevels.Bicycle = 1
    game.world.urban = { merchantOnboarded: false, activeTransport: 'walking' }
    const save = createSaveGame(game)
    expect(save.urban).toEqual(defaults)
    expect(restoreGameSessionFromSave(save).world.urban).toEqual(defaults)
  })
})
