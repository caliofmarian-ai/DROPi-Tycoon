import './style.css'
import {
  AbstractMesh,
  Color3,
  Color4,
  DirectionalLight,
  DynamicTexture,
  Engine,
  FollowCamera,
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

type Obstacle = { x: number; z: number; halfX: number; halfZ: number }
type Waypoint = { label: string; position: Vector3 }
type InputAction = 'forward' | 'back' | 'left' | 'right'

const canvas = document.querySelector<HTMLCanvasElement>('#renderCanvas')
const objectiveEl = document.querySelector<HTMLElement>('#objective')
const telemetryEl = document.querySelector<HTMLElement>('#telemetry')

if (!canvas || !objectiveEl || !telemetryEl) throw new Error('Spike UI failed to initialize')

const engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false })
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
const buildingMaterials = [
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
  obstacles.push({ x, z, halfX: width / 2, halfZ: depth / 2 })

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
  createBuilding(`building-${index}`, x, z, w, d, h, buildingMaterials[index % buildingMaterials.length])
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

const hero = new TransformNode('hero', scene)
hero.position.set(-2, 0, 20)
hero.rotation.y = Math.PI

const torso = MeshBuilder.CreateCylinder('hero-torso', { height: 0.95, diameterTop: 0.43, diameterBottom: 0.52, tessellation: 12 }, scene)
torso.parent = hero
torso.position.y = 1.15
torso.material = heroMat
registerShadow(torso)

const head = MeshBuilder.CreateSphere('hero-head', { diameter: 0.42, segments: 12 }, scene)
head.parent = hero
head.position.y = 1.82
head.material = skinMat
registerShadow(head)

const leftLeg = MeshBuilder.CreateBox('hero-leg-l', { width: 0.18, height: 0.72, depth: 0.2 }, scene)
leftLeg.parent = hero
leftLeg.position.set(-0.13, 0.42, 0)
leftLeg.material = heroDark
registerShadow(leftLeg)

const rightLeg = leftLeg.clone('hero-leg-r')
rightLeg.parent = hero
rightLeg.position.x = 0.13
registerShadow(rightLeg)

const parcel = MeshBuilder.CreateBox('hero-parcel', { width: 0.68, height: 0.48, depth: 0.46 }, scene)
parcel.parent = hero
parcel.position.set(0, 1.05, 0.44)
parcel.material = parcelMat
parcel.setEnabled(false)
registerShadow(parcel)

const camera = new FollowCamera('third-person-camera', new Vector3(0, 3.2, 7), scene)
camera.radius = 6.8
camera.heightOffset = 2.15
camera.rotationOffset = 180
camera.cameraAcceleration = 0.065
camera.maxCameraSpeed = 12
camera.lowerRadiusLimit = 4.2
camera.upperRadiusLimit = 9.5
camera.checkCollisions = true
camera.collisionRadius = new Vector3(0.35, 0.35, 0.35)
camera.lockedTarget = hero
camera.attachControl(canvas, true)
scene.activeCamera = camera

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
  { label: "Mara's Market", position: new Vector3(-27, 0, -7) },
  { label: 'Customer', position: new Vector3(34, 0, -16) },
]

const marker = createMarker('objective-marker', waypoints[0].position, dropiMat)
let phase = 0

const npcMat = [mat('npc-blue', '#496b86'), mat('npc-green', '#71886c'), mat('npc-rust', '#956655')]
const npcs = Array.from({ length: 8 }, (_, index) => {
  const npc = MeshBuilder.CreateCapsule(`npc-${index}`, { height: 1.7, radius: 0.24, tessellation: 8 }, scene)
  npc.position.set(-54 + index * 14, 0.86, index % 2 === 0 ? 10.7 : -10.7)
  npc.material = npcMat[index % npcMat.length]
  registerShadow(npc)
  return { mesh: npc, originX: npc.position.x, speed: 0.45 + (index % 3) * 0.16, phase: index * 0.8 }
})

