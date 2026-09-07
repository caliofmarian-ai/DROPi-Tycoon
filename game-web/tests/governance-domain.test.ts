import { describe, expect, it } from 'vitest'
import { PROTOTYPE_GOVERNANCE_POLICY } from '../src/config/governance'
import {
  castGovernanceBallot,
  createInitialCompanyGovernanceState,
  createVotingSnapshot,
  ensureExecutiveContinuity,
  executeExecutiveAppointment,
  expireGovernanceProposal,
  openExecutiveAppointmentProposal,
  resolveGovernanceProposal,
  validateCompanyGovernanceIntegrity,
} from '../src/systems/governanceSystem'
import {
  allocateEquityFromTreasury,
  createInitialCompanyEquityState,
  reconcileEquityMemberExit,
  setCurrentExecutive,
  setEquityMemberActive,
  transferEquityHolding,
  validateCompanyEquityIntegrity,
} from '../src/systems/equityLedgerSystem'
import type { CompanyEquityState } from '../src/types/equity'

const COMPANY = 'COMPANY-001'
const FOUNDER = 'ACTOR-FOUNDER'
const MEMBER = 'ACTOR-MEMBER'
const INVESTOR = 'ACTOR-INVESTOR'
const OUTSIDER = 'ACTOR-OUTSIDER'

const allocate = (
  state: CompanyEquityState,
  actorId: string,
  poolId: 'InternalMember' | 'ExternalMarket',
  units: number,
): CompanyEquityState => {
  const result = allocateEquityFromTreasury(state, actorId, poolId, units)
  if (!result.changed) throw new Error(`Expected ${poolId} allocation.`)
  return result.state
}

const createVotingEquity = (): CompanyEquityState => {
  let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
  equity = setEquityMemberActive(equity, MEMBER, true)
  equity = allocate(equity, FOUNDER, 'InternalMember', 3000)
  equity = allocate(equity, MEMBER, 'InternalMember', 1000)
  equity = allocate(equity, INVESTOR, 'ExternalMarket', 2000)
  equity = allocate(equity, FOUNDER, 'ExternalMarket', 500)
  return equity
}

const openProposal = (equity: CompanyEquityState = createVotingEquity()) => {
  const governance = createInitialCompanyGovernanceState(COMPANY)
  const result = openExecutiveAppointmentProposal(
    governance,
    equity,
    {
      commandId: 'CMD-OPEN-1',
      proposalId: 'PROPOSAL-1',
      actionId: 'ACTION-1',
      createdByActorId: FOUNDER,
      candidateActorId: MEMBER,
    },
    PROTOTYPE_GOVERNANCE_POLICY,
  )
  if (!result.changed) throw new Error(`Expected proposal to open: ${result.reason}`)
  return { governance: result.state, equity, proposal: result.proposal }
}

const approveProposal = (equity: CompanyEquityState = createVotingEquity()) => {
  const opened = openProposal(equity)
  const founderVote = castGovernanceBallot(opened.governance, {
    commandId: 'CMD-VOTE-FOUNDER',
    proposalId: 'PROPOSAL-1',
    actorId: FOUNDER,
    choice: 'For',
  })
  if (!founderVote.changed) throw new Error('Expected founder vote.')
  const resolved = resolveGovernanceProposal(
    founderVote.state,
    { commandId: 'CMD-RESOLVE-1', proposalId: 'PROPOSAL-1' },
    PROTOTYPE_GOVERNANCE_POLICY,
  )
  if (!resolved.changed) throw new Error('Expected proposal resolution.')
  return { governance: resolved.state, equity, proposal: resolved.proposal }
}

