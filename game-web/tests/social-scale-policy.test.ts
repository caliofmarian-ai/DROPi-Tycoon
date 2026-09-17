import { describe, expect, it } from 'vitest'
import {
  HUMAN_COMPANY_MIN_REAL_PLAYER_MEMBERS,
  STARTER_VENTURE_ACTIVE_NPC_SPECIALIST_CAP,
  canActivateNpcSpecialist,
  canPromoteToHumanCompany,
  validateSocialScaleSnapshot,
} from '../src/company/socialScalePolicy'

describe('early company social scale policy', () => {
  it('allows up to three active NPC specialists in a solo starter venture', () => {
    expect(STARTER_VENTURE_ACTIVE_NPC_SPECIALIST_CAP).toBe(3)
    expect(validateSocialScaleSnapshot({
      tier: 'StarterVenture',
      authenticatedHumanMemberIds: ['player:owner'],
      activeNpcSpecialistIds: ['npc:1', 'npc:2', 'npc:3'],
      controlledStarterVentureIds: ['company:starter:1'],
    })).toEqual({ allowed: true, reason: 'within-starter-cap' })
  })

  it('blocks activation of a fourth active NPC specialist while still solo starter tier', () => {
    const decision = canActivateNpcSpecialist({
      tier: 'StarterVenture',
      authenticatedHumanMemberIds: ['player:owner'],
      activeNpcSpecialistIds: ['npc:1', 'npc:2', 'npc:3'],
      controlledStarterVentureIds: ['company:starter:1'],
    }, 'npc:4')

    expect(decision).toEqual({ allowed: false, reason: 'starter-active-npc-cap-reached' })
  })

  it('requires at least two real human members for the human-company tier', () => {
    expect(HUMAN_COMPANY_MIN_REAL_PLAYER_MEMBERS).toBe(2)
    expect(canPromoteToHumanCompany(['player:owner'])).toEqual({
      allowed: false,
      reason: 'human-company-needs-real-player-partner',
    })
    expect(canPromoteToHumanCompany(['player:owner', 'player:partner'])).toEqual({
      allowed: true,
      reason: 'human-company-member-gate-satisfied',
    })
  })

  it('does not let NPC specialists count as real human members', () => {
    expect(validateSocialScaleSnapshot({
      tier: 'HumanCompany',
      authenticatedHumanMemberIds: ['player:owner'],
      activeNpcSpecialistIds: ['npc:1', 'npc:2', 'npc:3'],
    })).toEqual({ allowed: false, reason: 'human-company-needs-real-player-partner' })
  })

  it('blocks a starter shell-venture bypass', () => {
    expect(validateSocialScaleSnapshot({
      tier: 'StarterVenture',
      authenticatedHumanMemberIds: ['player:owner'],
      activeNpcSpecialistIds: [],
      controlledStarterVentureIds: ['company:starter:1', 'company:starter:2'],
    })).toEqual({ allowed: false, reason: 'shell-venture-bypass' })
  })
})
