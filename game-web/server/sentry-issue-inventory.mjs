// Explicit operator CLI only. Not imported by the HTTP server and not exposed as an endpoint.
// Performs one bounded GET against Sentry and emits only redacted issue-level metadata.
import { pathToFileURL } from 'node:url'

const UNKNOWN = 'UNKNOWN'
const regions = { global: 'https://sentry.io', us: 'https://us.sentry.io', eu: 'https://de.sentry.io' }
const MAX_ISSUES = 25

const redactText = (value) => String(value || '')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
  .replace(/https?:\/\/[^\s)\]}>,]+/gi, '[redacted-url]')
  .replace(/\b(?:sk|sntrys|sentry)[-_][A-Za-z0-9_-]{12,}\b/gi, '[redacted-secret]')
  .slice(0, 240)

const safeIntegerString = (value) => /^\d+$/.test(String(value || '')) ? String(value) : UNKNOWN
const safeIsoTimestamp = (value) => {
  if (!value) return UNKNOWN
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : UNKNOWN
}

export async function inventorySentryIssues(env = process.env, fetcher = globalThis.fetch) {
  const result = { diagnostic: 'DROPi_SENTRY_ISSUE_INVENTORY', status: UNKNOWN, query: 'is:unresolved' }
  const token = env.SENTRY_AUTH_TOKEN?.trim()
  const org = env.SENTRY_ORG?.trim()
  const project = env.SENTRY_PROJECT?.trim()
  const origin = regions[env.DROPI_SENTRY_API_REGION || 'global']

  if (!token || !org || !project) return { ...result, reason: 'REQUIRED_RUNTIME_CONFIGURATION_MISSING' }
  if (!origin || !/^[a-zA-Z0-9_-]+$/.test(org) || !/^[a-zA-Z0-9_-]+$/.test(project)) {
    return { ...result, reason: 'INVALID_API_REGION_OR_PROJECT_REFERENCE' }
  }

  const url = `${origin}/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}/issues/` +
    `?query=${encodeURIComponent(result.query)}&sort=date&statsPeriod=14d&limit=${MAX_ISSUES}`

  try {
    const response = await fetcher(url, {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    result.http = response.status
    if (!response.ok) return { ...result, reason: 'ISSUE_LOOKUP_UNAVAILABLE' }

    const body = await response.json()
    if (!Array.isArray(body)) return { ...result, reason: 'UNEXPECTED_ISSUE_RESPONSE' }

    const issues = body.slice(0, MAX_ISSUES).map((issue) => ({
      id: safeIntegerString(issue.id),
      short_id: /^[A-Z0-9_-]{1,64}$/i.test(String(issue.shortId || '')) ? String(issue.shortId) : UNKNOWN,
      status: /^[a-z_]{1,32}$/i.test(String(issue.status || '')) ? String(issue.status) : UNKNOWN,
      level: /^[a-z_]{1,32}$/i.test(String(issue.level || '')) ? String(issue.level) : UNKNOWN,
      count: safeIntegerString(issue.count),
      first_seen: safeIsoTimestamp(issue.firstSeen),
      last_seen: safeIsoTimestamp(issue.lastSeen),
      title: redactText(issue.title || issue.metadata?.title || issue.metadata?.value),
      culprit: redactText(issue.culprit),
    }))

    return {
      ...result,
      status: 'PASS',
      issue_count: issues.length,
      truncated: body.length > MAX_ISSUES,
      issues,
      observed_at: new Date().toISOString(),
      reason: issues.length ? 'UNRESOLVED_ISSUES_OBSERVED' : 'NO_UNRESOLVED_ISSUES_OBSERVED',
    }
  } catch {
    return { ...result, reason: 'ISSUE_LOOKUP_NETWORK_FAILURE' }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await inventorySentryIssues()))
  } catch {
    console.log(JSON.stringify({
      diagnostic: 'DROPi_SENTRY_ISSUE_INVENTORY',
      status: UNKNOWN,
      reason: 'UNEXPECTED_DIAGNOSTIC_FAILURE',
    }))
  }
}
