import * as Sentry from '@sentry/browser'
import { buildSentryConfig } from './sentryConfig'

export const initBrowserObservability = (): boolean => {
  const config = buildSentryConfig(import.meta.env.VITE_SENTRY_DSN, import.meta.env.MODE)
  if (!config) return false

  Sentry.init(config)
  Sentry.setTag('dropi.runtime', 'game-web')
  return true
}
