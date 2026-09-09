export const DATA_RIGHTS_REQUEST_TYPES = [
  'AccountDeletion',
  'Access',
  'Rectification',
  'Portability',
] as const

export type DataRightsRequestType = (typeof DATA_RIGHTS_REQUEST_TYPES)[number]

export const DATA_RIGHTS_REQUEST_STATES = [
  'Received',
  'AwaitingIdentityVerification',
  'Authorized',
  'Processing',
  'AwaitingProcessorCompletion',
  'RetentionReview',
  'Completed',
  'Rejected',
] as const

export type DataRightsRequestState = (typeof DATA_RIGHTS_REQUEST_STATES)[number]

export interface DataRightsRequest {
  requestId: string
  requestType: DataRightsRequestType
  targetAccountId: string
  state: DataRightsRequestState
}

export type DataRightsTransitionResult =
  | { ok: true; request: DataRightsRequest }
  | { ok: false; reason: 'InvalidTransition' }

const REQUEST_TRANSITIONS: Readonly<Record<DataRightsRequestState, readonly DataRightsRequestState[]>> = {
  Received: ['AwaitingIdentityVerification', 'Rejected'],
  AwaitingIdentityVerification: ['Authorized', 'Rejected'],
  Authorized: ['Processing', 'Rejected'],
  Processing: ['AwaitingProcessorCompletion', 'RetentionReview', 'Completed', 'Rejected'],
  AwaitingProcessorCompletion: ['Processing', 'RetentionReview', 'Completed', 'Rejected'],
  RetentionReview: ['Processing', 'Completed', 'Rejected'],
  Completed: [],
  Rejected: [],
}

export const transitionDataRightsRequest = (
  request: DataRightsRequest,
  nextState: DataRightsRequestState,
): DataRightsTransitionResult => {
  if (!REQUEST_TRANSITIONS[request.state].includes(nextState)) {
    return { ok: false, reason: 'InvalidTransition' }
  }
  return { ok: true, request: { ...request, state: nextState } }
}

export const AUTHENTICATION_BOUNDARIES = [
  'NotConfigured',
  'Unauthenticated',
  'Authenticated',
] as const

export type AuthenticationBoundary = (typeof AUTHENTICATION_BOUNDARIES)[number]

export interface ServerAuthorizationContext {
  authentication: AuthenticationBoundary
  authenticatedAccountId?: string
  identityVerified: boolean
}

export type DataRightsAuthorizationFailure =
  | 'AuthenticationNotConfigured'
  | 'IdentityNotVerified'
  | 'AccountMismatch'

export type DataRightsAuthorizationResult =
  | { authorized: true; accountId: string }
  | { authorized: false; reason: DataRightsAuthorizationFailure }

/**
 * Production account rights must be authorized from server-derived authentication context.
 * Client-supplied actor/profile IDs are deliberately not accepted as an authorization input.
 */
export const authorizeDataRightsRequest = (
  request: Pick<DataRightsRequest, 'targetAccountId'>,
  context: ServerAuthorizationContext,
): DataRightsAuthorizationResult => {
  if (context.authentication === 'NotConfigured') {
    return { authorized: false, reason: 'AuthenticationNotConfigured' }
  }
  if (
    context.authentication !== 'Authenticated'
    || !context.identityVerified
    || typeof context.authenticatedAccountId !== 'string'
    || context.authenticatedAccountId.trim().length === 0
  ) {
    return { authorized: false, reason: 'IdentityNotVerified' }
  }
  if (context.authenticatedAccountId !== request.targetAccountId) {
    return { authorized: false, reason: 'AccountMismatch' }
  }
  return { authorized: true, accountId: context.authenticatedAccountId }
}

export const DATA_CATEGORY_ACTIVATION = ['CurrentLocalOnly', 'FutureConditional'] as const
export type DataCategoryActivation = (typeof DATA_CATEGORY_ACTIVATION)[number]

export const DELETION_ACTIONS = [
  'SeparateLocalReset',
  'Delete',
  'IrreversiblyDeidentify',
  'DeleteAtProcessor',
  'SuppressRestoreAndExpireBackup',
] as const
export type DeletionAction = (typeof DELETION_ACTIONS)[number]

export interface AccountDataCategoryPolicy {
  category: AccountDataCategory
  activation: DataCategoryActivation
  accountAssociated: boolean
  defaultDeletionAction: DeletionAction
  retentionRule: string
  allowsDocumentedRetentionException: boolean
  legalReviewRequired: boolean
}

export const ACCOUNT_DATA_CATEGORIES = [
  'LocalGameSave',
  'AccountCore',
  'PublicProfile',
  'AvatarMedia',
  'CloudGameState',
  'CommercialEntitlementRecord',
  'SecurityAndAbuseRecord',
  'SupportCorrespondence',
  'UGCModerationRecord',
  'ProcessorReplica',
  'BackupReplica',
] as const

export type AccountDataCategory = (typeof ACCOUNT_DATA_CATEGORIES)[number]

