export const STARTER_VENTURE_ACTIVE_NPC_SPECIALIST_CAP = 3 as const
export const HUMAN_COMPANY_MIN_REAL_PLAYER_MEMBERS = 2 as const

export type OrganizationScaleTier = 'Person' | 'StarterVenture' | 'HumanCompany'

export interface SocialScaleSnapshot {
  tier: OrganizationScaleTier
  authenticatedHumanMemberIds: readonly string[]
  activeNpcSpecialistIds: readonly string[]
  controlledStarterVentureIds?: readonly string[]
}

export type SocialScaleDecision =
  | { allowed: true; reason: 'within-starter-cap' | 'human-company-member-gate-satisfied' | 'not-applicable' }
  | {
      allowed: false
      reason:
        | 'starter-active-npc-cap-reached'
        | 'human-company-needs-real-player-partner'
        | 'duplicate-human-member'
        | 'duplicate-active-npc-specialist'
        | 'shell-venture-bypass'
    }

const unique = (ids: readonly string[]): boolean => new Set(ids).size === ids.length
const validId = (value: string): boolean => value.trim().length > 0 && value.length <= 180

export const validateSocialScaleSnapshot = (snapshot: SocialScaleSnapshot): SocialScaleDecision => {
  if (!snapshot.authenticatedHumanMemberIds.every(validId) || !unique(snapshot.authenticatedHumanMemberIds)) {
    return { allowed: false, reason: 'duplicate-human-member' }
  }
  if (!snapshot.activeNpcSpecialistIds.every(validId) || !unique(snapshot.activeNpcSpecialistIds)) {
    return { allowed: false, reason: 'duplicate-active-npc-specialist' }
  }
  if (snapshot.tier === 'StarterVenture' && (snapshot.controlledStarterVentureIds?.length ?? 0) > 1) {
    return { allowed: false, reason: 'shell-venture-bypass' }
  }
  if (snapshot.tier === 'StarterVenture' && snapshot.activeNpcSpecialistIds.length > STARTER_VENTURE_ACTIVE_NPC_SPECIALIST_CAP) {
    return { allowed: false, reason: 'starter-active-npc-cap-reached' }
  }
  if (snapshot.tier === 'HumanCompany' && snapshot.authenticatedHumanMemberIds.length < HUMAN_COMPANY_MIN_REAL_PLAYER_MEMBERS) {
    return { allowed: false, reason: 'human-company-needs-real-player-partner' }
  }
  if (snapshot.tier === 'StarterVenture') return { allowed: true, reason: 'within-starter-cap' }
  if (snapshot.tier === 'HumanCompany') return { allowed: true, reason: 'human-company-member-gate-satisfied' }
  return { allowed: true, reason: 'not-applicable' }
}

export const canActivateNpcSpecialist = (
  snapshot: SocialScaleSnapshot,
  specialistId: string,
): SocialScaleDecision => {
  if (!validId(specialistId) || snapshot.activeNpcSpecialistIds.includes(specialistId)) {
    return { allowed: false, reason: 'duplicate-active-npc-specialist' }
  }
  const next: SocialScaleSnapshot = {
    ...snapshot,
    activeNpcSpecialistIds: [...snapshot.activeNpcSpecialistIds, specialistId],
  }
  return validateSocialScaleSnapshot(next)
}

export const canPromoteToHumanCompany = (
  authenticatedHumanMemberIds: readonly string[],
): SocialScaleDecision => validateSocialScaleSnapshot({
  tier: 'HumanCompany',
  authenticatedHumanMemberIds,
  activeNpcSpecialistIds: [],
})
