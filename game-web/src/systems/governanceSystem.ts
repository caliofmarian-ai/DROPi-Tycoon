import type { BusinessCompanyId, EconomicActorId } from '../types/business'
import {
  EQUITY_POOL_IDS,
  type CompanyEquityState,
  type EquityPoolId,
} from '../types/equity'
import {
  GOVERNANCE_PROPOSAL_STATUSES,
  GOVERNANCE_VOTE_CHOICES,
  type CompanyGovernanceState,
  type ExecutiveContinuityResult,
  type GovernanceBlockReason,
  type GovernanceCommandReceipt,
  type GovernanceIntegrityResult,
  type GovernanceMutationResult,
  type GovernanceProposalState,
  type GovernanceResolutionState,
  type GovernanceVoteChoice,
  type GovernanceVotingPolicy,
  type GovernanceVotingWeightSnapshot,
} from '../types/governance'
import {
  getActorEquityUnits,
  setCurrentExecutive,
  validateCompanyEquityIntegrity,
} from './equityLedgerSystem'

const BPS_SCALE = 10_000
const GOVERNANCE_COMMAND_TYPES = ['OpenProposal', 'CastBallot', 'ResolveProposal', 'ExpireProposal', 'ExecuteProposal'] as const

const isNonEmpty = (value: string): boolean => value.trim().length > 0
const isSafePositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const isKnownPool = (value: unknown): value is EquityPoolId =>
  typeof value === 'string' && EQUITY_POOL_IDS.includes(value as EquityPoolId)
const isVoteChoice = (value: unknown): value is GovernanceVoteChoice =>
  typeof value === 'string' && GOVERNANCE_VOTE_CHOICES.includes(value as GovernanceVoteChoice)
const isProposalStatus = (value: unknown): boolean =>
  typeof value === 'string' && GOVERNANCE_PROPOSAL_STATUSES.includes(value as GovernanceProposalState['status'])

const cloneProposal = (proposal: GovernanceProposalState): GovernanceProposalState => ({
  ...proposal,
  action: { ...proposal.action },
  voterWeights: proposal.voterWeights.map(weight => ({ ...weight })),
  ballots: proposal.ballots.map(ballot => ({ ...ballot })),
  resolution: proposal.resolution ? { ...proposal.resolution } : undefined,
})

const cloneGovernanceState = (state: CompanyGovernanceState): CompanyGovernanceState => ({
  ...state,
  proposals: state.proposals.map(cloneProposal),
  receipts: state.receipts.map(receipt => ({ ...receipt })),
})

const fingerprint = (...parts: string[]): string => parts.join('\u0000')

export const validateGovernanceVotingPolicy = (policy: GovernanceVotingPolicy): boolean => {
  if (!isNonEmpty(policy.version) || policy.votingPools.length === 0) return false
  const pools = new Set<EquityPoolId>()
  for (const poolId of policy.votingPools) {
    if (!isKnownPool(poolId) || pools.has(poolId)) return false
    pools.add(poolId)
  }
  if (!Number.isSafeInteger(policy.quorumBps) || policy.quorumBps < 0 || policy.quorumBps > BPS_SCALE) return false
  if (
    !Number.isSafeInteger(policy.approvalThresholdBps)
    || policy.approvalThresholdBps < 0
    || policy.approvalThresholdBps > BPS_SCALE
  ) return false
  return typeof policy.approvalRequiresStrictlyGreater === 'boolean'
    && typeof policy.executiveCandidateRequiresActiveMembership === 'boolean'
}

export const createInitialCompanyGovernanceState = (companyId: BusinessCompanyId): CompanyGovernanceState => ({
  companyId,
  proposals: [],
  receipts: [],
})