describe('company governance domain', () => {
  it('starts empty and internally valid', () => {
    const state = createInitialCompanyGovernanceState(COMPANY)
    expect(state).toEqual({ companyId: COMPANY, proposals: [], receipts: [] })
    expect(validateCompanyGovernanceIntegrity(state)).toEqual({ valid: true, errors: [] })
  })

  it('aggregates actual Internal and External holdings while treasury carries zero voting weight', () => {
    const equity = createVotingEquity()
    const snapshot = createVotingSnapshot(equity, PROTOTYPE_GOVERNANCE_POLICY)

    expect(snapshot).toEqual([
      { actorId: FOUNDER, units: 3500 },
      { actorId: INVESTOR, units: 2000 },
      { actorId: MEMBER, units: 1000 },
    ])
    expect(snapshot.reduce((sum, item) => sum + item.units, 0)).toBe(6500)
    expect(equity.totalUnits).toBe(10_000)
  })

  it('opens an executive proposal with a frozen voting snapshot and exact replay is idempotent', () => {
    const equity = createVotingEquity()
    const governance = createInitialCompanyGovernanceState(COMPANY)
    const input = {
      commandId: 'CMD-OPEN-1',
      proposalId: 'PROPOSAL-1',
      actionId: 'ACTION-1',
      createdByActorId: FOUNDER,
      candidateActorId: MEMBER,
    }
    const first = openExecutiveAppointmentProposal(governance, equity, input, PROTOTYPE_GOVERNANCE_POLICY)
    expect(first.changed).toBe(true)
    if (!first.changed) throw new Error('Expected proposal opening.')
    expect(first.proposal.eligibleVotingUnits).toBe(6500)
    expect(first.proposal.status).toBe('Open')

    const replay = openExecutiveAppointmentProposal(first.state, equity, input, PROTOTYPE_GOVERNANCE_POLICY)
    expect(replay.changed).toBe(false)
    if (replay.changed) throw new Error('Expected duplicate command.')
    expect(replay.reason).toBe('DuplicateCommand')
    expect(replay.duplicate).toBe(true)
    expect(replay.state.proposals).toHaveLength(1)
  })

  it('rejects conflicting reuse of a command ID', () => {
    const opened = openProposal()
    const conflict = castGovernanceBallot(opened.governance, {
      commandId: 'CMD-OPEN-1',
      proposalId: 'PROPOSAL-1',
      actorId: FOUNDER,
      choice: 'For',
    })
    expect(conflict.changed).toBe(false)
    if (conflict.changed) throw new Error('Expected command conflict.')
    expect(conflict.reason).toBe('CommandIdConflict')
  })

  it('requires an active member executive candidate', () => {
    const equity = createVotingEquity()
    const result = openExecutiveAppointmentProposal(
      createInitialCompanyGovernanceState(COMPANY),
      equity,
      {
        commandId: 'CMD-OPEN-X',
        proposalId: 'PROPOSAL-X',
        actionId: 'ACTION-X',
        createdByActorId: FOUNDER,
        candidateActorId: OUTSIDER,
      },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(result.changed).toBe(false)
    if (result.changed) throw new Error('Expected candidate rejection.')
    expect(result.reason).toBe('CandidateNotEligible')
  })

  it('requires the proposal creator to hold snapshotted voting equity', () => {
    const equity = createVotingEquity()
    const result = openExecutiveAppointmentProposal(
      createInitialCompanyGovernanceState(COMPANY),
      equity,
      {
        commandId: 'CMD-OPEN-X',
        proposalId: 'PROPOSAL-X',
        actionId: 'ACTION-X',
        createdByActorId: OUTSIDER,
        candidateActorId: MEMBER,
      },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(result.changed).toBe(false)
    if (result.changed) throw new Error('Expected proposer rejection.')
    expect(result.reason).toBe('ProposerNotEligible')
  })

  it('keeps ballot weight frozen even when shares move after proposal creation', () => {
    const opened = openProposal()
    const transfer = transferEquityHolding(opened.equity, FOUNDER, INVESTOR, 'ExternalMarket', 500)
    if (!transfer.changed) throw new Error('Expected later share transfer.')

    const vote = castGovernanceBallot(opened.governance, {
      commandId: 'CMD-VOTE-1',
      proposalId: 'PROPOSAL-1',
      actorId: FOUNDER,
      choice: 'For',
    })
    expect(vote.changed).toBe(true)
    if (!vote.changed) throw new Error('Expected vote.')
    expect(vote.proposal.ballots[0].weight).toBe(3500)
    expect(createVotingSnapshot(transfer.state, PROTOTYPE_GOVERNANCE_POLICY).find(item => item.actorId === FOUNDER)?.units).toBe(3000)
  })

  it('allows one ballot per actor and exact ballot replay does not duplicate weight', () => {
    const opened = openProposal()
    const input = { commandId: 'CMD-VOTE-1', proposalId: 'PROPOSAL-1', actorId: FOUNDER, choice: 'For' as const }
    const first = castGovernanceBallot(opened.governance, input)
    expect(first.changed).toBe(true)
    if (!first.changed) throw new Error('Expected first ballot.')

    const replay = castGovernanceBallot(first.state, input)
    expect(replay.changed).toBe(false)
    if (replay.changed) throw new Error('Expected replay.')
    expect(replay.reason).toBe('DuplicateCommand')
    expect(replay.state.proposals[0].ballots).toHaveLength(1)

    const secondId = castGovernanceBallot(first.state, { ...input, commandId: 'CMD-VOTE-2', choice: 'Against' })
    expect(secondId.changed).toBe(false)
    if (secondId.changed) throw new Error('Expected duplicate actor rejection.')
    expect(secondId.reason).toBe('AlreadyVoted')
  })

  it('rejects a closed vote when participation does not reach quorum', () => {
    const opened = openProposal()
    const investorVote = castGovernanceBallot(opened.governance, {
      commandId: 'CMD-VOTE-I', proposalId: 'PROPOSAL-1', actorId: INVESTOR, choice: 'For',
    })
    if (!investorVote.changed) throw new Error('Expected investor vote.')
    const resolved = resolveGovernanceProposal(
      investorVote.state,
      { commandId: 'CMD-RESOLVE', proposalId: 'PROPOSAL-1' },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(resolved.changed).toBe(true)
    if (!resolved.changed) throw new Error('Expected resolution.')
    expect(resolved.proposal.status).toBe('Rejected')
    expect(resolved.proposal.resolution?.quorumMet).toBe(false)
  })

  it('does not approve an exact voting tie', () => {
    let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    equity = setEquityMemberActive(equity, MEMBER, true)
    equity = allocate(equity, FOUNDER, 'InternalMember', 1000)
    equity = allocate(equity, INVESTOR, 'ExternalMarket', 1000)
    const opened = openProposal(equity)
    const yes = castGovernanceBallot(opened.governance, {
      commandId: 'CMD-YES', proposalId: 'PROPOSAL-1', actorId: FOUNDER, choice: 'For',
    })
    if (!yes.changed) throw new Error('Expected yes vote.')
    const no = castGovernanceBallot(yes.state, {
      commandId: 'CMD-NO', proposalId: 'PROPOSAL-1', actorId: INVESTOR, choice: 'Against',
    })
    if (!no.changed) throw new Error('Expected no vote.')
    const resolved = resolveGovernanceProposal(
      no.state,
      { commandId: 'CMD-RESOLVE', proposalId: 'PROPOSAL-1' },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(resolved.changed).toBe(true)
    if (!resolved.changed) throw new Error('Expected tie resolution.')
    expect(resolved.proposal.resolution).toMatchObject({ quorumMet: true, approved: false, forUnits: 1000, againstUnits: 1000 })
    expect(resolved.proposal.status).toBe('Rejected')
  })

  it('approves a strict majority after quorum is reached', () => {
    const approved = approveProposal()
    expect(approved.proposal.status).toBe('Approved')
    expect(approved.proposal.resolution).toMatchObject({
      participatingUnits: 3500,
      forUnits: 3500,
      quorumMet: true,
      approved: true,
    })
  })

  it('executes approved leadership change without rewriting Founder identity or equity supply', () => {
    const approved = approveProposal()
    const result = executeExecutiveAppointment(
      approved.governance,
      approved.equity,
      { commandId: 'CMD-EXECUTE', proposalId: 'PROPOSAL-1' },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(result.changed).toBe(true)
    if (!result.changed) throw new Error('Expected execution.')
    expect(result.equityState.executiveActorId).toBe(MEMBER)
    expect(result.equityState.founderActorId).toBe(FOUNDER)
    expect(result.equityState.totalUnits).toBe(10_000)
    expect(validateCompanyEquityIntegrity(result.equityState).valid).toBe(true)
    expect(result.proposal.status).toBe('Executed')
  })

  it('prevents double execution and exact execution replay is idempotent', () => {
    const approved = approveProposal()
    const input = { commandId: 'CMD-EXECUTE', proposalId: 'PROPOSAL-1' }
    const first = executeExecutiveAppointment(approved.governance, approved.equity, input, PROTOTYPE_GOVERNANCE_POLICY)
    expect(first.changed).toBe(true)
    if (!first.changed) throw new Error('Expected execution.')

    const replay = executeExecutiveAppointment(first.governanceState, first.equityState, input, PROTOTYPE_GOVERNANCE_POLICY)
    expect(replay.changed).toBe(false)
    if (replay.changed) throw new Error('Expected duplicate execution.')
    expect(replay.reason).toBe('DuplicateCommand')
    expect(replay.equityState.executiveActorId).toBe(MEMBER)

    const secondCommand = executeExecutiveAppointment(
      first.governanceState,
      first.equityState,
      { commandId: 'CMD-EXECUTE-2', proposalId: 'PROPOSAL-1' },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(secondCommand.changed).toBe(false)
    if (secondCommand.changed) throw new Error('Expected already executed rejection.')
    expect(secondCommand.reason).toBe('AlreadyExecuted')
  })

  it('blocks execution if the approved candidate loses active membership before execution', () => {
    const approved = approveProposal()
    const afterExit = reconcileEquityMemberExit(approved.equity, MEMBER)
    const result = executeExecutiveAppointment(
      approved.governance,
      afterExit,
      { commandId: 'CMD-EXECUTE', proposalId: 'PROPOSAL-1' },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(result.changed).toBe(false)
    if (result.changed) throw new Error('Expected candidate eligibility rejection.')
    expect(result.reason).toBe('CandidateNotEligible')
    expect(result.equityState.executiveActorId).toBe(FOUNDER)
  })

  it('supports explicit expiry of an unresolved proposal', () => {
    const opened = openProposal()
    const expired = expireGovernanceProposal(opened.governance, {
      commandId: 'CMD-EXPIRE', proposalId: 'PROPOSAL-1',
    })
    expect(expired.changed).toBe(true)
    if (!expired.changed) throw new Error('Expected expiry.')
    expect(expired.proposal.status).toBe('Expired')
    expect(expired.proposal.resolution).toBeUndefined()
  })

  it('fails safe when a ballot weight is forged', () => {
    const opened = openProposal()
    const corrupted = {
      ...opened.governance,
      proposals: opened.governance.proposals.map(proposal => ({
        ...proposal,
        ballots: [{ actorId: FOUNDER, choice: 'For' as const, weight: 9999 }],
      })),
    }
    expect(validateCompanyGovernanceIntegrity(corrupted).valid).toBe(false)
    const result = resolveGovernanceProposal(
      corrupted,
      { commandId: 'CMD-RESOLVE', proposalId: 'PROPOSAL-1' },
      PROTOTYPE_GOVERNANCE_POLICY,
    )
    expect(result.changed).toBe(false)
    if (result.changed) throw new Error('Expected corrupted-state rejection.')
    expect(result.reason).toBe('InvalidGovernanceState')
  })

  it('keeps an eligible current executive unchanged', () => {
    const equity = createVotingEquity()
    const result = ensureExecutiveContinuity(equity)
    expect(result).toMatchObject({ changed: false, mode: 'CurrentExecutiveEligible', caretaker: false })
    expect(result.state.executiveActorId).toBe(FOUNDER)
  })

  it('recovers executive continuity to the active member with the greatest Internal stake', () => {
    let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    equity = setEquityMemberActive(equity, MEMBER, true)
    equity = allocate(equity, FOUNDER, 'InternalMember', 1000)
    equity = allocate(equity, MEMBER, 'InternalMember', 2000)
    equity = setCurrentExecutive(equity, OUTSIDER)

    const result = ensureExecutiveContinuity(equity)
    expect(result).toMatchObject({ changed: true, mode: 'ActiveMemberCaretaker', caretaker: true })
    expect(result.state.executiveActorId).toBe(MEMBER)
    expect(result.state.founderActorId).toBe(FOUNDER)
  })

  it('uses deterministic actor ID tie-break for equal Internal stakes', () => {
    let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    equity = setEquityMemberActive(equity, 'ACTOR-A', true)
    equity = setEquityMemberActive(equity, 'ACTOR-B', true)
    equity = reconcileEquityMemberExit(equity, FOUNDER)
    equity = allocate(equity, 'ACTOR-A', 'InternalMember', 500)
    equity = allocate(equity, 'ACTOR-B', 'InternalMember', 500)
    equity = setCurrentExecutive(equity, OUTSIDER)

    const result = ensureExecutiveContinuity(equity)
    expect(result.state.executiveActorId).toBe('ACTOR-A')
  })

  it('falls back to the historical Founder as bounded caretaker when no active member exists', () => {
    let equity = createInitialCompanyEquityState(COMPANY, FOUNDER)
    equity = reconcileEquityMemberExit(equity, FOUNDER)
    equity = setCurrentExecutive(equity, OUTSIDER)

    const result = ensureExecutiveContinuity(equity)
    expect(result).toMatchObject({ changed: true, mode: 'FounderCaretaker', caretaker: true })
    expect(result.state.executiveActorId).toBe(FOUNDER)
    expect(result.state.activeMemberActorIds).toEqual([])
    expect(result.state.founderActorId).toBe(FOUNDER)
  })
})
