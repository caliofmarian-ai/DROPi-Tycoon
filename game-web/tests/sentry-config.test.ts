import { describe, expect, it } from 'vitest'
import { buildSentryConfig } from '../src/observability/sentryConfig'

describe('Sentry runtime configuration', () => {
  it('stays disabled when no DSN is configured', () => {
    expect(buildSentryConfig(undefined, 'production')).toBeNull()
    expect(buildSentryConfig('   ', 'production')).toBeNull()
  })

  it('uses the configured DSN without enabling PII or tracing', () => {
    expect(buildSentryConfig(' https://examplePublicKey@o0.ingest.sentry.io/1 ', 'production')).toEqual({
      dsn: 'https://examplePublicKey@o0.ingest.sentry.io/1',
      environment: 'production',
      sendDefaultPii: false,
      tracesSampleRate: 0,
    })
  })

  it('correlates valid Railway commit and deployment identifiers without accepting arbitrary metadata', () => {
    const commit = '7bec720a2463dbf4b4ac40d775e7942a5e1740a8'
    const deployment = '4635596b-896e-47a3-b1d4-308c8e69cd97'
    expect(buildSentryConfig('https://public@example.ingest.sentry.io/1', 'production', ` ${commit.toUpperCase()} `, ` ${deployment.toUpperCase()} `)).toMatchObject({
      release: commit,
      dist: deployment,
      sendDefaultPii: false,
      tracesSampleRate: 0,
    })

    expect(buildSentryConfig('https://public@example.ingest.sentry.io/1', 'production', 'branch-name', 'not-a-deployment')).toEqual({
      dsn: 'https://public@example.ingest.sentry.io/1',
      environment: 'production',
      sendDefaultPii: false,
      tracesSampleRate: 0,
    })
  })
})
