import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateMergeGate } from './evaluate-merge-gate.mjs'

const policy = {
  automation_enabled: true,
  gateValues: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'],
  requiredMergeGates: [
    'scope_authorized',
    'ownership_reconciled',
    'canonical_main_reconciled',
    'exact_head_identified',
    'required_tests',
    'required_ci',
    'independent_audit',
    'mergeability',
  ],
  conditionalMergeGates: {
    playerVisible: ['player_visible_evidence'],
    deploymentAffecting: ['deployment_or_build_evidence'],
  },
  mergeRules: {
    implementerCannotBeSoleAuditor: true,
    exactFinalHeadRequired: true,
  },
}

function passingEvidence() {
  return {
    issue: 723,
    pr: 999,
    risk: { playerVisible: true, deploymentAffecting: false },
    gates: {
      scope_authorized: 'PASS',
      ownership_reconciled: 'PASS',
      canonical_main_reconciled: 'PASS',
      exact_head_identified: 'PASS',
      required_tests: 'PASS',
      required_ci: 'PASS',
      independent_audit: 'PASS',
      mergeability: 'PASS',
      player_visible_evidence: 'PASS',
    },
    unresolvedRequiredEvidence: [],
    prohibitedActionDetected: false,
    implementerAgentIds: ['DT-01'],
    independentAuditorAgentIds: ['DT-16'],
    finalHeadSha: 'abc123',
    auditedHeadSha: 'abc123',
    ciHeadSha: 'abc123',
  }
}

test('PASS when all required and conditional gates pass on exact head', () => {
  const result = evaluateMergeGate(policy, passingEvidence())
  assert.equal(result.decision, 'PASS')
})

test('UNKNOWN blocks merge', () => {
  const evidence = passingEvidence()
  evidence.gates.required_ci = 'UNKNOWN'
  const result = evaluateMergeGate(policy, evidence)
  assert.equal(result.decision, 'UNKNOWN')
  assert.match(result.unknowns.join('\n'), /required_ci=UNKNOWN/)
})

test('player-visible work fails without visual evidence', () => {
  const evidence = passingEvidence()
  delete evidence.gates.player_visible_evidence
  const result = evaluateMergeGate(policy, evidence)
  assert.equal(result.decision, 'UNKNOWN')
})

test('implementer cannot be sole auditor', () => {
  const evidence = passingEvidence()
  evidence.independentAuditorAgentIds = ['DT-01']
  const result = evaluateMergeGate(policy, evidence)
  assert.equal(result.decision, 'FAIL')
  assert.match(result.failures.join('\n'), /independent auditor/)
})

test('audit and CI must bind to exact final head', () => {
  const evidence = passingEvidence()
  evidence.auditedHeadSha = 'older'
  evidence.ciHeadSha = 'older'
  const result = evaluateMergeGate(policy, evidence)
  assert.equal(result.decision, 'FAIL')
  assert.match(result.failures.join('\n'), /finalHeadSha/)
})

test('hard stops fail merge even when technical gates pass', () => {
  const evidence = passingEvidence()
  evidence.hardStop = 'UNBOUNDED_OR_NEW_REAL_MONEY_SPEND'
  const result = evaluateMergeGate(policy, evidence)
  assert.equal(result.decision, 'FAIL')
})

test('emergency stop disables autonomous merge', () => {
  const stoppedPolicy = structuredClone(policy)
  stoppedPolicy.automation_enabled = false
  const result = evaluateMergeGate(stoppedPolicy, passingEvidence())
  assert.equal(result.decision, 'FAIL')
  assert.match(result.failures.join('\n'), /automation_enabled is false/)
})
