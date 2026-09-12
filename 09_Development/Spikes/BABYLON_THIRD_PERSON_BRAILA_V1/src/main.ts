import './style.css'
import {
  AbstractMesh,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  DynamicTexture,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from '@babylonjs/core'

type Obstacle = { name: string; x: number; z: number; halfX: number; halfZ: number; height: number }
type Waypoint = { label: string; position: Vector3 }
type InputAction = 'forward' | 'back' | 'left' | 'right'
type PerformanceSample = {
  averageFps: number
  p95FrameMs: number
  slowFramePercent: number
  sampleCount: number
}

const requireElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Spike UI failed to initialize: ${selector}`)
  return element
}

const canvas = requireElement<HTMLCanvasElement>('#renderCanvas')
const objectiveEl = requireElement<HTMLElement>('#objective')
const telemetryEl = requireElement<HTMLElement>('#telemetry')
const interactButton = requireElement<HTMLButtonElement>('#interact')
const recenterButton = requireElement<HTMLButtonElement>('#recenter')

const engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false })
const MAX_RENDER_DPR = 1.5
const BUILD_SHA = import.meta.env.VITE_COMMIT_SHA || 'LOCAL'

const resizeRenderer = (): void => {
  const deviceDpr = Math.max(1, window.devicePixelRatio || 1)
  engine.setHardwareScalingLevel(deviceDpr / Math.min(deviceDpr, MAX_RENDER_DPR))
  engine.resize()
}

const scheduleResize = (): void => {
  window.requestAnimationFrame(() => window.requestAnimationFrame(resizeRenderer))
}

resizeRenderer()
const scene = new Scene(engine)
scene.clearColor = new Color4(0.58, 0.76, 0.86, 1)
scene.collisionsEnabled = true
scene.fogMode = Scene.FOGMODE_EXP2
scene.fogDensity = 0.0035
scene.fogColor = new Color3(0.58, 0.76, 0.86)

const mat = (name: string, hex: string, rough = 1): StandardMaterial => {
  const m = new StandardMaterial(name, scene)
  m.diffuseColor = Color3.FromHexString(hex)
  m.specularColor = new Color3(0.12 / rough, 0.12 / rough, 0.12 / rough)
  return m
}

const asphalt = mat('asphalt', '#313942')
const sidewalk = mat('sidewalk', '#a9aa9f')
const curb = mat('curb', '#d9d5c8')
const grass = mat('grass', '#607c59')
const water = mat('danube', '#315f78', 0.65)
water.alpha = 0.94
const trunkMat = mat('tree-trunk', '#5d4638')
const leafMat = mat('tree-leaves', '#426a46')
const glassMat = mat('window-glass', '#4e7587', 0.45)
const heroMat = mat('hero-jacket', '#176e9a', 0.8)
const heroDark = mat('hero-trousers', '#222c35')
const skinMat = mat('hero-skin', '#c99170')
const parcelMat = mat('parcel', '#a87642')
const dropiMat = mat('dropi-blue', '#00a7dc', 0.55)
const merchantMat = mat('merchant-accent', '#d99a42')
const customerMat = mat('customer-accent', '#83b976')
const roadLineMat = mat('road-lines', '#e7e1c4')
const carMatA = mat('car-a', '#344c61', 0.55)
const carMatB = mat('car-b', '#9e493f', 0.55)

const hemi = new HemisphericLight('ambient', new Vector3(0.2, 1, 0.15), scene)
hemi.intensity = 0.68
hemi.diffuse = new Color3(0.95, 0.98, 1)
hemi.groundColor = new Color3(0.26, 0.29, 0.28)

const sun = new DirectionalLight('sun', new Vector3(-0.45, -1, 0.32), scene)
sun.position = new Vector3(35, 65, -30)
sun.intensity = 1.15
const shadows = new ShadowGenerator(1024, sun)
shadows.useBlurExponentialShadowMap = true
shadows.blurKernel = 24

const world = MeshBuilder.CreateBox('ground', { width: 180, depth: 130, height: 0.2 }, scene)
world.position.y = -0.12
world.material = grass
world.receiveShadows = true

const river = MeshBuilder.CreateBox('river', { width: 180, depth: 19, height: 0.08 }, scene)
river.position.set(0, 0.01, -55)
river.material = water
river.receiveShadows = true

const quay = MeshBuilder.CreateBox('quay', { width: 180, depth: 7, height: 0.16 }, scene)
quay.position.set(0, 0.04, -42)
quay.material = sidewalk
quay.receiveShadows = true

const roadA = MeshBuilder.CreateBox('road-main', { width: 150, depth: 12, height: 0.08 }, scene)
roadA.position.set(0, 0.02, 0)
roadA.material = asphalt
roadA.receiveShadows = true

const roadB = MeshBuilder.CreateBox('road-cross', { width: 12, depth: 84, height: 0.08 }, scene)
roadB.position.set(8, 0.025, 2)
roadB.material = asphalt
roadB.receiveShadows = true

for (let x = -64; x <= 64; x += 8) {
  const line = MeshBuilder.CreateBox(`lane-${x}`, { width: 3.5, depth: 0.15, height: 0.02 }, scene)
  line.position.set(x, 0.075, 0)
  line.material = roadLineMat
}

for (const z of [-8, 8]) {
  const walk = MeshBuilder.CreateBox(`sidewalk-main-${z}`, { width: 150, depth: 4, height: 0.16 }, scene)
  walk.position.set(0, 0.08, z)
  walk.material = sidewalk
  walk.receiveShadows = true
}

for (const x of [0, 16]) {
  const walk = MeshBuilder.CreateBox(`sidewalk-cross-${x}`, { width: 4, depth: 84, height: 0.16 }, scene)
  walk.position.set(x, 0.082, 2)
  walk.material = sidewalk
  walk.receiveShadows = true
}

const obstacles: Obstacle[] = []
const buildingMaterials: [StandardMaterial, StandardMaterial, StandardMaterial, StandardMaterial, StandardMaterial] = [
  mat('facade-sand', '#b99d80'),
  mat('facade-brick', '#8f6250'),
  mat('facade-stone', '#9e9f98'),
  mat('facade-cream', '#c8b89d'),
  mat('facade-blue', '#7895a3'),
]

const registerShadow = (mesh: AbstractMesh): void => {
  shadows.addShadowCaster(mesh)
  if (mesh instanceof Mesh) mesh.receiveShadows = true
}

const createSign = (text: string, x: number, y: number, z: number, width: number, accent: string): void => {
  const texture = new DynamicTexture(`sign-${text}`, { width: 1024, height: 256 }, scene, true)
  texture.hasAlpha = true
  const ctx = texture.getContext()
  ctx.clearRect(0, 0, 1024, 256)
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, 1024, 256)
  texture.drawText(text, null, 166, 'bold 98px system-ui', '#ffffff', 'transparent', true, true)
  texture.wrapU = Texture.CLAMP_ADDRESSMODE
  texture.wrapV = Texture.CLAMP_ADDRESSMODE

  const material = new StandardMaterial(`sign-mat-${text}`, scene)
  material.diffuseTexture = texture
  material.emissiveColor = Color3.FromHexString(accent).scale(0.4)
  material.backFaceCulling = false

  const sign = MeshBuilder.CreatePlane(`sign-plane-${text}`, { width, height: width / 4 }, scene)
  sign.position.set(x, y, z)
  sign.rotation.y = Math.PI
  sign.material = material
}

const createBuilding = (
  name: string,
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  material: StandardMaterial,
  sign?: { text: string; accent: string },
): Mesh => {
  const building = MeshBuilder.CreateBox(name, { width, depth, height }, scene)
  building.position.set(x, height / 2, z)
  building.material = material
  building.checkCollisions = true
  registerShadow(building)
  obstacles.push({ name, x, z, halfX: width / 2, halfZ: depth / 2, height })

  const roof = MeshBuilder.CreateBox(`${name}-roof`, { width: width + 0.3, depth: depth + 0.3, height: 0.35 }, scene)
  roof.position.set(x, height + 0.17, z)
  roof.material = curb
  registerShadow(roof)

  const floorCount = Math.max(2, Math.floor(height / 3.2))
  const cols = Math.max(2, Math.floor(width / 3.3))
  for (let floor = 0; floor < floorCount; floor += 1) {
    for (let col = 0; col < cols; col += 1) {
      const window = MeshBuilder.CreateBox(`${name}-w-${floor}-${col}`, { width: 1.2, height: 1.15, depth: 0.08 }, scene)
      window.position.set(x - width / 2 + 1.7 + col * ((width - 3.4) / Math.max(1, cols - 1)), 2.1 + floor * 3.0, z - depth / 2 - 0.05)
      window.material = glassMat
    }
  }

  const door = MeshBuilder.CreateBox(`${name}-door`, { width: 1.35, height: 2.35, depth: 0.12 }, scene)
  door.position.set(x, 1.18, z - depth / 2 - 0.08)
  door.material = heroDark

  if (sign) createSign(sign.text, x, Math.min(height - 1.2, 3.5), z - depth / 2 - 0.16, Math.min(width * 0.68, 7.5), sign.accent)
  return building
}

createBuilding('dropi-hq', 29, 15, 18, 12, 14, buildingMaterials[4], { text: 'DROPi HQ', accent: '#009fd4' })
createBuilding('maras-market', -27, -13, 14, 10, 9, buildingMaterials[0], { text: "MARA'S MARKET", accent: '#c98425' })
createBuilding('customer-block', 34, -23, 17, 12, 16, buildingMaterials[2], { text: 'RESIDENCES', accent: '#52765a' })

const genericBuildings: Array<[number, number, number, number, number]> = [
  [-52, 17, 16, 12, 12], [-34, 18, 13, 12, 9], [-12, 19, 15, 13, 15], [52, 18, 15, 12, 11],
  [-52, -19, 15, 12, 10], [-8, -22, 16, 14, 17], [55, -21, 15, 13, 13],
  [-58, 35, 18, 14, 15], [-30, 37, 14, 12, 11], [34, 38, 18, 15, 18], [58, 37, 15, 13, 12],
]

genericBuildings.forEach(([x, z, w, d, h], index) => {
  createBuilding(`building-${index}`, x, z, w, d, h, buildingMaterials[index % buildingMaterials.length] ?? buildingMaterials[0])
})

const createTree = (x: number, z: number, scale = 1): void => {
  const trunk = MeshBuilder.CreateCylinder(`tree-trunk-${x}-${z}`, { height: 2.5 * scale, diameter: 0.34 * scale }, scene)
  trunk.position.set(x, 1.25 * scale, z)
  trunk.material = trunkMat
  registerShadow(trunk)
  const crown = MeshBuilder.CreateSphere(`tree-crown-${x}-${z}`, { diameter: 2.7 * scale, segments: 8 }, scene)
  crown.position.set(x, 3.1 * scale, z)
  crown.material = leafMat
  registerShadow(crown)
}

for (let x = -66; x <= 66; x += 11) {
  if (Math.abs(x - 8) > 10) {
    createTree(x, 11.2, 0.9)
    if (x % 22 === 0) createTree(x + 3, -11.3, 0.82)
  }
}
for (let x = -64; x <= 64; x += 12) createTree(x, -39, 0.95)

const createCar = (name: string, x: number, z: number, material: StandardMaterial, rotationY = 0): void => {
  const root = new TransformNode(name, scene)
  root.position.set(x, 0.3, z)
  root.rotation.y = rotationY
  const body = MeshBuilder.CreateBox(`${name}-body`, { width: 1.75, height: 0.65, depth: 4 }, scene)
  body.parent = root
  body.position.y = 0.45
  body.material = material
  registerShadow(body)
  const cabin = MeshBuilder.CreateBox(`${name}-cabin`, { width: 1.55, height: 0.7, depth: 1.85 }, scene)
  cabin.parent = root
  cabin.position.set(0, 1.05, -0.2)
  cabin.material = glassMat
  registerShadow(cabin)
}

createCar('car-1', -15, 3, carMatA, Math.PI / 2)
createCar('car-2', 43, -3, carMatB, -Math.PI / 2)
createCar('car-3', 6, 25, carMatA, 0)

const HERO_START = new Vector3(-2, 0, 20)
const HERO_VISUAL_HEIGHT_M = 1.78
const hero = new TransformNode('hero', scene)
hero.position.copyFrom(HERO_START)
hero.rotation.y = Math.PI

const torso = MeshBuilder.CreateCylinder('hero-torso', { height: 0.84, diameterTop: 0.43, diameterBottom: 0.5, tessellation: 12 }, scene)
torso.parent = hero
torso.position.y = 1.1
torso.material = heroMat
registerShadow(torso)

const head = MeshBuilder.CreateSphere('hero-head', { diameter: 0.38, segments: 12 }, scene)
head.parent = hero
head.position.y = 1.59
head.material = skinMat
registerShadow(head)

const leftLeg = MeshBuilder.CreateBox('hero-leg-l', { width: 0.18, height: 0.72, depth: 0.2 }, scene)
leftLeg.parent = hero
leftLeg.position.set(-0.13, 0.36, 0)
leftLeg.material = heroDark
registerShadow(leftLeg)

const rightLeg = MeshBuilder.CreateBox('hero-leg-r', { width: 0.18, height: 0.72, depth: 0.2 }, scene)
rightLeg.parent = hero
rightLeg.position.set(0.13, 0.36, 0)
rightLeg.material = heroDark
registerShadow(rightLeg)

const leftArm = MeshBuilder.CreateBox('hero-arm-l', { width: 0.14, height: 0.72, depth: 0.17 }, scene)
leftArm.parent = hero
leftArm.position.set(-0.31, 1.1, 0)
leftArm.material = heroMat
registerShadow(leftArm)

const rightArm = MeshBuilder.CreateBox('hero-arm-r', { width: 0.14, height: 0.72, depth: 0.17 }, scene)
rightArm.parent = hero
rightArm.position.set(0.31, 1.1, 0)
rightArm.material = heroMat
registerShadow(rightArm)

const parcel = MeshBuilder.CreateBox('hero-parcel', { width: 0.68, height: 0.48, depth: 0.46 }, scene)
parcel.parent = hero
parcel.position.set(0, 1.05, 0.44)
parcel.material = parcelMat
parcel.setEnabled(false)
registerShadow(parcel)

const CAMERA_RADIUS_M = 6.4
const CAMERA_BETA = 1.17
const CAMERA_TARGET_HEIGHT_M = 1.18
const initialCameraAlpha = hero.rotation.y - Math.PI / 2
const cameraTarget = new TransformNode('third-person-camera-target', scene)
cameraTarget.position.copyFromFloats(hero.position.x, hero.position.y + CAMERA_TARGET_HEIGHT_M, hero.position.z)

const camera = new ArcRotateCamera(
  'third-person-camera',
  initialCameraAlpha,
  CAMERA_BETA,
  CAMERA_RADIUS_M,
  cameraTarget.position,
  scene,
)
camera.setTarget(cameraTarget, false, false, true)
camera.lowerRadiusLimit = 3.1
camera.upperRadiusLimit = CAMERA_RADIUS_M
camera.lowerBetaLimit = 0.86
camera.upperBetaLimit = 1.36
camera.angularSensibilityX = 1650
camera.angularSensibilityY = 1850
camera.panningSensibility = 0
camera.pinchPrecision = 38
camera.useNaturalPinchZoom = true
camera.wheelPrecision = 45
camera.keysUp = []
camera.keysDown = []
camera.keysLeft = []
camera.keysRight = []
camera.inertia = 0.72
camera.minZ = 0.08
camera.maxZ = 220
camera.checkCollisions = true
camera.collisionRadius = new Vector3(0.42, 0.34, 0.42)
camera.attachControl(true)
scene.activeCamera = camera

let cameraCollisionCount = 0
let lastCameraCollision = 'none'
let lastCameraCollisionAt = -Infinity
camera.onCollide = collidedMesh => {
  const now = performance.now()
  if (collidedMesh.name !== lastCameraCollision || now - lastCameraCollisionAt > 300) {
    cameraCollisionCount += 1
  }
  lastCameraCollision = collidedMesh.name
  lastCameraCollisionAt = now
}

const createMarker = (name: string, position: Vector3, material: StandardMaterial): Mesh => {
  const marker = MeshBuilder.CreateTorus(name, { diameter: 2.3, thickness: 0.12, tessellation: 32 }, scene)
  marker.rotation.x = Math.PI / 2
  marker.position.copyFrom(position)
  marker.position.y = 0.17
  marker.material = material
  return marker
}

const waypoints: Waypoint[] = [
  { label: 'DROPi HQ', position: new Vector3(29, 0, 8) },
  { label: "Mara's Market", position: new Vector3(-27, 0, -19) },
  { label: 'Customer', position: new Vector3(34, 0, -30) },
]

const firstWaypoint = waypoints[0]
if (!firstWaypoint) throw new Error('Spike route has no starting waypoint')
const marker = createMarker('objective-marker', firstWaypoint.position, dropiMat)
let phase = 0

const npcMat: [StandardMaterial, StandardMaterial, StandardMaterial] = [
  mat('npc-blue', '#496b86'),
  mat('npc-green', '#71886c'),
  mat('npc-rust', '#956655'),
]
const npcs = Array.from({ length: 8 }, (_, index) => {
  const npc = MeshBuilder.CreateCapsule(`npc-${index}`, { height: 1.7, radius: 0.24, tessellation: 8 }, scene)
  npc.position.set(-54 + index * 14, 0.86, index % 2 === 0 ? 10.7 : -10.7)
  npc.material = npcMat[index % npcMat.length] ?? npcMat[0]
  registerShadow(npc)
  return { mesh: npc, originX: npc.position.x, speed: 0.45 + (index % 3) * 0.16, phase: index * 0.8 }
})

const input: Record<InputAction, boolean> = { forward: false, back: false, left: false, right: false }
const keyMap: Record<string, InputAction> = {
  KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
}
let cameraPointerActive = false
let cameraManualUntil = 0

const resetMovementInput = (): void => {
  for (const action of Object.keys(input) as InputAction[]) input[action] = false
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action]')) {
    button.classList.remove('active')
  }
}

window.addEventListener('keydown', event => {
  const action = keyMap[event.code]
  if (action) {
    input[action] = true
    event.preventDefault()
  }
  if (!event.repeat && (event.code === 'KeyE' || event.code === 'Space')) tryInteract()
})
window.addEventListener('keyup', event => {
  const action = keyMap[event.code]
  if (action) {
    input[action] = false
    event.preventDefault()
  }
})
window.addEventListener('blur', resetMovementInput)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) resetMovementInput()
})

canvas.addEventListener('pointerdown', () => {
  cameraPointerActive = true
  cameraManualUntil = Number.POSITIVE_INFINITY
})
window.addEventListener('pointerup', () => {
  if (!cameraPointerActive) return
  cameraPointerActive = false
  cameraManualUntil = performance.now() + 1400
})
window.addEventListener('pointercancel', () => {
  cameraPointerActive = false
  cameraManualUntil = performance.now() + 600
})

recenterButton.addEventListener('pointerdown', event => {
  event.preventDefault()
  cameraPointerActive = false
  cameraManualUntil = 0
})

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action]')) {
  const action = button.dataset.action
  if (!action) continue
  if (action === 'interact') {
    button.addEventListener('pointerdown', event => {
      event.preventDefault()
      tryInteract()
    })
    continue
  }
  if (!['forward', 'back', 'left', 'right'].includes(action)) continue
  const typed = action as InputAction
  const set = (value: boolean): void => {
    input[typed] = value
    button.classList.toggle('active', value)
  }
  button.addEventListener('pointerdown', event => {
    event.preventDefault()
    button.setPointerCapture(event.pointerId)
    set(true)
  })
  button.addEventListener('pointerup', event => { event.preventDefault(); set(false) })
  button.addEventListener('pointercancel', () => set(false))
  button.addEventListener('lostpointercapture', () => set(false))
}

const distanceXZ = (a: Vector3, b: Vector3): number => Math.hypot(a.x - b.x, a.z - b.z)
const INTERACTION_RADIUS_M = 2.8
let interactionFeedback = ''
let interactionFeedbackUntil = 0

function objectiveText(): string {
  if (phase === 0) return 'Approach DROPi HQ and interact.'
  if (phase === 1) return "Travel to Mara's Market and pick up the parcel."
  if (phase === 2) return 'Carry the parcel to the customer and hand it over.'
  return 'Visual route complete. Press INTERACT to restart the technical route.'
}

function activeWaypoint(): Waypoint | null {
  if (phase > 2) return null
  return waypoints[phase] ?? null
}

function updateObjective(): void {
  const target = activeWaypoint()
  if (target) marker.position.copyFrom(target.position)
  marker.setEnabled(Boolean(target))

  const distance = target ? distanceXZ(hero.position, target.position) : 0
  const ready = Boolean(target && distance <= INTERACTION_RADIUS_M)
  interactButton.classList.toggle('ready', ready || phase > 2)
  interactButton.dataset.ready = String(ready || phase > 2)

  if (performance.now() < interactionFeedbackUntil) {
    objectiveEl.textContent = interactionFeedback
  } else if (ready) {
    objectiveEl.textContent = `${target?.label ?? 'Objective'} reached — press INTERACT.`
  } else {
    objectiveEl.textContent = objectiveText()
  }
}

function tryInteract(): void {
  if (phase > 2) {
    phase = 0
    parcel.setEnabled(false)
    hero.position.copyFrom(HERO_START)
    hero.rotation.y = Math.PI
    currentSpeed = 0
    resetMovementInput()
    cameraManualUntil = 0
    interactionFeedback = 'Technical route restarted at the Brăila graybox start.'
    interactionFeedbackUntil = performance.now() + 1600
    updateObjective()
    return
  }
  const target = activeWaypoint()
  if (!target) return
  const distance = distanceXZ(hero.position, target.position)
  if (distance > INTERACTION_RADIUS_M) {
    interactionFeedback = `${target.label} is ${distance.toFixed(1)} m away — move within ${INTERACTION_RADIUS_M.toFixed(1)} m.`
    interactionFeedbackUntil = performance.now() + 1800
    updateObjective()
    return
  }
  if (phase === 0) {
    phase = 1
  } else if (phase === 1) {
    parcel.setEnabled(true)
    phase = 2
  } else {
    parcel.setEnabled(false)
    phase = 3
  }
  interactionFeedback = ''
  interactionFeedbackUntil = 0
  updateObjective()
}

const HERO_RADIUS = 0.42
const blocked = (position: Vector3): boolean => {
  if (Math.abs(position.x) > 82 || position.z > 58 || position.z < -39) return true
  return obstacles.some(o =>
    Math.abs(position.x - o.x) < o.halfX + HERO_RADIUS &&
    Math.abs(position.z - o.z) < o.halfZ + HERO_RADIUS,
  )
}

const moveHeroWithSlide = (delta: Vector3): number => {
  const startX = hero.position.x
  const startZ = hero.position.z

  const xCandidate = hero.position.clone()
  xCandidate.x += delta.x
  if (!blocked(xCandidate)) hero.position.x = xCandidate.x

  const zCandidate = hero.position.clone()
  zCandidate.z += delta.z
  if (!blocked(zCandidate)) hero.position.z = zCandidate.z

  return Math.hypot(hero.position.x - startX, hero.position.z - startZ)
}

const moveTowards = (current: number, target: number, maxDelta: number): number => {
  if (Math.abs(target - current) <= maxDelta) return target
  return current + Math.sign(target - current) * maxDelta
}

const shortestAngleDelta = (from: number, to: number): number =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from))

const cameraClippingObstacle = (): Obstacle | null => obstacles.find(obstacle =>
  camera.position.y > 0 &&
  camera.position.y < obstacle.height &&
  Math.abs(camera.position.x - obstacle.x) < obstacle.halfX &&
  Math.abs(camera.position.z - obstacle.z) < obstacle.halfZ,
) ?? null

const FRAME_SAMPLE_LIMIT = 300
const frameTimesMs: number[] = []
const telemetryWarmupEndsAt = performance.now() + 1500

const getPerformanceSample = (): PerformanceSample => {
  if (frameTimesMs.length === 0) {
    return { averageFps: engine.getFps(), p95FrameMs: 0, slowFramePercent: 0, sampleCount: 0 }
  }
  const averageFrameMs = frameTimesMs.reduce((sum, value) => sum + value, 0) / frameTimesMs.length
  const sorted = [...frameTimesMs].sort((a, b) => a - b)
  const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
  const p95FrameMs = sorted[p95Index] ?? 0
  const slowFrames = frameTimesMs.filter(value => value > 33.34).length
  return {
    averageFps: 1000 / averageFrameMs,
    p95FrameMs,
    slowFramePercent: (slowFrames / frameTimesMs.length) * 100,
    sampleCount: frameTimesMs.length,
  }
}

let walkPhase = 0
let telemetryAccumulator = 0
let currentSpeed = 0

scene.onBeforeRenderObservable.add(() => {
  const rawFrameMs = engine.getDeltaTime()
  const dt = Math.min(rawFrameMs / 1000, 0.05)
  const turn = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const move = (input.forward ? 1 : 0) - (input.back ? 1 : 0)

  hero.rotation.y += turn * 2.05 * dt
  const targetSpeed = move > 0 ? 4.25 : move < 0 ? -2.75 : 0
  const acceleration = move === 0 ? 11.5 : 8.5
  currentSpeed = moveTowards(currentSpeed, targetSpeed, acceleration * dt)

  let movedDistance = 0
  if (Math.abs(currentSpeed) > 0.01) {
    const direction = new Vector3(Math.sin(hero.rotation.y), 0, Math.cos(hero.rotation.y))
    const expectedDistance = Math.abs(currentSpeed * dt)
    movedDistance = moveHeroWithSlide(direction.scale(currentSpeed * dt))
    if (expectedDistance > 0.01 && movedDistance < expectedDistance * 0.08) currentSpeed = 0
  }

  if (movedDistance > 0.0001) {
    walkPhase += movedDistance * 5.2
    leftLeg.rotation.x = Math.sin(walkPhase) * 0.34
    rightLeg.rotation.x = -Math.sin(walkPhase) * 0.34
    if (!parcel.isEnabled()) {
      leftArm.rotation.x = -Math.sin(walkPhase) * 0.22
      rightArm.rotation.x = Math.sin(walkPhase) * 0.22
    }
  } else {
    leftLeg.rotation.x *= 0.78
    rightLeg.rotation.x *= 0.78
    if (!parcel.isEnabled()) {
      leftArm.rotation.x *= 0.78
      rightArm.rotation.x *= 0.78
    }
  }

  if (parcel.isEnabled()) {
    leftArm.rotation.x += (-0.48 - leftArm.rotation.x) * Math.min(1, dt * 10)
    rightArm.rotation.x += (-0.48 - rightArm.rotation.x) * Math.min(1, dt * 10)
  }

  const now = performance.now() / 1000
  npcs.forEach((npc, index) => {
    npc.mesh.position.x = npc.originX + Math.sin(now * npc.speed + npc.phase) * (5 + (index % 2) * 2)
    npc.mesh.rotation.y = Math.cos(now * npc.speed + npc.phase) >= 0 ? Math.PI / 2 : -Math.PI / 2
  })

  const targetFollow = 1 - Math.exp(-10 * dt)
  cameraTarget.position.x += (hero.position.x - cameraTarget.position.x) * targetFollow
  cameraTarget.position.y += (hero.position.y + CAMERA_TARGET_HEIGHT_M - cameraTarget.position.y) * targetFollow
  cameraTarget.position.z += (hero.position.z - cameraTarget.position.z) * targetFollow

  if (performance.now() > cameraManualUntil) {
    const cameraFollow = 1 - Math.exp(-5.5 * dt)
    const desiredAlpha = hero.rotation.y - Math.PI / 2
    camera.alpha += shortestAngleDelta(camera.alpha, desiredAlpha) * cameraFollow
    camera.beta += (CAMERA_BETA - camera.beta) * cameraFollow
    camera.radius += (CAMERA_RADIUS_M - camera.radius) * cameraFollow
  }

  marker.rotation.z += dt * 0.7
  if (performance.now() >= telemetryWarmupEndsAt && rawFrameMs > 0 && rawFrameMs < 250) {
    frameTimesMs.push(rawFrameMs)
    if (frameTimesMs.length > FRAME_SAMPLE_LIMIT) frameTimesMs.shift()
  }

  telemetryAccumulator += dt
  if (telemetryAccumulator > 0.4) {
    const target = activeWaypoint()
    const distance = target ? distanceXZ(hero.position, target.position) : 0
    const sample = getPerformanceSample()
    const clippingRisk = cameraClippingObstacle()
    const recentCollision = performance.now() - lastCameraCollisionAt < 850
    const cameraState = clippingRisk ? `CLIP-RISK:${clippingRisk.name}` : recentCollision ? `COLLISION:${lastCameraCollision}` : 'CLEAR'
    const orientation = window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'
    telemetryEl.textContent = `build ${BUILD_SHA.slice(0, 8)} · ${sample.averageFps.toFixed(0)} avg FPS · p95 ${sample.p95FrameMs.toFixed(1)} ms · slow ${sample.slowFramePercent.toFixed(0)}% · ${engine.getRenderWidth()}×${engine.getRenderHeight()} · ${orientation} · camera ${cameraState}${target ? ` · objective ${distance.toFixed(1)} m` : ''}`
    updateObjective()
    telemetryAccumulator = 0
  }
})

updateObjective()
engine.runRenderLoop(() => scene.render())
window.addEventListener('resize', scheduleResize, { passive: true })
window.addEventListener('orientationchange', scheduleResize, { passive: true })
window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true })
screen.orientation?.addEventListener('change', scheduleResize)
canvas.addEventListener('contextmenu', event => event.preventDefault())

Object.assign(window, {
  __DROPiBabylonSpike: {
    classification: 'NON-AUTHORITATIVE VISUAL SPIKE',
    renderer: 'Babylon.js 9.26.0',
    issue: 710,
    buildSha: BUILD_SHA,
    heroVisualHeightMeters: HERO_VISUAL_HEIGHT_M,
    interactionRadiusMeters: INTERACTION_RADIUS_M,
    getFps: () => engine.getFps(),
    getPerformanceSample,
    getPhase: () => phase,
    getHeroPosition: () => ({ x: hero.position.x, y: hero.position.y, z: hero.position.z }),
    getCameraState: () => ({
      alpha: camera.alpha,
      beta: camera.beta,
      radius: camera.radius,
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      collisionCount: cameraCollisionCount,
      lastCollision: lastCameraCollision,
      clippingRisk: cameraClippingObstacle()?.name ?? null,
    }),
  },
})
