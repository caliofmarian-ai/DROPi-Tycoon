import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { verifySentry } from '../server/sentry-diagnostics.mjs'

const eventId = '0123456789abcdef0123456789abcdef'
const marker = 'DROPi-SENTRY-SMOKE-733-test'
const env = {
  SENTRY_AUTH_TOKEN: 'test-private-value-never-log', SENTRY_ORG: 'test-org', SENTRY_PROJECT: 'test-project',
  VITE_SENTRY_DSN: 'https://public@o0.ingest.sentry.io/123',
  DROPI_SENTRY_VERIFY_EVENT_ID: eventId, DROPI_SENTRY_VERIFY_MARKER: marker,
}
const event = { eventID: eventId, projectID: '123', metadata: { value: marker },
  sdk: { name: 'sentry.javascript.browser' },
  tags: [{ key: 'environment', value: 'production' }, { key: 'dropi.runtime', value: 'game-web' }],
}
const response = (data: unknown, status = 200) => ({ ok: status === 200, status, json: async () => data })

describe('Sentry deployment boundary', () => {
  it('declares public Sentry/build metadata before Vite builds without exposing the auth token', () => {
    const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')
    const builder = dockerfile.split(' AS builder')[1].split('# ---- Production stage ----')[0]
    for (const declaration of [
      'ARG VITE_SENTRY_DSN',
      'ARG RAILWAY_GIT_COMMIT_SHA',
      'ARG RAILWAY_DEPLOYMENT_ID',
      'ENV VITE_SENTRY_RELEASE=$RAILWAY_GIT_COMMIT_SHA',
      'ENV VITE_SENTRY_DIST=$RAILWAY_DEPLOYMENT_ID',
    ]) {
      expect(builder.indexOf(declaration)).toBeGreaterThanOrEqual(0)
      expect(builder.indexOf(declaration)).toBeLessThan(builder.indexOf('RUN npm run build'))
    }
    expect(dockerfile).not.toMatch(/^\s*(?:ARG|ENV)\s+(?:VITE_)?SENTRY_AUTH_TOKEN/m)
  })

  it('does not call the API when credentials are absent', async () => {
    let calls = 0
    const result = await verifySentry({}, async () => { calls++; return response({}) })
    expect(calls).toBe(0)
    expect(result.connection).toBe('UNKNOWN')
  })

  it('uses only bounded read-only authenticated requests and emits no secrets', async () => {
    const calls: string[] = []
    const result = await verifySentry(env, async (url: string, options: RequestInit) => {
      calls.push(url)
      expect(url.startsWith('https://sentry.io/api/0/projects/test-org/test-project/')).toBe(true)
      expect(options.method).toBe('GET')
      expect(options.redirect).toBe('error')
      expect(options.signal).toBeDefined()
      return response(url.includes('/events/') ? event : { id: '123' })
    })
    expect(calls).toHaveLength(2)
    expect(result.connection).toBe('PASS')
    expect(JSON.stringify(result)).not.toContain(env.SENTRY_AUTH_TOKEN)
    expect(JSON.stringify(result)).not.toContain(env.VITE_SENTRY_DSN)
    expect(result.scrubbing.scrubIPAddresses).toBe('UNKNOWN')
  })

  it('does not promote configuration-only evidence to connection PASS', async () => {
    const result = await verifySentry({ ...env, DROPI_SENTRY_VERIFY_EVENT_ID: '' }, async () => response({ id: '123' }))
    expect(result.configuration).toBe('PASS')
    expect(result.connection).toBe('UNKNOWN')
  })

  it('rejects a DSN/project mismatch', async () => {
    const result = await verifySentry(env, async () => response({ id: '456' }))
    expect(result.status).toBe('FAIL')
    expect(result.reason).toBe('DSN_PROJECT_MISMATCH')
  })

  it('does not accept another environment or another event', async () => {
    const result = await verifySentry(env, async (url: string) => response(url.includes('/events/')
      ? { ...event, eventID: 'ffffffffffffffffffffffffffffffff', tags: [] } : { id: '123' }))
    expect(result.connection).toBe('FAIL')
  })

  it('keeps permission failures UNKNOWN and does not print response bodies', async () => {
    const result = await verifySentry(env, async () => response({ detail: env.SENTRY_AUTH_TOKEN }, 403))
    expect(result.connection).toBe('UNKNOWN')
    expect(result.project_http).toBe(403)
    expect(JSON.stringify(result)).not.toContain(env.SENTRY_AUTH_TOKEN)
  })

  it('does not echo network error text that could contain secrets', async () => {
    const result = await verifySentry(env, async () => { throw new Error(env.SENTRY_AUTH_TOKEN) })
    expect(result.connection).toBe('UNKNOWN')
    expect(JSON.stringify(result)).not.toContain(env.SENTRY_AUTH_TOKEN)
  })

  it('rejects arbitrary API destinations without sending credentials', async () => {
    let calls = 0
    const result = await verifySentry({ ...env, DROPI_SENTRY_API_REGION: 'https://untrusted.invalid' }, async () => {
      calls++; return response({})
    })
    expect(calls).toBe(0)
    expect(result.connection).toBe('UNKNOWN')
  })
})
