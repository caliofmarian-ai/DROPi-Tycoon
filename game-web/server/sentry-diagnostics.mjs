// Explicit operator CLI only. Not imported by the HTTP server, not an endpoint.
// Reads existing runtime credentials internally; never logs credentials or bodies.
import { pathToFileURL } from 'node:url'

const UNKNOWN = 'UNKNOWN'
const nullableBoolean = (value) => typeof value === 'boolean' ? value : UNKNOWN
const regions = { global: 'https://sentry.io', us: 'https://us.sentry.io', eu: 'https://de.sentry.io' }

export async function verifySentry(env = process.env, fetcher = globalThis.fetch) {
  const result = { diagnostic: 'DROPi_SENTRY_VERIFY', status: UNKNOWN, connection: UNKNOWN }
  const token = env.SENTRY_AUTH_TOKEN?.trim()
  const org = env.SENTRY_ORG?.trim()
  const project = env.SENTRY_PROJECT?.trim()
  const eventId = env.DROPI_SENTRY_VERIFY_EVENT_ID?.trim()
  const marker = env.DROPI_SENTRY_VERIFY_MARKER?.trim()
  const origin = regions[env.DROPI_SENTRY_API_REGION || 'global']
  if (!token || !org || !project || !env.VITE_SENTRY_DSN?.trim()) {
    return { ...result, reason: 'REQUIRED_RUNTIME_CONFIGURATION_MISSING' }
  }
  if (!origin || !/^[a-zA-Z0-9_-]+$/.test(org) || !/^[a-zA-Z0-9_-]+$/.test(project)) {
    return { ...result, reason: 'INVALID_API_REGION_OR_PROJECT_REFERENCE' }
  }
  let dsn
  try { dsn = new URL(env.VITE_SENTRY_DSN.trim()) } catch {
    return { ...result, reason: 'INVALID_DSN' }
  }
  if (dsn.protocol !== 'https:' || !dsn.hostname.endsWith('.sentry.io') || dsn.password || !/^\/\d+$/.test(dsn.pathname)) {
    return { ...result, reason: 'UNSUPPORTED_OR_INVALID_DSN' }
  }
  if (eventId && (!/^[a-f0-9]{32}$/i.test(eventId) || !/^DROPi-SENTRY-SMOKE-733-[A-Za-z0-9_-]+$/.test(marker || ''))) {
    return { ...result, reason: 'INVALID_CONTROLLED_EVENT_REFERENCE' }
  }
  const base = `${origin}/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}`
  const get = async (path) => {
    try {
      const response = await fetcher(`${base}${path}`, {
        method: 'GET', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!response.ok) return { http: response.status }
      return { http: response.status, data: await response.json() }
    } catch { return { http: null } }
  }
  const projectResponse = await get('/')
  result.project_http = projectResponse.http
  if (!projectResponse.data) return { ...result, reason: 'PROJECT_LOOKUP_UNAVAILABLE' }
  const configured = projectResponse.data
  result.project_id = /^\d+$/.test(String(configured.id)) ? String(configured.id) : UNKNOWN
  result.dsn_project_match = String(configured.id) === dsn.pathname.slice(1)
  result.scrubbing = {
    scrubIPAddresses: nullableBoolean(configured.scrubIPAddresses),
    dataScrubber: nullableBoolean(configured.dataScrubber),
    dataScrubberDefaults: nullableBoolean(configured.dataScrubberDefaults),
  }
  if (!result.dsn_project_match) return { ...result, status: 'FAIL', reason: 'DSN_PROJECT_MISMATCH' }
  if (!eventId) return { ...result, configuration: 'PASS', reason: 'CONTROLLED_EVENT_LOOKUP_NOT_REQUESTED' }
  const eventResponse = await get(`/events/${eventId}/`)
  result.event_http = eventResponse.http
  if (!eventResponse.data) return { ...result, reason: 'CONTROLLED_EVENT_LOOKUP_UNAVAILABLE' }
  const event = eventResponse.data
  const tags = Object.fromEntries((event.tags || []).map(({ key, value }) => [key, value]))
  const exceptions = (event.entries || []).filter((entry) => entry.type === 'exception')
    .flatMap((entry) => entry.data?.values || [])
  const markerMatches = event.metadata?.value === marker || event.message === marker ||
    exceptions.some((entry) => entry.value === marker)
  const checks = {
    event_id: (event.eventID || event.id)?.toLowerCase() === eventId.toLowerCase(),
    project: String(event.projectID) === String(configured.id),
    marker: markerMatches,
    environment: tags.environment === 'production',
    runtime: tags['dropi.runtime'] === 'game-web',
    browser_sdk: event.sdk?.name === 'sentry.javascript.browser',
  }
  result.event_id = eventId.toLowerCase()
  result.checks = checks
  result.ip_field_present = Boolean(event.user?.ip_address)
  result.user_email_field_present = Boolean(event.user?.email)
  result.observed_at = new Date().toISOString()
  const pass = Object.values(checks).every(Boolean)
  return { ...result, status: pass ? 'PASS' : 'FAIL', connection: pass ? 'PASS' : 'FAIL',
    reason: pass ? 'CONTROLLED_BROWSER_EVENT_OBSERVED' : 'CONTROLLED_EVENT_METADATA_MISMATCH' }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Diagnostics must not take down the game. Status, not process success, is evidence.
  try { console.log(JSON.stringify(await verifySentry())) } catch {
    console.log(JSON.stringify({ diagnostic: 'DROPi_SENTRY_VERIFY', status: UNKNOWN,
      connection: UNKNOWN, reason: 'UNEXPECTED_DIAGNOSTIC_FAILURE' }))
  }
}
