import { describe, expect, it } from 'vitest'
import type { DeliveryMission } from '../src/systems/urbanLogistics'
import {
  applyMissionEvent,
  createMissionRuntimeState,
  startMission,
} from '../src/missions/missionEngine'
import type {
  MissionDefinition,
  MissionRuntimeState,
  MissionWorldFacts,
} from '../src/missions/missionModel'
import {
  MISSION_RESUME_CONTRACT_KIND,
  MISSION_RESUME_CONTRACT_VERSION,
  collectMissionResumeAuthorityReferences,
  createMissionResumePayload,
  restoreMissionResumePayload,
  validateMissionResumeReferences,
} from '../src/missions/missionResumeContract'

const facts = (worldMinute = 20): MissionWorldFacts => ({
  worldMinute,
  orderStatuses: { 'order:resume': 'Available' },
})

const delivery: DeliveryMission = {
  missionId: 'delivery:resume',
  orderId: 'order:resume',
  parcels: [{ parcelId: 'parcel:resume', orderId: 'order:resume', cargoUnits: 1 }],
  legs: [{
    legId: 'leg:resume',
    mode: 'terrestrial',
    transport: 'walking',
    carrier: { kind: 'player', playerId: 'hero:resume' },
    from: 'pickup:resume',
    to: 'delivery:resume',
    parcelIds: ['parcel:resume'],
  }],
}

const signalMission = (missionId = 'mission:resume'): MissionDefinition => ({
  missionId,
  category: 'CampaignStory',
  source: { kind: 'Authored', authoredRef: 'resume-test' },
  label: 'Resume test',
  prerequisites: [],
  availability: 'Prerequisites',
  startStageId: 'work',
  stages: [{
    stageId: 'work',
    label: 'Work',
    objectives: [{ objectiveId: 'done', kind: 'signal', signalType: 'done', label: 'Done' }],
  }],
  completionConsequences: [{ kind: 'AccessGrant', accessId: 'next:resume' }],
})

const deliveryMission = (optional = false): MissionDefinition => ({
  missionId: optional ? 'mission:optional-delivery' : 'mission:delivery-resume',
  category: 'Employer',
  source: { kind: 'Authored' },
  label: 'Delivery resume',
  prerequisites: [],
  availability: 'Prerequisites',
  startStageId: 'deliver',
  stages: [{
    stageId: 'deliver',
    label: 'Deliver',
    objectives: [{
      objectiveId: 'deliver-parcel',
      kind: 'delivery',
      delivery: {
        deliveryMissionId: delivery.missionId,
        orderId: delivery.orderId,
        parcelIds: ['parcel:resume'],
      },
      status: 'Delivered',
      label: 'Deliver the restored parcel',
      ...(optional ? { optional: true } : {}),
    }, {
      objectiveId: 'order-ready',
      kind: 'orderStatus',
      orderId: delivery.orderId,
      status: 'Available',
      label: 'Keep the order reference',
      ...(optional ? { optional: true } : {}),
    }],
  }],
  completionConsequences: [],
})

const started = (
  definitions: readonly MissionDefinition[],
  missionId: string,
  worldFacts = facts(),
): MissionRuntimeState => {
  const initial = createMissionRuntimeState(definitions, worldFacts)
  const result = startMission(definitions, initial, missionId, worldFacts)
  expect(result.changed).toBe(true)
  return result.state
}

