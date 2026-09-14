import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { EngineStore } from '@babylonjs/core/Engines/engineStore'
import { cameraBoomDirection, insideCameraBox, recoverCameraRadius, resolveCameraBoom } from './cameraOcclusion'
import type { CameraBox, BoomResult } from './cameraOcclusion'

const CAMERA_ISSUE = 717
const CAMERA_MAX_RADIUS_M = 11
const CAMERA_MIN_RADIUS_M = 3.1
const CAMERA_MIN_BETA = .42
const CAMERA_MAX_BETA = 1.52
const CAMERA_HORIZONTAL_SENSIBILITY = 720
const CAMERA_VERTICAL_SENSIBILITY = 900
const RECENTER_BETA = 1.17
const RECENTER_RESPONSE = 10

type CameraAuthorityDebug = {
  issue: number
  mode: 'player-free-look'
  getState(): {
    alpha: number; beta: number; radius: number; requestedRadius: number
    dragging: boolean; recentering: boolean; occlusion: BoomResult['status'] | 'FAIL'
    blocker: string | null; error: string
  }
}
declare global { interface Window { __DROPiCameraAuthorityV3?: CameraAuthorityDebug } }
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
const shortestAngleDelta = (from: number, to: number): number => Math.atan2(Math.sin(to - from), Math.cos(to - from))
const addCameraHelp = (): void => {
  if (document.querySelector('#dropi-camera-authority-help')) return
  const style = document.createElement('style')
  style.dataset.dropiCameraAuthority = String(CAMERA_ISSUE)
  style.textContent = `
    #dropi-camera-authority-help {
      position: fixed; left: 50%; top: max(8px, env(safe-area-inset-top)); z-index: 13;
      transform: translateX(-50%); max-width: 45vw; padding: 6px 10px; border-radius: 9px;
      background: rgba(3,15,26,.68); border: 1px solid rgba(93,214,255,.2); color: rgba(225,244,250,.82);
      font-size: 8px; font-weight: 800; letter-spacing: .08em; text-align: center; pointer-events: none; user-select: none;
    }
    @media (orientation: landscape) and (max-height: 600px) {
      #dropi-camera-authority-help { top: max(6px, env(safe-area-inset-top)); font-size: 7px; max-width: 36vw; padding: 5px 8px; }
    }
  `
  document.head.append(style)
  const help = document.createElement('div')
  help.id = 'dropi-camera-authority-help'
  help.textContent = 'DRAG WORLD = FAST FREE LOOK · VIEW STAYS · RECENTER ONLY WHEN YOU ASK'
  document.body.append(help)
}
const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  const activeCamera = scene?.activeCamera
  const canvas = document.querySelector<HTMLCanvasElement>('#renderCanvas')
  const recenterButton = document.querySelector<HTMLButtonElement>('#recenter')
  if (!scene || !hero || !(activeCamera instanceof ArcRotateCamera) || !canvas || !recenterButton) { window.requestAnimationFrame(boot); return }
  if (window.__DROPiCameraAuthorityV3) return
  const camera = activeCamera
  // The user's requested zoom stays in the accepted range. A safety pull-in
  // can go closer than 3.1m; that minimum previously forced the eye into walls.
  camera.lowerRadiusLimit = .05
  camera.upperRadiusLimit = CAMERA_MAX_RADIUS_M
  camera.lowerBetaLimit = CAMERA_MIN_BETA; camera.upperBetaLimit = CAMERA_MAX_BETA
  camera.angularSensibilityX = CAMERA_HORIZONTAL_SENSIBILITY; camera.angularSensibilityY = CAMERA_VERTICAL_SENSIBILITY
  camera.inertia = .55
  // Keep the engine collider enabled as a second safety check. Never disable
  // building colliders, gameplay obstacles or collisions to make a test green.
  camera.checkCollisions = true
  let lockedAlpha = camera.alpha, lockedBeta = camera.beta
  let requestedRadius = clamp(camera.radius, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
  let lastAppliedRadius = requestedRadius
  let dragging = false, recentering = false
  let occlusion: BoomResult['status'] | 'FAIL' = 'CLEAR', blocker: string | null = null, error = ''
  const activePointers = new Set<number>()
  const captureAngles = (): void => { lockedAlpha = camera.alpha; lockedBeta = clamp(camera.beta, CAMERA_MIN_BETA, CAMERA_MAX_BETA) }
  const begin = (event: PointerEvent): void => { activePointers.add(event.pointerId); dragging = true; recentering = false }
  const move = (): void => { if (dragging) window.requestAnimationFrame(captureAngles) }
  const end = (event: PointerEvent): void => {
    activePointers.delete(event.pointerId)
    if (activePointers.size) return
    dragging = false; window.requestAnimationFrame(captureAngles)
  }
  canvas.addEventListener('pointerdown', begin, { passive: true })
  canvas.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerup', end, { passive: true })
  window.addEventListener('pointercancel', end, { passive: true })
  document.addEventListener('pointerdown', event => {
    if (!(event.target instanceof Element) || !event.target.closest('#dropi-camera-zoom button')) return
    const before = camera.radius
    recentering = false
    window.setTimeout(() => {
      // Apply the button's delta to the requested radius, not the temporarily
      // shortened boom. Leaving a wall restores the user's chosen distance.
      requestedRadius = clamp(requestedRadius + camera.radius - before, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
    }, 0)
  }, { capture: true })
  canvas.addEventListener('wheel', () => {
    const before = camera.radius
    window.requestAnimationFrame(() => { requestedRadius = clamp(requestedRadius + camera.radius - before, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M) })
  }, { passive: true })
  recenterButton.addEventListener('pointerdown', () => { dragging = false; activePointers.clear(); recentering = true })
  const release = (): void => { activePointers.clear(); dragging = false; captureAngles() }
  window.addEventListener('blur', release)
  document.addEventListener('visibilitychange', () => { if (document.hidden) release() })

  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, .1)
    if (dragging) {
      captureAngles()
      if (activePointers.size > 1) requestedRadius = clamp(requestedRadius + camera.radius - lastAppliedRadius, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
    } else if (recentering) {
      const blend = 1 - Math.exp(-RECENTER_RESPONSE * dt), targetAlpha = hero.rotation.y - Math.PI / 2
      lockedAlpha += shortestAngleDelta(lockedAlpha, targetAlpha) * blend
      lockedBeta += (RECENTER_BETA - lockedBeta) * blend
      if (Math.abs(shortestAngleDelta(lockedAlpha, targetAlpha)) < .01 && Math.abs(lockedBeta - RECENTER_BETA) < .01) {
        lockedAlpha = targetAlpha; lockedBeta = RECENTER_BETA; recentering = false
      }
    }
    // Legacy follow and the movement safety code must not overwrite player yaw
    // or re-expand a collision-shortened camera to its old desired radius.
    camera.alpha = lockedAlpha; camera.beta = lockedBeta
    try {
      const boxes: CameraBox[] = []
      for (const mesh of scene.meshes) {
        if (!mesh.isEnabled() || mesh.getTotalVertices() <= 0) continue
        const overhead = mesh.isVisible && (mesh.name === 'realism-hq-canopy' || mesh.name.startsWith('target-shop-awning-'))
        if (!mesh.checkCollisions && !overhead) continue
        mesh.computeWorldMatrix(true)
        const b = mesh.getBoundingInfo().boundingBox
        boxes.push({ id: mesh.name, min: b.minimumWorld, max: b.maximumWorld })
      }
      const focus = scene.getTransformNodeByName('third-person-camera-target')
      if (focus) {
        // Relocation/restart must not drag the old focus point through buildings.
        // During ordinary movement the accepted follow smoothing is preserved.
        const desired = { x: hero.position.x, y: hero.position.y + 1.18, z: hero.position.z }
        if (Math.hypot(focus.position.x - desired.x, focus.position.y - desired.y, focus.position.z - desired.z) > 2 || boxes.some(box => insideCameraBox(focus.position, box))) {
          focus.position.set(desired.x, desired.y, desired.z)
        }
        focus.computeWorldMatrix(true)
      }
      const origin = camera.getTarget()
      const result = resolveCameraBoom(origin, cameraBoomDirection(lockedAlpha, lockedBeta), requestedRadius, boxes)
      occlusion = result.status; blocker = result.blocker; error = ''
      camera.radius = Math.max(.05, recoverCameraRadius(lastAppliedRadius, result.radius, dt))
      lastAppliedRadius = camera.radius
      camera.getViewMatrix(true)
    } catch (cause) {
      occlusion = 'FAIL'; error = cause instanceof Error ? cause.message : String(cause)
      // Retain the engine collision handler and previous safe distance.
      camera.radius = Math.max(.05, lastAppliedRadius)
    }
  })
  scene.onDisposeObservable.addOnce(() => scene.onBeforeRenderObservable.remove(observer))
  addCameraHelp()
  window.__DROPiCameraAuthorityV3 = {
    issue: CAMERA_ISSUE, mode: 'player-free-look',
    getState: () => ({ alpha: camera.alpha, beta: camera.beta, radius: camera.radius, requestedRadius, dragging, recentering, occlusion, blocker, error }),
  }
}
boot()
