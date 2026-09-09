import { describe, expect, it } from 'vitest'
import {
  applyMissionEvent,
  createMissionRuntimeState,
  startMission,
  validateMissionGraph,
} from '../src/missions/missionEngine'
import type { MissionDefinition, MissionWorldFacts } from '../src/missions/missionModel'

const facts = (worldMinute = 10): MissionWorldFacts => ({ worldMinute })

const simpleMission = (
  missionId: string,
  overrides: Partial<MissionDefinition> = {},
): MissionDefinition => ({
  missionId,
  category: 'CampaignStory',
  source: { kind: 'Authored' },
  label: missionId,
  prerequisites: [],
  availability: 'Prerequisites',
  startStageId: 'start',
  stages: [{
    stageId: 'start',
    label: 'Start',
    objectives: [{ objectiveId: 'done', kind: 'signal', signalType: 'done', label: 'Done' }],
  }],
  completionConsequences: [],
  ...overrides,
})

const start = (
  definitions: readonly MissionDefinition[],
  missionId: string,
  worldFacts = facts(),
) => {
  const created = createMissionRuntimeState(definitions, worldFacts)
  const started = startMission(definitions, created, missionId, worldFacts)
  expect(started.changed).toBe(true)
  return started.state
}

describe('#553 mission framework hardening', () => {
  it('treats missionCompleted prerequisites and explicit unlocks as the same causal direction', () => {
    const first = simpleMission('mission:first', {
      unlocks: [{ missionId: 'mission:second' }],
    })
    const second = simpleMission('mission:second', {
      prerequisites: [{ kind: 'missionCompleted', missionId: 'mission:first' }],
      availability: 'ExplicitUnlock',
    })

    expect(validateMissionGraph([first, second])).toEqual({ valid: true, errors: [] })

    let state = start([first, second], first.missionId)
    const completed = applyMissionEvent(
      [first, second],
      state,
      first.missionId,
      { eventId: 'event:first-done', kind: 'Signal', signalType: 'done' },
      facts(),
    )
    state = completed.state
    expect(state.missions[first.missionId].status).toBe('Completed')
    expect(state.missions[second.missionId].status).toBe('Available')
  })

  it('makes prerequisite-only chains available after the prerequisite settles', () => {
    const first = simpleMission('mission:prerequisite-root')
    const second = simpleMission('mission:prerequisite-child', {
      prerequisites: [{ kind: 'missionCompleted', missionId: first.missionId }],
    })
    const definitions = [first, second]

    let state = start(definitions, first.missionId)
    expect(state.missions[second.missionId].status).toBe('Locked')
    state = applyMissionEvent(
      definitions,
      state,
      first.missionId,
      { eventId: 'event:root-complete', kind: 'Signal', signalType: 'done' },
      facts(),
    ).state
    expect(state.missions[second.missionId].status).toBe('Available')
  })

  it('records a failure event before applying failure so a duplicate event cannot increment failure twice', () => {
    const mission = simpleMission('mission:retry-idempotent', {
      failurePolicy: { kind: 'Retry' },
    })
    const definitions = [mission]
    let state = start(definitions, mission.missionId)

    const firstFailure = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:same-failure', kind: 'Fail', reason: 'parcel-error' },
      facts(),
    )
    expect(firstFailure.state.missions[mission.missionId].failureCount).toBe(1)
    expect(firstFailure.state.missions[mission.missionId].processedEventIds).toContain('event:same-failure')

    state = firstFailure.state
    const duplicate = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:same-failure', kind: 'Fail', reason: 'parcel-error' },
      facts(),
    )
    expect(duplicate.changed).toBe(false)
    expect(duplicate.reason).toBe('duplicate-event')
    expect(duplicate.state.missions[mission.missionId].failureCount).toBe(1)
  })

  it('preserves the configured retry stage across a delayed second chance', () => {
    const mission: MissionDefinition = {
      ...simpleMission('mission:delayed-stage'),
      startStageId: 'intro',
      stages: [
        {
          stageId: 'intro',
          label: 'Intro',
          objectives: [{ objectiveId: 'intro-done', kind: 'signal', signalType: 'intro-done', label: 'Intro done' }],
          next: { stageId: 'work' },
        },
        {
          stageId: 'work',
          label: 'Work',
          objectives: [{ objectiveId: 'work-done', kind: 'signal', signalType: 'work-done', label: 'Work done' }],
        },
      ],
      failurePolicy: { kind: 'DelayedSecondChance', delayMinutes: 30, stageId: 'work' },
    }
    const definitions = [mission]
    let state = start(definitions, mission.missionId, facts(10))
    state = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:intro', kind: 'Signal', signalType: 'intro-done' },
      facts(10),
    ).state
    expect(state.missions[mission.missionId].stageId).toBe('work')

    state = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:fail-work', kind: 'Fail', reason: 'recoverable' },
      facts(10),
    ).state
    expect(state.missions[mission.missionId]).toMatchObject({
      status: 'Delayed',
      stageId: 'work',
      availableAtWorldMinute: 40,
    })

    const restarted = startMission(definitions, state, mission.missionId, facts(40))
    expect(restarted.changed).toBe(true)
    expect(restarted.state.missions[mission.missionId]).toMatchObject({ status: 'Active', stageId: 'work' })
  })

  it('supports an alternate failure outcome without completing or corrupting the mission', () => {
    const mission: MissionDefinition = {
      ...simpleMission('mission:alternate-outcome'),
      stages: [
        {
          stageId: 'start',
          label: 'Start',
          objectives: [{ objectiveId: 'primary', kind: 'signal', signalType: 'primary', label: 'Primary' }],
        },
        {
          stageId: 'recovery',
          label: 'Recovery',
          objectives: [{ objectiveId: 'recovery', kind: 'signal', signalType: 'recovery', label: 'Recovery' }],
        },
      ],
      failurePolicy: { kind: 'AlternateOutcome', target: { stageId: 'recovery' } },
    }
    const definitions = [mission]
    const state = start(definitions, mission.missionId)
    const failed = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:alternate', kind: 'Fail', reason: 'route-blocked' },
      facts(),
    )
    expect(failed.state.missions[mission.missionId]).toMatchObject({
      status: 'Active',
      stageId: 'recovery',
      failureCount: 1,
    })
    expect(failed.state.completionReceipts).toEqual([])
  })
})
