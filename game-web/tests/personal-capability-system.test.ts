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
  serializeGameSession,
} from '../src/persistence/saveSystem'
import {
  PERSONAL_CAPABILITY_DEFINITIONS,
  createInitialPersonalProgressionState,
  evaluatePersonalCapability,
  hasPersonalCapabilityForVehicle,
  learnPersonalCapability,
  sanitizePersonalProgression,
} from '../src/systems/personalCapabilitySystem'
import { PERSONAL_CAPABILITY_IDS, type GameSessionState } from '../src/types/game'

const makeSession = (): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
})

describe('#370 personal capability foundation', () => {
  it('keeps one data-driven definition for every stable capability id', () => {
    expect(PERSONAL_CAPABILITY_DEFINITIONS.map(item => item.id)).toEqual(PERSONAL_CAPABILITY_IDS)
    expect(new Set(PERSONAL_CAPABILITY_DEFINITIONS.map(item => item.id)).size).toBe(PERSONAL_CAPABILITY_IDS.length)
  })

  it('starts with delivery literacy and walking fundamentals but not bicycle operation', () => {
    const state = createInitialPersonalProgressionState()

    expect(state.experiencePoints).toBe(0)
    expect(state.progressionPoints).toBe(0)
    expect(state.learnedCapabilityIds).toEqual(['DeliveryAppLiteracy', 'WalkingCourierFundamentals'])
    expect(state.learnedCapabilityIds).not.toContain('BicycleOperation')
  })

  it('blocks Bicycle Operation until both its prerequisite knowledge and progression threshold are met', () => {
    const noPoints = createInitialPersonalProgressionState()
    const missingPoints = evaluatePersonalCapability(noPoints, 'BicycleOperation')
    expect(missingPoints.status).toBe('Blocked')
    expect(missingPoints.missingCapabilityIds).toEqual([])
    expect(missingPoints.missingProgressionPoints).toBe(1)

    const missingWalking = evaluatePersonalCapability({
      experiencePoints: 0,
      progressionPoints: 1,
      learnedCapabilityIds: ['DeliveryAppLiteracy'],
    }, 'BicycleOperation')
    expect(missingWalking.status).toBe('Blocked')
    expect(missingWalking.missingCapabilityIds).toEqual(['WalkingCourierFundamentals'])
  })

  it('does not let Company Money substitute for personal qualification', () => {
    const company = createInitialCompanyState()
    company.money = 1_000_000
    const evaluation = evaluatePersonalCapability(createInitialPersonalProgressionState(), 'BicycleOperation', { company })

    expect(evaluation.status).toBe('Blocked')
    expect(evaluation.missingProgressionPoints).toBe(1)
  })

  it('learns the early Bicycle Operation qualification once the real prerequisites are satisfied', () => {
    const state = {
      ...createInitialPersonalProgressionState(),
      progressionPoints: 1,
    }
    expect(evaluatePersonalCapability(state, 'BicycleOperation').status).toBe('Available')

    const result = learnPersonalCapability(state, 'BicycleOperation')
    expect(result.learned).toBe(true)
    if (!result.learned) throw new Error('Bicycle Operation should be learnable')
    expect(result.state.learnedCapabilityIds).toContain('BicycleOperation')
    expect(evaluatePersonalCapability(result.state, 'BicycleOperation').status).toBe('Learned')
  })

  it('represents future physical-facility prerequisites without making the future capability live', () => {
    const state = {
      ...createInitialPersonalProgressionState(),
      progressionPoints: 2,
      learnedCapabilityIds: [
        'DeliveryAppLiteracy',
        'WalkingCourierFundamentals',
        'BicycleOperation',
      ] as const,
    }
    const company = createInitialCompanyState()

    const withoutWorkshop = evaluatePersonalCapability(
      { ...state, learnedCapabilityIds: [...state.learnedCapabilityIds] },
      'BicycleMaintenance',
      { company },
    )
    expect(withoutWorkshop.status).toBe('Future')
    expect(withoutWorkshop.missingHQDepartments).toEqual(['Maintenance'])

    company.hq.constructedDepartments.push('Maintenance')
    const withWorkshop = evaluatePersonalCapability(
      { ...state, learnedCapabilityIds: [...state.learnedCapabilityIds] },
      'BicycleMaintenance',
      { company },
    )
    expect(withWorkshop.status).toBe('Future')
    expect(withWorkshop.missingHQDepartments).toEqual([])
  })

  it('exposes vehicle eligibility as a reusable domain query without wiring a current gameplay lockout', () => {
    const state = createInitialPersonalProgressionState()
    expect(hasPersonalCapabilityForVehicle(state, 'Bicycle')).toBe(false)

    const qualified = {
      ...state,
      learnedCapabilityIds: [...state.learnedCapabilityIds, 'BicycleOperation' as const],
    }
    expect(hasPersonalCapabilityForVehicle(qualified, 'Bicycle')).toBe(true)
    expect(hasPersonalCapabilityForVehicle(qualified, 'DeliveryVan')).toBe(false)
  })

  it('keeps legacy/current Save v2 payloads without personal activity compact and restores canonical starter state', () => {
    const saved = createSaveGame(makeSession())
    expect(saved.formatVersion).toBe(2)
    expect(saved).not.toHaveProperty('personalProgression')

    const restored = restoreGameSessionFromSave(saved)
    expect(restored.personalProgression).toEqual(createInitialPersonalProgressionState())
  })

  it('round-trips real personal progression through additive Save v2 persistence', () => {
    const session = makeSession()
    session.personalProgression = {
      experiencePoints: 120,
      progressionPoints: 1,
      learnedCapabilityIds: ['DeliveryAppLiteracy', 'WalkingCourierFundamentals', 'BicycleOperation'],
    }

    const raw = serializeGameSession(session)
    const parsed = JSON.parse(raw) as Record<string, unknown>
    expect(parsed.personalProgression).toEqual(session.personalProgression)
    const parsedWorldContinuity = parsed.worldContinuity as Record<string, unknown> | undefined
    expect(Object.prototype.hasOwnProperty.call(parsedWorldContinuity ?? {}, 'personalProgression')).toBe(false)

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') throw new Error('Expected a valid Save v2 payload')
    expect(decoded.save.personalProgression).toEqual(session.personalProgression)
    expect(Object.prototype.hasOwnProperty.call(decoded.save.worldContinuity ?? {}, 'personalProgression')).toBe(false)

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.personalProgression).toEqual(session.personalProgression)
  })

  it('repairs malformed personal progression while preserving stable valid capability ids', () => {
    const result = sanitizePersonalProgression({
      experiencePoints: -10,
      progressionPoints: 2,
      learnedCapabilityIds: ['BicycleOperation', 'NOT-A-CAPABILITY'],
    })

    expect(result.repaired).toBe(true)
    expect(result.personalProgression.experiencePoints).toBe(0)
    expect(result.personalProgression.progressionPoints).toBe(2)
    expect(result.personalProgression.learnedCapabilityIds).toEqual([
      'DeliveryAppLiteracy',
      'WalkingCourierFundamentals',
      'BicycleOperation',
    ])
  })
})