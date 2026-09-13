import { readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const POLICY_URL = new URL('../../../AI_Project_Memory/AUTONOMOUS_AGENT_POLICY.json', import.meta.url)

function intEnv(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`)
  }
  return value
}

function numberEnv(name, fallback, { min = 0, max = Number.MAX_VALUE } = {}) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be a number between ${min} and ${max}`)
  }
  return value
}

function boolEnv(name, fallback) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  if (/^(1|true|yes|on)$/i.test(raw)) return true
  if (/^(0|false|no|off)$/i.test(raw)) return false
  throw new Error(`${name} must be true/false`)
}

function parseRepository(value) {
  const match = /^([^/]+)\/([^/]+)$/.exec(value)
  if (!match) throw new Error('GITHUB_REPOSITORY must be owner/name')
  return { owner: match[1], repo: match[2], fullName: value }
}

export const MODEL_PRICING_USD_PER_MILLION = Object.freeze({
  'gpt-5.6-luna': { input: 0.2, output: 1.2 },
  'gpt-5.6-terra': { input: 2.0, output: 12.0 },
  'gpt-5.6': { input: 4.0, output: 20.0 },
  'gpt-5.6-sol': { input: 4.0, output: 20.0 },
})

export async function loadConfig() {
  const policy = JSON.parse(await readFile(POLICY_URL, 'utf8'))
  const repository = parseRepository(process.env.GITHUB_REPOSITORY || 'caliofmarian-ai/DROPi-Tycoon')

  const config = {
    policy,
    repository,
    mainBranch: process.env.GITHUB_MAIN_BRANCH || 'main',
    githubToken: process.env.GITHUB_TOKEN || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    triageModel: process.env.OPENAI_TRIAGE_MODEL || 'gpt-5.6-luna',
    implementerModel: process.env.OPENAI_IMPLEMENTER_MODEL || 'gpt-5.6-terra',
    auditorModel: process.env.OPENAI_AUDITOR_MODEL || 'gpt-5.6-sol',
    pollIntervalMs: intEnv('AUTONOMOUS_POLL_SECONDS', 60, { min: 30, max: 3600 }) * 1000,
    maxConcurrentIssues: intEnv(
      'AUTONOMOUS_MAX_CONCURRENT_ISSUES',
      Math.min(3, policy.limits?.maxConcurrentIssues ?? 3),
      { min: 1, max: 10 },
    ),
    maxSubagentsPerIssue: intEnv(
      'AUTONOMOUS_MAX_SUBAGENTS_PER_ISSUE',
      Math.min(3, policy.limits?.maxParallelSubagentsPerIssue ?? 3),
      { min: 1, max: 8 },
    ),
    maxAttemptsPerIssue: intEnv(
      'AUTONOMOUS_MAX_ATTEMPTS_PER_ISSUE',
      Math.min(3, policy.limits?.maxImplementationAttemptsPerIssue ?? 3),
      { min: 1, max: 5 },
    ),
    maxIssuesPerDay: intEnv('AUTONOMOUS_MAX_ISSUES_PER_DAY', 8, { min: 1, max: 50 }),
    dailyBudgetUsd: numberEnv('AUTONOMOUS_DAILY_BUDGET_USD', 5, { min: 0.25, max: 1000 }),
    maxSessionMinutes: intEnv('AUTONOMOUS_MAX_SESSION_MINUTES', 45, { min: 5, max: 180 }),
    ciTimeoutMinutes: intEnv('AUTONOMOUS_CI_TIMEOUT_MINUTES', 35, { min: 5, max: 120 }),
    postMergeTimeoutMinutes: intEnv('AUTONOMOUS_POST_MERGE_TIMEOUT_MINUTES', 35, { min: 5, max: 120 }),
    triageCandidateLimit: intEnv('AUTONOMOUS_TRIAGE_CANDIDATE_LIMIT', 30, { min: 5, max: 100 }),
    workspaceRoot: process.env.AUTONOMOUS_WORKSPACE_ROOT || path.join(os.tmpdir(), 'dropi-dt00-workspaces'),
    reportIssueNumber: intEnv('AUTONOMOUS_REPORT_ISSUE', 723, { min: 1 }),
    healthPort: intEnv('PORT', 8080, { min: 1, max: 65535 }),
    enableTriage: boolEnv('AUTONOMOUS_TRIAGE_ENABLED', true),
    dryRun: boolEnv('AUTONOMOUS_DRY_RUN', false),
    githubApiBase: process.env.GITHUB_API_BASE || 'https://api.github.com',
  }

  const modelNames = [config.triageModel, config.implementerModel, config.auditorModel]
  for (const model of modelNames) {
    if (!MODEL_PRICING_USD_PER_MILLION[model]) {
      throw new Error(`No conservative pricing entry configured for model ${model}`)
    }
  }

  return config
}

export function runtimeReadiness(config) {
  const blockers = []
  if (config.policy?.automation_enabled !== true) blockers.push('canonical automation_enabled is not true')
  if (!config.githubToken) blockers.push('GITHUB_TOKEN missing')
  if (!config.openaiApiKey) blockers.push('OPENAI_API_KEY missing')
  if (config.dailyBudgetUsd <= 0) blockers.push('AUTONOMOUS_DAILY_BUDGET_USD must be positive')
  return { ready: blockers.length === 0, blockers }
}

export function conservativeSessionCostUsd(model, usage) {
  const pricing = MODEL_PRICING_USD_PER_MILLION[model]
  if (!pricing || !usage) return 0
  const input = Number(usage.input_tokens || 0)
  const output = Number(usage.output_tokens || 0)
  // Cached input is intentionally charged at the full input rate here. The budget gate
  // therefore errs on the conservative side instead of underestimating spend.
  return (input * pricing.input + output * pricing.output) / 1_000_000
}
