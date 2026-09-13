#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import process from 'node:process'

const POLICY_PATH = new URL('../AI_Project_Memory/AUTONOMOUS_AGENT_POLICY.json', import.meta.url)

export async function loadPolicy(path = POLICY_PATH) {
  return JSON.parse(await readFile(path, 'utf8'))
}

export function evaluateMergeGate(policy, evidence) {
  const failures = []
  const unknowns = []

  if (!policy?.automation_enabled) {
    failures.push('automation_enabled is false')
  }

  if (!evidence || typeof evidence !== 'object') {
    return { decision: 'FAIL', failures: ['evidence payload missing'], unknowns: [] }
  }

  const gateValues = new Set(policy.gateValues ?? [])
  const gates = evidence.gates ?? {}

  const evaluateRequired = (name) => {
    const value = gates[name]
    if (!gateValues.has(value)) {
      unknowns.push(`${name}=MISSING_OR_INVALID`)
      return
    }
    if (value === 'UNKNOWN') unknowns.push(`${name}=UNKNOWN`)
    else if (value !== 'PASS') failures.push(`${name}=${value}`)
  }

  for (const gate of policy.requiredMergeGates ?? []) evaluateRequired(gate)

  const risk = evidence.risk ?? {}
  for (const [flag, conditionalGates] of Object.entries(policy.conditionalMergeGates ?? {})) {
    if (risk[flag] === true) {
      for (const gate of conditionalGates) evaluateRequired(gate)
    }
  }

  if (evidence.unresolvedRequiredEvidence && evidence.unresolvedRequiredEvidence.length > 0) {
    failures.push(`unresolvedRequiredEvidence=${evidence.unresolvedRequiredEvidence.join(',')}`)
  }

  if (evidence.prohibitedActionDetected === true) {
    failures.push('prohibitedActionDetected=true')
  }

  const implementers = new Set(evidence.implementerAgentIds ?? [])
  const auditors = new Set(evidence.independentAuditorAgentIds ?? [])
  if (policy.mergeRules?.implementerCannotBeSoleAuditor) {
    const hasIndependentAuditor = [...auditors].some((id) => !implementers.has(id))
    if (!hasIndependentAuditor) failures.push('independent auditor is not independent from implementer')
  }

  if (policy.mergeRules?.exactFinalHeadRequired) {
    if (!evidence.finalHeadSha || evidence.finalHeadSha !== evidence.auditedHeadSha) {
      failures.push('auditedHeadSha does not match finalHeadSha')
    }
    if (evidence.ciHeadSha && evidence.ciHeadSha !== evidence.finalHeadSha) {
      failures.push('ciHeadSha does not match finalHeadSha')
    }
  }

  if (evidence.hardStop) failures.push(`hardStop=${evidence.hardStop}`)

  let decision = 'PASS'
  if (failures.length > 0) decision = 'FAIL'
  else if (unknowns.length > 0) decision = 'UNKNOWN'

  return {
    decision,
    failures,
    unknowns,
    issue: evidence.issue ?? null,
    pr: evidence.pr ?? null,
    finalHeadSha: evidence.finalHeadSha ?? null,
  }
}

async function main() {
  const [, , evidencePath] = process.argv
  if (!evidencePath) {
    console.error('Usage: node evaluate-merge-gate.mjs <evidence.json>')
    process.exit(2)
  }

  const [policy, evidence] = await Promise.all([
    loadPolicy(),
    readFile(evidencePath, 'utf8').then(JSON.parse),
  ])

  const result = evaluateMergeGate(policy, evidence)
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.decision === 'PASS' ? 0 : 1)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
