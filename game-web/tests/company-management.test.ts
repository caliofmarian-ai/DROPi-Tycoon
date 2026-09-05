import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import {
  clearGameSession,
  getOrCreateGameSession,
  peekGameSession,
  replaceGameSession,
  startNewGameSession,
} from '../src/state/gameSession'
import { settleDeliveryOutcome } from '../src/systems/economySettlement'
import {
  getAvailableUpgrades,
  purchaseUpgrade,
  UPGRADE_CATALOG,
} from '../src/systems/upgradeSystem'

const companyManagementSource = readFileSync(
  new URL('../src/scenes/CompanyManagementScene.ts', import.meta.url),
  'utf8',
)
const gameWorldSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)
const mainMenuSource = readFileSync(
  new URL('../src/scenes/MainMenuScene.ts', import.meta.url),
  'utf8',
)

afterEach(() => {
  clearGameSession()
})

describe('ISSUE-010 — upgrade purchase domain flow', () => {
  it('defines all canonical upgrade types plus the Bicycle vehicle milestone', () => {
    expect(UPGRADE_CATALOG.map((upgrade) => upgrade.id)).toEqual([
      'DeliverySpeed',
      'Capacity',
      'Efficiency',
      'Bicycle',
    ])
  })

  it('exposes Bicycle as the only currently purchasable prototype upgrade', () => {
    expect(getAvailableUpgrades().map((upgrade) => upgrade.id)).toEqual(['Bicycle'])
  })

  it('centralizes a reachable Bicycle price equal to one current standard delivery reward', () => {
    expect(BALANCING.BICYCLE_COST).toBe(BALANCING.ORDER_REWARD)
    expect(BALANCING.BICYCLE_COST).toBe(100)
  })

  it('rejects a fresh-company purchase without changing state', () => {
    const company = createInitialCompanyState()
    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(false)
    if (result.purchased) return
    expect(result.reason).toBe('not-enough-money')
    expect(result.company).toBe(company)
    expect(company.money).toBe(0)
    expect(company.purchasedUpgradeLevels.Bicycle).toBe(0)
  })

  it('rejects an amount one below the configured price', () => {
    const company = { ...createInitialCompanyState(), money: BALANCING.BICYCLE_COST - 1 }
    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(false)
    if (result.purchased) return
    expect(result.reason).toBe('not-enough-money')
    expect(result.company.money).toBe(BALANCING.BICYCLE_COST - 1)
  })

  it('purchases at exact affordability and deducts cost exactly once', () => {
    const company = { ...createInitialCompanyState(), money: BALANCING.BICYCLE_COST }
    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(true)
    if (!result.purchased) return
    expect(result.company.money).toBe(0)
    expect(result.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(result.message).toContain('Company improved')
  })

  it('does not mutate the input company or nested purchased-upgrade object', () => {
    const company = { ...createInitialCompanyState(), money: BALANCING.BICYCLE_COST }
    const originalLevels = company.purchasedUpgradeLevels
    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(true)
    if (!result.purchased) return
    expect(company.money).toBe(BALANCING.BICYCLE_COST)
    expect(company.purchasedUpgradeLevels.Bicycle).toBe(0)
    expect(result.company).not.toBe(company)
    expect(result.company.purchasedUpgradeLevels).not.toBe(originalLevels)
  })

  it('preserves unrelated company progression fields on purchase', () => {
    const company = {
      ...createInitialCompanyState(),
      companyName: 'Courier Test',
      level: 4,
      reputation: 73,
      money: 500,
      purchasedUpgradeLevels: {
        DeliverySpeed: 1,
        Capacity: 0,
        Efficiency: 1,
        Bicycle: 0,
      },
    }
    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(true)
    if (!result.purchased) return
    expect(result.company.companyName).toBe('Courier Test')
    expect(result.company.level).toBe(4)
    expect(result.company.reputation).toBe(73)
    expect(result.company.purchasedUpgradeLevels.DeliverySpeed).toBe(1)
    expect(result.company.purchasedUpgradeLevels.Efficiency).toBe(1)
  })

  it('prevents a one-time Bicycle from being charged twice', () => {
    const company = {
      ...createInitialCompanyState(),
      money: 500,
      purchasedUpgradeLevels: {
        ...createInitialCompanyState().purchasedUpgradeLevels,
        Bicycle: 1,
      },
    }
    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(false)
    if (result.purchased) return
    expect(result.reason).toBe('max-level')
    expect(result.company.money).toBe(500)
  })

  it('does not activate reserved canonical upgrade types prematurely', () => {
    const company = { ...createInitialCompanyState(), money: 999 }
    const result = purchaseUpgrade(company, 'DeliverySpeed')
    expect(result.purchased).toBe(false)
    if (result.purchased) return
    expect(result.reason).toBe('unavailable')
    expect(result.company.money).toBe(999)
  })

  it('rejects invalid negative money without mutating company state', () => {
    const company = { ...createInitialCompanyState(), money: -1 }
    const result = purchaseUpgrade(company, 'Bicycle')
    expect(result.purchased).toBe(false)
    if (result.purchased) return
    expect(result.reason).toBe('invalid-state')
    expect(result.company).toBe(company)
  })
})

describe('ISSUE-011 — runtime session preservation', () => {
  it('starts a new runtime session from canonical initializers', () => {
    const session = startNewGameSession()
    expect(session.company.money).toBe(0)
    expect(session.company.level).toBe(1)
    expect(session.company.reputation).toBe(50)
    expect(session.company.purchasedUpgradeLevels.Bicycle).toBe(0)
    expect(session.world.activeOrder.status).toBe('Available')
  })

  it('returns the same active runtime state rather than recreating it', () => {
    const session = startNewGameSession()
    session.company.money = 321
    session.world.activeOrder.status = 'Accepted'
    const resumed = getOrCreateGameSession()
    expect(resumed).toBe(session)
    expect(resumed.company.money).toBe(321)
    expect(resumed.world.activeOrder.status).toBe('Accepted')
  })

  it('replaces the active session with updated world and company references', () => {
    const world = createInitialWorldState()
    const company = { ...createInitialCompanyState(), money: 100 }
    replaceGameSession(world, company)
    expect(peekGameSession()?.world).toBe(world)
    expect(peekGameSession()?.company).toBe(company)
  })

  it('clears only in-memory state and can create a fresh session again', () => {
    const first = startNewGameSession()
    first.company.money = 400
    clearGameSession()
    expect(peekGameSession()).toBeNull()
    const next = getOrCreateGameSession()
    expect(next).not.toBe(first)
    expect(next.company.money).toBe(0)
  })

  it('delivery settlement preserves new company progression fields', () => {
    const company = {
      ...createInitialCompanyState(),
      companyName: 'Preserved Co',
      level: 3,
      purchasedUpgradeLevels: {
        ...createInitialCompanyState().purchasedUpgradeLevels,
        Bicycle: 1,
      },
    }
    const previous = {
      ...createInitialWorldState().activeOrder,
      status: 'PickedUp' as const,
    }
    const next = {
      ...previous,
      status: 'Completed' as const,
    }
    const settlement = settleDeliveryOutcome(previous, next, company)
    expect(settlement.applied).toBe(true)
    if (!settlement.applied) return
    expect(settlement.company.companyName).toBe('Preserved Co')
    expect(settlement.company.level).toBe(3)
    expect(settlement.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(settlement.company.money).toBe(100)
  })
})

describe('RBATCH-012 — scene integration boundaries', () => {
  it('MainMenu explicitly starts a fresh runtime session before GameWorld', () => {
    const startGameBody = mainMenuSource.slice(
      mainMenuSource.indexOf('private startGame'),
      mainMenuSource.indexOf('private createButton'),
    )
    expect(startGameBody).toContain('startNewGameSession()')
    expect(startGameBody).toContain("this.scene.start('GameWorld')")
  })

  it('GameWorld consumes the runtime session rather than recreating company/world state', () => {
    expect(gameWorldSource).toContain('getOrCreateGameSession()')
    expect(gameWorldSource).not.toContain('createInitialCompanyState()')
    expect(gameWorldSource).not.toContain('createInitialWorldState()')
  })

  it('GameWorld synchronizes runtime state before opening CompanyManagement', () => {
    const body = gameWorldSource.slice(
      gameWorldSource.indexOf('private openCompanyManagement'),
      gameWorldSource.indexOf('private syncRuntimeSession'),
    )
    expect(body).toContain('this.syncRuntimeSession()')
    expect(body).toContain("this.scene.start('CompanyManagement')")
  })

  it('GameWorld navigation labels are non-interactive with one input owner per button', () => {
    const body = gameWorldSource.slice(
      gameWorldSource.indexOf('private createMenuButton'),
      gameWorldSource.indexOf('private handleSceneShutdown'),
    )
    const interactiveCalls = body.match(/\.setInteractive/g) ?? []
    expect(interactiveCalls).toHaveLength(1)
    expect(body).not.toContain('text.setInteractive')
  })

  it('CompanyManagement owns purchase and return-to-world actions without label input duplication', () => {
    expect(companyManagementSource).toContain('purchaseUpgrade(')
    expect(companyManagementSource).toContain('replaceGameSession(')
    expect(companyManagementSource).toContain("this.scene.start('GameWorld')")
    const navigationButtonBody = companyManagementSource.slice(
      companyManagementSource.indexOf('private createButton'),
    )
    const interactiveCalls = navigationButtonBody.match(/\.setInteractive/g) ?? []
    expect(interactiveCalls).toHaveLength(1)
    expect(navigationButtonBody).not.toContain('text.setInteractive')
  })

  it('does not implement persistent Save/Load storage in RBATCH-012 scenes or session state', () => {
    const sessionSource = readFileSync(
      new URL('../src/state/gameSession.ts', import.meta.url),
      'utf8',
    )
    for (const source of [mainMenuSource, gameWorldSource, companyManagementSource, sessionSource]) {
      expect(source).not.toContain('localStorage')
      expect(source).not.toContain('sessionStorage')
    }
  })
})

describe('Workstream F — CompanyManagementScene plays purchase audio cues', () => {
  it('plays a purchase cue on success and a negative cue on failure', () => {
    expect(companyManagementSource).toContain("import { getAudioController } from '../systems/audioSystem'")
    expect(companyManagementSource).toContain("getAudioController().play(result.purchased ? 'purchase' : 'negative')")
  })
})
