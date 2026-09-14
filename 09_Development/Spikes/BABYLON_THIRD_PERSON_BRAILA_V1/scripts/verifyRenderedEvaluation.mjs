import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

// Runner-provided Chromium + Node CDP. Software WebGL regression is NOT Android
// hardware performance or visual acceptance. Never infer a rendered pose from
// an arbitrary wall-clock delay after an interaction.
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
let socket, sequence = 0
const pending = new Map()
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
const snapshot = () => evaluate(`(() => ({ ready: window.__DROPiEvaluationReadiness, contact: window.__DROPiContactRuntime, hero: window.__DROPiRiggedHeroV1, humans: window.__DROPiHumanoidPedestrians, resolution: window.__DROPiRenderQuality, surfaces: window.__DROPiSurfaceFinish, streetLife: window.__DROPiAuthoredStreetLifeV1, blocks: window.__DROPiAuthoredBlocksV1, streets: window.__DROPiAuthoredStreetLayerV1, rendererFailure: window.__DROPiBabylonSpikeFailure, buildSha: window.__DROPiBabylonSpike?.buildSha, phase: window.__DROPiBabylonSpike?.getPhase(), position: globalThis.__dropiTestScene ? (() => { const p = __dropiTestScene.getTransformNodeByName('hero').position; return {x:p.x,y:p.y,z:p.z} })() : null }))()`)
const freshCompletedSample = (contact, after) => Number.isInteger(contact?.sampleId) && contact.sampleId > after && contact.renderedSampleId === contact.sampleId
// Negative checks keep synchronization from accepting stale/unfinished poses.
assert.equal(freshCompletedSample({ sampleId: 4, renderedSampleId: 4 }, 4), false)
assert.equal(freshCompletedSample({ sampleId: 5, renderedSampleId: 4 }, 4), false)
assert.equal(freshCompletedSample({ sampleId: 5, renderedSampleId: 5 }, 4), true)
assert.equal(freshCompletedSample({ sampleId: NaN, renderedSampleId: NaN }, 4), false)
evidence.tests.push('fresh-frame guard rejects repeated, unfinished and missing pose samples')