const input: Record<InputAction, boolean> = { forward: false, back: false, left: false, right: false }
const keyMap: Record<string, InputAction> = {
  KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
}

window.addEventListener('keydown', event => {
  const action = keyMap[event.code]
  if (action) {
    input[action] = true
    event.preventDefault()
  }
  if (event.code === 'KeyE' || event.code === 'Space') tryInteract()
})
window.addEventListener('keyup', event => {
  const action = keyMap[event.code]
  if (action) {
    input[action] = false
    event.preventDefault()
  }
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

function objectiveText(): string {
  if (phase === 0) return 'Approach DROPi HQ and interact.'
  if (phase === 1) return "Travel to Mara's Market and pick up the parcel."
  if (phase === 2) return 'Carry the parcel to the customer and hand it over.'
  return 'Visual route complete. Press INTERACT to restart the technical route.'
}

function updateObjective(): void {
  objectiveEl.textContent = objectiveText()
  if (phase <= 2) marker.position.copyFrom(waypoints[phase].position)
  marker.setEnabled(phase <= 2)
}

function tryInteract(): void {
  if (phase > 2) {
    phase = 0
    parcel.setEnabled(false)
    updateObjective()
    return
  }
  const target = waypoints[phase]
  if (distanceXZ(hero.position, target.position) > 3.4) {
    objectiveEl.textContent = `${target.label} is too far away — move closer.`
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

let walkPhase = 0
let telemetryAccumulator = 0

scene.onBeforeRenderObservable.add(() => {
  const dt = Math.min(engine.getDeltaTime() / 1000, 0.05)
  const turn = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const move = (input.forward ? 1 : 0) - (input.back ? 1 : 0)

  hero.rotation.y += turn * 1.9 * dt
  if (move !== 0) {
    const direction = new Vector3(Math.sin(hero.rotation.y), 0, Math.cos(hero.rotation.y))
    const candidate = hero.position.add(direction.scale(move * 4.35 * dt))
    if (!blocked(candidate)) hero.position.copyFrom(candidate)
    walkPhase += dt * 10.5
    leftLeg.rotation.x = Math.sin(walkPhase) * 0.34
    rightLeg.rotation.x = -Math.sin(walkPhase) * 0.34
  } else {
    leftLeg.rotation.x *= 0.78
    rightLeg.rotation.x *= 0.78
  }

  const now = performance.now() / 1000
  npcs.forEach((npc, index) => {
    npc.mesh.position.x = npc.originX + Math.sin(now * npc.speed + npc.phase) * (5 + (index % 2) * 2)
    npc.mesh.rotation.y = Math.cos(now * npc.speed + npc.phase) >= 0 ? Math.PI / 2 : -Math.PI / 2
  })

  marker.rotation.z += dt * 0.7
  telemetryAccumulator += dt
  if (telemetryAccumulator > 0.4) {
    const distance = phase <= 2 ? distanceXZ(hero.position, waypoints[phase].position) : 0
    telemetryEl.textContent = `Babylon.js 9.26 · ${engine.getFps().toFixed(0)} FPS · hero ${hero.position.x.toFixed(1)}, ${hero.position.z.toFixed(1)} m${phase <= 2 ? ` · objective ${distance.toFixed(1)} m` : ''}`
    telemetryAccumulator = 0
  }
})

updateObjective()
engine.runRenderLoop(() => scene.render())
window.addEventListener('resize', () => engine.resize())

Object.assign(window, {
  __DROPiBabylonSpike: {
    classification: 'NON-AUTHORITATIVE VISUAL SPIKE',
    renderer: 'Babylon.js 9.26.0',
    issue: 710,
    getFps: () => engine.getFps(),
    getPhase: () => phase,
    getHeroPosition: () => ({ x: hero.position.x, y: hero.position.y, z: hero.position.z }),
  },
})
