import type { BusinessCompanyId, EconomicActorId } from './business'
import type { CompanyEquityState, EquityPoolId } from './equity'

export const GOVERNANCE_PROPOSAL_STATUSES = ['Open', 'Approved', 'Rejected', 'Expired', 'Executed'] as const
export type GovernanceProposalStatus = (typeof GOVERNANCE_PROPOSAL_STATUSES)[number]

export const GOVERNANCE_VOTE_CHOICES = ['For', 'Against', 'Abstain'] as const
export type GovernanceVoteChoice = (typeof GOVERNANCE_VOTE_CHOICES)[number]

export type GovernanceAction = {
  kind: 'AppointExecutive'
  actionId: string
  candidateActorId: EconomicActorId
}

export interface GovernanceVotingPolicy {
  version: string
  votingPools: EquityPoolId[]
  quorumBps: number
  approvalThresholdBps: number
  approvalRequiresStrictlyGreater: boolean
  executiveCandidateRequiresActiveMembership: boolean
}

export interface GovernanceVotingWeightSnapshot {
  actorId: EconomicActorId
  units: number
}

export interface GovernanceBallotState {
  actorId: EconomicActorId
  choice: GovernanceVoteChoice
  weight: number
}

export interface GovernanceResolutionState {
  participatingUnits: number
  forUnits: number
  againstUnits: number
  abstainUnits: number
  quorumMet: boolean
  approved: boolean
}

export interface GovernanceProposalState {
  proposalId: string
  companyId: BusinessCompanyId
  createdByActorId: EconomicActorId
  policyVersion: string
  action: GovernanceAction
  voterWeights: GovernanceVotingWeightSnapshot[]
  eligibleVotingUnits: number
  ballots: GovernanceBallotState[]
  status: GovernanceProposalStatus
  resolution?: GovernanceResolutionState
}

export type GovernanceCommandType = 'OpenProposal' | 'CastBallot' | 'ResolveProposal' | 'ExpireProposal' | 'ExecuteProposal'

export interface GovernanceCommandReceipt {
  commandId: string
  commandType: GovernanceCommandType
  proposalId: string
  fingerprint: string
}

export interface CompanyGovernanceState {
  companyId: BusinessCompanyId
  proposals: GovernanceProposalState[]
  receipts: GovernanceCommandReceipt[]
}

export type GovernanceBlockReason =
  | 'InvalidGovernanceState'
  | 'InvalidEquityState'
  | 'InvalidPolicy'
  | 'CompanyMismatch'
  | 'InvalidIdentifier'
  | 'DuplicateCommand'
  | 'CommandIdConflict'
  | 'ProposalIdConflict'
  | 'ProposalNotFound'
  | 'ProposalNotOpen'
  | 'ProposalNotApproved'
  | 'AlreadyExecuted'
  | 'ProposerNotEligible'
  | 'VoterNotEligible'
  | 'AlreadyVoted'
  | 'CandidateNotEligible'
  | 'NoEligibleVotingUnits'

export type GovernanceMutationResult =
  | {
      changed: true
      state: CompanyGovernanceState
      proposal: GovernanceProposalState
      receipt: GovernanceCommandReceipt
    }
  | {
      changed: false
      state: CompanyGovernanceState
      reason: GovernanceBlockReason
      duplicate?: boolean
      proposal?: GovernanceProposalState
      receipt?: GovernanceCommandReceipt
    }

export interface GovernanceIntegrityResult {
  valid: boolean
  errors: string[]
}

export type ExecutiveContinuityMode = 'CurrentExecutiveEligible' | 'ActiveMemberCaretaker' | 'FounderCaretaker' | 'InvalidEquity'

export interface ExecutiveContinuityResult {
  changed: boolean
  mode: ExecutiveContinuityMode
  caretaker: boolean
  state: CompanyEquityState
}
