import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { startNewGameSession } from '../src/state/gameSession'
import type { GameSessionState } from '../src/types/game'
import {
  acceptAndReceiveRecoveryMariaTest,
  chooseRecoveryHeroPresentation,
  completeRecoveryMariaReturn,
  deliverRecoveryMariaTest,
  ensureRecoveryOpeningRuntime,
  enterRecoveryMariaShop,
  recoveryOpeningObjective,
  recoveryOpeningStatusText,
  startRecoveryWorkSearch,
} from '../src/missions/recoveryOpeningRuntime'
import { INTERIOR_LOCATIONS, isInteriorWalkable, nearestInteriorInteraction } from '../src/world/interiorLocations'

const sceneSource = readFileSync(new URL('../src/scenes/GameWorldScene.ts', import.meta.url), 'utf8')

const advanceToMaria = (sex: 'Male' | 'Female' = 'Male') => {
  const session = startNewGameSession()
  const initialMoney = session.company.money
  expect(ensureRecoveryOpeningRuntime(session).phase).toBe('choose-presentation')
  expect(chooseRecoveryHeroPresentation(session, sex).phase).toBe('prologue')
  expect(startRecoveryWorkSearch(session).phase).toBe('search-work')
  expect(recoveryOpeningObjective(session)?.title).toContain('Maria')
  expect(enterRecoveryMariaShop(session).phase).toBe('maria-dialogue')
  return { session, initialMoney }
}

describe('recovery opening runtime vertical slice', () => {
  it('persists Male/Female as mission choice while keeping identical gameplay progression', () => {
    const male = startNewGameSession()
    expect(ensureRecoveryOpeningRuntime(male).active).toBe(true)
    const maleChoice = chooseRecoveryHeroPresentation(male, 'Male')
    expect(maleChoice.selectedSex).toBe('Male')
    expect(maleChoice.phase).toBe('prologue')

    const female = startNewGameSession()
    expect(ensureRecoveryOpeningRuntime(female).active).toBe(true)
    const femaleChoice = chooseRecoveryHeroPresentation(female, 'Female')
    expect(femaleChoice.selectedSex).toBe('Female')
    expect(femaleChoice.phase).toBe('prologue')

    expect(maleChoice.firstOrder).toEqual(femaleChoice.firstOrder)
    expect(maleChoice.definitions.map(definition => definition.missionId))
      .toEqual(femaleChoice.definitions.map(definition => definition.missionId))
  })

  it('keeps the early recovery HUD in no-phone personal mode', () => {
    const session = startNewGameSession()
    ensureRecoveryOpeningRuntime(session)
    expect(recoveryOpeningStatusText(session)).toBe('RECOVERY · On foot · No phone · Cargo 0/1')
  })

  it('hands Maria parcel into real cargo custody without crediting company money', () => {
    const { session, initialMoney } = advanceToMaria()
    const handed = acceptAndReceiveRecoveryMariaTest(session)

    expect(handed.changed).toBe(true)
    expect(handed.phase).toBe('deliver-first')
    expect(session.world.activeOrder.orderId).toBe(handed.firstOrder.orderId)
    expect(session.world.activeOrder.status).toBe('PickedUp')
    expect(session.world.activeOrder.economySettled).toBe(false)
    expect(session.world.player.currentOrder).toBe(handed.firstOrder.orderId)
    expect(session.world.player.carryingPackage).toBe(true)
    expect(session.company.money).toBe(initialMoney)
    expect(recoveryOpeningStatusText(session)).toContain('Cargo 1/1')
  })

  it('completes the legitimate delivery without inventing a settlement, then requires return to Maria', () => {
    const { session, initialMoney } = advanceToMaria('Female')
    acceptAndReceiveRecoveryMariaTest(session)

    const delivered = deliverRecoveryMariaTest(session, 0)
    expect(delivered.changed).toBe(true)
    expect(delivered.phase).toBe('return-maria')
    expect(session.world.activeOrder.status).toBe('Completed')
    expect(session.world.activeOrder.economySettled).toBe(false)
    expect(session.world.player.carryingPackage).toBe(false)
    expect(session.company.money).toBe(initialMoney)
    expect(recoveryOpeningObjective(session)?.title).toBe('Return to Maria')

    const returned = completeRecoveryMariaReturn(session)
    expect(returned.changed).toBe(true)
    expect(returned.phase).toBe('trial-ready')
    expect(session.company.money).toBe(initialMoney)
  })

  it('restores the selected presentation and delivery phase from the mission-resume envelope', () => {
    const { session } = advanceToMaria('Female')
    acceptAndReceiveRecoveryMariaTest(session)

    const restored = JSON.parse(JSON.stringify(session)) as GameSessionState
    const snapshot = ensureRecoveryOpeningRuntime(restored)
    expect(snapshot.active).toBe(true)
    expect(snapshot.selectedSex).toBe('Female')
    expect(snapshot.phase).toBe('deliver-first')
    expect(restored.world.player.carryingPackage).toBe(true)
  })

  it('keeps Maria counter reachable from the customer side of the solid counter', () => {
    const shop = INTERIOR_LOCATIONS['maria-shop']
    const customerSide = { x: 600, y: 390 }
    expect(isInteriorWalkable(shop, customerSide)).toBe(true)
    expect(nearestInteriorInteraction(shop, customerSide)?.id).toBe('maria-counter')
  })

  it('wires recovery actions into GameWorld before legacy HQ/Mara settlement paths', () => {
    expect(sceneSource).toContain('presentRecoveryOpeningIfNeeded()')
    expect(sceneSource).toContain("this.enterInterior('MariaShopInterior')")
    expect(sceneSource).toContain('deliverRecoveryMariaTest(session, distance)')
    expect(sceneSource).toContain('No GPS yet')
    expect(sceneSource).toContain('NO PHONE')
    expect(sceneSource.indexOf('if (recovery.active)')).toBeLessThan(sceneSource.indexOf('if (inInteractionRange(this.worldState.player, URBAN_HQ))'))
  })

  it('does not rewrite an unrelated existing mission resume into the recovery campaign', () => {
    const session = startNewGameSession()
    session.missionResume = {
      kind: 'dropi-mission-runtime-resume',
      version: 1,
      runtime: { version: 1, missions: { 'mission:other': {} }, completionReceipts: [] },
    }
    const snapshot = ensureRecoveryOpeningRuntime(session)
    expect(snapshot.active).toBe(false)
    expect(snapshot.phase).toBe('inactive')
  })
})
