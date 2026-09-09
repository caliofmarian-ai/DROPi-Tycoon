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
import { settleDeliveryOutcome } from '../src/systems/economySettlement'
import type { GameSessionState, OrderState } from '../src/types/game'
import { PLAYER_START } from '../src/world/worldLayout'

const makeSession = (): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
})

const decodeAndRestore = (session: GameSessionState): GameSessionState => {
  const decoded = decodeSave(serializeGameSession(session))
  expect(decoded.kind).toBe('valid')
  if (decoded.kind !== 'valid') throw new Error('expected valid save')
  return restoreGameSessionFromSave(decoded.save)
}

describe('#566 governed Save v2 world continuity', () => {
  it('resumes the same picked-up delivery, hero location and player cargo custody', () => {
    const session = makeSession()
    session.world.player.x = 412
    session.world.player.y = 318
    session.world.player.currentOrder = session.world.activeOrder.orderId
    session.world.player.carryingPackage = true
    session.world.activeOrder.status = 'PickedUp'
    session.world.isMoving = true
    session.world.tapTarget = { x: 900, y: 900 }
    session.world.pendingDeliveryDestination = session.world.activeOrder.destination

    const restored = decodeAndRestore(session)

    expect(restored.world.player).toMatchObject({
      x: 412,
      y: 318,
      currentOrder: session.world.activeOrder.orderId,
      carryingPackage: true,
    })
    expect(restored.world.activeOrder).toEqual({
      ...session.world.activeOrder,
      acceptRequested: false,
    })
    expect(restored.world.isMoving).toBe(false)
    expect(restored.world.tapTarget).toEqual({ x: 412, y: 318 })
    expect(restored.world.pendingDeliveryDestination).toBe('')
  })

  it('derives Accepted assignment state rather than trusting duplicated player flags', () => {
    const session = makeSession()
    session.world.activeOrder.status = 'Accepted'
    session.world.player.currentOrder = 'forged-order'
    session.world.player.carryingPackage = true

    const restored = decodeAndRestore(session)

    expect(restored.world.activeOrder.status).toBe('Accepted')
    expect(restored.world.player.currentOrder).toBe(session.world.activeOrder.orderId)
    expect(restored.world.player.carryingPackage).toBe(false)
  })

  it('preserves an already-settled terminal order so reload cannot settle it twice', () => {
    const session = makeSession()
    const previousOrder: OrderState = {
      ...session.world.activeOrder,
      status: 'PickedUp',
      economySettled: false,
    }
    const terminalOrder: OrderState = {
      ...previousOrder,
      status: 'Completed',
      economySettled: false,
    }
    const firstSettlement = settleDeliveryOutcome(previousOrder, terminalOrder, session.company)
    expect(firstSettlement.applied).toBe(true)
    if (!firstSettlement.applied) throw new Error(firstSettlement.reason)

    session.company = firstSettlement.company
    session.world.activeOrder = firstSettlement.order
    session.world.player.currentOrder = ''
    session.world.player.carryingPackage = false

    const restored = decodeAndRestore(session)
    expect(restored.world.activeOrder.status).toBe('Completed')
    expect(restored.world.activeOrder.economySettled).toBe(true)
    expect(restored.company.money).toBe(firstSettlement.company.money)

    const replay = settleDeliveryOutcome(previousOrder, restored.world.activeOrder, restored.company)
    expect(replay).toEqual({ applied: false, reason: 'Order settlement already applied' })
  })

  it('keeps historical Save v2 payloads without continuity valid and uses the legacy safe world fallback', () => {
    const session = makeSession()
    session.world.player.x = 412
    session.world.player.y = 318
    session.world.activeOrder.status = 'PickedUp'
    session.world.player.currentOrder = session.world.activeOrder.orderId
    session.world.player.carryingPackage = true

    const oldV2 = createSaveGame(session)
    delete oldV2.worldContinuity
    const decoded = decodeSave(JSON.stringify(oldV2))

    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.save.worldContinuity).toBeUndefined()

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.world.player.x).toBe(PLAYER_START.x)
    expect(restored.world.player.y).toBe(PLAYER_START.y)
    expect(restored.world.player.currentOrder).toBe('')
    expect(restored.world.player.carryingPackage).toBe(false)
    expect(restored.world.activeOrder.status).toBe('Available')
  })

  it('repairs unsafe hero coordinates and cargo mismatch without discarding a valid active order', () => {
    const session = makeSession()
    const save = createSaveGame(session)
    const raw = JSON.stringify({
      ...save,
      worldContinuity: {
        ...save.worldContinuity,
        hero: { x: Number.POSITIVE_INFINITY, y: -100 },
        activeOrder: {
          ...save.worldContinuity?.activeOrder,
          status: 'PickedUp',
          acceptRequested: true,
        },
        cargo: { custody: 'None' },
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.worldContinuity).toMatchObject({
      hero: PLAYER_START,
      activeOrder: { status: 'PickedUp', acceptRequested: false },
      cargo: { custody: 'Player', orderId: session.world.activeOrder.orderId },
    })

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.world.player.x).toBe(PLAYER_START.x)
    expect(restored.world.player.y).toBe(PLAYER_START.y)
    expect(restored.world.player.currentOrder).toBe(session.world.activeOrder.orderId)
    expect(restored.world.player.carryingPackage).toBe(true)
  })

  it('drops structurally invalid continuity and falls back safely instead of rejecting the whole Save v2 slot', () => {
    const save = createSaveGame(makeSession())
    const raw = JSON.stringify({
      ...save,
      worldContinuity: {
        schemaVersion: 1,
        hero: { x: 100, y: 100 },
        activeOrder: { orderId: '', status: 'PickedUp' },
        cargo: { custody: 'Player', orderId: 'forged' },
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.worldContinuity).toBeUndefined()

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.world.player.x).toBe(PLAYER_START.x)
    expect(restored.world.activeOrder.status).toBe('Available')
  })

  it('clears a forged non-terminal settlement marker while retaining the active job', () => {
    const save = createSaveGame(makeSession())
    const raw = JSON.stringify({
      ...save,
      worldContinuity: {
        ...save.worldContinuity,
        activeOrder: {
          ...save.worldContinuity?.activeOrder,
          status: 'Accepted',
          economySettled: true,
        },
      },
    })

    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.worldContinuity?.activeOrder).toMatchObject({
      status: 'Accepted',
      economySettled: false,
    })
  })
})