const tallyProposal = (proposal: GovernanceProposalState): GovernanceResolutionState => {
  let forUnits = 0
  let againstUnits = 0
  let abstainUnits = 0
  for (const ballot of proposal.ballots) {
    if (ballot.choice === 'For') forUnits += ballot.weight
    else if (ballot.choice === 'Against') againstUnits += ballot.weight
    else abstainUnits += ballot.weight
  }
  return {
    participatingUnits: forUnits + againstUnits + abstainUnits,
    forUnits,
    againstUnits,
    abstainUnits,
    quorumMet: false,
    approved: false,
  }
}

export const validateCompanyGovernanceIntegrity = (state: CompanyGovernanceState): GovernanceIntegrityResult => {
  const errors: string[] = []
  if (!isNonEmpty(state.companyId)) errors.push('companyId must be non-empty.')

  const proposalIds = new Set<string>()
  const actionIds = new Set<string>()
  for (const proposal of state.proposals) {
    if (!isNonEmpty(proposal.proposalId) || proposalIds.has(proposal.proposalId)) {
      errors.push('Proposal IDs must be non-empty and unique.')
    }
    proposalIds.add(proposal.proposalId)
    if (proposal.companyId !== state.companyId) errors.push('Proposal companyId must match governance companyId.')
    if (!isNonEmpty(proposal.createdByActorId)) errors.push('Proposal creator must be non-empty.')
    if (!isNonEmpty(proposal.policyVersion)) errors.push('Proposal policy version must be non-empty.')
    if (proposal.action.kind !== 'AppointExecutive') errors.push('Unknown governance action kind.')
    if (!isNonEmpty(proposal.action.actionId) || actionIds.has(proposal.action.actionId)) {
      errors.push('Governance action IDs must be non-empty and unique.')
    }
    actionIds.add(proposal.action.actionId)
    if (!isNonEmpty(proposal.action.candidateActorId)) errors.push('Executive candidate must be non-empty.')
    if (!isProposalStatus(proposal.status)) errors.push('Unknown governance proposal status.')

    const voters = new Set<string>()
    let snapshottedUnits = 0
    for (const weight of proposal.voterWeights) {
      if (!isNonEmpty(weight.actorId) || voters.has(weight.actorId)) {
        errors.push('Voter snapshot actor IDs must be non-empty and unique.')
      }
      voters.add(weight.actorId)
      if (!isSafePositiveInteger(weight.units)) errors.push('Voting weights must be positive safe integers.')
      else snapshottedUnits += weight.units
    }
    if (!Number.isSafeInteger(snapshottedUnits) || !isSafePositiveInteger(proposal.eligibleVotingUnits)) {
      errors.push('Eligible voting units must be a positive safe integer.')
    } else if (snapshottedUnits !== proposal.eligibleVotingUnits) {
      errors.push('Eligible voting units must equal the voter snapshot sum.')
    }

    const ballotActors = new Set<string>()
    for (const ballot of proposal.ballots) {
      if (!isNonEmpty(ballot.actorId) || ballotActors.has(ballot.actorId)) {
        errors.push('Each voter may have at most one ballot per proposal.')
      }
      ballotActors.add(ballot.actorId)
      if (!isVoteChoice(ballot.choice)) errors.push('Unknown governance vote choice.')
      if (!isSafePositiveInteger(ballot.weight)) errors.push('Ballot weight must be a positive safe integer.')
      const snapshot = proposal.voterWeights.find(weight => weight.actorId === ballot.actorId)
      if (!snapshot) errors.push('Ballot actor must exist in the voter snapshot.')
      else if (snapshot.units !== ballot.weight) errors.push('Ballot weight must equal the snapshotted voting weight.')
    }

    const tally = tallyProposal(proposal)
    if (![tally.participatingUnits, tally.forUnits, tally.againstUnits, tally.abstainUnits].every(Number.isSafeInteger)) {
      errors.push('Governance tally must remain within safe integer bounds.')
    }
    if (proposal.status === 'Open' || proposal.status === 'Expired') {
      if (proposal.resolution) errors.push('Open or expired proposal must not contain a completed resolution.')
    } else if (!proposal.resolution) {
      errors.push('Resolved proposal must contain resolution data.')
    } else {
      if (
        proposal.resolution.participatingUnits !== tally.participatingUnits
        || proposal.resolution.forUnits !== tally.forUnits
        || proposal.resolution.againstUnits !== tally.againstUnits
        || proposal.resolution.abstainUnits !== tally.abstainUnits
      ) errors.push('Resolution tally must match recorded ballots.')
      if ((proposal.status === 'Approved' || proposal.status === 'Executed') && !proposal.resolution.approved) {
        errors.push('Approved/executed proposal must contain an approved resolution.')
      }
      if (proposal.status === 'Rejected' && proposal.resolution.approved) {
        errors.push('Rejected proposal cannot contain an approved resolution.')
      }
    }
  }

  const commandIds = new Set<string>()
  for (const receipt of state.receipts) {
    if (!isNonEmpty(receipt.commandId) || commandIds.has(receipt.commandId)) {
      errors.push('Governance command IDs must be non-empty and unique.')
    }
    commandIds.add(receipt.commandId)
    if (!GOVERNANCE_COMMAND_TYPES.includes(receipt.commandType)) errors.push('Unknown governance command type.')
    if (!proposalIds.has(receipt.proposalId)) errors.push('Receipt must reference an existing proposal.')
    if (!isNonEmpty(receipt.fingerprint)) errors.push('Receipt fingerprint must be non-empty.')
  }
  return { valid: errors.length === 0, errors }
}

