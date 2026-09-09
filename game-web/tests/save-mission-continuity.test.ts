import { describe, expect, it } from 'vitest'
import {
  createMissionRuntimeState,
  startMission,
} from '../src/missions/missionEngine'
import type {
  MissionDefinition,
  MissionWorldFacts,
} from '../src/missions/missionModel'
import {
  createMissionResumePayload,
  restoreMissionResumePayload,
  validateMissionResumeReferences,
} from '../src/missions/missionResumeContract'
import {
  createSaveGame,
  decodeSave,
  restoreGameSessionFromSave,
  serializeGameSession,
} from '../src/persistence/saveSystem'
import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../src/state/gameState'
import type { GameSessionState } from '../src/types/game'

const definitionFor = (orderId: string): MissionDefinition => ({
  missionId: 'mission:save-continuity',
  category: 'CampaignStory',
  source: { kind: 'Authored', authoredRef: 'save-continuity-test' },
  label: 'Save continuity',
  prerequisites: [],
  availability: 'Prerequisites',
  startStageId: 'work',
  stages: [{
    stageId: 'work',
    label: 'Work',
    objectives: [{
      objectiveId: 'finish-order',
      kind: 'orderStatus',
      orderId,
      status: 'Completed',
      label: 'Finish the restored order',
    }],
  }],
  completionConsequences: [],
})

const factsFor = (orderId: string, status: 'PickedUp' | 'Completed'): MissionWorldFacts => ({
  worldMinute: 20,
  orderStatuses: { [orderId]: status },
})

const activeSession = (): { session: GameSessionState; definition: MissionDefinition } => {
  const world = createInitialWorldState()
  world.player.x += 160
  world.player.y += 80
  world.activeOrder.status = 'PickedUp'
  world.player.currentOrder = world.activeOrder.orderId
  world.player.carryingPackage = true

  const definition = definitionFor(world.activeOrder.orderId)
  const facts = factsFor(world.activeOrder.orderId, 'PickedUp')
  const initialMissionState = createMissionRuntimeState([definition], facts)
  const started = startMission([definition], initialMissionState, definition.missionId, facts)
  expect(started.changed).toBe(true)

  return {
    definition,
    session: {
      world,
      company: createInitialCompanyState(),
      settings: createInitialGameSettingsState(),
      missionResume: createMissionResumePayload(started.state),
    },
  }
}

describe('#566 governed Save v2 mission continuity integration', () => {
  it('restores world/order/cargo first and resumes the active mission against the same order authority', () => {
    const { session, definition } = activeSession()
    const raw = serializeGameSession(session)
    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.world.player.x).toBe(session.world.player.x)
    expect(restored.world.player.y).toBe(session.world.player.y)
    expect(restored.world.activeOrder.orderId).toBe(session.world.activeOrder.orderId)
    expect(restored.world.activeOrder.status).toBe('PickedUp')
    expect(restored.world.player.currentOrder).toBe(session.world.activeOrder.orderId)
    expect(restored.world.player.carryingPackage).toBe(true)
    expect(restored.missionResume).toEqual(session.missionResume)
    expect(restored.missionResume).not.toBe(session.missionResume)

    const missionRestore = restoreMissionResumePayload(
      restored.missionResume,
      [definition],
      factsFor(restored.world.activeOrder.orderId, 'PickedUp'),
    )
    expect(missionRestore.status).toBe('restored')
    expect(missionRestore.state.missions[definition.missionId]).toMatchObject({
      status: 'Active',
      stageId: 'work',
    })

    const referenceCheck = validateMissionResumeReferences(
      missionRestore.state,
      [definition],
      {
        hasOrder: orderId => orderId === restored.world.activeOrder.orderId,
        resolveDeliveryMission: () => null,
      },
    )
    expect(referenceCheck.resumable).toBe(true)
    expect(referenceCheck.issues).toEqual([])
    expect(referenceCheck.references).toEqual([expect.objectContaining({
      kind: 'order',
      orderId: restored.world.activeOrder.orderId,
      required: true,
    })])
  })

  it('drops a malformed outer mission envelope without sacrificing valid world continuity', () => {
    const { session } = activeSession()
    const raw = JSON.stringify({
      ...createSaveGame(session),
      missionResume: { kind: 'wrong-contract', version: 1, runtime: {} },
    })
    const decoded = decodeSave(raw)
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return
    expect(decoded.repaired).toBe(true)
    expect(decoded.save.missionResume).toBeUndefined()

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.world.activeOrder.orderId).toBe(session.world.activeOrder.orderId)
    expect(restored.world.activeOrder.status).toBe('PickedUp')
    expect(restored.world.player.carryingPackage).toBe(true)
  })

  it('keeps historical Save v2 without missionResume on the DT-09 legacy-safe path', () => {
    const { session, definition } = activeSession()
    const save = createSaveGame(session)
    delete save.missionResume
    const decoded = decodeSave(JSON.stringify(save))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') return

    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.missionResume).toBeUndefined()
    const missionRestore = restoreMissionResumePayload(
      restored.missionResume,
      [definition],
      factsFor(restored.world.activeOrder.orderId, 'PickedUp'),
    )
    expect(missionRestore.status).toBe('legacy-missing')
    expect(missionRestore.state.missions[definition.missionId].status).toBe('Available')
  })
})