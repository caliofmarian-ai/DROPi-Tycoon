import type { OrderStatus, PersonalCapabilityId } from '../types/game'

export const MISSION_RUNTIME_VERSION = 1 as const

export const MISSION_SOURCES = ['Authored', 'Systemic'] as const
export type MissionSourceKind = (typeof MISSION_SOURCES)[number]

export const MISSION_CATEGORIES = [
  'CampaignStory',
  'Character',
  'Employer',
  'Career',
  'Training',
  'Company',
  'Economic',
  'ProducerSupplyChain',
  'CivicWorld',
  'EventEmergencyLogistics',
] as const
export type MissionCategory = (typeof MISSION_CATEGORIES)[number]

export const MISSION_STATUSES = ['Locked', 'Delayed', 'Available', 'Active', 'Completed', 'Failed'] as const
export type MissionStatus = (typeof MISSION_STATUSES)[number]

export type MissionId = string
export type MissionArcId = string
export type MissionStageId = string
export type MissionObjectiveId = string

export type MissionSource =
  | { kind: 'Authored'; authoredRef?: string }
  | { kind: 'Systemic'; causeRef: string }

export type MissionPrerequisite =
  | { kind: 'missionCompleted'; missionId: MissionId }
  | { kind: 'capability'; capabilityId: PersonalCapabilityId }
  | { kind: 'equipment'; equipmentId: string }
  | { kind: 'actorAvailable'; actorId: string }
  | { kind: 'locationAvailable'; locationId: string }
  | { kind: 'worldFlag'; flagId: string }
  | { kind: 'orderStatus'; orderId: string; status: OrderStatus }
  | { kind: 'contractStatus'; contractId: string; status: string }
  | { kind: 'worldMinuteAtLeast'; worldMinute: number }

export interface MissionDeliveryReference {
  deliveryMissionId: string
  orderId: string
  parcelIds: readonly string[]
}

interface MissionObjectiveBase {
  objectiveId: MissionObjectiveId
  label: string
  optional?: boolean
}

export type MissionObjective =
  | (MissionObjectiveBase & {
      kind: 'signal'
      signalType: string
      referenceId?: string
    })
  | (MissionObjectiveBase & {
      kind: 'orderStatus'
      orderId: string
      status: OrderStatus
    })
  | (MissionObjectiveBase & {
      kind: 'delivery'
      delivery: MissionDeliveryReference
      status: 'PickedUp' | 'Delivered' | 'Failed'
    })
  | (MissionObjectiveBase & {
      kind: 'choice'
      choiceId: string
      options: readonly string[]
    })
  | (MissionObjectiveBase & {
      kind: 'time'
      atOrAfterWorldMinute: number
    })

export interface MissionStageLink {
  stageId: MissionStageId
  /** Explicit escape hatch for authored retry loops. Unmarked cycles are invalid. */
  allowCycle?: boolean
}

export interface MissionChoiceBranch {
  choiceId: string
  optionId: string
  target?: MissionStageLink
}

export interface MissionStageDefinition {
  stageId: MissionStageId
  label: string
  objectives: readonly MissionObjective[]
  next?: MissionStageLink
  branches?: readonly MissionChoiceBranch[]
}

export type MissionConsequence =
  | { kind: 'RelationshipDelta'; relationshipId: string; delta: number }
  | { kind: 'ReputationDelta'; reputationId: string; delta: number }
  | { kind: 'AccessGrant'; accessId: string }
  | { kind: 'CapabilityOpportunity'; capabilityId: PersonalCapabilityId; opportunityId: string }
  | { kind: 'EmployerTrustDelta'; employerId: string; delta: number }
  | { kind: 'CompanyRelationshipDelta'; companyId: string; delta: number }
  | { kind: 'ContractAvailability'; contractRef: string }
  | { kind: 'WorldFlag'; flagId: string; value: boolean }
  | {
      kind: 'EconomicSettlementReference'
      /** Mission engine never carries an amount: the referenced economic authority owns settlement. */
      settlementRef: string
    }

export interface MissionUnlockRule {
  missionId: MissionId
  choiceId?: string
  optionId?: string
  delayMinutes?: number
  allowCycle?: boolean
}

export type MissionFailurePolicy =
  | { kind: 'Retry'; stageId?: MissionStageId }
  | { kind: 'AlternateOutcome'; target: MissionStageLink }
  | { kind: 'DelayedSecondChance'; delayMinutes: number; stageId?: MissionStageId }
  | { kind: 'FailedBranch'; unlocks: readonly MissionUnlockRule[] }

export interface MissionDefinition {
  missionId: MissionId
  arcId?: MissionArcId
  category: MissionCategory
  source: MissionSource
  label: string
  prerequisites: readonly MissionPrerequisite[]
  startStageId: MissionStageId
  stages: readonly MissionStageDefinition[]
  completionConsequences: readonly MissionConsequence[]
  unlocks?: readonly MissionUnlockRule[]
  failurePolicy?: MissionFailurePolicy
  /** Root/systemic offers may become available from prerequisites alone. Chained missions are unlocked explicitly. */
  availability: 'Prerequisites' | 'ExplicitUnlock'
}

export interface MissionChoiceRecord {
  choiceId: string
  optionId: string
}

export interface MissionCompletionReceipt {
  receiptId: string
  missionId: MissionId
  completedAtWorldMinute: number
}

export interface MissionConsequenceIntent {
  intentId: string
  missionId: MissionId
  receiptId: string
  consequence: MissionConsequence
}

export interface MissionInstanceState {
  missionId: MissionId
  status: MissionStatus
  stageId?: MissionStageId
  completedObjectiveIds: MissionObjectiveId[]
  choices: MissionChoiceRecord[]
  processedEventIds: string[]
  failureCount: number
  availableAtWorldMinute?: number
  completionReceiptId?: string
  emittedConsequenceIntentIds: string[]
}

export interface MissionRuntimeState {
  version: typeof MISSION_RUNTIME_VERSION
  missions: Record<string, MissionInstanceState>
  completionReceipts: MissionCompletionReceipt[]
}

export interface MissionWorldFacts {
  worldMinute: number
  capabilityIds?: readonly PersonalCapabilityId[]
  equipmentIds?: readonly string[]
  actorIds?: readonly string[]
  locationIds?: readonly string[]
  worldFlags?: readonly string[]
  orderStatuses?: Readonly<Record<string, OrderStatus>>
  contractStatuses?: Readonly<Record<string, string>>
}

export type MissionEvent =
  | { eventId: string; kind: 'Signal'; signalType: string; referenceId?: string }
  | { eventId: string; kind: 'OrderStatus'; orderId: string; status: OrderStatus }
  | {
      eventId: string
      kind: 'DeliveryStatus'
      deliveryMissionId: string
      orderId: string
      parcelIds: readonly string[]
      status: 'PickedUp' | 'Delivered' | 'Failed'
    }
  | { eventId: string; kind: 'Choice'; choiceId: string; optionId: string }
  | { eventId: string; kind: 'Fail'; reason: string }
  | { eventId: string; kind: 'Tick' }

export interface MissionPrerequisiteEvaluation {
  eligible: boolean
  blockers: string[]
}

export interface MissionTransitionResult {
  state: MissionRuntimeState
  changed: boolean
  reason?: string
  emittedConsequences: MissionConsequenceIntent[]
}

export interface MissionGraphValidation {
  valid: boolean
  errors: string[]
}
