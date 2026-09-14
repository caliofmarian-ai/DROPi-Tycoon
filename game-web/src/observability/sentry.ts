import * as Sentry from '@sentry/browser'
import { buildSentryConfig } from './sentryConfig'

export const initBrowserObservability = (): boolean => {
  const config = buildSentryConfig(
    import.meta.env.VITE_SENTRY_DSN,
    import.meta.env.MODE,
    import.meta.env.VITE_SENTRY_RELEASE,
    import.meta.env.VITE_SENTRY_DIST,
  )
  if (!config) return false

  Sentry.init(config)
  Sentry.setTag('dropi.runtime', 'game-web')
  if (config.release) Sentry.setTag('dropi.commit', config.release)
  if (config.dist) Sentry.setTag('dropi.deployment', config.dist)
  return true
}
