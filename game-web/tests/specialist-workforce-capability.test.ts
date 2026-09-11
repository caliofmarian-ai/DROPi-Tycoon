import { describe, expect, it } from 'vitest'
import {
  evaluateSpecialistWorkforceContribution,
  type SpecialistCapabilityProfile,
  type SpecialistContributionRequirement,
  type SpecialistEngagementFacts,
} from '../src/capabilities/specialistWorkforceCapability'

const qualifiedSpecialist: SpecialistCapabilityProfile = {
  actorId: 'specialist:agri-001',
  learnedCapabilityIds: ['WarehouseOperations'],
  qualificationIds: ['qualification:agricultural-operations'],
}

const requirement: SpecialistContributionRequirement = {
  requiredCapabilityIds: ['WarehouseOperations'],
  requiredQualificationIds: ['qualification:agricultural-operations'],
}

const activeEngagement: SpecialistEngagementFacts = {
  specialistActorId: qualifiedSpecialist.actorId,
  companyId: 'company:001',
  engagementActive: true,
  availableForAssignment: true,
}

describe('specialist workforce capability authority', () => {
  it('allows a legitimately engaged, available and qualified specialist to contribute', () => {
    expect(
      evaluateSpecialistWorkforceContribution(
        qualifiedSpecialist,
        activeEngagement,
        requirement,
      ),
    ).toEqual({
      contributes: true,
      specialistActorId: qualifiedSpecialist.actorId,
      companyId: activeEngagement.companyId,
      blockers: [],
    })
  })

  it('does not convert recruitable candidate access into company capability before engagement', () => {
    const candidateOnly = {
      ...activeEngagement,
      engagementActive: false,
    }

    expect(
      evaluateSpecialistWorkforceContribution(
        qualifiedSpecialist,
        candidateOnly,
        requirement,
      ),
    ).toMatchObject({
      contributes: false,
      blockers: [{ code: 'specialist-not-engaged' }],
    })
  })

  it('keeps formal qualification distinct from a learned capability', () => {
    const withoutQualification: SpecialistCapabilityProfile = {
      ...qualifiedSpecialist,
      qualificationIds: [],
    }

    expect(
      evaluateSpecialistWorkforceContribution(
        withoutQualification,
        activeEngagement,
        requirement,
      ),
    ).toMatchObject({
      contributes: false,
      blockers: [
        {
          code: 'specialist-qualification-missing',
          missingId: 'qualification:agricultural-operations',
        },
      ],
    })
  })

  it('withdraws company contribution when the specialist leaves without erasing personal evidence', () => {
    const endedEngagement = {
      ...activeEngagement,
      engagementActive: false,
      availableForAssignment: false,
    }

    const result = evaluateSpecialistWorkforceContribution(
      qualifiedSpecialist,
      endedEngagement,
      requirement,
    )

    expect(result.contributes).toBe(false)
    expect(result.blockers.map((blocker) => blocker.code)).toEqual([
      'specialist-not-engaged',
      'specialist-unavailable',
    ])
    expect(qualifiedSpecialist.qualificationIds).toEqual([
      'qualification:agricultural-operations',
    ])
  })

  it('fails closed when engagement points at a different person', () => {
    const wrongIdentity = {
      ...activeEngagement,
      specialistActorId: 'specialist:other',
    }

    expect(
      evaluateSpecialistWorkforceContribution(
        qualifiedSpecialist,
        wrongIdentity,
        requirement,
      ),
    ).toMatchObject({
      contributes: false,
      blockers: [{ code: 'specialist-identity-mismatch' }],
    })
  })
})
