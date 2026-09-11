import { chromium } from 'playwright'
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const GAME_URL = process.env.DT23_GAME_URL ?? 'https://dropi-tycoon-production.up.railway.app/'
const OUTPUT_DIR = path.resolve(process.env.DT23_OUTPUT_DIR ?? '../artifacts/dt23/trailer-001')
const RAW_DIR = path.join(OUTPUT_DIR, 'raw')
const VIEWPORT = { width: 1280, height: 720 }
const STREET_TRAVEL_MS = 2600

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
  marks.push({ label, atMs, ...extra })
  console.log(`[DT23] ${label} @ ${(atMs / 1000).toFixed(2)}s`)
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
  await sleep(220)
}
const pressAction = async () => {
  await page.keyboard.press('KeyE')
  await sleep(1300)
}
const shot = async name => {
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}.png`), fullPage: false })
}

let video
try {
  mark('navigation-start', { gameUrl: GAME_URL })
  const response = await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  if (!response || response.status() >= 400) throw new Error(`Runtime navigation failed: HTTP ${response?.status() ?? 'NO_RESPONSE'}`)
  await canvas.waitFor({ state: 'visible', timeout: 60_000 })
  await sleep(3000)
  await shot('CAP-000-main-menu')

  await clickCanvas(478, 221) // actual Start Game button
  await sleep(5000)
  mark('game-world-visible')
  await shot('CAP-001-game-world')

  await clickCanvas(1138, 22) // actual Player Phone button
  await sleep(2500)
  await shot('CAP-002-player-phone')
  await clickCanvas(912, 209) // actual phone Close target
  await sleep(900)

  // Current shipped Brăila geometry places Mara east of HQ on the same walkable street.
  // HUD reports the initial target at about 421u; 2.6s at the real 150u/s walking speed
  // places the hero inside the canonical 48u interaction radius without teleporting state.
  await hold('KeyD', STREET_TRAVEL_MS)
  await pressAction()
  await sleep(1200)
  mark('merchant-introduction-attempt')
  await shot('CAP-003-merchant-interaction')

  // Return west along the same street to the physical HQ entrance.
  await hold('KeyA', STREET_TRAVEL_MS)
  await pressAction()
  await sleep(1700)
  mark('hq-entered')
  await shot('CAP-004-hq-interior')

  // Use the real physical Parcel Operations terminal in HQ.
  await hold('KeyD', 1900)
  await hold('KeyW', 760)
  await pressAction()
  await sleep(1500)
  mark('hq-parcel-operations-used')
  await shot('CAP-005-job-accepted')

  await page.keyboard.press('Escape') // real HQ exit control
  await sleep(2000)

  // Walk east back to Mara for the authoritative parcel pickup.
  await hold('KeyD', STREET_TRAVEL_MS)
  await pressAction()
  await sleep(1700)
  mark('pickup-interaction-attempt')
  await shot('CAP-006-parcel-picked-up')

  // This calibration frame intentionally stops after pickup. It exposes the next real objective
  // so DT-23 can set the final delivery leg from observed gameplay rather than inventing geometry.
  await sleep(1800)
  await shot('CAP-007-next-delivery-objective')

  mark('capture-complete')
  video = page.video()
} finally {
  await context.close()
  await browser.close()
}

if (!video) throw new Error('Playwright did not create a video stream.')
const rawVideoPath = await video.path()
const sourceVideo = path.join(OUTPUT_DIR, 'DROPi_Tycoon_Trailer_001_Gameplay_Source.webm')
await copyFile(rawVideoPath, sourceVideo)
const videoInfo = await stat(sourceVideo)
if (videoInfo.size < 50_000) throw new Error(`Captured video is unexpectedly small: ${videoInfo.size} bytes`)

const manifest = {
  schemaVersion: 4,
  captureType: 'AUTHENTIC_GAMEPLAY_SOURCE',
  gameUrl: GAME_URL,
  viewport: VIEWPORT,
  sourceVideo: path.basename(sourceVideo),
  sourceVideoBytes: videoInfo.size,
  recordedAtUtc: new Date().toISOString(),
  marks,
  pageErrors,
  failedResponses,
  truthfulness: {
    generatedPseudoGameplayUsed: false,
    internalGameStateMutationUsed: false,
    captureMethod: 'visible Phaser canvas + real keyboard/pointer controls',
    hqAcceptanceMethod: 'physical HQ Parcel Operations interaction',
    calibrationStopsAfterPickup: true,
  },
}
await writeFile(path.join(OUTPUT_DIR, 'capture-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`[DT23] Authentic gameplay source recorded: ${sourceVideo}`)