const blocked = (state: CompanyGovernanceState, reason: GovernanceBlockReason): GovernanceMutationResult => ({
  changed: false,
  state,
  reason,
})

const getReceiptReplay = (
  state: CompanyGovernanceState,
  commandId: string,
  expectedFingerprint: string,
): GovernanceMutationResult | undefined => {
  const receipt = state.receipts.find(item => item.commandId === commandId)
  if (!receipt) return undefined
  const proposal = state.proposals.find(item => item.proposalId === receipt.proposalId)
  if (receipt.fingerprint !== expectedFingerprint) {
    return { changed: false, state, reason: 'CommandIdConflict', receipt, proposal }
  }
  return { changed: false, state, reason: 'DuplicateCommand', duplicate: true, receipt, proposal }
}

const recordReceipt = (
  state: CompanyGovernanceState,
  receipt: GovernanceCommandReceipt,
): CompanyGovernanceState => ({
  ...state,
  receipts: [...state.receipts, receipt],
})

export const createVotingSnapshot = (
  equity: CompanyEquityState,
  policy: GovernanceVotingPolicy,
): GovernanceVotingWeightSnapshot[] => {
  const weights = new Map<EconomicActorId, number>()
  for (const holding of equity.holdings) {
    if (!policy.votingPools.includes(holding.poolId)) continue
    const next = (weights.get(holding.actorId) ?? 0) + holding.units
    if (!Number.isSafeInteger(next)) throw new Error('Governance voting weight overflow.')
    weights.set(holding.actorId, next)
  }
  return [...weights.entries()]
    .map(([actorId, units]) => ({ actorId, units }))
    .sort((left, right) => left.actorId.localeCompare(right.actorId))
}

