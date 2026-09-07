export const SHARED_STATE_FAMILIES = [
  'CameraPresentation',
  'TouchInput',
  'AudioPreferences',
  'HudPresentation',
  'PlayerAccountIdentity',
  'CompanyIdentityMembership',
  'SharedCompanyBalance',
  'CompanyOwnershipShares',
  'SharedMarketplaceSettlement',
  'CompanyPermissionsRoles',
  'WorldShardPresence',
  'SharedEconomicTransactions',
] as const

export type SharedStateFamily = (typeof SHARED_STATE_FAMILIES)[number]
export type AuthorityTarget = 'LocalPresentation' | 'FutureServerAuthoritative'

/**
 * Target authority inventory. It describes the multiplayer migration boundary,
 * not the current implementation status of every family.
 */
export const SHARED_STATE_AUTHORITY_TARGET: Readonly<Record<SharedStateFamily, AuthorityTarget>> = {
  CameraPresentation: 'LocalPresentation',
  TouchInput: 'LocalPresentation',
  AudioPreferences: 'LocalPresentation',
  HudPresentation: 'LocalPresentation',
  PlayerAccountIdentity: 'FutureServerAuthoritative',
  CompanyIdentityMembership: 'FutureServerAuthoritative',
  SharedCompanyBalance: 'FutureServerAuthoritative',
  CompanyOwnershipShares: 'FutureServerAuthoritative',
  SharedMarketplaceSettlement: 'FutureServerAuthoritative',
  CompanyPermissionsRoles: 'FutureServerAuthoritative',
  WorldShardPresence: 'FutureServerAuthoritative',
  SharedEconomicTransactions: 'FutureServerAuthoritative',
}

/** Opaque IDs: consumers must not derive permissions, ownership, geography or provider from their format. */
export type AuthorityActorId = string
export type AuthorityAggregateId = string
export type AuthorityCommandId = string
export type AuthorityEventId = string

export interface SharedCommandEnvelope<TCommandType extends string = string, TPayload = unknown> {
  commandId: AuthorityCommandId
  actorId: AuthorityActorId
  aggregateId: AuthorityAggregateId
  commandType: TCommandType
  /** Optimistic concurrency boundary supplied by the client projection. */
  expectedRevision: number
  payload: TPayload
}

export type AuthorityRejectionReason = 'StaleRevision' | 'ValidationFailed'

export interface AuthorityCommandReceipt {
  commandId: AuthorityCommandId
  aggregateId: AuthorityAggregateId
  accepted: boolean
  /** Revision after an accepted command, or the unchanged current revision after rejection. */
  resultingRevision: number
  /** Monotonic order assigned by the authority adapter to first-seen commands. */
  authoritativeSequence: number
  eventId?: AuthorityEventId
  rejectionReason?: AuthorityRejectionReason
}

export interface AuthorityEventEnvelope<TEventType extends string = string, TPayload = unknown> {
  eventId: AuthorityEventId
  commandId: AuthorityCommandId
  aggregateId: AuthorityAggregateId
  revision: number
  authoritativeSequence: number
  eventType: TEventType
  payload: TPayload
}

export type AuthorityCommandHandlingResult<TEventType extends string = string, TEventPayload = unknown> =
  | { accepted: true; eventType: TEventType; eventPayload: TEventPayload }
  | { accepted: false; reason: 'ValidationFailed' }

export type LocalAuthorityCommandResult<TEventType extends string = string, TEventPayload = unknown> =
  | {
      kind: 'applied'
      receipt: AuthorityCommandReceipt
      event: AuthorityEventEnvelope<TEventType, TEventPayload>
    }
  | {
      kind: 'duplicate'
      receipt: AuthorityCommandReceipt
      event?: AuthorityEventEnvelope<TEventType, TEventPayload>
    }
  | {
      kind: 'rejected'
      receipt: AuthorityCommandReceipt
    }
