import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { EngineStore } from '@babylonjs/core/Engines/engineStore'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { HERO_WALK_SPEED_MPS, movementSteps, planarSpeed } from './authoredWalk'

const CONTROL_ISSUE = 715, NAV_ISSUE = 716
const HERO_RADIUS_M = .42, JOYSTICK_DEAD_ZONE = .12
const ACCELERATION_MPS2 = 11.5, DECELERATION_MPS2 = 17, HERO_TURN_RESPONSE = 12
const CAMERA_SAFETY_RADIUS = new Vector3(.62, .44, .62)
type JoystickState = { x: number; y: number; magnitude: number; pointerId: number | null }
type NaturalControlsDebug = {
  issue: number; navigationIssue: number; mode: 'camera-relative-analog-v2'
  getJoystick(): { x: number; y: number; magnitude: number }
  getSpeed(): number; getCameraRadius(): number
}
declare global { interface Window { __DROPiNaturalControls?: NaturalControlsDebug } }
const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))
const moveTowards = (current: number, target: number, maxDelta: number): number => Math.abs(target - current) <= maxDelta ? target : current + Math.sign(target - current) * maxDelta
const shortestAngleDelta = (from: number, to: number): number => Math.atan2(Math.sin(to - from), Math.cos(to - from))
const addStyles = (): void => {
  const style = document.createElement('style'); style.dataset.dropiNaturalControlsV2 = String(NAV_ISSUE)
  style.textContent = `
    #movement-pad { width:148px; height:148px; display:flex !important; flex-direction:column; align-items:center; justify-content:center; gap:5px !important; pointer-events:none; }
    #movement-pad .dropi-joystick-base { position:relative; width:118px; height:118px; border-radius:999px; border:1px solid rgba(255,255,255,.28); background:radial-gradient(circle at 50% 50%,rgba(18,63,89,.62),rgba(4,19,31,.82)); box-shadow:inset 0 0 0 2px rgba(93,214,255,.08),0 10px 24px rgba(0,0,0,.28); pointer-events:auto; touch-action:none; -webkit-tap-highlight-color:transparent; }
    #movement-pad .dropi-joystick-base::before,#movement-pad .dropi-joystick-base::after { content:''; position:absolute; left:50%; top:50%; background:rgba(159,221,241,.12); transform:translate(-50%,-50%); pointer-events:none; }
    #movement-pad .dropi-joystick-base::before { width:72%; height:1px; }
    #movement-pad .dropi-joystick-base::after { width:1px; height:72%; }
    #movement-pad .dropi-joystick-knob { position:absolute; left:50%; top:50%; width:52px; height:52px; margin-left:-26px; margin-top:-26px; border-radius:999px; border:1px solid rgba(255,255,255,.4); background:rgba(48,174,216,.9); box-shadow:0 7px 18px rgba(0,0,0,.32),inset 0 0 0 2px rgba(255,255,255,.08); transform:translate3d(0,0,0); will-change:transform; pointer-events:none; }
    #movement-pad .dropi-joystick-label { color:rgba(230,246,252,.82); font-size:9px; font-weight:800; letter-spacing:.12em; text-shadow:0 1px 3px rgba(0,0,0,.6); pointer-events:none; }
    #dropi-camera-zoom { display:flex; gap:6px; justify-content:flex-end; pointer-events:auto; }
    #dropi-camera-zoom button { min-width:54px !important; min-height:34px !important; font-size:13px !important; padding:0 8px; letter-spacing:.05em; }
    #dropi-natural-control-badge { position:fixed; left:50%; bottom:max(8px,env(safe-area-inset-bottom)); z-index:8; transform:translateX(-50%); padding:5px 8px; border-radius:8px; background:rgba(3,15,26,.58); color:rgba(206,235,246,.72); font-size:8px; font-weight:800; letter-spacing:.1em; pointer-events:none; }
    @media (orientation:landscape) and (max-height:600px) {
      #movement-pad { width:132px; height:132px; }
      #movement-pad .dropi-joystick-base { width:102px; height:102px; }
      #movement-pad .dropi-joystick-knob { width:46px; height:46px; margin-left:-23px; margin-top:-23px; }
    }
  `
  document.head.append(style)
}
const installJoystick = (): { state: JoystickState; reset(): void } | null => {
  const movementPad = document.querySelector<HTMLElement>('#movement-pad')
  if (!movementPad) return null
  movementPad.replaceChildren()
  const base = document.createElement('div'); base.className = 'dropi-joystick-base'
  base.setAttribute('role', 'application'); base.setAttribute('aria-label', 'Camera-relative movement joystick')
  const knob = document.createElement('div'); knob.className = 'dropi-joystick-knob'; base.append(knob)
  const label = document.createElement('div'); label.className = 'dropi-joystick-label'; label.textContent = 'MOVE · CAMERA RELATIVE'
  movementPad.append(base, label)
  const state: JoystickState = { x: 0, y: 0, magnitude: 0, pointerId: null }
  const renderKnob = (): void => {
    const radius = Math.max(28, base.getBoundingClientRect().width * .34)
    knob.style.transform = `translate3d(${(state.x * radius).toFixed(1)}px,${(state.y * radius).toFixed(1)}px,0)`
  }
  const reset = (): void => { state.x = 0; state.y = 0; state.magnitude = 0; state.pointerId = null; renderKnob() }
  const update = (event: PointerEvent): void => {
    const rect = base.getBoundingClientRect(), radius = Math.max(28, rect.width * .34)
    const rawX = (event.clientX - rect.left - rect.width / 2) / radius, rawY = (event.clientY - rect.top - rect.height / 2) / radius
    const rawMagnitude = Math.hypot(rawX, rawY), scale = rawMagnitude > 1 ? 1 / rawMagnitude : 1
    const x = rawX * scale, y = rawY * scale, magnitude = Math.hypot(x, y)
    if (magnitude <= JOYSTICK_DEAD_ZONE) { state.x = 0; state.y = 0; state.magnitude = 0 }
    else {
      const normalized = clamp((magnitude - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE), 0, 1)
      state.x = x / magnitude * normalized; state.y = y / magnitude * normalized; state.magnitude = normalized
    }
    renderKnob()
  }
  base.addEventListener('pointerdown', event => {
    if (state.pointerId !== null && state.pointerId !== event.pointerId) return
    event.preventDefault(); event.stopPropagation(); state.pointerId = event.pointerId
    base.setPointerCapture(event.pointerId); update(event)
  })
  base.addEventListener('pointermove', event => { if (state.pointerId !== event.pointerId) return; event.preventDefault(); event.stopPropagation(); update(event) })
  const release = (event: PointerEvent): void => { if (state.pointerId !== event.pointerId) return; event.preventDefault(); event.stopPropagation(); reset() }
  base.addEventListener('pointerup', release); base.addEventListener('pointercancel', release); base.addEventListener('lostpointercapture', reset)
  window.addEventListener('blur', reset); window.addEventListener('dropi:native-back', reset)
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset() })
  return { state, reset }
}
const installCameraZoom = (camera: ArcRotateCamera): void => {
  const stack = document.querySelector<HTMLElement>('#action-stack')
  if (!stack || document.querySelector('#dropi-camera-zoom')) return
  const wrap = document.createElement('div'); wrap.id = 'dropi-camera-zoom'
  for (const [label, aria, delta] of [['CAM −', 'Zoom camera out', .8], ['CAM +', 'Zoom camera in', -.8]] as const) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.setAttribute('aria-label', aria)
    button.addEventListener('pointerdown', event => { event.preventDefault(); event.stopPropagation(); camera.radius = clamp(camera.radius + delta, camera.lowerRadiusLimit ?? 3.1, camera.upperRadiusLimit ?? 6.4) })
    wrap.append(button)
  }
  stack.prepend(wrap)
}
const boot = (): void => {
  const scene = EngineStore.LastCreatedScene, hero = scene?.getTransformNodeByName('hero'), activeCamera = scene?.activeCamera
  if (!scene || !hero || !(activeCamera instanceof ArcRotateCamera) || !document.querySelector('#movement-pad')) { window.requestAnimationFrame(boot); return }
  addStyles()
  if (!document.querySelector('#dropi-natural-control-badge')) {
    const badge = document.createElement('div'); badge.id = 'dropi-natural-control-badge'; badge.textContent = 'NATURAL CONTROL V2 · #715 · GPS #716'; document.body.append(badge)
  }
  const joystick = installJoystick()
  if (!joystick) return
  const camera = activeCamera; camera.collisionRadius.copyFrom(CAMERA_SAFETY_RADIUS); camera.minZ = Math.max(camera.minZ, .12); installCameraZoom(camera)
  const leftLeg = scene.getMeshByName('hero-leg-l'), rightLeg = scene.getMeshByName('hero-leg-r')
  const leftArm = scene.getMeshByName('hero-arm-l'), rightArm = scene.getMeshByName('hero-arm-r'), parcel = scene.getMeshByName('hero-parcel')
  let currentSpeed = 0, measuredSpeed = 0, walkPhase = 0, lastTravelDirection = new Vector3(0, 0, -1)
  const isBlocked = (p: Vector3): boolean => {
    if (Math.abs(p.x) > 82 || p.z > 58 || p.z < -39) return true
    for (const mesh of scene.meshes) {
      if (!mesh.checkCollisions || !mesh.isEnabled()) continue
      const b = mesh.getBoundingInfo().boundingBox, min = b.minimumWorld, max = b.maximumWorld
      if (p.x > min.x - HERO_RADIUS_M && p.x < max.x + HERO_RADIUS_M && p.z > min.z - HERO_RADIUS_M && p.z < max.z + HERO_RADIUS_M) return true
    }
    return false
  }
  const moveHeroWithSlide = (delta: Vector3): number => {
    const startX = hero.position.x, startZ = hero.position.z
    const x = hero.position.clone(); x.x += delta.x; if (!isBlocked(x)) hero.position.x = x.x
    const z = hero.position.clone(); z.z += delta.z; if (!isBlocked(z)) hero.position.z = z.z
    return Math.hypot(hero.position.x - startX, hero.position.z - startZ)
  }
  const cameraDirection = (): Vector3 | null => {
    if (joystick.state.magnitude <= 0) return null
    const forward = camera.getTarget().subtract(camera.position); forward.y = 0
    if (forward.lengthSquared() < .0001) return null
    forward.normalize()
    // Accepted #731 left-handed frame: Up x Forward is screen-right.
    const right = new Vector3(forward.z, 0, -forward.x)
    const direction = forward.scale(-joystick.state.y).add(right.scale(joystick.state.x)); direction.y = 0
    return direction.lengthSquared() < .0001 ? null : direction.normalize()
  }
  scene.onBeforeRenderObservable.add(() => {
    const seconds = scene.getEngine().getDeltaTime() / 1000
    const steps = movementSteps(seconds, document.hidden)
    const startX = hero.position.x, startZ = hero.position.z
    if (!steps.length) { currentSpeed = 0; measuredSpeed = 0; return }
    const direction = cameraDirection(), targetSpeed = direction ? HERO_WALK_SPEED_MPS * joystick.state.magnitude : 0
    let moved = 0
    for (const dt of steps) {
      currentSpeed = moveTowards(currentSpeed, targetSpeed, (targetSpeed > currentSpeed ? ACCELERATION_MPS2 : DECELERATION_MPS2) * dt)
      if (direction) { lastTravelDirection = direction; hero.rotation.y += shortestAngleDelta(hero.rotation.y, Math.atan2(direction.x, direction.z)) * (1 - Math.exp(-HERO_TURN_RESPONSE * dt)) }
      if (currentSpeed > .01) {
        const distance = moveHeroWithSlide(lastTravelDirection.scale(currentSpeed * dt)); moved += distance
        if (distance < .001 && currentSpeed > .4) currentSpeed *= .42
      }
    }
    measuredSpeed = planarSpeed(hero.position.x - startX, hero.position.z - startZ, seconds)
    if (moved > .0001) {
      walkPhase += moved * 5.2
      if (leftLeg) leftLeg.rotation.x = Math.sin(walkPhase) * .34
      if (rightLeg) rightLeg.rotation.x = -Math.sin(walkPhase) * .34
      if (!parcel?.isEnabled()) {
        if (leftArm) leftArm.rotation.x = -Math.sin(walkPhase) * .22
        if (rightArm) rightArm.rotation.x = Math.sin(walkPhase) * .22
      }
    }
    for (const mesh of scene.meshes) {
      if (!mesh.checkCollisions || !mesh.isEnabled()) continue
      const b = mesh.getBoundingInfo().boundingBox, min = b.minimumWorld, max = b.maximumWorld, p = camera.position
      if (p.x > min.x - .03 && p.x < max.x + .03 && p.y > min.y - .03 && p.y < max.y + .03 && p.z > min.z - .03 && p.z < max.z + .03) { camera.radius = Math.max(camera.lowerRadiusLimit ?? 3.1, camera.radius - .24); break }
    }
  })
  window.__DROPiNaturalControls = {
    issue: CONTROL_ISSUE, navigationIssue: NAV_ISSUE, mode: 'camera-relative-analog-v2',
    getJoystick: () => ({ x: joystick.state.x, y: joystick.state.y, magnitude: joystick.state.magnitude }),
    getSpeed: () => measuredSpeed, getCameraRadius: () => camera.radius,
  }
}
boot()
