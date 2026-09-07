import {
  EQUITY_POOL_IDS,
  type CompanyEquityState,
  type EquityPoolId,
} from '../types/equity'
import type {
  CompanyGovernanceState,
  ExecutiveContinuityResult,
  GovernanceBallotState,
  GovernanceBlockReason,
  GovernanceCommandReceipt,
  GovernanceIntegrityResult,
  GovernanceMutationResult,
  GovernanceProposalState,
  GovernanceResolutionState,
  GovernanceVoteChoice,
  GovernanceVotingPolicy,
  GovernanceVotingWeightSnapshot,
} from '../types/governance'
import {
  getActorEquityUnits,
  setCurrentExecutive,
  validateCompanyEquityIntegrity,
} from './equityLedgerSystem'

const BPS_SCALE = 10_000

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

const isNonEmpty = (value: string): boolean => value.trim().length > 0
const isSafeNonNegativeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0
const isSafePositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const isKnownPool = (poolId: EquityPoolId): boolean => EQUITY_POOL_IDS.some(candidate => candidate === poolId)
const isVoteChoice = (choice: string): choice is GovernanceVoteChoice =>
  choice === 'For' || choice === 'Against' || choice === 'Abstain'

const policyIsValid = (policy: GovernanceVotingPolicy): boolean => {
  if (!isNonEmpty(policy.version)) return false
  if (!Array.isArray(policy.votingPools) || policy.votingPools.length === 0) return false
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

const commandFingerprint = (...parts: string[]): string => parts.join('\u0000')

const getExistingReceipt = (
  state: CompanyGovernanceState,
  commandId: string,
): GovernanceCommandReceipt | undefined => state.receipts.find(receipt => receipt.commandId === commandId)

const duplicateOrConflict = (
  state: CompanyGovernanceState,
  commandId: string,
  fingerprint: string,
): GovernanceMutationResult | undefined => {
  const receipt = getExistingReceipt(state, commandId)
  if (!receipt) return undefined
  const proposal = state.proposals.find(item => item.proposalId === receipt.proposalId)
  if (receipt.fingerprint !== fingerprint) {
    return { changed: false, state, reason: 'CommandIdConflict', receipt, proposal }
  }
  return { changed: false, state, reason: 'ProposalNotOpen', duplicate: true, receipt, proposal }
}

const appendReceipt = (
  state: CompanyGovernanceState,
  receipt: GovernanceCommandReceipt,
): CompanyGovernanceState => ({ ...state, receipts: [...state.receipts, receipt] })

const getVotingSnapshot = (
  equity: CompanyEquityState,
  policy: GovernanceVotingPolicy,
): GovernanceVotingWeightSnapshot[] => {
  const weightByActor = new Map<string, number>()
  for (const holding of equity.holdings) {
    if (!policy.votingPools.includes(holding.poolId)) continue
    const next = (weightByActor.get(holding.actorId) ?? 0) + holding.units
    if (!Number.isSafeInteger(next)) throw new Error('Governance voting weight overflow.')
    weightByActor.set(holding.actorId, next)
  }
  return [...weightByActor.entries()]
    .map(([actorId, units]) => ({ actorId, units }))
    .sort((a, b) => a.actorId.localeCompare(b.actorId))
}

const tallyBallots = (ballots: GovernanceBallotState[]): GovernanceResolutionState => {
  let forUnits = 0
  let againstUnits = 0
  let abstainUnits = 0
  for (const ballot of ballots) {
    if (ballot.choice === 'For') forUnits += ballot.weight
    else if (ballot.choice === 'Against') againstUnits += ballot.weight
    else abstainUnits += ballot.weight
  }
  const participatingUnits = forUnits + againstUnits + abstainUnits
  if (![forUnits, againstUnits, abstainUnits, participatingUnits].every(Number.isSafeInteger)) {
    throw new Error('Governance tally overflow.')
  }
  return {
    participatingUnits,
    forUnits,
    againstUnits,
    abstainUnits,
    quorumMet: false,
    approved: false,
  }
}

export const createInitialCompanyGovernanceState = (companyId: string): CompanyGovernanceState => ({
  companyId,
  proposals: [],
  receipts: [],
})

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
    if (!isNonEmpty(proposal.policyVersion)) errors.push('Proposal policyVersion must be non-empty.')
    if (!isNonEmpty(proposal.action.actionId) || actionIds.has(proposal.action.actionId)) {
      errors.push('Governance action IDs must be non-empty and unique.')
    }
    actionIds.add(proposal.action.actionId)
    if (!isNonEmpty(proposal.action.candidateActorId)) errors.push('Executive candidate must be non-empty.')
    if (!['Open', 'Approved', 'Rejected', 'Expired', 'Executed'].includes(proposal.status)) {
      errors.push('Unknown governance proposal status.')
    }

    const voterIds = new Set<string>()
    let eligibleVotingUnits = 0
    for (const weight of proposal.voterWeights) {
      if (!isNonEmpty(weight.actorId) || voterIds.has(weight.actorId)) {
        errors.push('Governance voter snapshot IDs must be non-empty and unique.')
      }
      voterIds.add(weight.actorId)
      if (!isSafePositiveInteger(weight.units)) errors.push('Governance voting weights must be positive safe integers.')
      else eligibleVotingUnits += weight.units
    }
    if (!Number.isSafeInteger(eligibleVotingUnits) || !isSafePositiveInteger(proposal.eligibleVotingUnits)) {
      errors.push('Governance eligible voting total must be a positive safe integer.')
    } else if (eligibleVotingUnits !== proposal.eligibleVotingUnits) {
      errors.push('Governance eligible voting total must equal the voter snapshot sum.')
    }

    const ballotActors = new Set<string>()
    for (const ballot of proposal.ballots) {
      if (!isNonEmpty(ballot.actorId) || ballotActors.has(ballot.actorId)) {
        errors.push('Governance ballots must contain each actor at most once.')
      }
      ballotActors.add(ballot.actorId)
      const snapshotted = proposal.voterWeights.find(weight => weight.actorId === ballot.actorId)
      if (!snapshotted) errors.push('Governance ballot actor must exist in voter snapshot.')
      else if (snapshotted.units !== ballot.weight) errors.push('Governance ballot weight must equal snapshotted voting weight.')
      if (!isSafePositiveInteger(ballot.weight)) errors.push('Governance ballot weight must be a positive safe integer.')
      if (!isVoteChoice(ballot.choice)) errors.push('Unknown governance vote choice.')
    }

    if (proposal.status === 'Open' || proposal.status === 'Expired') {
      if (proposal.resolution) errors.push('Open or expired proposal must not contain a completed resolution.')
    } else {
      if (!proposal.resolution) errors.push('Resolved governance proposal must contain resolution data.')
      else {
        const tally = tallyBallots(proposal.ballots)
        if (
          proposal.resolution.participatingUnits !== tally.participatingUnits
          || proposal.resolution.forUnits !== tally.forUnits
          || proposal.resolution.againstUnits !== tally.againstUnits
          || proposal.resolution.abstainUnits !== tally.abstainUnits
        ) errors.push('Governance resolution tally must match recorded ballots.')
        if ((proposal.status === 'Approved' || proposal.status === 'Executed') && !proposal.resolution.approved) {
          errors.push('Approved/executed proposal must have approved resolution.')
        }
        if (proposal.status === 'Rejected' && proposal.resolution.approved) {
          errors.push('Rejected proposal cannot have approved resolution.')
        }
      }
    }
  }

  const commandIds = new Set<string>()
  for (const receipt of state.receipts) {
    if (!isNonEmpty(receipt.commandId) || commandIds.has(receipt.commandId)) {
      errors.push('Governance command IDs must be non-empty and unique.')
    }
    commandIds.add(receipt.commandId)
    if (!['OpenProposal', 'CastBallot', 'ResolveProposal', 'ExpireProposal', 'ExecuteProposal'].includes(receipt.commandType)) {
      errors.push('Unknown governance command receipt type.')
    }
    if (!proposalIds.has(receipt.proposalId)) errors.push('Governance receipt must reference an existing proposal.')
    if (!isNonEmpty(receipt.fingerprint)) errors.push('Governance receipt fingerprint must be non-empty.')
  }

  return { valid: errors.length === 0, errors }
}

