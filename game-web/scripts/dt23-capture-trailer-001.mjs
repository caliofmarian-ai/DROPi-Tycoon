import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const GAME_URL = process.env.DT23_GAME_URL ?? 'https://dropi-tycoon-production.up.railway.app/'
const OUTPUT_DIR = path.resolve(process.env.DT23_OUTPUT_DIR ?? '../artifacts/dt23/trailer-001')
const RAW_DIR = path.join(OUTPUT_DIR, 'raw')
const VIEWPORT = { width: 1280, height: 720 }
const STREET_APPROACH_MS = 22_000
const STREET_STEP_MS = 250
const STREET_MAX_STEPS = 48
const OBJECTIVE_PANEL = { x: 6, y: 46, width: 370, height: 62 }

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
await mkdir(RAW_DIR, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--disable-dev-shm-usage'],
})
const context = await browser.newContext({
  viewport: VIEWPORT,
  recordVideo: { dir: RAW_DIR, size: VIEWPORT },
  locale: 'en-US',
  timezoneId: 'Europe/Dublin',
  colorScheme: 'dark',
})
const page = await context.newPage()
const startedAt = Date.now()
const marks = []
const pageErrors = []
const failedResponses = []

const mark = (label, extra = {}) => {
  const atMs = Date.now() - startedAt
  const entry = { label, atMs, ...extra }
  marks.push(entry)
  console.log(`[DT23] ${label} @ ${(atMs / 1000).toFixed(2)}s ${JSON.stringify(extra)}`)
}
page.on('pageerror', error => pageErrors.push(String(error?.stack ?? error)))
page.on('response', response => {
  if (response.status() >= 500) failedResponses.push({ status: response.status(), url: response.url() })
})

