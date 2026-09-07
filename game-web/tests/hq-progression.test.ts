import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createSaveGame, decodeSave, restoreGameSessionFromSave, serializeGameSession } from '../src/persistence/saveSystem'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import {
  constructHQDepartment,
  getHQConstructionStatus,
  isHQDepartmentConstructed,
} from '../src/systems/hqProgressionSystem'

describe('Issue #343 / #352 — progressive HQ department construction', () => {
  it('starts a new company with only the minimum Core headquarters footprint', () => {
    const company = createInitialCompanyState()
    expect(company.hq.constructedDepartments).toEqual(['Core'])
    expect(isHQDepartmentConstructed(company, 'Core')).toBe(true)
    expect(isHQDepartmentConstructed(company, 'Maintenance')).toBe(false)
  })

  it('keeps Maintenance locked until authoritative money/level requirements are met', () => {
    const company = createInitialCompanyState()
    const status = getHQConstructionStatus(company, 'Maintenance')
    expect(status.constructed).toBe(false)
    expect(status.canConstruct).toBe(false)
    expect(status.department.constructionCost).toBe(BALANCING.HQ_MAINTENANCE_WING_CONSTRUCTION_COST)
    expect(status.missingMoney).toBe(BALANCING.HQ_MAINTENANCE_WING_CONSTRUCTION_COST)
  })

  it('constructs Maintenance once, deducts Company Money, and preserves the Core', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.HQ_MAINTENANCE_WING_CONSTRUCTION_COST + 75

    const result = constructHQDepartment(company, 'Maintenance')
    expect(result.constructed).toBe(true)
    expect(result.company.money).toBe(75)
    expect(result.company.hq.constructedDepartments).toEqual(['Core', 'Maintenance'])
    expect(isHQDepartmentConstructed(result.company, 'Maintenance')).toBe(true)
  })

  it('never charges twice for an already constructed department', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.HQ_MAINTENANCE_WING_CONSTRUCTION_COST + 50
    const first = constructHQDepartment(company, 'Maintenance')
    expect(first.constructed).toBe(true)

    const second = constructHQDepartment(first.company, 'Maintenance')
    expect(second.constructed).toBe(false)
    expect(second.company.money).toBe(50)
    expect(second.company.hq.constructedDepartments).toEqual(['Core', 'Maintenance'])
  })

  it('persists constructed HQ departments through additive Save v2 state', () => {
    const company = createInitialCompanyState()
    company.money = BALANCING.HQ_MAINTENANCE_WING_CONSTRUCTION_COST
    const built = constructHQDepartment(company, 'Maintenance')
    expect(built.constructed).toBe(true)

    const session = {
      world: createInitialWorldState(),
      company: built.company,
      settings: createInitialGameSettingsState(),
    }
    const save = createSaveGame(session)
    expect(save.company.hq?.constructedDepartments).toEqual(['Core', 'Maintenance'])

    const decoded = decodeSave(serializeGameSession(session))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.hq.constructedDepartments).toEqual(['Core', 'Maintenance'])
  })

  it('defaults an older Save v2 without HQ state to Core-only without inventing a built wing', () => {
    const session = {
      world: createInitialWorldState(),
      company: createInitialCompanyState(),
      settings: createInitialGameSettingsState(),
    }
    const save = createSaveGame(session)
    const rawObject = JSON.parse(JSON.stringify(save)) as { company: Record<string, unknown> }
    delete rawObject.company.hq

    const decoded = decodeSave(JSON.stringify(rawObject))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.save.company.hq?.constructedDepartments).toEqual(['Core'])
  })

  it('repairs malformed or duplicate department state safely', () => {
    const session = {
      world: createInitialWorldState(),
      company: createInitialCompanyState(),
      settings: createInitialGameSettingsState(),
    }
    const save = createSaveGame(session)
    const raw = JSON.stringify({
      ...save,
      company: {
        ...save.company,
        hq: { constructedDepartments: ['Maintenance', 'Maintenance', 'Unknown'] },
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.company.hq?.constructedDepartments).toEqual(['Core', 'Maintenance'])
  })
})
