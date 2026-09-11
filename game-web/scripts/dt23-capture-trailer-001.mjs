import { chromium } from 'playwright'
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const GAME_URL = process.env.DT23_GAME_URL ?? 'https://dropi-tycoon-production.up.railway.app/'
const OUTPUT_DIR = path.resolve(process.env.DT23_OUTPUT_DIR ?? '../artifacts/dt23/trailer-001')
const RAW_DIR = path.join(OUTPUT_DIR, 'raw')
const VIEWPORT = { width: 1280, height: 720 }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
await mkdir(RAW_DIR, { recursive: true })

const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-dev-shm-usage'] })
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
  await sleep(120)
}
const shot = async name => page.screenshot({ path: path.join(OUTPUT_DIR, `${name}.png`), fullPage: false })

let video
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
  await sleep(3500)

  await clickCanvas(1138, 22)
  await sleep(1200)
  mark('player-phone-open')
  await shot('CAP-002-player-phone')
  await sleep(5500)

  await clickCanvas(912, 209)
  await sleep(1000)
  mark('player-phone-closed')

  mark('movement-start')
  await hold('KeyD', 4000)
  mark('movement-end')
  await shot('CAP-003-authentic-movement')
  await sleep(1200)

  mark('capture-complete')
  video = page.video()
} finally {
  await context.close()
  await browser.close()
}

if (!video) throw new Error('Playwright did not create a video stream.')
const rawVideoPath = await video.path()
const sourceVideo = path.join(OUTPUT_DIR, 'DROPi_Tycoon_Teaser_001_Gameplay_Source.webm')
await copyFile(rawVideoPath, sourceVideo)
const sourceVideoBytes = (await stat(sourceVideo)).size
if (sourceVideoBytes < 50_000) throw new Error(`Captured video is unexpectedly small: ${sourceVideoBytes} bytes`)

const manifest = {
  schemaVersion: 8,
  creativeId: 'DT23-TEASER-001',
  captureType: 'AUTHENTIC_GAMEPLAY_SOURCE',
  gameUrl: GAME_URL,
  viewport: VIEWPORT,
  sourceVideo: path.basename(sourceVideo),
  sourceVideoBytes,
  recordedAtUtc: new Date().toISOString(),
  marks,
  pageErrors,
  failedResponses,
  truthfulness: {
    generatedPseudoGameplayUsed: false,
    internalGameStateMutationUsed: false,
    captureMethod: 'visible Phaser canvas + real pointer/keyboard controls',
    claimsShown: ['live game world', 'real Player Phone', 'real player movement'],
  },
}
await writeFile(path.join(OUTPUT_DIR, 'capture-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`[DT23] Authentic gameplay source recorded: ${sourceVideo} (${sourceVideoBytes} bytes)`)
