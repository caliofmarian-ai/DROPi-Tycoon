// Run explicitly from the isolated CI runner. No access to player sessions or API tokens.
import { chromium } from 'playwright'
import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const productionUrl = 'https://dropi-tycoon-production.up.railway.app/'
const expectedCommit = process.env.DROPI_EXPECTED_COMMIT || ''
const marker = process.env.DROPI_SENTRY_SMOKE_MARKER || ''
const outputDir = process.env.DROPI_SENTRY_SMOKE_OUTPUT || './artifacts/sentry'
const evidence = { status: 'UNKNOWN', connection: 'UNKNOWN',
  expected_deployment_commit: expectedCommit, deployment_commit_observed_in_browser: false,
  started_at: new Date().toISOString(), marker, production_url: productionUrl }
let browser
let phase = 'validate-input'
try {
  if (!/^[0-9a-f]{40}$/i.test(expectedCommit) || !/^DROPi-SENTRY-SMOKE-733-[A-Za-z0-9_-]+$/.test(marker)) {
    throw new Error('Invalid controlled smoke reference')
  }
  phase = 'launch-browser'
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  phase = 'load-production'
  const response = await page.goto(productionUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
  if (!response?.ok()) throw new Error('Production document unavailable')
  const scriptSrc = await page.locator('script[type="module"][src]').first().getAttribute('src')
  if (!scriptSrc) throw new Error('No production entry module')
  const scriptUrl = new URL(scriptSrc, productionUrl)
  if (scriptUrl.origin !== new URL(productionUrl).origin) throw new Error('Unexpected entry origin')
  const scriptResponse = await context.request.get(scriptUrl.href)
  if (!scriptResponse.ok()) throw new Error('Entry module unavailable')
  evidence.production_entry_sha256 = createHash('sha256').update(await scriptResponse.body()).digest('hex')
  await page.waitForTimeout(4000)
  phase = 'controlled-event'
  const captured = page.waitForResponse((res) => {
    const url = new URL(res.url())
    return url.hostname.endsWith('.sentry.io') && /\/api\/\d+\/envelope\//.test(url.pathname) &&
      Boolean(res.request().postDataBuffer()?.toString('utf8').includes(marker))
  }, { timeout: 45000 })
  // The deployed SDK's default error handler must capture this single synthetic error.
  await page.evaluate((value) => { window.setTimeout(() => { throw new Error(value) }, 0) }, marker)
  const sentryResponse = await captured
  const lines = sentryResponse.request().postDataBuffer().toString('utf8').split('\n')
  const envelope = JSON.parse(lines[0])
  let event
  for (let index = 1; index + 1 < lines.length; index++) {
    try { if (JSON.parse(lines[index]).type === 'event') { event = JSON.parse(lines[index + 1]); break } } catch {}
  }
  const markerMatches = event?.exception?.values?.some((value) => value.value === marker) || event?.message === marker
  if (!/^[a-f0-9]{32}$/i.test(envelope.event_id || '') || !markerMatches ||
      event.environment !== 'production' || event.tags?.['dropi.runtime'] !== 'game-web') {
    throw new Error('Controlled envelope metadata mismatch')
  }
  evidence.event_id = envelope.event_id
  evidence.environment = event.environment
  evidence.runtime = event.tags['dropi.runtime']
  evidence.transport_http = sentryResponse.status()
  evidence.observed_at = new Date().toISOString()
  evidence.status = sentryResponse.ok() ? 'PASS' : 'FAIL'
  evidence.reason = sentryResponse.ok() ? 'BROWSER_ENVELOPE_ACCEPTED_API_LOOKUP_STILL_REQUIRED' : 'INGESTION_REJECTED'
  if (!sentryResponse.ok()) process.exitCode = 1
} catch {
  evidence.status = 'FAIL'
  evidence.reason = 'BROWSER_SMOKE_FAILED'
  evidence.failed_phase = phase
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'sentry-browser-smoke.json'), JSON.stringify(evidence, null, 2) + '\n')
  console.log('DROPi_SENTRY_BROWSER_SMOKE ' + JSON.stringify(evidence))
}
