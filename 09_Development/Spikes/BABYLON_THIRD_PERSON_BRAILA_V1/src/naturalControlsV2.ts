import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { EngineStore } from '@babylonjs/core/Engines/engineStore'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { HERO_WALK_SPEED_MPS } from './authoredWalk'

const CONTROL_ISSUE = 715
const NAV_ISSUE = 716
const HERO_RADIUS_M = 0.42
const MAX_SPEED_MPS = HERO_WALK_SPEED_MPS
const JOYSTICK_DEAD_ZONE = 0.12
const ACCELERATION_MPS2 = 11.5
const DECELERATION_MPS2 = 17
const HERO_TURN_RESPONSE = 12
const CAMERA_SAFETY_RADIUS = new Vector3(0.62, 0.44, 0.62)
const CAMERA_ZOOM_STEP_M = 0.8

type JoystickState = {
  x: number
  y: number
  magnitude: number
  pointerId: number | null
}

type NaturalControlsDebug = {
  issue: number
  navigationIssue: number
  mode: 'camera-relative-analog-v2'
  getJoystick(): { x: number; y: number; magnitude: number }
  getSpeed(): number
  getCameraRadius(): number
}

declare global {
  interface Window {
    __DROPiNaturalControls?: NaturalControlsDebug
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const moveTowards = (current: number, target: number, maxDelta: number): number => {
  if (Math.abs(target - current) <= maxDelta) return target
  return current + Math.sign(target - current) * maxDelta
}

const shortestAngleDelta = (from: number, to: number): number =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from))

const addStyles = (): void => {
  const style = document.createElement('style')
  style.dataset.dropiNaturalControlsV2 = String(NAV_ISSUE)
  style.textContent = `
    #movement-pad {
      width: 148px;
      height: 148px;
      display: flex !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px !important;
      pointer-events: none;
    }

    #movement-pad .dropi-joystick-base {
      position: relative;
      width: 118px;
      height: 118px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, .28);
      background: radial-gradient(circle at 50% 50%, rgba(18, 63, 89, .62), rgba(4, 19, 31, .82));
      box-shadow: inset 0 0 0 2px rgba(93, 214, 255, .08), 0 10px 24px rgba(0, 0, 0, .28);
      pointer-events: auto;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }

    #movement-pad .dropi-joystick-base::before,
    #movement-pad .dropi-joystick-base::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      background: rgba(159, 221, 241, .12);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    #movement-pad .dropi-joystick-base::before {
      width: 72%;
      height: 1px;
    }

    #movement-pad .dropi-joystick-base::after {
      width: 1px;
      height: 72%;
    }

    #movement-pad .dropi-joystick-knob {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 52px;
      height: 52px;
      margin-left: -26px;
      margin-top: -26px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, .4);
      background: rgba(48, 174, 216, .9);
      box-shadow: 0 7px 18px rgba(0, 0, 0, .32), inset 0 0 0 2px rgba(255, 255, 255, .08);
      transform: translate3d(0, 0, 0);
      will-change: transform;
      pointer-events: none;
    }

    #movement-pad .dropi-joystick-label {
      color: rgba(230, 246, 252, .82);
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .12em;
      text-shadow: 0 1px 3px rgba(0, 0, 0, .6);
      pointer-events: none;
    }

    #dropi-camera-zoom {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      pointer-events: auto;
    }

    #dropi-camera-zoom button {
      min-width: 54px !important;
      min-height: 34px !important;
      font-size: 13px !important;
      padding: 0 8px;
      letter-spacing: .05em;
    }

    #dropi-natural-control-badge {
      position: fixed;
      left: 50%;
      bottom: max(8px, env(safe-area-inset-bottom));
      z-index: 8;
      transform: translateX(-50%);
      padding: 5px 8px;
      border-radius: 8px;
      background: rgba(3, 15, 26, .58);
      color: rgba(206, 235, 246, .72);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .1em;
      pointer-events: none;
    }

    @media (orientation: landscape) and (max-height: 600px) {
      #movement-pad {
        width: 132px;
        height: 132px;
      }

      #movement-pad .dropi-joystick-base {
        width: 102px;
        height: 102px;
      }

      #movement-pad .dropi-joystick-knob {
        width: 46px;
        height: 46px;
        margin-left: -23px;
        margin-top: -23px;
      }
    }
  `
  document.head.append(style)
}

