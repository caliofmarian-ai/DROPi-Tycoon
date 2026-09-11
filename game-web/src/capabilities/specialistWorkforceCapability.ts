import type { PersonalCapabilityId } from '../types/game'

/**
 * DT-06-owned evidence describing what a specialist personally knows or is
 * qualified to do. It is deliberately separate from employment and company
 * state: discovering or recruiting a person never transfers this evidence to
 * the player or company.
 */
export interface SpecialistCapabilityProfile {
  actorId: string
  learnedCapabilityIds: readonly PersonalCapabilityId[]
  qualificationIds: readonly string[]
}

/**
 * Read-only facts supplied by the workforce/company authority. DT-06 consumes
 * these facts but does not create employment, membership, wages or company
 * ownership.
 */
export interface SpecialistEngagementFacts {
  specialistActorId: string
  companyId: string
  engagementActive: boolean
  availableForAssignment: boolean
}

/**
 * People-side requirements for one organizational capability. Equipment,
 * facilities, authorizations, money and operating capacity are intentionally
 * composed by their owning domains outside this evaluator.
 */
export interface SpecialistContributionRequirement {
  requiredCapabilityIds?: readonly PersonalCapabilityId[]
  requiredQualificationIds?: readonly string[]
}

export type SpecialistContributionBlockerCode =
  | 'specialist-identity-mismatch'
  | 'specialist-not-engaged'
  | 'specialist-unavailable'
  | 'specialist-capability-missing'
  | 'specialist-qualification-missing'

export interface SpecialistContributionBlocker {
  code: SpecialistContributionBlockerCode
  missingId?: string
}

export interface SpecialistContributionEvaluation {
  contributes: boolean
  specialistActorId: string
  companyId: string
  blockers: SpecialistContributionBlocker[]
}

const includes = (values: readonly string[], expected: string): boolean => values.includes(expected)

/**
 * Returns whether one known specialist currently contributes the requested
 * people-side capability to one company.
 *
 * This function is intentionally mutation-free. In particular it never:
 * - grants the specialist's capability/qualification to the player;
 * - writes a permanent company capability flag;
 * - creates employment from candidate/recruitment access;
 * - treats equipment/facilities or Work Capacity as specialist evidence.
 *
 * Therefore a specialist leaving or becoming unavailable removes their
 * contribution immediately while their personal qualification profile remains
 * intact.
 */
export const evaluateSpecialistWorkforceContribution = (
  profile: SpecialistCapabilityProfile,
  engagement: SpecialistEngagementFacts,
  requirement: SpecialistContributionRequirement,
): SpecialistContributionEvaluation => {
  const blockers: SpecialistContributionBlocker[] = []

  if (profile.actorId !== engagement.specialistActorId) {
    blockers.push({ code: 'specialist-identity-mismatch' })
  }

  if (!engagement.engagementActive) {
    blockers.push({ code: 'specialist-not-engaged' })
  }

  if (!engagement.availableForAssignment) {
    blockers.push({ code: 'specialist-unavailable' })
  }

  for (const capabilityId of requirement.requiredCapabilityIds ?? []) {
    if (!includes(profile.learnedCapabilityIds, capabilityId)) {
      blockers.push({
        code: 'specialist-capability-missing',
        missingId: capabilityId,
      })
    }
  }

  for (const qualificationId of requirement.requiredQualificationIds ?? []) {
    if (!includes(profile.qualificationIds, qualificationId)) {
      blockers.push({
        code: 'specialist-qualification-missing',
        missingId: qualificationId,
      })
    }
  }

  return {
    contributes: blockers.length === 0,
    specialistActorId: engagement.specialistActorId,
    companyId: engagement.companyId,
    blockers,
  }
}
