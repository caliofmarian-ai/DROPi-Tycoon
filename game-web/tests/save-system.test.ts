import { describe, expect, it } from 'vitest'
import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../src/state/gameState'
import {
  autosaveIfApproved,
  CANONICAL_AUTOSAVE_EVENTS,
  createSaveGame,
  decodeSave,
  inspectSaveSlot,
  isCanonicalAutosaveEvent,
  LEGACY_SAVE_STORAGE_KEY,
  preserveInvalidSaveBeforeReplacement,
  restoreGameSessionFromSave,
  SAVE_CORRUPTED_BACKUP_KEY,
  SAVE_FORMAT_VERSION,
  SAVE_STAGING_KEY,
  SAVE_STORAGE_KEY,
  serializeGameSession,
  writeSaveSlot,
  type SaveStorage,
} from '../src/persistence/saveSystem'
import type { GameSessionState } from '../src/types/game'

class MemoryStorage implements SaveStorage {
  readonly values = new Map<string, string>()
  failOnSetKey: string | null = null

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failOnSetKey === key) {
      throw new Error(`write failed for ${key}`)
    }
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

const makeSession = (): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
})

const makeLegacyV1Raw = (): string =>
  JSON.stringify({
    formatVersion: 1,
    company: {
      companyName: 'DROPi Legacy',
      money: 900,
      level: 2,
      reputation: 61,
      purchasedUpgradeLevels: {
        DeliverySpeed: 0,
        Capacity: 0,
        Efficiency: 0,
        Bicycle: 1,
      },
    },
    settings: { tutorialCompleted: true },
  })