export const openExecutiveAppointmentProposal = (
  state: CompanyGovernanceState,
  equity: CompanyEquityState,
  input: {
    commandId: string
    proposalId: string
    actionId: string
    createdByActorId: EconomicActorId
    candidateActorId: EconomicActorId
  },
  policy: GovernanceVotingPolicy,
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return blocked(state, 'InvalidGovernanceState')
  const commandFingerprint = fingerprint(
    'OpenProposal', input.proposalId, input.actionId, input.createdByActorId, input.candidateActorId, policy.version,
  )
  const replay = getReceiptReplay(state, input.commandId, commandFingerprint)
  if (replay) return replay
  if (!validateGovernanceVotingPolicy(policy)) return blocked(state, 'InvalidPolicy')
  if (!validateCompanyEquityIntegrity(equity).valid) return blocked(state, 'InvalidEquityState')
  if (state.companyId !== equity.companyId) return blocked(state, 'CompanyMismatch')
  if (![input.commandId, input.proposalId, input.actionId, input.createdByActorId, input.candidateActorId].every(isNonEmpty)) {
    return blocked(state, 'InvalidIdentifier')
  }
  if (state.proposals.some(item => item.proposalId === input.proposalId || item.action.actionId === input.actionId)) {
    return blocked(state, 'ProposalIdConflict')
  }
  if (policy.executiveCandidateRequiresActiveMembership && !equity.activeMemberActorIds.includes(input.candidateActorId)) {
    return blocked(state, 'CandidateNotEligible')
  }

  const voterWeights = createVotingSnapshot(equity, policy)
  const eligibleVotingUnits = voterWeights.reduce((sum, item) => sum + item.units, 0)
  if (!isSafePositiveInteger(eligibleVotingUnits)) return blocked(state, 'NoEligibleVotingUnits')
  if (!voterWeights.some(item => item.actorId === input.createdByActorId)) return blocked(state, 'ProposerNotEligible')

  const proposal: GovernanceProposalState = {
    proposalId: input.proposalId,
    companyId: state.companyId,
    createdByActorId: input.createdByActorId,
    policyVersion: policy.version,
    action: { kind: 'AppointExecutive', actionId: input.actionId, candidateActorId: input.candidateActorId },
    voterWeights,
    eligibleVotingUnits,
    ballots: [],
    status: 'Open',
  }
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'OpenProposal',
    proposalId: input.proposalId,
    fingerprint: commandFingerprint,
  }
  const next = cloneGovernanceState(state)
  next.proposals.push(proposal)
  const withReceipt = recordReceipt(next, receipt)
  return { changed: true, state: withReceipt, proposal, receipt }
}

export const castGovernanceBallot = (
  state: CompanyGovernanceState,
  input: { commandId: string; proposalId: string; actorId: EconomicActorId; choice: GovernanceVoteChoice },
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return blocked(state, 'InvalidGovernanceState')
  const commandFingerprint = fingerprint('CastBallot', input.proposalId, input.actorId, input.choice)
  const replay = getReceiptReplay(state, input.commandId, commandFingerprint)
  if (replay) return replay
  if (![input.commandId, input.proposalId, input.actorId].every(isNonEmpty) || !isVoteChoice(input.choice)) {
    return blocked(state, 'InvalidIdentifier')
  }
  const proposal = state.proposals.find(item => item.proposalId === input.proposalId)
  if (!proposal) return blocked(state, 'ProposalNotFound')
  if (proposal.status !== 'Open') return blocked(state, 'ProposalNotOpen')
  const snapshot = proposal.voterWeights.find(item => item.actorId === input.actorId)
  if (!snapshot) return blocked(state, 'VoterNotEligible')
  if (proposal.ballots.some(item => item.actorId === input.actorId)) return blocked(state, 'AlreadyVoted')

  const next = cloneGovernanceState(state)
  const nextProposal = next.proposals.find(item => item.proposalId === input.proposalId)!
  nextProposal.ballots.push({ actorId: input.actorId, choice: input.choice, weight: snapshot.units })
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'CastBallot',
    proposalId: input.proposalId,
    fingerprint: commandFingerprint,
  }
  const withReceipt = recordReceipt(next, receipt)
  return { changed: true, state: withReceipt, proposal: nextProposal, receipt }
}

