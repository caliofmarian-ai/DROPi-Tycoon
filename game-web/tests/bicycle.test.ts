import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import {
  getMovementSpeedForCompany,
  isBicycleOwned,
  synchronizePlayerMovementSpeed,
} from '../src/systems/bicycleSystem'
import { purchaseUpgrade } from '../src/systems/upgradeSystem'

const gameWorldSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)
const gameTypesSource = readFileSync(
  new URL('../src/types/game.ts', import.meta.url),
  'utf8',
)
const gameStateSource = readFileSync(
  new URL('../src/state/gameState.ts', import.meta.url),
  'utf8',
)
const gameSessionSource = readFileSync(
  new URL('../src/state/gameSession.ts', import.meta.url),
  'utf8',
)
const bicycleSystemSource = readFileSync(
  new URL('../src/systems/bicycleSystem.ts', import.meta.url),
  'utf8',
)

describe('ISSUE-012 — Bicycle ownership uses purchased-upgrade state only', () => {
  it('starts without Bicycle ownership', () => {
    expect(isBicycleOwned(createInitialCompanyState())).toBe(false)
  })

  it('recognizes Bicycle ownership when the purchased level is 1', () => {
    const company = createInitialCompanyState()
    company.purchasedUpgradeLevels.Bicycle = 1
    expect(isBicycleOwned(company)).toBe(true)
  })

  it('treats any positive safe-integer Bicycle level as owned', () => {
    const company = createInitialCompanyState()
    company.purchasedUpgradeLevels.Bicycle = 2
    expect(isBicycleOwned(company)).toBe(true)
  })

  it('does not treat invalid or non-positive levels as ownership', () => {
    for (const level of [0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const company = createInitialCompanyState()
      company.purchasedUpgradeLevels.Bicycle = level
      expect(isBicycleOwned(company)).toBe(false)
    }
  })

  it('acquires ownership through the existing purchase flow', () => {
    const company = {
      ...createInitialCompanyState(),
      money: BALANCING.BICYCLE_COST,
    }
    const purchase = purchaseUpgrade(company, 'Bicycle')
    expect(purchase.purchased).toBe(true)
    if (!purchase.purchased) return
    expect(purchase.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(isBicycleOwned(purchase.company)).toBe(true)
  })

  it('does not introduce a standalone Bicycle ownership field into runtime state', () => {
    for (const source of [gameTypesSource, gameStateSource, gameSessionSource]) {
      expect(source).not.toContain('hasBicycle')
      expect(source).not.toContain('bicycleOwned')
      expect(source).not.toContain('ownsBicycle')
    }
  })
})

describe('ISSUE-013 — Bicycle movement-speed increase', () => {
  it('centralizes the established walking baseline at 150 px/s', () => {
    expect(BALANCING.WALKING_MOVEMENT_SPEED).toBe(150)
    expect(createInitialWorldState().player.movementSpeed).toBe(BALANCING.WALKING_MOVEMENT_SPEED)
  })

  it('defines a Bicycle speed that is clearly greater than walking', () => {
    expect(BALANCING.BICYCLE_MOVEMENT_SPEED).toBe(225)
    expect(BALANCING.BICYCLE_MOVEMENT_SPEED).toBeGreaterThan(BALANCING.WALKING_MOVEMENT_SPEED)
  })

  it('resolves walking speed before purchase', () => {
    expect(getMovementSpeedForCompany(createInitialCompanyState())).toBe(
      BALANCING.WALKING_MOVEMENT_SPEED,
    )
  })

  it('resolves Bicycle speed after purchase', () => {
    const company = createInitialCompanyState()
    company.purchasedUpgradeLevels.Bicycle = 1
    expect(getMovementSpeedForCompany(company)).toBe(BALANCING.BICYCLE_MOVEMENT_SPEED)
  })

  it('does not let unrelated upgrade ownership activate Bicycle speed', () => {
    const company = createInitialCompanyState()
    company.purchasedUpgradeLevels.DeliverySpeed = 1
    company.purchasedUpgradeLevels.Capacity = 1
    company.purchasedUpgradeLevels.Efficiency = 1
    expect(getMovementSpeedForCompany(company)).toBe(BALANCING.WALKING_MOVEMENT_SPEED)
  })

  it('synchronizes a stale walking WorldState to Bicycle speed without mutating inputs', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    company.purchasedUpgradeLevels.Bicycle = 1

    const synchronized = synchronizePlayerMovementSpeed(world, company)

    expect(synchronized).not.toBe(world)
    expect(synchronized.player).not.toBe(world.player)
    expect(synchronized.player.movementSpeed).toBe(BALANCING.BICYCLE_MOVEMENT_SPEED)
    expect(world.player.movementSpeed).toBe(BALANCING.WALKING_MOVEMENT_SPEED)
    expect(company.purchasedUpgradeLevels.Bicycle).toBe(1)
  })

  it('returns the same WorldState when the effective speed is already correct', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    expect(synchronizePlayerMovementSpeed(world, company)).toBe(world)
  })

  it('purchase-to-speed integration produces Bicycle speed only after a successful purchase', () => {
    const affordable = {
      ...createInitialCompanyState(),
      money: BALANCING.BICYCLE_COST,
    }
    const purchased = purchaseUpgrade(affordable, 'Bicycle')
    expect(purchased.purchased).toBe(true)
    if (!purchased.purchased) return
    expect(getMovementSpeedForCompany(purchased.company)).toBe(BALANCING.BICYCLE_MOVEMENT_SPEED)

    const unaffordable = purchaseUpgrade(createInitialCompanyState(), 'Bicycle')
    expect(unaffordable.purchased).toBe(false)
    expect(getMovementSpeedForCompany(unaffordable.company)).toBe(BALANCING.WALKING_MOVEMENT_SPEED)
  })
})

describe('RBATCH-013 — scene and scope boundaries', () => {
  it('synchronizes speed immediately after loading the active GameWorld session', () => {
    const sessionIndex = gameWorldSource.indexOf('getOrCreateGameSession()')
    const syncIndex = gameWorldSource.indexOf('synchronizePlayerMovementSpeed(')
    const playerVisualIndex = gameWorldSource.indexOf('this.playerVisual = createPlayerVisual(')
    expect(sessionIndex).toBeGreaterThan(-1)
    expect(syncIndex).toBeGreaterThan(sessionIndex)
    expect(playerVisualIndex).toBeGreaterThan(syncIndex)
  })

  it('continues to move through PlayerState.movementSpeed rather than a scene constant', () => {
    expect(gameWorldSource).toContain('this.worldState.player.movementSpeed * deltaSeconds')
    expect(gameWorldSource).not.toContain('BALANCING.BICYCLE_MOVEMENT_SPEED * deltaSeconds')
  })

  it('contains no persistent storage or advanced vehicle mechanics in the Bicycle system', () => {
    for (const forbidden of [
      'localStorage',
      'sessionStorage',
      'fuel',
      'maintenance',
      'damage',
      'capacity',
      'reward',
    ]) {
      expect(bicycleSystemSource.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }
  })
})