const installJoystick = (): {
  state: JoystickState
  reset: () => void
} | null => {
  const movementPad = document.querySelector<HTMLElement>('#movement-pad')
  if (!movementPad) return null

  movementPad.replaceChildren()

  const base = document.createElement('div')
  base.className = 'dropi-joystick-base'
  base.setAttribute('role', 'application')
  base.setAttribute('aria-label', 'Camera-relative movement joystick')

  const knob = document.createElement('div')
  knob.className = 'dropi-joystick-knob'
  base.append(knob)

  const label = document.createElement('div')
  label.className = 'dropi-joystick-label'
  label.textContent = 'MOVE · CAMERA RELATIVE'

  movementPad.append(base, label)

  const state: JoystickState = { x: 0, y: 0, magnitude: 0, pointerId: null }

  const renderKnob = (): void => {
    const rect = base.getBoundingClientRect()
    const travelRadius = Math.max(28, rect.width * 0.34)
    knob.style.transform = `translate3d(${(state.x * travelRadius).toFixed(1)}px, ${(state.y * travelRadius).toFixed(1)}px, 0)`
  }

  const reset = (): void => {
    state.x = 0
    state.y = 0
    state.magnitude = 0
    state.pointerId = null
    renderKnob()
  }

  const updateFromPointer = (event: PointerEvent): void => {
    const rect = base.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const travelRadius = Math.max(28, rect.width * 0.34)
    const rawX = (event.clientX - centerX) / travelRadius
    const rawY = (event.clientY - centerY) / travelRadius
    const rawMagnitude = Math.hypot(rawX, rawY)
    const scale = rawMagnitude > 1 ? 1 / rawMagnitude : 1
    const x = rawX * scale
    const y = rawY * scale
    const magnitude = Math.hypot(x, y)

    if (magnitude <= JOYSTICK_DEAD_ZONE) {
      state.x = 0
      state.y = 0
      state.magnitude = 0
    } else {
      const normalizedMagnitude = clamp(
        (magnitude - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE),
        0,
        1,
      )
      const inverseMagnitude = magnitude > 0 ? 1 / magnitude : 0
      state.x = x * inverseMagnitude * normalizedMagnitude
      state.y = y * inverseMagnitude * normalizedMagnitude
      state.magnitude = normalizedMagnitude
    }

    renderKnob()
  }

  base.addEventListener('pointerdown', event => {
    event.preventDefault()
    event.stopPropagation()
    state.pointerId = event.pointerId
    base.setPointerCapture(event.pointerId)
    updateFromPointer(event)
  })

  base.addEventListener('pointermove', event => {
    if (state.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    updateFromPointer(event)
  })

  const release = (event: PointerEvent): void => {
    if (state.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    reset()
  }

  base.addEventListener('pointerup', release)
  base.addEventListener('pointercancel', release)
  base.addEventListener('lostpointercapture', reset)
  window.addEventListener('blur', reset)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset()
  })
  window.addEventListener('dropi:native-back', reset)

  return { state, reset }
}

