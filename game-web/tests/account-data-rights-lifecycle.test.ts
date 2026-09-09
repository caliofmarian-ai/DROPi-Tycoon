import { describe, expect, it } from 'vitest'
import {
  ACCOUNT_DATA_CATEGORY_POLICIES,
  authorizeDataRightsRequest,
  buildAccountDeletionPlan,
  createMinimalCompletionEvidence,
  dataRightsHandlingRule,
  evaluateAccountDeletionSurfaceReadiness,
  transitionDataRightsRequest,
  validateRetentionException,
  type DataRightsRequest,
  type RetentionException,
} from '../src/privacy/accountDataRightsLifecycle'

const request = (state: DataRightsRequest['state'] = 'Received'): DataRightsRequest => ({
  requestId: 'rights-request-001',
  requestType: 'AccountDeletion',
  targetAccountId: 'acct-server-001',
  state,
})

describe('account data-rights lifecycle #562', () => {
  it('enforces the governed deletion lifecycle and terminal states', () => {
    const received = request()
    const awaiting = transitionDataRightsRequest(received, 'AwaitingIdentityVerification')
    expect(awaiting.ok).toBe(true)
    if (!awaiting.ok) throw new Error('expected transition')

    const authorized = transitionDataRightsRequest(awaiting.request, 'Authorized')
    expect(authorized.ok).toBe(true)
    if (!authorized.ok) throw new Error('expected transition')

    const processing = transitionDataRightsRequest(authorized.request, 'Processing')
    expect(processing.ok).toBe(true)
    if (!processing.ok) throw new Error('expected transition')

    const processors = transitionDataRightsRequest(processing.request, 'AwaitingProcessorCompletion')
    expect(processors.ok).toBe(true)
    if (!processors.ok) throw new Error('expected transition')

    const review = transitionDataRightsRequest(processors.request, 'RetentionReview')
    expect(review.ok).toBe(true)
    if (!review.ok) throw new Error('expected transition')

    const completed = transitionDataRightsRequest(review.request, 'Completed')
    expect(completed.ok).toBe(true)
    if (!completed.ok) throw new Error('expected transition')

    expect(transitionDataRightsRequest(completed.request, 'Processing')).toEqual({
      ok: false,
      reason: 'InvalidTransition',
    })
  })

  it('does not allow an account rights request to skip identity verification', () => {
    expect(transitionDataRightsRequest(request(), 'Authorized')).toEqual({
      ok: false,
      reason: 'InvalidTransition',
    })
  })

  it('hard-blocks authorization while production authentication is not configured under #560', () => {
    expect(authorizeDataRightsRequest(request(), {
      authentication: 'NotConfigured',
      identityVerified: false,
    })).toEqual({
      authorized: false,
      reason: 'AuthenticationNotConfigured',
    })
  })

  it('requires server-derived authenticated identity rather than a client target ID', () => {
    expect(authorizeDataRightsRequest(request(), {
      authentication: 'Unauthenticated',
      authenticatedAccountId: 'acct-server-001',
      identityVerified: false,
    })).toEqual({
      authorized: false,
      reason: 'IdentityNotVerified',
    })

    expect(authorizeDataRightsRequest(request(), {
      authentication: 'Authenticated',
      authenticatedAccountId: 'acct-other',
      identityVerified: true,
    })).toEqual({
      authorized: false,
      reason: 'AccountMismatch',
    })

    expect(authorizeDataRightsRequest(request(), {
      authentication: 'Authenticated',
      authenticatedAccountId: 'acct-server-001',
      identityVerified: true,
    })).toEqual({
      authorized: true,
      accountId: 'acct-server-001',
    })
  })

  it('keeps current local save data separate from future production account deletion', () => {
    const plan = buildAccountDeletionPlan({
      activeCategories: ['LocalGameSave', 'AccountCore', 'PublicProfile'],
    })

    expect(plan).toEqual([
      {
        category: 'LocalGameSave',
        action: 'SeparateLocalReset',
        note: 'Preserve local save data; account deletion and local-save reset are separate user choices.',
      },
      expect.objectContaining({ category: 'AccountCore', action: 'Delete' }),
      expect.objectContaining({ category: 'PublicProfile', action: 'Delete' }),
    ])
  })

  it('can represent a separately confirmed local-save reset without treating it as server deletion', () => {
    expect(buildAccountDeletionPlan({
      activeCategories: ['LocalGameSave'],
      resetLocalGameSave: true,
    })).toEqual([
      {
        category: 'LocalGameSave',
        action: 'SeparateLocalReset',
        note: 'Execute the separately confirmed local-save reset; this is not server account deletion.',
      },
    ])
  })

  it('propagates account deletion to processors and prevents deleted data from restoring from backups', () => {
    const plan = buildAccountDeletionPlan({
      activeCategories: ['ProcessorReplica', 'BackupReplica'],
    })
    expect(plan.map(entry => [entry.category, entry.action])).toEqual([
      ['ProcessorReplica', 'DeleteAtProcessor'],
      ['BackupReplica', 'SuppressRestoreAndExpireBackup'],
    ])
  })

  it('requires documented, scoped and bounded retention exceptions', () => {
    const valid: RetentionException = {
      category: 'SecurityAndAbuseRecord',
      reason: 'LegalClaims',
      policyRef: 'RETENTION-POLICY-LEGAL-CLAIMS',
      retainedSubset: 'minimum evidence required for the documented claim',
      expiresWhen: 'the documented legal-claims limitation/retention trigger ends',
    }
    expect(validateRetentionException(valid)).toBe(true)
    expect(validateRetentionException({ ...valid, policyRef: '' })).toBe(false)
    expect(validateRetentionException({ ...valid, retainedSubset: '' })).toBe(false)
    expect(validateRetentionException({ ...valid, expiresWhen: 'indefinite' })).toBe(false)
    expect(validateRetentionException({ ...valid, category: 'LocalGameSave' })).toBe(false)
  })

  it('retains only a documented restricted subset when a valid exception exists', () => {
    const plan = buildAccountDeletionPlan({
      activeCategories: ['AccountCore', 'SecurityAndAbuseRecord'],
      retentionExceptions: [{
        category: 'SecurityAndAbuseRecord',
        reason: 'FraudOrSecurity',
        policyRef: 'RETENTION-SECURITY-001',
        retainedSubset: 'minimal anti-abuse evidence',
        expiresWhen: 'the documented anti-abuse retention trigger ends',
      }],
    })
    expect(plan[0]).toEqual(expect.objectContaining({ category: 'AccountCore', action: 'Delete' }))
    expect(plan[1]).toEqual({
      category: 'SecurityAndAbuseRecord',
      action: 'RetainRestrictedSubset',
      retentionExceptionRef: 'RETENTION-SECURITY-001',
      note: 'Retain only the documented subset until the governed expiry condition: the documented anti-abuse retention trigger ends',
    })
  })

  it('rejects invalid retention exceptions rather than silently retaining data', () => {
    expect(() => buildAccountDeletionPlan({
      activeCategories: ['AccountCore'],
      retentionExceptions: [{
        category: 'AccountCore',
        reason: 'LegalObligation',
        policyRef: 'RETENTION-LEGAL-001',
        retainedSubset: 'required record subset',
        expiresWhen: 'forever',
      }],
    })).toThrow('Invalid retention exception for AccountCore')
  })

  it('creates minimal completion evidence without retaining account identity or deleted payload', () => {
    const plan = buildAccountDeletionPlan({
      activeCategories: ['AccountCore', 'ProcessorReplica'],
    })
    const evidence = createMinimalCompletionEvidence(
      request(),
      '2026-09-09T07:00:00Z',
      'Completed',
      plan,
      [{ processorRef: 'processor-storage', confirmationRef: 'processor-confirmation-77' }],
    )

    expect(evidence).toEqual({
      requestId: 'rights-request-001',
      requestType: 'AccountDeletion',
      completedAt: '2026-09-09T07:00:00Z',
      outcome: 'Completed',
      categoryOutcomes: [
        { category: 'AccountCore', action: 'Delete' },
        { category: 'ProcessorReplica', action: 'DeleteAtProcessor' },
      ],
      retentionExceptionRefs: [],
      processorConfirmationRefs: ['processor-confirmation-77'],
    })

    const serialized = JSON.stringify(evidence)
    expect(serialized).not.toContain('acct-server-001')
    expect(evidence).not.toHaveProperty('accountId')
    expect(evidence).not.toHaveProperty('targetAccountId')
    expect(evidence).not.toHaveProperty('payload')
  })

  it('marks portability as conditional rather than promising it for every data category', () => {
    expect(dataRightsHandlingRule('Portability')).toEqual(expect.objectContaining({
      serverAuthorizationRequired: true,
      legalApplicability: 'ConditionalLegalReview',
    }))
    expect(dataRightsHandlingRule('Access').legalApplicability).toBe('GenerallyApplicable')
    expect(dataRightsHandlingRule('Rectification').legalApplicability).toBe('GenerallyApplicable')
  })

  it('requires both Play deletion surfaces and real production authentication before readiness', () => {
    expect(evaluateAccountDeletionSurfaceReadiness({
      productionAuthenticationConfigured: false,
      inAppAvailable: false,
      externalWebAvailable: false,
    })).toEqual({
      ready: false,
      missing: [
        'ProductionServerAuthentication',
        'InAppDeletionPath',
        'ExternalWebDeletionPath',
      ],
    })

    expect(evaluateAccountDeletionSurfaceReadiness({
      productionAuthenticationConfigured: true,
      inAppAvailable: true,
      externalWebAvailable: true,
    })).toEqual({ ready: true, missing: [] })
  })

  it('does not represent future-conditional account categories as current collection', () => {
    const current = ACCOUNT_DATA_CATEGORY_POLICIES.filter(policy => policy.activation === 'CurrentLocalOnly')
    const future = ACCOUNT_DATA_CATEGORY_POLICIES.filter(policy => policy.activation === 'FutureConditional')
    expect(current.map(policy => policy.category)).toEqual(['LocalGameSave'])
    expect(future.length).toBeGreaterThan(0)
    expect(future.every(policy => policy.accountAssociated)).toBe(true)
  })
})