const assertHealthy = state => {
  assert.equal(evidence.errors.length, 0, 'Uncaught browser exceptions')
  if (state.rendererFailure || state.ready?.status === 'FAIL' || state.contact?.status === 'FAIL' || state.contact?.error) throw new Error(`Runtime failure: ${JSON.stringify(state)}`)
  if (state.contact?.mechanicalStatus === 'FAIL') throw new Error(`Actual contact constraint failed: ${JSON.stringify(state.contact)}`)
}
const waitForPose = async (label, predicate, after = -1, timeoutMs = 20000) => {
  const deadline = Date.now() + timeoutMs
  let last, observed = after, matchingFreshFrames = 0
  while (Date.now() < deadline) {
    last = await snapshot(); assertHealthy(last)
    if (freshCompletedSample(last.contact, observed)) {
      observed = last.contact.sampleId
      matchingFreshFrames = predicate(last) ? matchingFreshFrames + 1 : 0
      if (matchingFreshFrames >= 2) return last
    }
    await wait(100)
  }
  throw new Error(`${label}: no two matching completed pose frames before timeout: ${JSON.stringify(last)}`)
}
const frame = async (name, note) => {
  const before = await snapshot()
  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  const state = await snapshot()
  await writeFile(path.join(evidenceDir, `${name}.png`), Buffer.from(screenshot.data, 'base64'))
  // CDP screenshot capture is asynchronous. Record the interval honestly rather
  // than claiming the pre-screenshot state necessarily belongs to the image.
  evidence.frames.push({ name, note, sampleRange: [before.contact?.renderedSampleId, state.contact?.renderedSampleId], state })
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
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await send('Page.navigate', { url })
  let state = await waitForPose('complete startup', state => state.ready?.status === 'READY' && state.contact?.status === 'ACTIVE', -1, 100000)
  evidence.tests.push('complete asset/hero/8-pedestrian/material/contact startup READY')
  state = await frame('01-city-start', 'Actual bundled renderer; desktop software WebGL only')
  assertHealthy(state)
  assert.equal(state.humans?.visibleHumans, 8)
  assert.equal(state.streetLife?.authoredVehicles, 3)
  assert.equal(state.streets?.loaded, true)
  assert.ok(state.resolution.actualWidth >= 900 && state.resolution.actualHeight >= 400, 'Render buffer below CSS clarity floor')
  const engineChunk = (await readdir(path.join(dist, 'assets'))).find(name => /^engineStore-.*\.js$/.test(name))
  if (!engineChunk) throw new Error('Compiled engineStore module unavailable for scene inspection')
  await evaluate(`(async () => { const module = await import('/assets/${engineChunk}'); const store = Object.values(module).find(value => typeof value === 'function' && 'LastCreatedScene' in value); if (!store?.LastCreatedScene) throw new Error('Scene unavailable'); globalThis.__dropiTestScene = store.LastCreatedScene; })()`)
  const assembly = await evaluate(`(() => { const scene = __dropiTestScene; return { cars: ['car-1','car-2','car-3'].map(name => ({ name, visibleParts: scene.getTransformNodeByName(name).getChildMeshes(false).filter(mesh => mesh.isEnabled() && mesh.isVisible && mesh.getTotalVertices() > 0).map(mesh => ({ name: mesh.name, material: mesh.material?.name })) })), heroMeshes: scene.getMeshByName('p1-rigged-hero-root').getChildMeshes(false).filter(mesh => mesh.isEnabled() && mesh.isVisible).length, ghostCount: scene.meshes.filter(mesh => mesh.isEnabled() && mesh.isVisible && (/^npc-\\d+$/.test(mesh.name) || mesh.name.startsWith('hero-motion-'))).length }; })()`)
  for (const car of assembly.cars) {
    assert.ok(car.visibleParts.some(part => /wheel/i.test(part.name)), `${car.name}: missing wheel assembly`)
    assert.ok(car.visibleParts.some(part => /window/i.test(part.material)), `${car.name}: missing glazing`)
  }
  assert.ok(assembly.heroMeshes > 3); assert.equal(assembly.ghostCount, 0)
  evidence.tests.push({ completeAssemblies: assembly })
  const moveTo = async (x, z) => {
    const before = await snapshot()
    await evaluate(`(() => { const hero = __dropiTestScene.getTransformNodeByName('hero'); hero.position.x = ${x}; hero.position.z = ${z}; })()`)
    return waitForPose('test relocation settles', state => Math.hypot(state.position.x - x, state.position.z - z) < .01, before.contact.sampleId)
  }
  const interact = async (phase, carrying) => {
    const before = await snapshot()
    await evaluate(`document.getElementById('interact').dispatchEvent(new PointerEvent('pointerdown', { bubbles:true }))`)
    return waitForPose(`phase ${phase} and carry ${carrying}`, state => state.phase === phase && state.contact.hero?.carry === carrying, before.contact.sampleId)
  }
  await moveTo(29, 8); await interact(1, false)
  await frame('02-hq', 'Existing route HQ interaction, two fresh pose frames confirmed')
  await moveTo(-27, -19); await interact(2, true)
  state = await frame('03-carry', 'Actual route pickup with two-hand pose, confirmed after rendering')
  assert.equal(state.contact.hero.carry, true)
  assert.ok(Number.isFinite(state.contact.hero.handErrorM) && state.contact.hero.handErrorM <= .025, 'Rendered hand/socket gap')
  assert.ok(state.contact.hero.minFootClearanceM >= -.002, 'Rendered hero shoe penetration')
  evidence.tests.push('real route pickup: two-hand grip <=25mm and no shoe penetration')

  // Exercise the real touch joystick; do not count teleports as walking tests.
  await moveTo(8, -3)
  const touchWalk = async (name, sx, sy) => {
    const before = await snapshot()
    const pad = await evaluate(`(() => { const rect = document.querySelector('.dropi-joystick-base').getBoundingClientRect(); return {x:rect.x+rect.width/2,y:rect.y+rect.height/2,r:Math.max(28,rect.width*.34)} })()`)
    const expected = await evaluate(`(() => { const camera = __dropiTestScene.activeCamera; const f = camera.getTarget().subtract(camera.position); f.y=0; f.normalize(); return {x:f.z*${sx}-f.x*${sy},z:-f.x*${sx}-f.z*${sy}} })()`)
    try {
      await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pad.x + sx * pad.r * .8, y: pad.y + sy * pad.r * .8, id: 0 }] })
      const moved = await waitForPose(name, state => state.hero.measuredSpeed > .05 && state.hero.walkWeight > .8 && Math.hypot(state.position.x-before.position.x,state.position.z-before.position.z) > .05, before.contact.sampleId)
      const dx = moved.position.x-before.position.x, dz = moved.position.z-before.position.z
      assert.ok((dx*expected.x + dz*expected.z) / Math.hypot(dx,dz) > .7, `${name}: inverted camera-relative movement`)
      assert.ok(moved.hero.measuredSpeed <= 1.70, `${name}: walking speed exceeded`)
      assert.equal(moved.hero.animation, 'Walk_Loop')
      assert.equal(moved.contact.hero.carry, true)
      assert.ok(Number.isFinite(moved.contact.hero.handErrorM) && moved.contact.hero.handErrorM <= .025, `${name}: carry loses hand contact`)
      assert.ok(moved.contact.hero.minFootClearanceM >= -.002, `${name}: shoe penetration`)
      evidence.tests.push({ touchWalk: name, distance: Math.hypot(dx,dz), speed: moved.hero.measuredSpeed, handGapM: moved.contact.hero.handErrorM, footClearanceM: moved.contact.hero.minFootClearanceM })
    } finally { await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
    const end = await snapshot()
    return waitForPose(`${name} stop`, state => state.hero.measuredSpeed < .02 && state.hero.walkWeight < .01, end.contact.sampleId)
  }
  for (const [name,x,y] of [['forward',0,-1],['right',1,0],['backward',0,1],['left',-1,0]]) {
    await touchWalk(name,x,y)
  }
  await frame('04-walk-stop', 'Real touch traversal in four directions while carrying, then stopped')
  await moveTo(34, -30); await interact(3, false)
  await frame('05-handoff', 'Actual handoff releases the carry pose')
  await interact(0, false)
  state = await frame('06-restart', 'Restart has no carried parcel or retained hand grip')
  assertHealthy(state); assert.equal(state.contact.hero.carry, false)
  evidence.tests.push('handoff/restart release carry with fresh completed pose evidence')
  evidence.status = 'PASS'
  console.log('Rendered regression PASS: complete scene, wheels/glass, no ghosts, route pickup, two-hand carry, four real joystick directions, stops, handoff/restart. Software WebGL only; NOT Android acceptance.')
} catch (error) {
  evidence.status = 'FAIL'; evidence.error = error instanceof Error ? error.stack : String(error)
  if (socket?.readyState === WebSocket.OPEN) { try { await frame('failure', 'Failure evidence; not a passing preview') } catch {} }
  console.error(JSON.stringify(evidence, null, 2))
  throw error
} finally {
  await writeFile(path.join(evidenceDir, 'verification.json'), `${JSON.stringify(evidence, null, 2)}\n`)
  socket?.close(); browser.kill('SIGTERM'); server.close()
  await wait(250); await rm(profile, { recursive: true, force: true }).catch(() => {})
}