const block = (
  state: CompanyGovernanceState,
  reason: GovernanceBlockReason,
): GovernanceMutationResult => ({ changed: false, state, reason })

export const openExecutiveAppointmentProposal = (
  state: CompanyGovernanceState,
  equity: CompanyEquityState,
  input: {
    commandId: string
    proposalId: string
    actionId: string
    createdByActorId: string
    candidateActorId: string
  },
  policy: GovernanceVotingPolicy,
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return block(state, 'InvalidGovernanceState')
  const fingerprint = commandFingerprint(
    'OpenProposal', input.proposalId, input.actionId, input.createdByActorId, input.candidateActorId, policy.version,
  )
  const replay = duplicateOrConflict(state, input.commandId, fingerprint)
  if (replay) return replay
  if (!policyIsValid(policy)) return block(state, 'InvalidPolicy')
  if (!validateCompanyEquityIntegrity(equity).valid) return block(state, 'InvalidEquityState')
  if (state.companyId !== equity.companyId) return block(state, 'CompanyMismatch')
  if (![input.commandId, input.proposalId, input.actionId, input.createdByActorId, input.candidateActorId].every(isNonEmpty)) {
    return block(state, 'InvalidIdentifier')
  }
  if (state.proposals.some(proposal => proposal.proposalId === input.proposalId || proposal.action.actionId === input.actionId)) {
    return block(state, 'ProposalIdConflict')
  }
  if (policy.executiveCandidateRequiresActiveMembership && !equity.activeMemberActorIds.includes(input.candidateActorId)) {
    return block(state, 'CandidateNotEligible')
  }

  const voterWeights = getVotingSnapshot(equity, policy)
  const eligibleVotingUnits = voterWeights.reduce((sum, weight) => sum + weight.units, 0)
  if (!isSafePositiveInteger(eligibleVotingUnits)) return block(state, 'NoEligibleVotingUnits')
  if (!voterWeights.some(weight => weight.actorId === input.createdByActorId)) return block(state, 'ProposerNotEligible')

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
    proposalId: proposal.proposalId,
    fingerprint,
  }
  const next = cloneGovernanceState(state)
  next.proposals.push(proposal)
  const withReceipt = appendReceipt(next, receipt)
  return { changed: true, state: withReceipt, proposal, receipt }
}

