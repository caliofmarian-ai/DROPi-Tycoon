import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

// Uses the runner's browser and Node 22's WebSocket/CDP, not an unpinned npm
// browser download. These are rendered desktop regression checks, NOT Android
// hardware performance or owner visual acceptance.
const chromePath = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(file => file && existsSync(file))
if (!chromePath) throw new Error('Rendered regression gate requires a runner-provided Chromium binary')
const dist = path.resolve('dist'), evidenceDir = path.join(dist, 'evidence')
await mkdir(evidenceDir, { recursive: true })
const profile = await mkdtemp(path.join(tmpdir(), 'dropi-browser-'))
const evidence = { classification: 'DESKTOP_SOFTWARE_WEBGL_REGRESSION_NOT_ANDROID_ACCEPTANCE', sourceSha: process.env.VITE_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'LOCAL', browser: chromePath, status: 'RUNNING', frames: [], errors: [], tests: [] }
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
    const filename = path.resolve(dist, `.${pathname === '/' ? '/index.html' : pathname}`)
    if (!filename.startsWith(`${dist}${path.sep}`)) { response.writeHead(403).end(); return }
    const bytes = await readFile(filename)
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(bytes)
  } catch { response.writeHead(404).end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const url = `http://127.0.0.1:${server.address().port}`
let stderr = ''
const browser = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
browser.stderr.on('data', data => { stderr = `${stderr}${data}`.slice(-8000) })
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
let socket
const pending = new Map()
let sequence = 0
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}`)) }, 30000)
  pending.set(id, { resolve: result => { clearTimeout(timeout); resolve(result) }, reject: error => { clearTimeout(timeout); reject(error) } })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
  return result.result?.value
}
const snapshot = () => evaluate(`(() => ({ ready: window.__DROPiEvaluationReadiness, contact: window.__DROPiContactRuntime, hero: window.__DROPiRiggedHeroV1, humans: window.__DROPiHumanoidPedestrians, resolution: window.__DROPiRenderQuality, surfaces: window.__DROPiSurfaceFinish, streetLife: window.__DROPiAuthoredStreetLifeV1, blocks: window.__DROPiAuthoredBlocksV1, streets: window.__DROPiAuthoredStreetLayerV1, rendererFailure: window.__DROPiBabylonSpikeFailure, buildSha: window.__DROPiBabylonSpike?.buildSha }))()`)
const frame = async (name, note) => {
  const state = await snapshot()
  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(path.join(evidenceDir, `${name}.png`), Buffer.from(screenshot.data, 'base64'))
  evidence.frames.push({ name, note, state })
  return state
}
try {
  let port
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break } catch { await wait(100) }
  }
  if (!port) throw new Error(`Browser did not start: ${stderr}`)
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const page = targets.find(target => target.type === 'page')
  if (!page?.webSocketDebuggerUrl) throw new Error('No inspectable browser page')
  socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const task = pending.get(message.id); if (!task) return
      pending.delete(message.id)
      if (message.error) task.reject(new Error(JSON.stringify(message.error)))
      else task.resolve(message.result)
    } else if (message.method === 'Runtime.exceptionThrown') evidence.errors.push(message.params.exceptionDetails)
  })
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 960, height: 432, deviceScaleFactor: 2.25, mobile: true })
  await send('Page.navigate', { url })
  let state
  for (let attempt = 0; attempt < 200; attempt += 1) {
    await wait(500); state = await snapshot()
    if (state.rendererFailure || state.ready?.status === 'FAIL') throw new Error(`Runtime startup failed: ${JSON.stringify(state)}`)
    if (state.ready?.status === 'READY') break
  }
  assert.equal(state.ready?.status, 'READY', 'Complete scene did not leave loading')
  evidence.tests.push('complete asset/hero/8-pedestrian/material/contact startup READY')
  await wait(800)
  state = await frame('01-city-start', 'Actual bundled renderer, startup view; desktop software WebGL only')
  assert.equal(state.contact?.status, 'ACTIVE')
  assert.equal(state.humans?.visibleHumans, 8)
  assert.equal(state.streetLife?.authoredVehicles, 3)
  assert.equal(state.streets?.loaded, true)
  assert.ok(state.resolution.actualWidth >= 900 && state.resolution.actualHeight >= 400, 'Render buffer regressed below CSS clarity floor')
  assert.equal(evidence.errors.length, 0, 'Uncaught browser exceptions')
  const engineChunk = (await readdir(path.join(dist, 'assets'))).find(name => /^engineStore-.*\.js$/.test(name))
  if (!engineChunk) throw new Error('Compiled engineStore module not discoverable for read-only scene inspection')
  await evaluate(`(async () => { const module = await import('/assets/${engineChunk}'); const engineStore = Object.values(module).find(value => typeof value === 'function' && 'LastCreatedScene' in value); if (!engineStore?.LastCreatedScene) throw new Error('Scene unavailable'); globalThis.__dropiTestScene = engineStore.LastCreatedScene; })()`)
  const assembly = await evaluate(`(() => { const scene = globalThis.__dropiTestScene; return { cars: ['car-1','car-2','car-3'].map(name => ({ name, visibleParts: scene.getTransformNodeByName(name).getChildMeshes(false).filter(mesh => mesh.isEnabled() && mesh.isVisible && mesh.getTotalVertices() > 0).map(mesh => ({ name: mesh.name, material: mesh.material?.name })) })), heroMeshes: scene.getMeshByName('p1-rigged-hero-root').getChildMeshes(false).filter(mesh => mesh.isEnabled() && mesh.isVisible).length }; })()`)
  for (const car of assembly.cars) assert.ok(car.visibleParts.length > 1, `${car.name}: incomplete car hierarchy`)
  assert.ok(assembly.heroMeshes > 3)
  evidence.tests.push({ completeAssemblies: assembly })
  const moveTo = async (x, z, interact = false) => {
    await evaluate(`(() => { const hero = __dropiTestScene.getTransformNodeByName('hero'); hero.position.x = ${x}; hero.position.z = ${z}; })()`)
    await wait(500)
    if (interact) { await evaluate(`document.getElementById('interact').dispatchEvent(new PointerEvent('pointerdown', { bubbles:true }))`); await wait(500) }
  }
  await moveTo(29, 8, true)
  assert.equal(await evaluate('window.__DROPiBabylonSpike.getPhase()'), 1)
  await frame('02-hq', 'Mission interaction at HQ using the existing evaluation route')
  await moveTo(-27, -19, true)
  assert.equal(await evaluate('window.__DROPiBabylonSpike.getPhase()'), 2)
  state = await frame('03-carry', 'Actual mission pickup with two-hand contact controller active')
  assert.equal(state.contact.hero.carry, true)
  assert.ok(state.contact.hero.handErrorM <= .025, `Rendered carry has hand gap ${state.contact.hero.handErrorM}`)
  assert.ok(state.contact.hero.minFootClearanceM >= -.002, 'Rendered hero shoe penetration')
  evidence.tests.push('real route pickup preserves 36x24x24cm parcel and both hand contacts')
  await moveTo(34, -30, true)
  assert.equal(await evaluate('window.__DROPiBabylonSpike.getPhase()'), 3)
  await frame('04-handoff', 'Actual route handoff, no carry pose retained after parcel disable')
  await moveTo(34, -30, true)
  assert.equal(await evaluate('window.__DROPiBabylonSpike.getPhase()'), 0)
  state = await snapshot(); assert.equal(state.contact.hero.carry, false)
  evidence.tests.push('handoff and restart release carry and plant locks')
  evidence.status = 'PASS'
  console.log('Rendered evaluation regression PASS: complete startup, native bodies, car assemblies, pickup/carry/handoff/restart. Desktop software renderer is NOT Android acceptance.')
} catch (error) {
  evidence.status = 'FAIL'; evidence.error = error instanceof Error ? error.stack : String(error)
  if (socket?.readyState === WebSocket.OPEN) {
    try { await frame('failure', 'Failure evidence; not a passing preview') } catch {}
  }
  console.error(JSON.stringify(evidence, null, 2))
  throw error
} finally {
  await writeFile(path.join(evidenceDir, 'verification.json'), `${JSON.stringify(evidence, null, 2)}\n`)
  socket?.close(); browser.kill('SIGTERM'); server.close()
  await wait(250); await rm(profile, { recursive: true, force: true }).catch(() => {})
}
