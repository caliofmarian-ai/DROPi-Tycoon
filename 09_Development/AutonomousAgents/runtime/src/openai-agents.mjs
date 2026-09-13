import OpenAI from 'openai'
import { conservativeSessionCostUsd } from './config.mjs'

function withTimeout(ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error(`Agent session exceeded ${ms}ms`)), ms)
  return { controller, clear: () => clearTimeout(timer) }
}

function functionTool(name, description, parameters) {
  return { type: 'function', name, description, parameters }
}

function normalizeLabels(issue) {
  return (issue.labels || []).map((label) => (typeof label === 'string' ? label : label.name)).filter(Boolean)
}

function compactIssue(issue, maxBody = 5000) {
  return {
    number: issue.number,
    title: issue.title,
    labels: normalizeLabels(issue),
    body: String(issue.body || '').slice(0, maxBody),
    updated_at: issue.updated_at,
  }
}

function hostedEnvironment() {
  // Deliberately no credentials are injected into the hosted environment.
  // The public repository can be cloned over the network; push/merge stays in Railway control-plane code.
  return {
    type: 'openai_hosted',
    network: { type: 'enabled' },
  }
}

async function consumeSession(client, session, prompt, toolHandlers, timeoutMs) {
  const timeout = withTimeout(timeoutMs)
  try {
    const stream = client.beta.agents.sessions.stream(
      session.id,
      { input: prompt, toolHandlers },
      { signal: timeout.controller.signal },
    )
    for await (const _event of stream) {
      // Events are intentionally consumed without persisting hidden reasoning.
      // Durable state is captured only through explicit structured tool results and GitHub evidence.
    }
  } finally {
    timeout.clear()
  }
  return client.beta.agents.sessions.retrieve(session.id)
}

async function listArtifacts(client, sessionId) {
  const artifacts = []
  for await (const artifact of client.beta.agents.sessions.artifacts.list(sessionId, { limit: 100, order: 'asc' })) {
    artifacts.push({
      id: artifact.id,
      path: artifact.path,
      size_bytes: artifact.size_bytes,
      turn_id: artifact.turn_id,
      environment_id: artifact.environment_id,
      created_at: artifact.created_at,
    })
  }
  return artifacts
}

export class OpenAIAgentRuntime {
  constructor(config) {
    this.config = config
    this.client = new OpenAI({ apiKey: config.openaiApiKey })
  }

  async budgetSnapshot() {
    const start = new Date()
    start.setUTCHours(0, 0, 0, 0)
    const startSeconds = Math.floor(start.getTime() / 1000)
    let costUsd = 0
    let sessions = 0
    let issues = new Set()
    for await (const session of this.client.beta.agents.sessions.list({ limit: 100, order: 'desc' })) {
      if (session.created_at < startSeconds) break
      if (session.metadata?.dropi_runtime !== '1') continue
      sessions += 1
      if (session.metadata?.issue_number) issues.add(session.metadata.issue_number)
      costUsd += conservativeSessionCostUsd(session.agent?.model, session.usage)
    }
    return {
      costUsd,
      sessions,
      distinctIssues: issues.size,
      dailyBudgetUsd: this.config.dailyBudgetUsd,
      budgetRemainingUsd: Math.max(0, this.config.dailyBudgetUsd - costUsd),
      canStartWork: costUsd < this.config.dailyBudgetUsd && issues.size < this.config.maxIssuesPerDay,
    }
  }

