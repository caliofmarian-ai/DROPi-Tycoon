import type { PlayerMobilityWorkAccessPresentationProjection } from '../capabilities/playerMobilityWorkAccessPresentation'
import type { GameSessionPlayerEconomyProjection } from '../economy/gameSessionPlayerEconomyComposition'
import { sanitizeWorldIdentityState } from '../systems/worldIdentitySystem'
import type { GameSessionState } from '../types/game'

export const PLAYER_PROFILE_PRESENTATION_VERSION = 1 as const

export interface PlayerProfileLocalityProjection {
  worldInstanceId: string
  heroActorId: string
  authorityRef: string
  homeLocalityId?: string | null
  startingLocalityId?: string | null
  currentLocalityId?: string | null
}

export interface PlayerProfileAuthorityProjection {
  locality?: PlayerProfileLocalityProjection | null
  playerEconomy?: GameSessionPlayerEconomyProjection | null
  workAccess?: PlayerMobilityWorkAccessPresentationProjection | null
}

export interface PlayerProfilePresentation {
  version: typeof PLAYER_PROFILE_PRESENTATION_VERSION
  heading: 'PLAYER PROFILE'
  lines: string[]
}

const validReference = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= 180

const localityLabel = (value: string | null | undefined): string =>
  validReference(value) ? value : 'Not yet authoritative'

const matchesIdentity = (
  projection: { worldInstanceId: string; heroActorId: string },
  worldInstanceId: string,
  heroActorId: string,
): boolean => projection.worldInstanceId === worldInstanceId && projection.heroActorId === heroActorId

/**
 * Read-only Account/Profile projection. It deliberately does not invent authentication,
 * residence/locality identity, Player Economy state or work eligibility when those owners
 * have not supplied a scoped authoritative projection for the current World Instance hero.
 */
export const buildPlayerProfilePresentation = (
  session: GameSessionState,
  authorities: PlayerProfileAuthorityProjection = {},
): PlayerProfilePresentation => {
  const identity = sanitizeWorldIdentityState(session.worldIdentity).state
  const locality = authorities.locality &&
    matchesIdentity(authorities.locality, identity.worldInstanceId, identity.heroActorId) &&
    validReference(authorities.locality.authorityRef)
    ? authorities.locality
    : null
  const economy = authorities.playerEconomy &&
    matchesIdentity(authorities.playerEconomy, identity.worldInstanceId, identity.heroActorId)
    ? authorities.playerEconomy
    : null
  const workAccess = authorities.workAccess &&
    matchesIdentity(authorities.workAccess, identity.worldInstanceId, identity.heroActorId) &&
    (!locality?.currentLocalityId || !workAccessLocalityConflicts(authorities.workAccess.currentLocalityId, locality.currentLocalityId))
    ? authorities.workAccess
    : null

  const economyLine = economy
    ? `Player Economy: Work Capacity ${economy.workCapacity.current}/${economy.workCapacity.max} · basic delivery ${economy.workCapacity.canPerformBasicDelivery ? 'ready' : 'blocked'}`
    : 'Player Economy: Not mounted in this session'

  const eligibleWork = workAccess?.activities.filter(activity => activity.eligible).map(activity => activity.label) ?? []
  const workLine = workAccess
    ? eligibleWork.length > 0
      ? `Work access: ${eligibleWork.slice(0, 2).join(' · ')}${eligibleWork.length > 2 ? ' · more' : ''}`
      : 'Work access: No eligible activity in current projection'
    : 'Work access: Not mounted in this session'

  return {
    version: PLAYER_PROFILE_PRESENTATION_VERSION,
    heading: 'PLAYER PROFILE',
    lines: [
      'Authority: LOCAL / OFFLINE · no authenticated session',
      `Hero: ${identity.heroActorId}`,
      `World: ${identity.worldInstanceId}`,
      `Home: ${localityLabel(locality?.homeLocalityId)}`,
      `Start: ${localityLabel(locality?.startingLocalityId)}`,
      `Current: ${localityLabel(locality?.currentLocalityId)}`,
      economyLine,
      workLine,
    ],
  }
}

const workAccessLocalityConflicts = (
  workAccessLocalityId: string | null,
  currentLocalityId: string | null | undefined,
): boolean => Boolean(
  validReference(workAccessLocalityId) &&
  validReference(currentLocalityId) &&
  workAccessLocalityId !== currentLocalityId,
)