export const resolveGovernanceProposal = (
  state: CompanyGovernanceState,
  input: { commandId: string; proposalId: string },
  policy: GovernanceVotingPolicy,
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return blocked(state, 'InvalidGovernanceState')
  const commandFingerprint = fingerprint('ResolveProposal', input.proposalId, policy.version)
  const replay = getReceiptReplay(state, input.commandId, commandFingerprint)
  if (replay) return replay
  if (!validateGovernanceVotingPolicy(policy)) return blocked(state, 'InvalidPolicy')
  if (![input.commandId, input.proposalId].every(isNonEmpty)) return blocked(state, 'InvalidIdentifier')
  const proposal = state.proposals.find(item => item.proposalId === input.proposalId)
  if (!proposal) return blocked(state, 'ProposalNotFound')
  if (proposal.status !== 'Open') return blocked(state, 'ProposalNotOpen')
  if (proposal.policyVersion !== policy.version) return blocked(state, 'InvalidPolicy')

  const resolution = tallyProposal(proposal)
  resolution.quorumMet = resolution.participatingUnits * BPS_SCALE >= proposal.eligibleVotingUnits * policy.quorumBps
  const left = resolution.forUnits * BPS_SCALE
  const right = resolution.participatingUnits * policy.approvalThresholdBps
  const approvalThresholdMet = policy.approvalRequiresStrictlyGreater ? left > right : left >= right
  resolution.approved = resolution.quorumMet && resolution.participatingUnits > 0 && approvalThresholdMet

  const next = cloneGovernanceState(state)
  const nextProposal = next.proposals.find(item => item.proposalId === input.proposalId)!
  nextProposal.resolution = resolution
  nextProposal.status = resolution.approved ? 'Approved' : 'Rejected'
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'ResolveProposal',
    proposalId: input.proposalId,
    fingerprint: commandFingerprint,
  }
  const withReceipt = recordReceipt(next, receipt)
  return { changed: true, state: withReceipt, proposal: nextProposal, receipt }
}

export const expireGovernanceProposal = (
  state: CompanyGovernanceState,
  input: { commandId: string; proposalId: string },
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return blocked(state, 'InvalidGovernanceState')
  const commandFingerprint = fingerprint('ExpireProposal', input.proposalId)
  const replay = getReceiptReplay(state, input.commandId, commandFingerprint)
  if (replay) return replay
  if (![input.commandId, input.proposalId].every(isNonEmpty)) return blocked(state, 'InvalidIdentifier')
  const proposal = state.proposals.find(item => item.proposalId === input.proposalId)
  if (!proposal) return blocked(state, 'ProposalNotFound')
  if (proposal.status !== 'Open') return blocked(state, 'ProposalNotOpen')

  const next = cloneGovernanceState(state)
  const nextProposal = next.proposals.find(item => item.proposalId === input.proposalId)!
  nextProposal.status = 'Expired'
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'ExpireProposal',
    proposalId: input.proposalId,
    fingerprint: commandFingerprint,
  }
  const withReceipt = recordReceipt(next, receipt)
  return { changed: true, state: withReceipt, proposal: nextProposal, receipt }
}

