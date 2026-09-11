import { chromium } from 'playwright'
import { PNG } from 'pngjs'
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

const isObjectiveGold = (r, g, b) =>
  r >= 225 && r <= 255 && g >= 160 && g <= 225 && b >= 25 && b <= 120

/**
 * Detect the visible gold objective marker strictly from rendered pixels.
 * This deliberately does not inspect Phaser scene state, registries, mission objects,
 * world coordinates or save data. The capture agent sees what a player sees.
 */
const findVisibleGoldObjective = async () => {
  const buffer = await page.screenshot({ fullPage: false })
  const png = PNG.sync.read(buffer)
  const bins = new Map()
  const points = []
  const binSize = 32

  for (let y = 110; y < Math.min(png.height - 100, 620); y += 1) {
    for (let x = 80; x < Math.min(png.width - 80, 1200); x += 1) {
      const offset = (y * png.width + x) * 4
      const r = png.data[offset]
      const g = png.data[offset + 1]
      const b = png.data[offset + 2]
      if (!isObjectiveGold(r, g, b)) continue
      points.push({ x, y })
      const bx = Math.floor(x / binSize)
      const by = Math.floor(y / binSize)
      const key = `${bx},${by}`
      bins.set(key, (bins.get(key) ?? 0) + 1)
    }
  }

  if (!points.length) return null

  let best = null
  for (const key of bins.keys()) {
    const [bx, by] = key.split(',').map(Number)
    let score = 0
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        score += bins.get(`${bx + dx},${by + dy}`) ?? 0
      }
    }
    if (!best || score > best.score) best = { bx, by, score }
  }

  if (!best || best.score < 45) return null
  const centerX = (best.bx + 0.5) * binSize
  const centerY = (best.by + 0.5) * binSize
  const cluster = points.filter(({ x, y }) => Math.hypot(x - centerX, y - centerY) <= 105)
  if (cluster.length < 35) return null

  return {
    x: cluster.reduce((sum, point) => sum + point.x, 0) / cluster.length,
    y: cluster.reduce((sum, point) => sum + point.y, 0) / cluster.length,
    pixels: cluster.length,
    score: best.score,
  }
}

/**
 * Move through the actual public tap-to-move input. If the objective is not visible,
 * zoom out using the real HUD minus control until the gold marker is visible.
 */
const navigateToVisibleObjective = async label => {
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const target = await findVisibleGoldObjective()
    if (!target) {
      mark(`${label}-objective-not-visible`, { attempt })
      await clickCanvas(1155, 200) // real HUD zoom-out button at canonical 1280x720 layout
      await sleep(900)
      continue
    }

    const centerDistance = Math.hypot(target.x - VIEWPORT.width / 2, target.y - VIEWPORT.height / 2)
    mark(`${label}-objective-visible`, {
      attempt,
      screenX: Math.round(target.x),
      screenY: Math.round(target.y),
      pixels: target.pixels,
      centerDistance: Math.round(centerDistance),
    })

    if (centerDistance <= 105) {
      await sleep(650)
      return target
    }

    await clickCanvas(target.x, target.y)
    await sleep(2200)
  }

  const last = await findVisibleGoldObjective()
  if (!last) throw new Error(`Could not visually resolve objective marker for ${label}.`)
  await clickCanvas(last.x, last.y)
  await sleep(1800)
  return last
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

  // Follow the visible mission marker through the game's own tap-to-move system.
  await navigateToVisibleObjective('merchant-onboarding')
  await pressAction()
  await sleep(1500)
  mark('merchant-interaction')
  await shot('CAP-003-merchant-interaction')

  // The next visible objective returns the player to HQ.
  await navigateToVisibleObjective('hq-return')
  await pressAction()
  await sleep(1800)
  mark('hq-entered')
  await shot('CAP-004-hq-interior')

  // HQ interior spawn is (600,620). Walk to the real Parcel Operations staging interaction
  // around (945,485), then use E. This invokes BaseInteriorScene.useOperationsDesk(), which
  // delegates to the same authoritative performUrbanInteraction path used by the game.
  await hold('KeyD', 1900)
  await hold('KeyW', 760)
  await pressAction()
  await sleep(1600)
  mark('hq-parcel-operations-used')
  await shot('CAP-005-job-accepted')

  // ESC is the real HQ interior exit control. It returns to the sleeping GameWorldScene
  // while preserving the authoritative accepted order.
  await page.keyboard.press('Escape')
  await sleep(2200)
  mark('hq-exited-after-acceptance')

  // Follow the now-authoritative pickup objective on the live map.
  await navigateToVisibleObjective('pickup')
  await pressAction()
  await sleep(1600)
  mark('parcel-pickup-interaction')
  await shot('CAP-006-parcel-picked-up')

  // Follow the delivery objective using the same player-visible marker and tap-to-move path.
  await navigateToVisibleObjective('delivery')
  await pressAction()
  await sleep(4200)
  mark('delivery-interaction')
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
  schemaVersion: 3,
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
    captureMethod: 'rendered-pixel objective detection + visible Phaser pointer/keyboard inputs',
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