describe('RBATCH-014 + RBATCH-018 — canonical save serialization', () => {
  it('serializes current company progression including Phase-2 employees and payroll', () => {
    const session = makeSession()
    session.company.companyName = 'DROPi Express'
    session.company.money = 2450
    session.company.level = 3
    session.company.reputation = 17
    session.company.purchasedUpgradeLevels.Bicycle = 1
    session.company.employees = [
      {
        employeeId: 'courier-001',
        name: 'Alex',
        role: 'Courier',
        status: 'Active',
        salaryPerCycle: 25,
      },
    ]
    session.company.payroll.lastProcessedCycle = 4
    session.settings.tutorialCompleted = true

    expect(createSaveGame(session)).toEqual({
      formatVersion: SAVE_FORMAT_VERSION,
      company: {
        companyName: 'DROPi Express',
        money: 2450,
        level: 3,
        reputation: 17,
        purchasedUpgradeLevels: {
          DeliverySpeed: 0,
          Capacity: 0,
          Efficiency: 0,
          Bicycle: 1,
        },
        employees: [
          {
            employeeId: 'courier-001',
            name: 'Alex',
            role: 'Courier',
            status: 'Active',
            salaryPerCycle: 25,
          },
        ],
        payroll: { lastProcessedCycle: 4 },
      },
      settings: { tutorialCompleted: true, soundEnabled: true },
    })
  })

  it('still excludes player position and all WorldState', () => {
    const session = makeSession()
    session.world.player.x = 123
    session.world.player.y = 456
    session.world.player.currentOrder = 'ORDER-001'
    session.world.activeOrder.status = 'PickedUp'

    const parsed = JSON.parse(serializeGameSession(session)) as Record<string, unknown>
    expect(parsed).not.toHaveProperty('world')
    expect(parsed).not.toHaveProperty('player')
    expect(JSON.stringify(parsed)).not.toContain('currentOrder')
    expect(JSON.stringify(parsed)).not.toContain('activeOrder')
  })

  it('still persists only tutorial status from settings', () => {
    const session = makeSession()
    const parsed = JSON.parse(serializeGameSession(session)) as {
      settings: Record<string, unknown>
    }

    expect(parsed.settings).toEqual({ tutorialCompleted: false, soundEnabled: true })
    expect(parsed.settings).not.toHaveProperty('language')
    expect(parsed.settings).not.toHaveProperty('sound')
    expect(parsed.settings).not.toHaveProperty('music')
    expect(parsed.settings).not.toHaveProperty('difficulty')
  })

  it('ignores unapproved extra fields when decoding a compatible save', () => {
    const session = makeSession()
    const raw = JSON.stringify({
      ...createSaveGame(session),
      player: { x: 999, y: 999 },
      activeOrder: { status: 'PickedUp' },
      settings: {
        tutorialCompleted: true,
        language: 'ro',
        sound: false,
        music: false,
        difficulty: 'hard',
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.save.settings).toEqual({ tutorialCompleted: true, soundEnabled: true })
    expect(decoded.save).not.toHaveProperty('player')
    expect(decoded.save).not.toHaveProperty('activeOrder')
  })
})

describe('RBATCH-018 — v1 to v2 migration', () => {
  it('migrates a valid v1 payload without losing existing progression', () => {
    const decoded = decodeSave(makeLegacyV1Raw())
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return

    expect(decoded.migratedFrom).toBe(1)
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.formatVersion).toBe(2)
    expect(decoded.save.company).toMatchObject({
      companyName: 'DROPi Legacy',
      money: 900,
      level: 2,
      reputation: 61,
      employees: [],
      payroll: { lastProcessedCycle: 0 },
    })
    expect(decoded.save.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(decoded.save.settings.tutorialCompleted).toBe(true)
  })

  it('finds a legacy v1 storage key when no v2 save exists', () => {
    const storage = new MemoryStorage()
    storage.setItem(LEGACY_SAVE_STORAGE_KEY, makeLegacyV1Raw())

    const inspection = inspectSaveSlot(storage)
    expect(inspection.kind).toBe('valid')
    if (inspection.kind !== 'valid') return
    expect(inspection.source).toBe('legacy-primary')
    expect(inspection.migratedFrom).toBe(1)
    expect(inspection.save.company.money).toBe(900)
  })

  it('prefers a current v2 save over an older legacy slot', () => {
    const storage = new MemoryStorage()
    storage.setItem(LEGACY_SAVE_STORAGE_KEY, makeLegacyV1Raw())
    const session = makeSession()
    session.company.money = 1234
    writeSaveSlot(storage, session)

    const inspection = inspectSaveSlot(storage)
    expect(inspection.kind).toBe('valid')
    if (inspection.kind !== 'valid') return
    expect(inspection.source).toBe('primary')
    expect(inspection.save.company.money).toBe(1234)
  })
})

describe('ISSUE-015 / ISSUE-017 / RBATCH-018 — validation and load', () => {
  it('restores progression and employees while regenerating world state', () => {
    const session = makeSession()
    session.company.money = 3210
    session.company.level = 4
    session.company.reputation = 23
    session.company.purchasedUpgradeLevels.Bicycle = 1
    session.company.employees = [
      {
        employeeId: 'courier-001',
        name: 'Alex',
        role: 'Courier',
        status: 'Active',
        salaryPerCycle: 25,
      },
    ]
    session.company.payroll.lastProcessedCycle = 2
    session.settings.tutorialCompleted = true
    session.world.player.x = 50
    session.world.player.y = 70
    session.world.player.currentOrder = 'ORDER-001'
    session.world.player.carryingPackage = true
    session.world.activeOrder.status = 'PickedUp'

    const decoded = decodeSave(serializeGameSession(session))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.money).toBe(3210)
    expect(restored.company.level).toBe(4)
    expect(restored.company.reputation).toBe(23)
    expect(restored.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(restored.company.employees).toHaveLength(1)
    expect(restored.company.employees[0].status).toBe('Active')
    expect(restored.company.payroll.lastProcessedCycle).toBe(2)
    expect(restored.settings.tutorialCompleted).toBe(true)

    expect(restored.world.player.x).toBe(380)
    expect(restored.world.player.y).toBe(270)
    expect(restored.world.player.currentOrder).toBe('')
    expect(restored.world.player.carryingPackage).toBe(false)
    expect(restored.world.activeOrder.status).toBe('Available')
    expect(restored.world.player.movementSpeed).toBeGreaterThan(150)
  })

  it('uses safe defaults for individually missing or invalid required fields', () => {
    const raw = JSON.stringify({
      formatVersion: SAVE_FORMAT_VERSION,
      company: {
        companyName: '',
        money: -5,
        level: 0,
        reputation: 'bad',
        purchasedUpgradeLevels: {
          DeliverySpeed: -1,
          Capacity: 2,
          Efficiency: 1.5,
        },
        employees: 'bad',
        payroll: { lastProcessedCycle: -1 },
      },
      settings: { tutorialCompleted: 'yes' },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return

    const defaults = createInitialCompanyState()
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.company.companyName).toBe(defaults.companyName)
    expect(decoded.save.company.money).toBe(defaults.money)
    expect(decoded.save.company.level).toBe(defaults.level)
    expect(decoded.save.company.reputation).toBe(defaults.reputation)
    expect(decoded.save.company.purchasedUpgradeLevels).toEqual({
      DeliverySpeed: 0,
      Capacity: 2,
      Efficiency: 0,
      Bicycle: 0,
    })
    expect(decoded.save.company.employees).toEqual([])
    expect(decoded.save.company.payroll).toEqual({ lastProcessedCycle: 0 })
    expect(decoded.save.settings.tutorialCompleted).toBe(false)
  })

  it('drops malformed or duplicate employee rows without crashing', () => {
    const session = makeSession()
    const save = createSaveGame(session)
    const raw = JSON.stringify({
      ...save,
      company: {
        ...save.company,
        employees: [
          { employeeId: 'x', name: 'A', role: 'Courier', status: 'Active', salaryPerCycle: 10 },
          { employeeId: 'x', name: 'B', role: 'Courier', status: 'Active', salaryPerCycle: 20 },
          { employeeId: '', name: '', role: 'Bad', status: 'Nope', salaryPerCycle: -1 },
        ],
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.company.employees).toHaveLength(1)
    expect(decoded.save.company.employees[0].employeeId).toBe('x')
  })

  it('rejects malformed JSON as corrupted', () => {
    expect(decodeSave('{broken')).toMatchObject({ kind: 'corrupted' })
  })

  it('rejects a non-object save root as corrupted', () => {
    expect(decodeSave('[]')).toMatchObject({ kind: 'corrupted' })
  })

  it('rejects a save without format version as corrupted', () => {
    expect(decodeSave(JSON.stringify({ company: {} }))).toMatchObject({ kind: 'corrupted' })
  })

  it('treats an unknown version as incompatible instead of silently loading it', () => {
    const result = decodeSave(JSON.stringify({ formatVersion: 99, company: {} }))
    expect(result).toMatchObject({ kind: 'incompatible', foundVersion: 99 })
  })

  it('treats a missing company object as structurally corrupted', () => {
    expect(
      decodeSave(JSON.stringify({ formatVersion: SAVE_FORMAT_VERSION, settings: {} })),
    ).toMatchObject({ kind: 'corrupted' })
  })
})

describe('ISSUE-014 / ISSUE-017 — one-slot write and interrupted-write recovery', () => {
  it('writes staging first, commits primary, then clears staging', () => {
    const storage = new MemoryStorage()
    const result = writeSaveSlot(storage, makeSession())

    expect(result.ok).toBe(true)
    expect(storage.getItem(SAVE_STORAGE_KEY)).not.toBeNull()
    expect(storage.getItem(SAVE_STAGING_KEY)).toBeNull()
  })

  it('recovers a valid staging payload when primary is corrupted', () => {
    const storage = new MemoryStorage()
    const session = makeSession()
    session.company.money = 777
    storage.setItem(SAVE_STORAGE_KEY, '{broken')
    storage.setItem(SAVE_STAGING_KEY, serializeGameSession(session))

    const inspection = inspectSaveSlot(storage)
    expect(inspection.kind).toBe('valid')
    if (inspection.kind !== 'valid') return
    expect(inspection.source).toBe('staging')
    expect(inspection.save.company.money).toBe(777)
  })

  it('keeps staging available for recovery when the primary write fails', () => {
    const storage = new MemoryStorage()
    storage.failOnSetKey = SAVE_STORAGE_KEY

    const result = writeSaveSlot(storage, makeSession())
    expect(result.ok).toBe(false)
    expect(storage.getItem(SAVE_STAGING_KEY)).not.toBeNull()
  })

  it('reports a missing slot when no current or legacy save exists', () => {
    expect(inspectSaveSlot(new MemoryStorage())).toEqual({ kind: 'missing' })
  })

  it('preserves unreadable raw data before an explicitly confirmed replacement', () => {
    const storage = new MemoryStorage()
    const raw = '{broken-save'
    storage.setItem(SAVE_STORAGE_KEY, raw)
    const inspection = inspectSaveSlot(storage)

    preserveInvalidSaveBeforeReplacement(storage, inspection)
    expect(storage.getItem(SAVE_CORRUPTED_BACKUP_KEY)).toBe(raw)
  })
})

describe('ISSUE-016 + RBATCH-018 — canonical autosave policy', () => {
  it('contains v0.1, employee and vehicle progression triggers', () => {
    expect([...CANONICAL_AUTOSAVE_EVENTS]).toEqual([
      'delivery-completed',
      'upgrade-purchased',
      'progression-changed',
      'tutorial-step-completed',
      'employee-hired',
      'employee-onboarding-completed',
      'salary-cycle-processed',
      'vehicle-purchased',
      'settings-changed',
      'operating-day-closed',
    ])
  })

  it('rejects generic scene-exit and movement events', () => {
    expect(isCanonicalAutosaveEvent('scene-exit')).toBe(false)
    expect(isCanonicalAutosaveEvent('movement')).toBe(false)
    expect(isCanonicalAutosaveEvent('order-accepted')).toBe(false)
    expect(isCanonicalAutosaveEvent('package-picked-up')).toBe(false)
  })

  it('does not write for an unapproved event', () => {
    const storage = new MemoryStorage()
    const result = autosaveIfApproved(storage, makeSession(), 'scene-exit')
    expect(result).toEqual({ saved: false, reason: 'not-approved' })
    expect(storage.getItem(SAVE_STORAGE_KEY)).toBeNull()
  })

  it('writes progression for an approved employee event', () => {
    const storage = new MemoryStorage()
    const session = makeSession()
    session.company.money = 1900

    const result = autosaveIfApproved(storage, session, 'employee-hired')
    expect(result).toEqual({ saved: true, event: 'employee-hired' })

    const inspection = inspectSaveSlot(storage)
    expect(inspection.kind).toBe('valid')
    if (inspection.kind !== 'valid') return
    expect(inspection.save.company.money).toBe(1900)
  })
})

describe('MainMenu regression — toggling sound before Continue Game never loses a valid save', () => {
  it('preserves company/economy/employees/vehicles/reviews when sound is toggled and Exit Game is pressed with no active session', () => {
    const storage = new MemoryStorage()

    // A prior play session produced a valid, populated save on disk.
    const originalSession = makeSession()
    originalSession.company.companyName = 'Established Co'
    originalSession.company.money = 5230
    originalSession.company.level = 4
    originalSession.company.reputation = 87
    originalSession.company.employees = [
      { employeeId: 'emp-1', name: 'Alex', role: 'Courier', status: 'Active', salaryPerCycle: 40 },
    ]
    originalSession.company.vehicles = [{ vehicleId: 'veh-1', typeId: 'Bicycle' }]
    originalSession.company.reviews = [
      { orderId: 'order-1', rating: 5, sentiment: 'Positive', message: 'Great service', reputationImpact: 2 },
    ]
    originalSession.settings.soundEnabled = true
    writeSaveSlot(storage, originalSession)

    // Fresh app launch: MainMenuScene.create() only peeks/inspects storage,
    // it never sets an active session. Continue Game is NOT pressed.
    const launchInspection = inspectSaveSlot(storage)
    expect(launchInspection.kind).toBe('valid')
    if (launchInspection.kind !== 'valid') return

    // Settings -> toggle sound, with no active session, must restore from
    // the saved session and persist directly, without ever creating a new
    // in-memory session (mirrors MainMenuScene.toggleSound()'s valid-save branch).
    const restoredSession = restoreGameSessionFromSave(launchInspection.save)
    restoredSession.settings.soundEnabled = !restoredSession.settings.soundEnabled
    writeSaveSlot(storage, restoredSession)

    // Exit Game with no active session must be a no-op for save writing —
    // there is nothing further to persist here, matching production code.

    const finalInspection = inspectSaveSlot(storage)
    expect(finalInspection.kind).toBe('valid')
    if (finalInspection.kind !== 'valid') return

    expect(finalInspection.save.company.companyName).toBe('Established Co')
    expect(finalInspection.save.company.money).toBe(5230)
    expect(finalInspection.save.company.level).toBe(4)
    expect(finalInspection.save.company.reputation).toBe(87)
    expect(finalInspection.save.company.employees).toEqual(originalSession.company.employees)
    expect(finalInspection.save.company.vehicles).toEqual(originalSession.company.vehicles)
    expect(finalInspection.save.company.reviews).toEqual(originalSession.company.reviews)
    expect(finalInspection.save.settings.soundEnabled).toBe(false)
  })
})