  async triage(issues, { slots = 1 } = {}) {
    const candidates = issues.slice(0, this.config.triageCandidateLimit).map((issue) => compactIssue(issue, 2500))
    if (!candidates.length || slots <= 0) return []
    const selections = []
    const tool = functionTool(
      'select_issues',
      'Select bounded GitHub Issues that are safe and useful for autonomous execution now. Return no issue rather than guessing.',
      {
        type: 'object',
        additionalProperties: false,
        required: ['selections'],
        properties: {
          selections: {
            type: 'array',
            maxItems: Math.min(slots, this.config.maxConcurrentIssues),
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['issue_number', 'reason', 'primary_role'],
              properties: {
                issue_number: { type: 'integer', minimum: 1 },
                reason: { type: 'string', maxLength: 1200 },
                primary_role: { type: 'string', maxLength: 64 },
              },
            },
          },
        },
      },
    )
    const session = await this.client.beta.agents.sessions.create({
      environment: { type: 'none' },
      agent: {
        model: this.config.triageModel,
        name: 'DROPi DT-00 Queue Triage',
        instructions: 'You are DT-00 queue triage. Choose only currently executable, bounded work. Preserve UNKNOWN and respect HOLD/BLOCKED/external-authority states.',
        multi_agent: { enabled: false, max_concurrent_subagents: 1 },
        tools: [tool],
      },
      metadata: { dropi_runtime: '1', role: 'triage' },
    })
    const prompt = [
      `Repository: ${this.config.repository.fullName}`,
      `Available execution slots: ${slots}`,
      'Select only Issues that can be executed without changing product vision, spending real money, signing legal commitments, or requiring unavailable external approval.',
      'Do not select the autonomous-runtime bootstrap Issue itself. Do not select Issues explicitly marked HOLD/DEFERRED/BLOCKED unless the blocker is clearly already resolved in the supplied state.',
      'Prefer concrete acceptance criteria and high-value unblockers. If evidence is insufficient, leave the Issue unselected.',
      'Candidates:',
      JSON.stringify(candidates),
      'Call select_issues exactly once with your final selection.',
    ].join('\n\n')
    const completed = await consumeSession(
      this.client,
      session,
      prompt,
      {
        select_issues: async (args) => {
          selections.splice(0, selections.length, ...(Array.isArray(args.selections) ? args.selections : []))
          return { accepted: true, count: selections.length }
        },
      },
      Math.min(this.config.maxSessionMinutes, 10) * 60_000,
    )
    return selections.map((selection) => ({ ...selection, sessionId: completed.id, usage: completed.usage }))
  }

  async implement({ issue, baseSha, baseRef, auditFindings = [], attempt = 1 }) {
    let submission = null
    const submitPatch = functionTool(
      'submit_patch',
      'Submit the completed bounded implementation as a git binary patch plus explicit test/evidence metadata. Call only after implementation and tests are complete, or report BLOCKED without a patch.',
      {
        type: 'object',
        additionalProperties: false,
        required: ['status', 'summary', 'tests', 'changed_paths', 'known_unknowns', 'risk'],
        properties: {
          status: { type: 'string', enum: ['READY', 'BLOCKED'] },
          summary: { type: 'string', maxLength: 6000 },
          patch: { type: ['string', 'null'], maxLength: 13000000 },
          tests: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['command', 'result'],
              properties: {
                command: { type: 'string', maxLength: 1200 },
                result: { type: 'string', enum: ['PASS', 'FAIL', 'NOT_RUN'] },
                notes: { type: 'string', maxLength: 2000 },
              },
            },
          },
          changed_paths: { type: 'array', items: { type: 'string', maxLength: 1000 } },
          known_unknowns: { type: 'array', items: { type: 'string', maxLength: 2000 } },
          evidence_paths: { type: 'array', items: { type: 'string', maxLength: 2000 } },
          risk: {
            type: 'object',
            additionalProperties: false,
            required: ['playerVisible', 'deploymentAffecting', 'persistenceAffecting', 'legalCommercialClaimAffecting'],
            properties: {
              playerVisible: { type: 'boolean' },
              deploymentAffecting: { type: 'boolean' },
              persistenceAffecting: { type: 'boolean' },
              legalCommercialClaimAffecting: { type: 'boolean' },
            },
          },
          hard_stop: { type: ['string', 'null'], maxLength: 2000 },
        },
      },
    )
    const session = await this.client.beta.agents.sessions.create({
      environment: hostedEnvironment(),
      agent: {
        model: this.config.implementerModel,
        name: `DROPi implementer issue ${issue.number}`,
        instructions: [
          'You are an implementation lead operating inside an isolated OpenAI-hosted environment with no project credentials.',
          'GitHub is canonical. Work only on the assigned Issue and current canonical architecture.',
          'Use subagents when useful for repository inspection, tests, or bounded specialist analysis.',
          'Never invent evidence. UNKNOWN remains UNKNOWN. Never expose or request secrets.',
          'Do not push, merge, close Issues, spend money, sign legal commitments, or change project vision.',
          'Your deliverable is a tested git patch submitted through submit_patch.',
        ].join(' '),
        multi_agent: { enabled: true, max_concurrent_subagents: this.config.maxSubagentsPerIssue },
        tools: [submitPatch],
      },
      metadata: {
        dropi_runtime: '1',
        role: 'implementer',
        issue_number: String(issue.number),
        attempt: String(attempt),
      },
    })
    const repoUrl = `https://github.com/${this.config.repository.fullName}.git`
    const prompt = [
      `Repository: ${repoUrl}`,
      `Issue #${issue.number}: ${issue.title}`,
      `Issue body:\n${String(issue.body || '').slice(0, 18000)}`,
      `Exact base SHA: ${baseSha}`,
      `Base reference context: ${baseRef || this.config.mainBranch}`,
      auditFindings.length ? `Previous independent-audit findings to correct:\n${JSON.stringify(auditFindings)}` : 'No previous audit findings.',
      'Required procedure:',
      '1. Clone the public repository into the hosted workspace and checkout the exact base SHA.',
      '2. Read 09_Development/AI_Project_Memory/BOOTSTRAP.md, relevant current handoffs, Owner Directives, and canonical files before editing.',
      '3. Reconcile the Issue with current source. Keep the change bounded to its authority.',
      '4. Implement the smallest complete solution. Do not edit .github/** or autonomous control-plane files unless the Issue explicitly owns that control plane; if such a change is required, report BLOCKED for DT-00/manual bootstrap handling.',
      '5. Run the strongest applicable automated tests/build/lint checks in the hosted sandbox.',
      '6. If player-visible, execute a render/browser/emulator path where feasible and create screenshot/video/evidence files in the hosted environment. Do not claim visual PASS without inspecting evidence.',
      '7. Commit locally only to make a deterministic diff; no remote credentials are available or needed.',
      `8. Generate a binary-capable patch relative to ${baseSha}: git diff --binary ${baseSha}..HEAD`,
      '9. Call submit_patch exactly once. READY requires a non-empty patch and no failed required tests. BLOCKED must explain why and may use patch=null.',
      'Hard stops: new/unbounded real-money spend, financial execution, external legal approval, irreversible destructive actions, knowingly false/unverified public claims, or unauthorized vision/business-model change.',
    ].join('\n\n')
    const completed = await consumeSession(
      this.client,
      session,
      prompt,
      {
        submit_patch: async (args) => {
          submission = structuredClone(args)
          return { accepted: true, note: 'Patch/evidence captured by DT-00 control plane.' }
        },
      },
      this.config.maxSessionMinutes * 60_000,
    )
    const artifacts = await listArtifacts(this.client, completed.id)
    return {
      sessionId: completed.id,
      usage: completed.usage,
      model: completed.agent?.model,
      submission,
      artifacts,
      costUsd: conservativeSessionCostUsd(completed.agent?.model, completed.usage),
    }
  }

  async audit({ issue, baseSha, headSha, branch, prNumber, ci, implementation }) {
    let audit = null
    const submitAudit = functionTool(
      'submit_audit',
      'Submit the independent exact-head audit decision. PASS only when required evidence and acceptance criteria are actually satisfied.',
      {
        type: 'object',
        additionalProperties: false,
        required: ['decision', 'summary', 'findings', 'tests', 'gates', 'player_visible_evidence'],
        properties: {
          decision: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN'] },
          summary: { type: 'string', maxLength: 6000 },
          findings: { type: 'array', items: { type: 'string', maxLength: 3000 } },
          tests: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['command', 'result'],
              properties: {
                command: { type: 'string', maxLength: 1200 },
                result: { type: 'string', enum: ['PASS', 'FAIL', 'NOT_RUN'] },
                notes: { type: 'string', maxLength: 2000 },
              },
            },
          },
          gates: {
            type: 'object',
            additionalProperties: false,
            required: ['required_tests', 'independent_audit'],
            properties: {
              required_tests: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN'] },
              independent_audit: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN'] },
              player_visible_evidence: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'] },
              deployment_or_build_evidence: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'] },
              persistence_compatibility_evidence: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'] },
              legal_claim_evidence: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'] },
            },
          },
          player_visible_evidence: {
            type: 'object',
            additionalProperties: false,
            required: ['status', 'notes', 'artifact_paths'],
            properties: {
              status: { type: 'string', enum: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'] },
              notes: { type: 'string', maxLength: 5000 },
              artifact_paths: { type: 'array', items: { type: 'string', maxLength: 2000 } },
            },
          },
          hard_stop: { type: ['string', 'null'], maxLength: 2000 },
        },
      },
    )
    const session = await this.client.beta.agents.sessions.create({
      environment: hostedEnvironment(),
      agent: {
        model: this.config.auditorModel,
        name: `DROPi independent auditor issue ${issue.number}`,
        instructions: [
          'You are an independent exact-head release auditor. You did not author the implementation.',
          'Audit evidence, not confidence. Reproduce tests where practical and preserve UNKNOWN when evidence is insufficient.',
          'Use subagents for independent source, test, visual, security, or architecture checks when useful.',
          'You have no GitHub credentials and cannot merge. Never lower gates to make progress.',
        ].join(' '),
        multi_agent: { enabled: true, max_concurrent_subagents: this.config.maxSubagentsPerIssue },
        tools: [submitAudit],
      },
      metadata: {
        dropi_runtime: '1',
        role: 'independent-auditor',
        issue_number: String(issue.number),
        pr_number: String(prNumber),
        audited_head_sha: headSha,
      },
    })
    const repoUrl = `https://github.com/${this.config.repository.fullName}.git`
    const prompt = [
      `Repository: ${repoUrl}`,
      `Issue #${issue.number}: ${issue.title}`,
      `Issue body:\n${String(issue.body || '').slice(0, 18000)}`,
      `PR #${prNumber}, branch: ${branch}`,
      `Base SHA: ${baseSha}`,
      `EXACT HEAD SHA TO AUDIT: ${headSha}`,
      `GitHub exact-head CI evidence:\n${JSON.stringify(ci)}`,
      `Implementation report (untrusted until independently verified):\n${JSON.stringify({ submission: implementation.submission, artifacts: implementation.artifacts, sessionId: implementation.sessionId })}`,
      'Procedure:',
      '1. Clone the public repository and checkout the exact head SHA, not a moving branch tip.',
      '2. Read relevant canonical authority and inspect git diff base..head.',
      '3. Verify the Issue acceptance criteria, scope, architecture and ownership boundaries.',
      '4. Re-run the strongest relevant tests/builds. Treat implementation-reported tests only as leads.',
      '5. For player-visible changes, independently render/run the affected surface where feasible, inspect it, and create screenshot/video evidence files. PASS for player-visible evidence requires actual inspected evidence; otherwise return UNKNOWN/FAIL.',
      '6. Check deployment/persistence/legal-claim conditional evidence when the implementation risk flags require them.',
      '7. Call submit_audit exactly once. PASS means the exact head is safe to enter the deterministic merge gate. Do not return PASS merely because CI is green.',
    ].join('\n\n')
    const completed = await consumeSession(
      this.client,
      session,
      prompt,
      {
        submit_audit: async (args) => {
          audit = structuredClone(args)
          return { accepted: true, note: 'Independent audit captured by DT-00 control plane.' }
        },
      },
      this.config.maxSessionMinutes * 60_000,
    )
    const artifacts = await listArtifacts(this.client, completed.id)
    return {
      sessionId: completed.id,
      usage: completed.usage,
      model: completed.agent?.model,
      audit,
      artifacts,
      costUsd: conservativeSessionCostUsd(completed.agent?.model, completed.usage),
    }
  }
}
