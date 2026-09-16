import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const dist = path.resolve('dist')
const evidenceDir = path.join(dist, 'evidence')
await mkdir(evidenceDir, { recursive: true })
const chromePath = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser']
  .find(candidate => candidate && existsSync(candidate))
if (!chromePath) throw new Error('High-fidelity runtime proof requires Chromium')

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary',
}
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
    const file = path.resolve(dist, `.${pathname === '/' ? '/index.html' : pathname}`)
    if (!file.startsWith(`${dist}${path.sep}`)) { response.writeHead(403).end(); return }
    const bytes = await readFile(file)
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(bytes)
  } catch { response.writeHead(404).end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const url = `http://127.0.0.1:${server.address().port}`
const profile = await mkdtemp(path.join(tmpdir(), 'dropi-highfi-browser-'))
const browser = spawn(chromePath, [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] })
let stderr = ''
browser.stderr.on('data', data => { stderr = `${stderr}${data}`.slice(-8000) })
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
let socket
let sequence = 0
const pending = new Map()
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}`)) }, 30_000)
  pending.set(id, { resolve: result => { clearTimeout(timeout); resolve(result) }, reject: error => { clearTimeout(timeout); reject(error) } })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text)
  return response.result?.value
}

const evidence = {
  classification: 'INTERNAL_HIGH_FIDELITY_RENDERED_PROOF_NOT_ANDROID_VISUAL_ACCEPTANCE',
  sourceSha: process.env.VITE_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'LOCAL',
  candidateSha256: process.env.DROPI_HIGH_FIDELITY_HERO_SHA256 ?? 'UNKNOWN',
  status: 'RUNNING',
}

try {
  let port
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break } catch { await wait(100) }
  }
  if (!port) throw new Error(`Browser did not start: ${stderr}`)
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const page = targets.find(target => target.type === 'page')
  if (!page?.webSocketDebuggerUrl) throw new Error('No inspectable Chrome page')
  socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const task = pending.get(message.id)
    if (!task) return
    pending.delete(message.id)
    if (message.error) task.reject(new Error(JSON.stringify(message.error)))
    else task.resolve(message.result)
  })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 960, height: 432, deviceScaleFactor: 2.25, mobile: true })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await send('Page.navigate', { url })

  const deadline = Date.now() + 100_000
  let state
  while (Date.now() < deadline) {
    state = await evaluate(`(()=>({
      high: window.__DROPiHighFidelityHeroV1,
      failure: window.__DROPiBabylonSpikeFailure,
      ready: window.__DROPiEvaluationReadiness,
      contact: window.__DROPiContactRuntime,
    }))()`)
    if (state?.failure) throw new Error(`Renderer failure: ${JSON.stringify(state.failure)}`)
    if (state?.high?.status === 'FALLBACK') throw new Error(`High-fidelity fallback: ${state.high.error ?? 'unknown'}`)
    if (state?.high?.loaded && state?.high?.status === 'ACTIVE') break
    await wait(150)
  }
  assert.equal(state?.high?.loaded, true, `High-fidelity hero never became ACTIVE: ${JSON.stringify(state)}`)
  assert.equal(state.high.status, 'ACTIVE')
  assert.equal(state.high.file, 'hero-courier-v1.glb')
  assert.ok(state.high.meshCount >= 6, `Expected multi-mesh human, got ${state.high.meshCount}`)
  assert.ok(state.high.skeletonCount >= 1, 'High-fidelity hero skeleton missing')
  assert.ok(state.high.triangleCount >= 30_000, `High-fidelity geometry unexpectedly low: ${state.high.triangleCount}`)
  assert.equal(state.high.animationMode, 'PROCEDURAL_GAME_ENGINE_GAIT')

  const runtime = await evaluate(`(()=>{
    const scene = Object.values(globalThis).find(value => value?.LastCreatedScene)?.LastCreatedScene
    const root = window.__DROPiHighFidelityHeroV1?.loaded
    const oldRoot = document ? true : false
    return { root, oldRoot }
  })()`)
  assert.equal(runtime.root, true)

  await wait(800)
  const full = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(path.join(evidenceDir, 'high-fidelity-hero-runtime.png'), Buffer.from(full.data, 'base64'))

  // Bring the third-person camera closer and around the hero for a face-readable
  // evidence frame. This mutates only the headless review camera, not game state.
  await evaluate(`(()=>{
    const api = window.__DROPiBabylonSpike
    const scene = globalThis.__dropiTestScene
    if (scene?.activeCamera && api) {
      const hero = scene.getTransformNodeByName('hero')
      const camera = scene.activeCamera
      if (hero && 'alpha' in camera && 'radius' in camera) {
        camera.alpha = hero.rotation.y + Math.PI / 2
        camera.beta = 1.17
        camera.radius = 3.15
      }
    }
  })()`)
  await wait(80)
  const close = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(path.join(evidenceDir, 'high-fidelity-hero-close.png'), Buffer.from(close.data, 'base64'))

  evidence.status = 'PASS'
  evidence.runtime = state.high
} catch (error) {
  evidence.status = 'FAIL'
  evidence.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  throw error
} finally {
  await writeFile(path.join(evidenceDir, 'high-fidelity-hero-runtime.json'), `${JSON.stringify(evidence, null, 2)}\n`)
  try { socket?.close() } catch {}
  browser.kill('SIGTERM')
  server.close()
  await rm(profile, { recursive: true, force: true })
}
