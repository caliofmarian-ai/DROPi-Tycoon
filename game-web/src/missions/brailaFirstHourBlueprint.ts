import type { MissionDefinition, MissionDeliveryReference } from './missionModel'

export interface BrailaFirstHourBindings {
  dispatcherActorId: string
  dispatcherLocationId: string
  localContactActorId: string
  localContactLocationId: string
  firstDelivery: MissionDeliveryReference
  firstDeliverySettlementRef: string
}

/**
 * Replaceable first-hour architecture fixture only. Agent 8 owns permanent character,
 * dialogue and story canon; callers bind real actor/location/logistics identities later.
 */
export const buildNeutralBrailaFirstHourBlueprint = (
  bindings: BrailaFirstHourBindings,
): readonly MissionDefinition[] => [
  {
    missionId: 'first-hour:meet-dispatcher',
    arcId: 'first-hour:braila-placeholder',
    category: 'Employer',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'Meet the dispatcher',
    prerequisites: [
      { kind: 'actorAvailable', actorId: bindings.dispatcherActorId },
      { kind: 'locationAvailable', locationId: bindings.dispatcherLocationId },
    ],
    availability: 'Prerequisites',
    startStageId: 'meet',
    stages: [{
      stageId: 'meet',
      label: 'Understand the immediate situation',
      objectives: [{
        objectiveId: 'meet-dispatcher',
        kind: 'signal',
        signalType: 'actor-met',
        referenceId: bindings.dispatcherActorId,
        label: 'Speak with the dispatcher',
      }],
    }],
    completionConsequences: [{ kind: 'EmployerTrustDelta', employerId: 'first-hour:employer-placeholder', delta: 1 }],
    unlocks: [{ missionId: 'first-hour:light-job' }],
    failurePolicy: { kind: 'Retry' },
  },
  {
    missionId: 'first-hour:light-job',
    arcId: 'first-hour:braila-placeholder',
    category: 'Employer',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'Complete a basic light job',
    prerequisites: [{ kind: 'missionCompleted', missionId: 'first-hour:meet-dispatcher' }],
    availability: 'ExplicitUnlock',
    startStageId: 'pickup',
    stages: [
      {
        stageId: 'pickup',
        label: 'Collect the assigned parcel',
        objectives: [{
          objectiveId: 'first-job-pickup',
          kind: 'delivery',
          delivery: bindings.firstDelivery,
          status: 'PickedUp',
          label: 'Pick up the assigned parcel through the existing logistics runtime',
        }],
        next: { stageId: 'deliver' },
      },
      {
        stageId: 'deliver',
        label: 'Complete the assigned route',
        objectives: [{
          objectiveId: 'first-job-delivery',
          kind: 'delivery',
          delivery: bindings.firstDelivery,
          status: 'Delivered',
          label: 'Deliver the same parcel through the existing logistics runtime',
        }],
      },
    ],
    completionConsequences: [
      { kind: 'EmployerTrustDelta', employerId: 'first-hour:employer-placeholder', delta: 1 },
      { kind: 'EconomicSettlementReference', settlementRef: bindings.firstDeliverySettlementRef },
    ],
    unlocks: [{ missionId: 'first-hour:meet-local-contact' }],
    failurePolicy: { kind: 'DelayedSecondChance', delayMinutes: 15, stageId: 'pickup' },
  },
  {
    missionId: 'first-hour:meet-local-contact',
    arcId: 'first-hour:braila-placeholder',
    category: 'Character',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'Meet a recurring local contact',
    prerequisites: [
      { kind: 'missionCompleted', missionId: 'first-hour:light-job' },
      { kind: 'actorAvailable', actorId: bindings.localContactActorId },
      { kind: 'locationAvailable', locationId: bindings.localContactLocationId },
    ],
    availability: 'ExplicitUnlock',
    startStageId: 'meet',
    stages: [{
      stageId: 'meet',
      label: 'Meet the local contact',
      objectives: [{
        objectiveId: 'meet-local-contact',
        kind: 'signal',
        signalType: 'actor-met',
        referenceId: bindings.localContactActorId,
        label: 'Meet the local contact in the world',
      }],
    }],
    completionConsequences: [{
      kind: 'RelationshipDelta',
      relationshipId: `relationship:${bindings.localContactActorId}`,
      delta: 1,
    }],
    unlocks: [{ missionId: 'first-hour:complication-choice' }],
    failurePolicy: { kind: 'Retry' },
  },
  {
    missionId: 'first-hour:complication-choice',
    arcId: 'first-hour:braila-placeholder',
    category: 'Character',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'Handle a small complication',
    prerequisites: [{ kind: 'missionCompleted', missionId: 'first-hour:meet-local-contact' }],
    availability: 'ExplicitUnlock',
    startStageId: 'choose',
    stages: [{
      stageId: 'choose',
      label: 'Choose what matters right now',
      objectives: [{
        objectiveId: 'first-hour-choice',
        kind: 'choice',
        choiceId: 'first-hour-priority',
        options: ['assist-local', 'protect-job'],
        label: 'Make one meaningful choice',
      }],
    }],
    completionConsequences: [],
    unlocks: [
      { missionId: 'first-hour:assist-outcome', choiceId: 'first-hour-priority', optionId: 'assist-local' },
      { missionId: 'first-hour:duty-outcome', choiceId: 'first-hour-priority', optionId: 'protect-job' },
    ],
    failurePolicy: { kind: 'Retry' },
  },
  {
    missionId: 'first-hour:assist-outcome',
    arcId: 'first-hour:braila-placeholder',
    category: 'Character',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'Resolve the local-first outcome',
    prerequisites: [],
    availability: 'ExplicitUnlock',
    startStageId: 'resolve',
    stages: [{
      stageId: 'resolve',
      label: 'Experience the consequence',
      objectives: [{ objectiveId: 'assist-resolved', kind: 'signal', signalType: 'outcome-resolved', referenceId: 'assist-local', label: 'Resolve the local-first outcome' }],
    }],
    completionConsequences: [
      { kind: 'RelationshipDelta', relationshipId: `relationship:${bindings.localContactActorId}`, delta: 1 },
      { kind: 'EmployerTrustDelta', employerId: 'first-hour:employer-placeholder', delta: -1 },
    ],
    unlocks: [{ missionId: 'first-hour:return-report' }],
    failurePolicy: { kind: 'Retry' },
  },
  {
    missionId: 'first-hour:duty-outcome',
    arcId: 'first-hour:braila-placeholder',
    category: 'Employer',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'Resolve the job-first outcome',
    prerequisites: [],
    availability: 'ExplicitUnlock',
    startStageId: 'resolve',
    stages: [{
      stageId: 'resolve',
      label: 'Experience the consequence',
      objectives: [{ objectiveId: 'duty-resolved', kind: 'signal', signalType: 'outcome-resolved', referenceId: 'protect-job', label: 'Resolve the job-first outcome' }],
    }],
    completionConsequences: [
      { kind: 'EmployerTrustDelta', employerId: 'first-hour:employer-placeholder', delta: 1 },
      { kind: 'RelationshipDelta', relationshipId: `relationship:${bindings.localContactActorId}`, delta: -1 },
    ],
    unlocks: [{ missionId: 'first-hour:return-report' }],
    failurePolicy: { kind: 'Retry' },
  },
  {
    missionId: 'first-hour:return-report',
    arcId: 'first-hour:braila-placeholder',
    category: 'Employer',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'Return and report',
    prerequisites: [],
    availability: 'ExplicitUnlock',
    startStageId: 'report',
    stages: [{
      stageId: 'report',
      label: 'Return to the dispatcher',
      objectives: [{
        objectiveId: 'report-back',
        kind: 'signal',
        signalType: 'actor-reported-to',
        referenceId: bindings.dispatcherActorId,
        label: 'Report what happened',
      }],
    }],
    completionConsequences: [{ kind: 'AccessGrant', accessId: 'first-hour:next-opportunity-placeholder' }],
    unlocks: [{ missionId: 'first-hour:next-opportunity', delayMinutes: 30 }],
    failurePolicy: { kind: 'Retry' },
  },
  {
    missionId: 'first-hour:next-opportunity',
    arcId: 'first-hour:braila-placeholder',
    category: 'Career',
    source: { kind: 'Authored', authoredRef: 'agent8-canon-pending' },
    label: 'See the next opportunity',
    prerequisites: [],
    availability: 'ExplicitUnlock',
    startStageId: 'available',
    stages: [{
      stageId: 'available',
      label: 'A new opportunity becomes available',
      objectives: [{ objectiveId: 'next-opportunity-seen', kind: 'signal', signalType: 'opportunity-seen', label: 'See the next opportunity' }],
    }],
    completionConsequences: [],
    failurePolicy: { kind: 'Retry' },
  },
]