const installCameraZoom = (camera: ArcRotateCamera): void => {
  const actionStack = document.querySelector<HTMLElement>('#action-stack')
  if (!actionStack || document.querySelector('#dropi-camera-zoom')) return

  const wrap = document.createElement('div')
  wrap.id = 'dropi-camera-zoom'

  const zoomOut = document.createElement('button')
  zoomOut.type = 'button'
  zoomOut.textContent = 'CAM −'
  zoomOut.setAttribute('aria-label', 'Zoom camera out')

  const zoomIn = document.createElement('button')
  zoomIn.type = 'button'
  zoomIn.textContent = 'CAM +'
  zoomIn.setAttribute('aria-label', 'Zoom camera in')

  const adjust = (delta: number): void => {
    const minimum = camera.lowerRadiusLimit ?? 3.1
    const maximum = camera.upperRadiusLimit ?? 6.4
    camera.radius = clamp(camera.radius + delta, minimum, maximum)
  }

  zoomOut.addEventListener('pointerdown', event => {
    event.preventDefault()
    event.stopPropagation()
    adjust(CAMERA_ZOOM_STEP_M)
  })
  zoomIn.addEventListener('pointerdown', event => {
    event.preventDefault()
    event.stopPropagation()
    adjust(-CAMERA_ZOOM_STEP_M)
  })

  wrap.append(zoomOut, zoomIn)
  actionStack.prepend(wrap)
}

