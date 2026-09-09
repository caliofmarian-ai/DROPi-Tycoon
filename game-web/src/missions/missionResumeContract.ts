import {
  cloneMissionRuntimeState,
  createMissionRuntimeState,
  deliveryReferenceMatches,
  type MissionDeliveryResolver,
} from './missionEngine'
import {
  type MissionDefinition,
  type MissionDeliveryReference,
  type MissionRuntimeState,
  type MissionWorldFacts,
} from './missionModel'
import { sanitizeMissionRuntimeState } from './missionPersistence'

export const MISSION_RESUME_CONTRACT_KIND = 'dropi-mission-runtime-resume' as const
export const MISSION_RESUME_CONTRACT_VERSION = 1 as const

export interface MissionResumePayloadV1 {
  kind: typeof MISSION_RESUME_CONTRACT_KIND
  version: typeof MISSION_RESUME_CONTRACT_VERSION
  runtime: MissionRuntimeState
}

export type MissionResumeRestoreStatus =
  | 'restored'
  | 'legacy-missing'
  | 'repaired'
  | 'incompatible'

export interface MissionResumeRestoreResult {
  state: MissionRuntimeState
  status: MissionResumeRestoreStatus
  reasons: string[]
}

export type MissionResumeAuthorityReference =
  | {
      kind: 'order'
      missionId: string
      stageId: string
      objectiveId: string
      required: boolean
      orderId: string
    }
  | {
      kind: 'delivery'
      missionId: string
      stageId: string
      objectiveId: string
      required: boolean
      expectedStatus: 'PickedUp' | 'Delivered' | 'Failed'
      delivery: MissionDeliveryReference
    }

export type MissionResumeReferenceIssueCode =
  | 'active-mission-definition-missing'
  | 'active-mission-stage-missing'
  | 'order-reference-missing'
  | 'delivery-reference-missing-or-mismatched'

export interface MissionResumeReferenceIssue {
  severity: 'blocker' | 'warning'
  code: MissionResumeReferenceIssueCode
  missionId: string
  stageId?: string
  objectiveId?: string
  referenceId?: string
}

export interface MissionResumeReferenceValidation {
  resumable: boolean
  issues: MissionResumeReferenceIssue[]
  references: MissionResumeAuthorityReference[]
}