export const executeExecutiveAppointment = (
  state: CompanyGovernanceState,
  equity: CompanyEquityState,
  input: { commandId: string; proposalId: string },
  policy: GovernanceVotingPolicy,
):
  | {
      changed: true
      governanceState: CompanyGovernanceState
      equityState: CompanyEquityState
      proposal: GovernanceProposalState
      receipt: GovernanceCommandReceipt
    }
  | {
      changed: false
      governanceState: CompanyGovernanceState
      equityState: CompanyEquityState
      reason: GovernanceBlockReason
      duplicate?: boolean
      proposal?: GovernanceProposalState
      receipt?: GovernanceCommandReceipt
    } => {
  if (!validateCompanyGovernanceIntegrity(state).valid) {
    return { changed: false, governanceState: state, equityState: equity, reason: 'InvalidGovernanceState' }
  }
  const proposal = state.proposals.find(item => item.proposalId === input.proposalId)
  const commandFingerprint = proposal
    ? fingerprint('ExecuteProposal', input.proposalId, proposal.action.actionId, proposal.action.candidateActorId, policy.version)
    : fingerprint('ExecuteProposal', input.proposalId, policy.version)
  const receipt = state.receipts.find(item => item.commandId === input.commandId)
  if (receipt) {
    if (receipt.fingerprint !== commandFingerprint) {
      return { changed: false, governanceState: state, equityState: equity, reason: 'CommandIdConflict', receipt, proposal }
    }
    return {
      changed: false,
      governanceState: state,
      equityState: equity,
      reason: 'DuplicateCommand',
      duplicate: true,
      receipt,
      proposal,
    }
  }
  if (!validateGovernanceVotingPolicy(policy)) {
    return { changed: false, governanceState: state, equityState: equity, reason: 'InvalidPolicy' }
  }
  if (!validateCompanyEquityIntegrity(equity).valid) {
    return { changed: false, governanceState: state, equityState: equity, reason: 'InvalidEquityState' }
  }
  if (state.companyId !== equity.companyId) {
    return { changed: false, governanceState: state, equityState: equity, reason: 'CompanyMismatch' }
  }
  if (![input.commandId, input.proposalId].every(isNonEmpty)) {
    return { changed: false, governanceState: state, equityState: equity, reason: 'InvalidIdentifier' }
  }
  if (!proposal) return { changed: false, governanceState: state, equityState: equity, reason: 'ProposalNotFound' }
  if (proposal.status === 'Executed') {
    return { changed: false, governanceState: state, equityState: equity, reason: 'AlreadyExecuted', proposal }
  }
  if (proposal.status !== 'Approved') {
    return { changed: false, governanceState: state, equityState: equity, reason: 'ProposalNotApproved', proposal }
  }
  if (proposal.policyVersion !== policy.version) {
    return { changed: false, governanceState: state, equityState: equity, reason: 'InvalidPolicy', proposal }
  }
  if (
    policy.executiveCandidateRequiresActiveMembership
    && !equity.activeMemberActorIds.includes(proposal.action.candidateActorId)
  ) {
    return { changed: false, governanceState: state, equityState: equity, reason: 'CandidateNotEligible', proposal }
  }

  const nextEquity = setCurrentExecutive(equity, proposal.action.candidateActorId)
  const nextGovernance = cloneGovernanceState(state)
  const nextProposal = nextGovernance.proposals.find(item => item.proposalId === input.proposalId)!
  nextProposal.status = 'Executed'
  const executionReceipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'ExecuteProposal',
    proposalId: input.proposalId,
    fingerprint: commandFingerprint,
  }
  const withReceipt = recordReceipt(nextGovernance, executionReceipt)
  return {
    changed: true,
    governanceState: withReceipt,
    equityState: nextEquity,
    proposal: nextProposal,
    receipt: executionReceipt,
  }
}

export const ensureExecutiveContinuity = (equity: CompanyEquityState): ExecutiveContinuityResult => {
  if (!validateCompanyEquityIntegrity(equity).valid) {
    return { changed: false, mode: 'InvalidEquity', caretaker: false, state: equity }
  }
  if (equity.activeMemberActorIds.includes(equity.executiveActorId)) {
    return { changed: false, mode: 'CurrentExecutiveEligible', caretaker: false, state: equity }
  }

  if (equity.activeMemberActorIds.length > 0) {
    const rankedMembers = [...equity.activeMemberActorIds].sort((left, right) => {
      const leftUnits = getActorEquityUnits(equity, left, 'InternalMember')
      const rightUnits = getActorEquityUnits(equity, right, 'InternalMember')
      if (leftUnits !== rightUnits) return rightUnits - leftUnits
      return left.localeCompare(right)
    })
    const next = setCurrentExecutive(equity, rankedMembers[0])
    return {
      changed: next.executiveActorId !== equity.executiveActorId,
      mode: 'ActiveMemberCaretaker',
      caretaker: true,
      state: next,
    }
  }

  const next = setCurrentExecutive(equity, equity.founderActorId)
  return {
    changed: next.executiveActorId !== equity.executiveActorId,
    mode: 'FounderCaretaker',
    caretaker: true,
    state: next,
  }
}