const addControlBadge = (): void => {
  if (document.querySelector('#dropi-natural-control-badge')) return
  const badge = document.createElement('div')
  badge.id = 'dropi-natural-control-badge'
  badge.textContent = 'NATURAL CONTROL V2 · #715 · GPS #716'
  document.body.append(badge)
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  const activeCamera = scene?.activeCamera
  const movementPad = document.querySelector<HTMLElement>('#movement-pad')

  if (!scene || !hero || !(activeCamera instanceof ArcRotateCamera) || !movementPad) {
    window.requestAnimationFrame(boot)
    return
  }

  addStyles()
  addControlBadge()
  const joystick = installJoystick()
  if (!joystick) return

  const camera = activeCamera
  camera.collisionRadius.copyFrom(CAMERA_SAFETY_RADIUS)
  camera.minZ = Math.max(camera.minZ, 0.12)
  installCameraZoom(camera)

  const leftLeg = scene.getMeshByName('hero-leg-l')
  const rightLeg = scene.getMeshByName('hero-leg-r')
  const leftArm = scene.getMeshByName('hero-arm-l')
  const rightArm = scene.getMeshByName('hero-arm-r')
  const parcel = scene.getMeshByName('hero-parcel')

  let currentSpeed = 0
  let measuredSpeed = 0
  let walkPhase = 0
  let lastTravelDirection = new Vector3(0, 0, -1)

  const isBlocked = (position: Vector3): boolean => {
    if (Math.abs(position.x) > 82 || position.z > 58 || position.z < -39) return true

    for (const mesh of scene.meshes) {
      if (!mesh.checkCollisions || !mesh.isEnabled()) continue
      const bounds = mesh.getBoundingInfo().boundingBox
      const min = bounds.minimumWorld
      const max = bounds.maximumWorld
      if (
        position.x > min.x - HERO_RADIUS_M &&
        position.x < max.x + HERO_RADIUS_M &&
        position.z > min.z - HERO_RADIUS_M &&
        position.z < max.z + HERO_RADIUS_M
      ) {
        return true
      }
    }

    return false
  }

  const moveHeroWithSlide = (delta: Vector3): number => {
    const startX = hero.position.x
    const startZ = hero.position.z

    const xCandidate = hero.position.clone()
    xCandidate.x += delta.x
    if (!isBlocked(xCandidate)) hero.position.x = xCandidate.x

    const zCandidate = hero.position.clone()
    zCandidate.z += delta.z
    if (!isBlocked(zCandidate)) hero.position.z = zCandidate.z

    return Math.hypot(hero.position.x - startX, hero.position.z - startZ)
  }

  const getCameraRelativeDirection = (): Vector3 | null => {
    if (joystick.state.magnitude <= 0) return null

    const cameraTarget = camera.getTarget()
    const forward = cameraTarget.subtract(camera.position)
    forward.y = 0
    if (forward.lengthSquared() < 0.0001) return null
    forward.normalize()

    // Babylon's default scene is left-handed. Up × forward is screen-right.
    // The previous spike used the negative of this vector, which inverted left/right.
    const right = new Vector3(forward.z, 0, -forward.x)
    const direction = forward.scale(-joystick.state.y).add(right.scale(joystick.state.x))
    direction.y = 0
    if (direction.lengthSquared() < 0.0001) return null
    direction.normalize()
    return direction
  }

  const cameraInsideCollisionMesh = (): string | null => {
    for (const mesh of scene.meshes) {
      if (!mesh.checkCollisions || !mesh.isEnabled()) continue
      const bounds = mesh.getBoundingInfo().boundingBox
      const min = bounds.minimumWorld
      const max = bounds.maximumWorld
      if (
        camera.position.x > min.x - 0.03 &&
        camera.position.x < max.x + 0.03 &&
        camera.position.y > min.y - 0.03 &&
        camera.position.y < max.y + 0.03 &&
        camera.position.z > min.z - 0.03 &&
        camera.position.z < max.z + 0.03
      ) {
        return mesh.name
      }
    }
    return null
  }

  scene.onBeforeRenderObservable.add(() => {
    const rawFrameMs = scene.getEngine().getDeltaTime()
    const dt = Math.min(rawFrameMs / 1000, 0.05)
    const requestedDirection = getCameraRelativeDirection()
    const targetSpeed = requestedDirection ? MAX_SPEED_MPS * joystick.state.magnitude : 0
    const response = targetSpeed > currentSpeed ? ACCELERATION_MPS2 : DECELERATION_MPS2
    currentSpeed = moveTowards(currentSpeed, targetSpeed, response * dt)

    if (requestedDirection) {
      lastTravelDirection = requestedDirection
      const desiredYaw = Math.atan2(requestedDirection.x, requestedDirection.z)
      const turnBlend = 1 - Math.exp(-HERO_TURN_RESPONSE * dt)
      hero.rotation.y += shortestAngleDelta(hero.rotation.y, desiredYaw) * turnBlend
    }

    let movedDistance = 0
    if (currentSpeed > 0.01) {
      movedDistance = moveHeroWithSlide(lastTravelDirection.scale(currentSpeed * dt))
      if (movedDistance < 0.001 && currentSpeed > 0.4) currentSpeed *= 0.42
    }
    // Report actual post-collision travel, not requested velocity. Footsteps and
    // animation must stop when the hero is pushing against an obstacle.
    measuredSpeed = rawFrameMs > 0 && rawFrameMs < 250 ? movedDistance / (rawFrameMs / 1000) : 0

    if (movedDistance > 0.0001) {
      walkPhase += movedDistance * 5.2
      if (leftLeg) leftLeg.rotation.x = Math.sin(walkPhase) * 0.34
      if (rightLeg) rightLeg.rotation.x = -Math.sin(walkPhase) * 0.34
      if (!parcel?.isEnabled()) {
        if (leftArm) leftArm.rotation.x = -Math.sin(walkPhase) * 0.22
        if (rightArm) rightArm.rotation.x = Math.sin(walkPhase) * 0.22
      }
    }

    const clippingMesh = cameraInsideCollisionMesh()
    if (clippingMesh) {
      const minimumRadius = camera.lowerRadiusLimit ?? 3.1
      camera.radius = Math.max(minimumRadius, camera.radius - 0.24)
    }
  })

  window.__DROPiNaturalControls = {
    issue: CONTROL_ISSUE,
    navigationIssue: NAV_ISSUE,
    mode: 'camera-relative-analog-v2',
    getJoystick: () => ({
      x: joystick.state.x,
      y: joystick.state.y,
      magnitude: joystick.state.magnitude,
    }),
    getSpeed: () => measuredSpeed,
    getCameraRadius: () => camera.radius,
  }
}

boot()