/**
 * This registry is an implementation contract, not a statement that future-conditional
 * categories are collected by the current release. Current source evidence is governed by
 * CURRENT_RELEASE_DATA_FLOW_569.md and must be re-audited whenever a future category activates.
 */
export const ACCOUNT_DATA_CATEGORY_POLICIES: readonly AccountDataCategoryPolicy[] = [
  {
    category: 'LocalGameSave',
    activation: 'CurrentLocalOnly',
    accountAssociated: false,
    defaultDeletionAction: 'SeparateLocalReset',
    retentionRule: 'On-device lifecycle only; account deletion must not silently erase local save data without an explicit local-reset choice.',
    allowsDocumentedRetentionException: false,
    legalReviewRequired: false,
  },
  {
    category: 'AccountCore',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'Delete',
    retentionRule: 'Delete when an authorized account-deletion request completes unless a documented legal retention exception applies.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'PublicProfile',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'Delete',
    retentionRule: 'Remove public/private profile linkage when account deletion completes; retained fragments require an explicit documented exception.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'AvatarMedia',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'Delete',
    retentionRule: 'Delete account-owned avatar media and revoke public references when account deletion completes.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'CloudGameState',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'Delete',
    retentionRule: 'Delete account-linked cloud game state unless a documented exception specifically covers a required subset.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'CommercialEntitlementRecord',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'IrreversiblyDeidentify',
    retentionRule: 'No fixed period is canonized. If activated, legal/accounting/refund/fraud obligations and the minimum retained fields require owner/legal review.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'SecurityAndAbuseRecord',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'IrreversiblyDeidentify',
    retentionRule: 'Retain only the minimum justified subset for a documented security, fraud, abuse or legal-claims purpose; no indefinite blanket retention.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'SupportCorrespondence',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'Delete',
    retentionRule: 'Delete or de-identify after the support purpose and any documented justified retention need ends.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'UGCModerationRecord',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'IrreversiblyDeidentify',
    retentionRule: 'If UGC activates, retain only a justified moderation/safety/legal subset for a governed period; final rule requires child-safety and jurisdiction review.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'ProcessorReplica',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'DeleteAtProcessor',
    retentionRule: 'Propagate deletion to the applicable processor/subprocessor under the active processing contract and capture completion evidence.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
  {
    category: 'BackupReplica',
    activation: 'FutureConditional',
    accountAssociated: true,
    defaultDeletionAction: 'SuppressRestoreAndExpireBackup',
    retentionRule: 'Prevent deleted account data from being restored to live service and expire backup copies under a validated backup-retention policy.',
    allowsDocumentedRetentionException: true,
    legalReviewRequired: true,
  },
]

const CATEGORY_POLICY_BY_ID = new Map(
  ACCOUNT_DATA_CATEGORY_POLICIES.map(policy => [policy.category, policy] as const),
)

export const RETENTION_EXCEPTION_REASONS = [
  'LegalObligation',
  'FraudOrSecurity',
  'LegalClaims',
] as const

export type RetentionExceptionReason = (typeof RETENTION_EXCEPTION_REASONS)[number]

export interface RetentionException {
  category: AccountDataCategory
  reason: RetentionExceptionReason
  policyRef: string
  retainedSubset: string
  expiresWhen: string
}

export const validateRetentionException = (exception: RetentionException): boolean => {
  const policy = CATEGORY_POLICY_BY_ID.get(exception.category)
  if (!policy?.allowsDocumentedRetentionException) return false
  if (exception.policyRef.trim().length === 0) return false
  if (exception.retainedSubset.trim().length === 0) return false
  const expiry = exception.expiresWhen.trim().toLowerCase()
  if (expiry.length === 0 || expiry === 'indefinite' || expiry === 'forever' || expiry === 'never') {
    return false
  }
  return true
}

export type DeletionPlanAction = DeletionAction | 'RetainRestrictedSubset'

export interface AccountDeletionPlanEntry {
  category: AccountDataCategory
  action: DeletionPlanAction
  retentionExceptionRef?: string
  note: string
}

export interface AccountDeletionPlanInput {
  activeCategories: readonly AccountDataCategory[]
  retentionExceptions?: readonly RetentionException[]
  resetLocalGameSave?: boolean
}

/**
 * Builds a deterministic execution plan only for data categories that the caller confirms are
 * active for the release/account. Passing a FutureConditional category does not activate it.
 */
export const buildAccountDeletionPlan = (
  input: AccountDeletionPlanInput,
): AccountDeletionPlanEntry[] => {
  const exceptions = new Map<AccountDataCategory, RetentionException>()
  for (const exception of input.retentionExceptions ?? []) {
    if (!validateRetentionException(exception)) {
      throw new Error(`Invalid retention exception for ${exception.category}`)
    }
    exceptions.set(exception.category, exception)
  }

  const seen = new Set<AccountDataCategory>()
  const result: AccountDeletionPlanEntry[] = []
  for (const category of input.activeCategories) {
    if (seen.has(category)) continue
    seen.add(category)
    const policy = CATEGORY_POLICY_BY_ID.get(category)
    if (!policy) throw new Error(`Unknown account data category: ${category}`)

    if (category === 'LocalGameSave') {
      result.push({
        category,
        action: input.resetLocalGameSave ? 'SeparateLocalReset' : 'SeparateLocalReset',
        note: input.resetLocalGameSave
          ? 'Execute the separately confirmed local-save reset; this is not server account deletion.'
          : 'Preserve local save data; account deletion and local-save reset are separate user choices.',
      })
      continue
    }

    const exception = exceptions.get(category)
    if (exception) {
      result.push({
        category,
        action: 'RetainRestrictedSubset',
        retentionExceptionRef: exception.policyRef,
        note: `Retain only the documented subset until the governed expiry condition: ${exception.expiresWhen}`,
      })
      continue
    }

    result.push({
      category,
      action: policy.defaultDeletionAction,
      note: policy.retentionRule,
    })
  }
  return result
}

export interface ProcessorDeletionConfirmation {
  processorRef: string
  confirmationRef: string
}

export interface MinimalDataRightsCompletionEvidence {
  requestId: string
  requestType: DataRightsRequestType
  completedAt: string
  outcome: 'Completed' | 'Rejected'
  categoryOutcomes: readonly {
    category: AccountDataCategory
    action: DeletionPlanAction
  }[]
  retentionExceptionRefs: readonly string[]
  processorConfirmationRefs: readonly string[]
}

/**
 * Deliberately omits account ID, email, display name, request payload and deleted data.
 * The caller remains responsible for governing the retention of this minimal audit record.
 */
export const createMinimalCompletionEvidence = (
  request: Pick<DataRightsRequest, 'requestId' | 'requestType'>,
  completedAt: string,
  outcome: 'Completed' | 'Rejected',
  plan: readonly AccountDeletionPlanEntry[] = [],
  processorConfirmations: readonly ProcessorDeletionConfirmation[] = [],
): MinimalDataRightsCompletionEvidence => ({
  requestId: request.requestId,
  requestType: request.requestType,
  completedAt,
  outcome,
  categoryOutcomes: plan.map(entry => ({ category: entry.category, action: entry.action })),
  retentionExceptionRefs: plan
    .flatMap(entry => entry.retentionExceptionRef ? [entry.retentionExceptionRef] : []),
  processorConfirmationRefs: processorConfirmations.map(confirmation => confirmation.confirmationRef),
})

export interface DataRightsHandlingRule {
  requestType: DataRightsRequestType
  serverAuthorizationRequired: true
  handling: string
  legalApplicability: 'GenerallyApplicable' | 'ConditionalLegalReview'
}

export const DATA_RIGHTS_HANDLING_RULES: readonly DataRightsHandlingRule[] = [
  {
    requestType: 'AccountDeletion',
    serverAuthorizationRequired: true,
    handling: 'Execute the governed deletion/de-identification/propagation plan for active account-associated categories while keeping local-save reset a separate choice.',
    legalApplicability: 'GenerallyApplicable',
  },
  {
    requestType: 'Access',
    serverAuthorizationRequired: true,
    handling: 'Provide the authenticated requester with the applicable personal-data copy and required processing information from active authoritative stores.',
    legalApplicability: 'GenerallyApplicable',
  },
  {
    requestType: 'Rectification',
    serverAuthorizationRequired: true,
    handling: 'Correct supported inaccurate mutable personal fields in authoritative stores and propagate the correction where required, or provide a governed rejection reason.',
    legalApplicability: 'GenerallyApplicable',
  },
  {
    requestType: 'Portability',
    serverAuthorizationRequired: true,
    handling: 'Provide a structured machine-readable export only for data/categories where the legal portability conditions apply; do not over-promise universal portability.',
    legalApplicability: 'ConditionalLegalReview',
  },
]

export const dataRightsHandlingRule = (requestType: DataRightsRequestType): DataRightsHandlingRule => {
  const rule = DATA_RIGHTS_HANDLING_RULES.find(candidate => candidate.requestType === requestType)
  if (!rule) throw new Error(`Unknown data-rights request type: ${requestType}`)
  return rule
}

export const ACCOUNT_DELETION_CHANNELS = ['InApp', 'ExternalWeb'] as const
export type AccountDeletionChannel = (typeof ACCOUNT_DELETION_CHANNELS)[number]

export interface AccountDeletionSurfaceReadiness {
  productionAuthenticationConfigured: boolean
  inAppAvailable: boolean
  externalWebAvailable: boolean
}

export interface AccountDeletionSurfaceReadinessResult {
  ready: boolean
  missing: readonly string[]
}

export const evaluateAccountDeletionSurfaceReadiness = (
  input: AccountDeletionSurfaceReadiness,
): AccountDeletionSurfaceReadinessResult => {
  const missing: string[] = []
  if (!input.productionAuthenticationConfigured) missing.push('ProductionServerAuthentication')
  if (!input.inAppAvailable) missing.push('InAppDeletionPath')
  if (!input.externalWebAvailable) missing.push('ExternalWebDeletionPath')
  return { ready: missing.length === 0, missing }
}