export const castGovernanceBallot = (
  state: CompanyGovernanceState,
  input: { commandId: string; proposalId: string; actorId: string; choice: GovernanceVoteChoice },
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return block(state, 'InvalidGovernanceState')
  const fingerprint = commandFingerprint('CastBallot', input.proposalId, input.actorId, input.choice)
  const replay = duplicateOrConflict(state, input.commandId, fingerprint)
  if (replay) return replay
  if (![input.commandId, input.proposalId, input.actorId].every(isNonEmpty)) return block(state, 'InvalidIdentifier')
  if (!isVoteChoice(input.choice)) return block(state, 'InvalidGovernanceState')
  const proposal = state.proposals.find(item => item.proposalId === input.proposalId)
  if (!proposal) return block(state, 'ProposalNotFound')
  if (proposal.status !== 'Open') return block(state, 'ProposalNotOpen')
  const snapshot = proposal.voterWeights.find(weight => weight.actorId === input.actorId)
  if (!snapshot) return block(state, 'VoterNotEligible')
  if (proposal.ballots.some(ballot => ballot.actorId === input.actorId)) return block(state, 'AlreadyVoted')

  const next = cloneGovernanceState(state)
  const nextProposal = next.proposals.find(item => item.proposalId === input.proposalId)!
  nextProposal.ballots.push({ actorId: input.actorId, choice: input.choice, weight: snapshot.units })
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'CastBallot',
    proposalId: input.proposalId,
    fingerprint,
  }
  const withReceipt = appendReceipt(next, receipt)
  return { changed: true, state: withReceipt, proposal: nextProposal, receipt }
}