describe('#566 mission-side persistence/resume contract', () => {
  it('creates an embed-ready versioned payload without aliasing mutable mission state', () => {
    const mission = signalMission()
    const state = started([mission], mission.missionId)
    const payload = createMissionResumePayload(state)

    expect(payload.kind).toBe(MISSION_RESUME_CONTRACT_KIND)
    expect(payload.version).toBe(MISSION_RESUME_CONTRACT_VERSION)
    expect(payload.runtime).toEqual(state)
    expect(payload.runtime).not.toBe(state)
    expect(payload.runtime.missions[mission.missionId]).not.toBe(state.missions[mission.missionId])

    payload.runtime.missions[mission.missionId].processedEventIds.push('payload-only')
    expect(state.missions[mission.missionId].processedEventIds).toEqual([])
  })

  it('restores an active stage exactly without replaying events or emitting consequences', () => {
    const mission: MissionDefinition = {
      ...signalMission(),
      stages: [{
        stageId: 'work',
        label: 'Work',
        objectives: [
          { objectiveId: 'first', kind: 'signal', signalType: 'first', label: 'First' },
          { objectiveId: 'second', kind: 'signal', signalType: 'second', label: 'Second' },
        ],
      }],
    }
    const definitions = [mission]
    let state = started(definitions, mission.missionId)
    state = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:first', kind: 'Signal', signalType: 'first' },
      facts(),
    ).state

    const restored = restoreMissionResumePayload(createMissionResumePayload(state), definitions, facts())
    expect(restored.status).toBe('restored')
    expect(restored.reasons).toEqual([])
    expect(restored.state).toEqual(state)
    expect(restored.state.missions[mission.missionId]).toMatchObject({
      status: 'Active',
      stageId: 'work',
      completedObjectiveIds: ['first'],
      processedEventIds: ['event:first'],
    })
    expect(restored.state.completionReceipts).toEqual([])
  })

  it('treats a missing payload as a legacy-safe boundary rather than claiming Save-schema ownership', () => {
    const mission = signalMission()
    const restored = restoreMissionResumePayload(undefined, [mission], facts())

    expect(restored.status).toBe('legacy-missing')
    expect(restored.reasons).toEqual(['mission-resume-payload-missing'])
    expect(restored.state.missions[mission.missionId].status).toBe('Available')
    expect(restored.state.completionReceipts).toEqual([])
  })

  it('rejects an incompatible outer contract and safely supplies fresh mission state', () => {
    const mission = signalMission()
    const restored = restoreMissionResumePayload({
      kind: MISSION_RESUME_CONTRACT_KIND,
      version: 999,
      runtime: {},
    }, [mission], facts())

    expect(restored.status).toBe('incompatible')
    expect(restored.reasons).toEqual(['mission-resume-contract-incompatible'])
    expect(restored.state.missions[mission.missionId].status).toBe('Available')
  })

  it('repairs malformed mission runtime inside a compatible envelope without touching external state', () => {
    const mission = signalMission()
    const restored = restoreMissionResumePayload({
      kind: MISSION_RESUME_CONTRACT_KIND,
      version: MISSION_RESUME_CONTRACT_VERSION,
      runtime: {
        version: 1,
        missions: {
          [mission.missionId]: {
            missionId: mission.missionId,
            status: 'Active',
            completedObjectiveIds: [],
            choices: [],
            processedEventIds: [],
            failureCount: 0,
            emittedConsequenceIntentIds: [],
          },
        },
        completionReceipts: [],
      },
    }, [mission], facts())

    expect(restored.status).toBe('repaired')
    expect(restored.reasons).toContain(`mission-instance-repaired:${mission.missionId}`)
    expect(restored.state.missions[mission.missionId].status).toBe('Available')
  })

  it('preserves exactly-once completion identities so reload cannot replay consequences', () => {
    const mission = signalMission('mission:completion-resume')
    const definitions = [mission]
    let state = started(definitions, mission.missionId)
    const completed = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:complete-once', kind: 'Signal', signalType: 'done' },
      facts(),
    )
    expect(completed.emittedConsequences).toHaveLength(1)
    state = completed.state

    const restored = restoreMissionResumePayload(createMissionResumePayload(state), definitions, facts())
    expect(restored.status).toBe('restored')
    expect(restored.state.completionReceipts).toHaveLength(1)
    expect(restored.state.missions[mission.missionId].emittedConsequenceIntentIds).toEqual([
      'mission-consequence:mission:completion-resume:0',
    ])

    const replay = applyMissionEvent(
      definitions,
      restored.state,
      mission.missionId,
      { eventId: 'event:complete-once', kind: 'Signal', signalType: 'done' },
      facts(),
    )
    expect(replay.changed).toBe(false)
    expect(replay.emittedConsequences).toEqual([])
    expect(replay.state.completionReceipts).toHaveLength(1)
  })

  it('exposes only unresolved active order/delivery references for the owning Save/world reconciliation', () => {
    const mission = deliveryMission()
    const state = started([mission], mission.missionId)

    expect(collectMissionResumeAuthorityReferences(state, [mission])).toEqual([
      {
        kind: 'delivery',
        missionId: mission.missionId,
        stageId: 'deliver',
        objectiveId: 'deliver-parcel',
        required: true,
        expectedStatus: 'Delivered',
        delivery: {
          deliveryMissionId: delivery.missionId,
          orderId: delivery.orderId,
          parcelIds: ['parcel:resume'],
        },
      },
      {
        kind: 'order',
        missionId: mission.missionId,
        stageId: 'deliver',
        objectiveId: 'order-ready',
        required: true,
        orderId: delivery.orderId,
      },
    ])
  })

  it('accepts exact authoritative order/DeliveryMission identity and blocks missing required references', () => {
    const mission = deliveryMission()
    const state = started([mission], mission.missionId)
    const valid = validateMissionResumeReferences(state, [mission], {
      hasOrder: orderId => orderId === delivery.orderId,
      resolveDeliveryMission: missionId => missionId === delivery.missionId ? delivery : undefined,
    })
    expect(valid.resumable).toBe(true)
    expect(valid.issues).toEqual([])

    const missing = validateMissionResumeReferences(state, [mission], {
      hasOrder: () => false,
      resolveDeliveryMission: () => undefined,
    })
    expect(missing.resumable).toBe(false)
    expect(missing.issues.map(issue => issue.code)).toEqual([
      'order-reference-missing',
      'delivery-reference-missing-or-mismatched',
      'order-reference-missing',
    ])
    expect(missing.issues.every(issue => issue.severity === 'blocker')).toBe(true)
  })

  it('reports missing optional external references as warnings without blocking mission resume', () => {
    const mission = deliveryMission(true)
    const state = started([mission], mission.missionId)
    const result = validateMissionResumeReferences(state, [mission], {
      hasOrder: () => false,
      resolveDeliveryMission: () => undefined,
    })

    expect(result.resumable).toBe(true)
    expect(result.issues).toHaveLength(3)
    expect(result.issues.every(issue => issue.severity === 'warning')).toBe(true)
  })

  it('is deterministic across repeated restore and validation calls', () => {
    const mission = deliveryMission()
    const definitions = [mission]
    const state = started(definitions, mission.missionId)
    const payload = createMissionResumePayload(state)
    const authority = {
      hasOrder: (orderId: string) => orderId === delivery.orderId,
      resolveDeliveryMission: (missionId: string) => missionId === delivery.missionId ? delivery : undefined,
    }

    const firstRestore = restoreMissionResumePayload(payload, definitions, facts())
    const secondRestore = restoreMissionResumePayload(payload, definitions, facts())
    expect(firstRestore).toEqual(secondRestore)
    expect(validateMissionResumeReferences(firstRestore.state, definitions, authority)).toEqual(
      validateMissionResumeReferences(secondRestore.state, definitions, authority),
    )
  })
})