const canvas = page.locator('canvas').first()
const canvasPoint = async (x, y) => {
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Gameplay canvas has no visible bounding box.')
  return { x: box.x + x / VIEWPORT.width * box.width, y: box.y + y / VIEWPORT.height * box.height }
}
const clickCanvas = async (x, y) => {
  const point = await canvasPoint(x, y)
  await page.mouse.click(point.x, point.y)
}
const hold = async (key, ms) => {
  await page.keyboard.down(key)
  await sleep(ms)
  await page.keyboard.up(key)
  await sleep(100)
}
const pressAction = async (settleMs = 400) => {
  await page.keyboard.press('KeyE')
  await sleep(settleMs)
}
const shot = async name => {
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}.png`), fullPage: false })
}
const objectiveCrop = async () => page.screenshot({ clip: OBJECTIVE_PANEL })

const visibleImageDiff = (beforeBuffer, afterBuffer) => {
  const before = PNG.sync.read(beforeBuffer)
  const after = PNG.sync.read(afterBuffer)
  if (before.width !== after.width || before.height !== after.height) return Number.POSITIVE_INFINITY
  let total = 0
  let samples = 0
  for (let y = 0; y < before.height; y += 2) {
    for (let x = 0; x < before.width; x += 2) {
      const offset = (y * before.width + x) * 4
      total += Math.abs(before.data[offset] - after.data[offset])
      total += Math.abs(before.data[offset + 1] - after.data[offset + 1])
      total += Math.abs(before.data[offset + 2] - after.data[offset + 2])
      samples += 3
    }
  }
  return samples ? total / samples : 0
}

const actionChangesObjective = async (label, step) => {
  const before = await objectiveCrop()
  await pressAction()
  const after = await objectiveCrop()
  const score = visibleImageDiff(before, after)
  mark(`${label}-action-probe`, { step, objectivePixelDiff: Number(score.toFixed(3)) })
  return score >= 2.2
}

const sweepStreetInteraction = async (key, label) => {
  await hold(key, STREET_APPROACH_MS)
  for (let step = 0; step <= STREET_MAX_STEPS; step += 1) {
    if (step % 8 === 0) await shot(`DIAG-${label}-step-${String(step).padStart(2, '0')}`)
    if (await actionChangesObjective(label, step)) {
      mark(`${label}-confirmed`, { step })
      return
    }
    if (step < STREET_MAX_STEPS) await hold(key, STREET_STEP_MS)
  }
  throw new Error(`${label} did not change the visible objective panel across the calibrated interaction sweep.`)
}

let video
let captureError = null
try {
  mark('navigation-start', { gameUrl: GAME_URL })
  const response = await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  if (!response || response.status() >= 400) throw new Error(`Runtime navigation failed: HTTP ${response?.status() ?? 'NO_RESPONSE'}`)
  await canvas.waitFor({ state: 'visible', timeout: 60_000 })
  await sleep(3000)
  await shot('CAP-000-main-menu')

  await clickCanvas(478, 221)
  await sleep(5000)
  mark('game-world-visible')
  await shot('CAP-001-game-world')

  await clickCanvas(1138, 22)
  await sleep(2500)
  await shot('CAP-002-player-phone')
  await clickCanvas(912, 209)
  await sleep(900)

  await sweepStreetInteraction('KeyD', 'merchant-introduction')
  await sleep(900)
  await shot('CAP-003-merchant-introduced')

  await sweepStreetInteraction('KeyA', 'hq-return')
  await sleep(1200)
  await shot('CAP-004-hq-interior')

  await hold('KeyD', 1900)
  await hold('KeyW', 760)
  for (let step = 0; step < 8; step += 1) {
    await pressAction(300)
    if (step < 7) await hold('KeyD', 250)
  }
  await sleep(900)
  mark('hq-parcel-operations-sweep-complete')
  await shot('CAP-005-job-acceptance-result')

  await page.keyboard.press('Escape')
  await sleep(2000)

  await sweepStreetInteraction('KeyD', 'parcel-pickup')
  await sleep(1200)
  await shot('CAP-006-parcel-picked-up')
  await sleep(1200)
  await shot('CAP-007-next-delivery-objective')

  mark('capture-complete')
} catch (error) {
  captureError = error
  mark('capture-error', { message: error instanceof Error ? error.message : String(error) })
  await shot('DIAG-capture-error-final')
} finally {
  video = page.video()
  await context.close()
  await browser.close()
}

let sourceVideo = null
let sourceVideoBytes = 0
if (video) {
  const rawVideoPath = await video.path()
  sourceVideo = path.join(OUTPUT_DIR, 'DROPi_Tycoon_Trailer_001_Gameplay_Source.webm')
  await copyFile(rawVideoPath, sourceVideo)
  sourceVideoBytes = (await stat(sourceVideo)).size
}

const manifest = {
  schemaVersion: 6,
  captureType: 'AUTHENTIC_GAMEPLAY_SOURCE',
  gameUrl: GAME_URL,
  viewport: VIEWPORT,
  sourceVideo: sourceVideo ? path.basename(sourceVideo) : null,
  sourceVideoBytes,
  recordedAtUtc: new Date().toISOString(),
  captureSucceeded: !captureError,
  captureError: captureError ? (captureError instanceof Error ? captureError.message : String(captureError)) : null,
  marks,
  pageErrors,
  failedResponses,
  truthfulness: {
    generatedPseudoGameplayUsed: false,
    internalGameStateMutationUsed: false,
    captureMethod: 'visible Phaser canvas + real keyboard/pointer controls + rendered-HUD pixel-change confirmation',
    hqAcceptanceMethod: 'physical HQ Parcel Operations interaction sweep',
    calibrationStopsAfterPickup: true,
  },
}
await writeFile(path.join(OUTPUT_DIR, 'capture-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

if (sourceVideoBytes > 0) console.log(`[DT23] Gameplay source bytes preserved: ${sourceVideoBytes}`)
if (captureError) throw captureError
if (!sourceVideo || sourceVideoBytes < 50_000) throw new Error(`Captured video is unexpectedly small: ${sourceVideoBytes} bytes`)