export const resolveGovernanceProposal = (
  state: CompanyGovernanceState,
  input: { commandId: string; proposalId: string },
  policy: GovernanceVotingPolicy,
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return block(state, 'InvalidGovernanceState')
  const fingerprint = commandFingerprint('ResolveProposal', input.proposalId, policy.version)
  const replay = duplicateOrConflict(state, input.commandId, fingerprint)
  if (replay) return replay
  if (!policyIsValid(policy)) return block(state, 'InvalidPolicy')
  if (![input.commandId, input.proposalId].every(isNonEmpty)) return block(state, 'InvalidIdentifier')
  const proposal = state.proposals.find(item => item.proposalId === input.proposalId)
  if (!proposal) return block(state, 'ProposalNotFound')
  if (proposal.status !== 'Open') return block(state, 'ProposalNotOpen')
  if (proposal.policyVersion !== policy.version) return block(state, 'InvalidPolicy')

  const resolution = tallyBallots(proposal.ballots)
  resolution.quorumMet = resolution.participatingUnits * BPS_SCALE >= proposal.eligibleVotingUnits * policy.quorumBps
  const approvalLeft = resolution.forUnits * BPS_SCALE
  const approvalRight = resolution.participatingUnits * policy.approvalThresholdBps
  const thresholdMet = policy.approvalRequiresStrictlyGreater
    ? approvalLeft > approvalRight
    : approvalLeft >= approvalRight
  resolution.approved = resolution.quorumMet && resolution.participatingUnits > 0 && thresholdMet

  const next = cloneGovernanceState(state)
  const nextProposal = next.proposals.find(item => item.proposalId === input.proposalId)!
  nextProposal.resolution = resolution
  nextProposal.status = resolution.approved ? 'Approved' : 'Rejected'
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'ResolveProposal',
    proposalId: input.proposalId,
    fingerprint,
  }
  const withReceipt = appendReceipt(next, receipt)
  return { changed: true, state: withReceipt, proposal: nextProposal, receipt }
}

export const expireGovernanceProposal = (
  state: CompanyGovernanceState,
  input: { commandId: string; proposalId: string },
): GovernanceMutationResult => {
  if (!validateCompanyGovernanceIntegrity(state).valid) return block(state, 'InvalidGovernanceState')
  const fingerprint = commandFingerprint('ExpireProposal', input.proposalId)
  const replay = duplicateOrConflict(state, input.commandId, fingerprint)
  if (replay) return replay
  if (![input.commandId, input.proposalId].every(isNonEmpty)) return block(state, 'InvalidIdentifier')
  const proposal = state.proposals.find(item => item.proposalId === input.proposalId)
  if (!proposal) return block(state, 'ProposalNotFound')
  if (proposal.status !== 'Open') return block(state, 'ProposalNotOpen')

  const next = cloneGovernanceState(state)
  const nextProposal = next.proposals.find(item => item.proposalId === input.proposalId)!
  nextProposal.status = 'Expired'
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'ExpireProposal',
    proposalId: input.proposalId,
    fingerprint,
  }
  const withReceipt = appendReceipt(next, receipt)
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
  const actionFingerprint = proposal
    ? commandFingerprint('ExecuteProposal', input.proposalId, proposal.action.actionId, proposal.action.candidateActorId, policy.version)
    : commandFingerprint('ExecuteProposal', input.proposalId, policy.version)
  const existing = getExistingReceipt(state, input.commandId)
  if (existing) {
    if (existing.fingerprint !== actionFingerprint) {
      return { changed: false, governanceState: state, equityState: equity, reason: 'CommandIdConflict', receipt: existing, proposal }
    }
    return {
      changed: false,
      governanceState: state,
      equityState: equity,
      reason: 'AlreadyExecuted',
      duplicate: true,
      receipt: existing,
      proposal,
    }
  }
  if (!policyIsValid(policy)) {
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
  const receipt: GovernanceCommandReceipt = {
    commandId: input.commandId,
    commandType: 'ExecuteProposal',
    proposalId: input.proposalId,
    fingerprint: actionFingerprint,
  }
  const withReceipt = appendReceipt(nextGovernance, receipt)
  return { changed: true, governanceState: withReceipt, equityState: nextEquity, proposal: nextProposal, receipt }
}

export const ensureExecutiveContinuity = (equity: CompanyEquityState): ExecutiveContinuityResult => {
  if (!validateCompanyEquityIntegrity(equity).valid) {
    return { changed: false, mode: 'InvalidEquity', caretaker: false, state: equity }
  }
  if (equity.activeMemberActorIds.includes(equity.executiveActorId)) {
    return { changed: false, mode: 'CurrentExecutiveEligible', caretaker: false, state: equity }
  }

  if (equity.activeMemberActorIds.length > 0) {
    const ranked = [...equity.activeMemberActorIds].sort((left, right) => {
      const rightUnits = getActorEquityUnits(equity, right, 'InternalMember')
      const leftUnits = getActorEquityUnits(equity, left, 'InternalMember')
      if (rightUnits !== leftUnits) return rightUnits - leftUnits
      return left.localeCompare(right)
    })
    const caretakerActorId = ranked[0]
    const next = setCurrentExecutive(equity, caretakerActorId)
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
