import type { GovernanceVotingPolicy } from '../types/governance'

/**
 * Prototype governance policy. These values are governed balance/policy inputs,
 * not historical company state, so later balancing can evolve without rewriting saves.
 */
export const PROTOTYPE_GOVERNANCE_POLICY: GovernanceVotingPolicy = {
  version: 'prototype-governance-v1',
  votingPools: ['InternalMember', 'ExternalMarket'],
  quorumBps: 5_000,
  approvalThresholdBps: 5_000,
  approvalRequiresStrictlyGreater: true,
  executiveCandidateRequiresActiveMembership: true,
}