export interface MissionResumeAuthorityPort {
  /** Read-only existence check against the order state restored by the Save/world owner. */
  hasOrder(orderId: string): boolean
  /** Read-only resolver for the already-authoritative DeliveryMission aggregate. */
  resolveDeliveryMission: MissionDeliveryResolver
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Returns the object that the owning Save/world aggregate may embed as one field.
 * This function does not write localStorage, Save v2, PostgreSQL, hero position,
 * cargo custody, economy state or any other external authority.
 */
export const createMissionResumePayload = (state: MissionRuntimeState): MissionResumePayloadV1 => ({
  kind: MISSION_RESUME_CONTRACT_KIND,
  version: MISSION_RESUME_CONTRACT_VERSION,
  runtime: cloneMissionRuntimeState(state),
})

/**
 * Restores mission progress without replaying mission events or emitting consequences.
 * `undefined` is a supported legacy boundary: an older Save v2 has no mission payload,
 * so the caller receives a fresh mission runtime while the owning Save migration remains
 * free to preserve the rest of that save.
 */
export const restoreMissionResumePayload = (
  value: unknown,
  definitions: readonly MissionDefinition[],
  facts: MissionWorldFacts,
): MissionResumeRestoreResult => {
  if (value === undefined) {
    return {
      state: createMissionRuntimeState(definitions, facts),
      status: 'legacy-missing',
      reasons: ['mission-resume-payload-missing'],
    }
  }

  if (!record(value) ||
    value.kind !== MISSION_RESUME_CONTRACT_KIND ||
    value.version !== MISSION_RESUME_CONTRACT_VERSION ||
    !('runtime' in value)) {
    return {
      state: createMissionRuntimeState(definitions, facts),
      status: 'incompatible',
      reasons: ['mission-resume-contract-incompatible'],
    }
  }

  const sanitized = sanitizeMissionRuntimeState(value.runtime, definitions, facts)
  return {
    state: sanitized.state,
    status: sanitized.repaired ? 'repaired' : 'restored',
    reasons: sanitized.reasons,
  }
}

/**
 * Exposes only unresolved external references needed by active mission stages.
 * The Save/world owner can use these expectations to reconcile order/cargo state without
 * the mission runtime copying or becoming authoritative for those aggregates.
 */
export const collectMissionResumeAuthorityReferences = (
  state: MissionRuntimeState,
  definitions: readonly MissionDefinition[],
): MissionResumeAuthorityReference[] => {
  const definitionsById = new Map(definitions.map(definition => [definition.missionId, definition]))
  const references: MissionResumeAuthorityReference[] = []

  for (const instance of Object.values(state.missions)) {
    if (instance.status !== 'Active' || !instance.stageId) continue
    const definition = definitionsById.get(instance.missionId)
    const stage = definition?.stages.find(candidate => candidate.stageId === instance.stageId)
    if (!stage) continue

    const completed = new Set(instance.completedObjectiveIds)
    for (const objective of stage.objectives) {
      if (completed.has(objective.objectiveId)) continue
      const required = objective.optional !== true
      if (objective.kind === 'orderStatus') {
        references.push({
          kind: 'order',
          missionId: instance.missionId,
          stageId: stage.stageId,
          objectiveId: objective.objectiveId,
          required,
          orderId: objective.orderId,
        })
      } else if (objective.kind === 'delivery') {
        references.push({
          kind: 'delivery',
          missionId: instance.missionId,
          stageId: stage.stageId,
          objectiveId: objective.objectiveId,
          required,
          expectedStatus: objective.status,
          delivery: {
            deliveryMissionId: objective.delivery.deliveryMissionId,
            orderId: objective.delivery.orderId,
            parcelIds: [...objective.delivery.parcelIds],
          },
        })
      }
    }
  }

  return references
}

/**
 * Validates mission-side identity continuity only. Cargo custody, hero location and
 * settlement receipts remain the owning persistence/economy domains' responsibility.
 * No mission state or external aggregate is mutated by this check.
 */
export const validateMissionResumeReferences = (
  state: MissionRuntimeState,
  definitions: readonly MissionDefinition[],
  authority: MissionResumeAuthorityPort,
): MissionResumeReferenceValidation => {
  const definitionsById = new Map(definitions.map(definition => [definition.missionId, definition]))
  const issues: MissionResumeReferenceIssue[] = []

  for (const instance of Object.values(state.missions)) {
    if (instance.status !== 'Active') continue
    const definition = definitionsById.get(instance.missionId)
    if (!definition) {
      issues.push({
        severity: 'blocker',
        code: 'active-mission-definition-missing',
        missionId: instance.missionId,
        ...(instance.stageId ? { stageId: instance.stageId } : {}),
      })
      continue
    }
    const stage = definition.stages.find(candidate => candidate.stageId === instance.stageId)
    if (!stage) {
      issues.push({
        severity: 'blocker',
        code: 'active-mission-stage-missing',
        missionId: instance.missionId,
        ...(instance.stageId ? { stageId: instance.stageId } : {}),
      })
    }
  }

  const references = collectMissionResumeAuthorityReferences(state, definitions)
  for (const reference of references) {
    const severity = reference.required ? 'blocker' : 'warning'
    if (reference.kind === 'order') {
      if (!authority.hasOrder(reference.orderId)) {
        issues.push({
          severity,
          code: 'order-reference-missing',
          missionId: reference.missionId,
          stageId: reference.stageId,
          objectiveId: reference.objectiveId,
          referenceId: reference.orderId,
        })
      }
      continue
    }

    if (!authority.hasOrder(reference.delivery.orderId)) {
      issues.push({
        severity,
        code: 'order-reference-missing',
        missionId: reference.missionId,
        stageId: reference.stageId,
        objectiveId: reference.objectiveId,
        referenceId: reference.delivery.orderId,
      })
    }
    if (!deliveryReferenceMatches(reference.delivery, authority.resolveDeliveryMission)) {
      issues.push({
        severity,
        code: 'delivery-reference-missing-or-mismatched',
        missionId: reference.missionId,
        stageId: reference.stageId,
        objectiveId: reference.objectiveId,
        referenceId: reference.delivery.deliveryMissionId,
      })
    }
  }

  return {
    resumable: issues.every(issue => issue.severity !== 'blocker'),
    issues,
    references,
  }
}
