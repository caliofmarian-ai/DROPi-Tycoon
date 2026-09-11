import { chromium } from 'playwright'
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const GAME_URL = process.env.DT23_GAME_URL ?? 'https://dropi-tycoon-production.up.railway.app/'
const OUTPUT_DIR = path.resolve(process.env.DT23_OUTPUT_DIR ?? '../artifacts/dt23/trailer-001')
const RAW_DIR = path.join(OUTPUT_DIR, 'raw')
const VIEWPORT = { width: 1280, height: 720 }

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

await mkdir(RAW_DIR, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--disable-dev-shm-usage',
  ],
})

const context = await browser.newContext({
  viewport: VIEWPORT,
  recordVideo: {
    dir: RAW_DIR,
    size: VIEWPORT,
  },
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

page.on('pageerror', error => {
  pageErrors.push(String(error?.stack ?? error))
})

page.on('response', response => {
  if (response.status() >= 500) {
    failedResponses.push({ status: response.status(), url: response.url() })
  }
})

page.on('console', message => {
  if (message.type() === 'error') console.log(`[browser:error] ${message.text()}`)
})

const canvas = page.locator('canvas').first()

const canvasPoint = async (x, y) => {
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Gameplay canvas has no visible bounding box.')
  return {
    x: box.x + x / VIEWPORT.width * box.width,
    y: box.y + y / VIEWPORT.height * box.height,
  }
}

const clickCanvas = async (x, y) => {
  const point = await canvasPoint(x, y)
  await page.mouse.click(point.x, point.y)
}

const hold = async (key, ms) => {
  await page.keyboard.down(key)
  await sleep(ms)
  await page.keyboard.up(key)
  await sleep(180)
}

const pressAction = async () => {
  await page.keyboard.press('KeyE')
  await sleep(1200)
}

const shot = async name => {
  await page.screenshot({
    path: path.join(OUTPUT_DIR, `${name}.png`),
    fullPage: false,
  })
}

let video
try {
  mark('navigation-start', { gameUrl: GAME_URL })
  const response = await page.goto(GAME_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  })
  if (!response || response.status() >= 400) {
    throw new Error(`Runtime navigation failed: HTTP ${response?.status() ?? 'NO_RESPONSE'}`)
  }

  await canvas.waitFor({ state: 'visible', timeout: 60_000 })
  await sleep(3000)
  mark('main-menu-visible')
  await shot('CAP-000-main-menu')

  // Canonical 1280x720 MainMenu first-action center for a fresh browser context.
  // This clicks the actual Phaser "Start Game" button; it does not call internal scene APIs.
  await clickCanvas(478, 221)
  await sleep(5000)
  mark('game-world-visible')
  await shot('CAP-001-game-world')

  // Real in-game Player Phone button. The phone opens over the live GameWorldScene.
  await clickCanvas(1138, 22)
  await sleep(3000)
  mark('player-phone-open')
  await shot('CAP-002-player-phone')

  // Real phone Close target for the canonical 1280x720 landscape layout.
  await clickCanvas(912, 209)
  await sleep(1000)
  mark('player-phone-closed')

  // Walk only through the runtime's real keyboard controls and walkable city surfaces.
  // HQ (380,270) -> central vertical -> Mara/PickupZone (620,910).
  await hold('KeyD', 2800)
  await hold('KeyS', 4260)
  await hold('KeyA', 1200)
  mark('merchant-arrival-attempt')
  await pressAction()
  await shot('CAP-003-merchant-interaction')

  // Mara -> HQ. The first E at HQ legitimately enters the physical HQ interior.
  await hold('KeyD', 1200)
  await hold('KeyW', 4260)
  await hold('KeyA', 2800)
  mark('hq-entrance-attempt')
  await pressAction()
  await sleep(1800)
  await shot('CAP-004-hq-interior')

  // HQ interior spawn is (600,620). Walk to the real Parcel Operations staging interaction
  // around (945,485), then use E. This invokes BaseInteriorScene.useOperationsDesk(), which
  // delegates to the same authoritative performUrbanInteraction path used by the game.
  await hold('KeyD', 1900)
  await hold('KeyW', 760)
  mark('hq-parcel-operations-attempt')
  await pressAction()
  await sleep(1600)
  await shot('CAP-005-job-accepted')

  // ESC is the real HQ interior exit control. It returns to the sleeping GameWorldScene
  // while preserving the authoritative accepted order.
  await page.keyboard.press('Escape')
  await sleep(2200)
  mark('hq-exited-after-acceptance')

  // HQ -> merchant again, then authoritative pickup.
  await hold('KeyD', 2800)
  await hold('KeyS', 4260)
  await hold('KeyA', 1200)
  mark('pickup-arrival-attempt')
  await pressAction()
  await sleep(1400)
  await shot('CAP-006-parcel-picked-up')

  // PickupZone (620,910) -> first canonical DeliveryZone (560,290).
  // The route stays on real walkable surfaces: east to the central vertical corridor,
  // north to the residential lane, then west to the customer.
  await hold('KeyD', 1200)
  await hold('KeyW', 4140)
  await hold('KeyA', 1600)
  mark('delivery-arrival-attempt')
  await pressAction()
  await sleep(3500)
  await shot('CAP-007-delivery-result')

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
if (videoInfo.size < 50_000) {
  throw new Error(`Captured video is unexpectedly small: ${videoInfo.size} bytes`)
}

const manifest = {
  schemaVersion: 2,
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
    captureMethod: 'visible Phaser canvas + real pointer/keyboard inputs',
    hqAcceptanceMethod: 'physical HQ Parcel Operations interaction',
  },
}

await writeFile(
  path.join(OUTPUT_DIR, 'capture-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
)

console.log(`[DT23] Authentic gameplay source recorded: ${sourceVideo}`)
console.log(`[DT23] Bytes: ${videoInfo.size}`)
if (pageErrors.length) console.log(`[DT23] Page errors observed: ${pageErrors.length}`)
if (failedResponses.length) console.log(`[DT23] HTTP 5xx responses observed: ${failedResponses.length}`)
