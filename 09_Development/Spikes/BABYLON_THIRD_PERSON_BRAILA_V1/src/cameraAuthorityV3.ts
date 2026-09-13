import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { EngineStore } from '@babylonjs/core/Engines/engineStore'

const CAMERA_ISSUE = 717
const CAMERA_MAX_RADIUS_M = 11
const CAMERA_MIN_RADIUS_M = 3.1
const RECENTER_BETA = 1.17
const RECENTER_RESPONSE = 10

type CameraAuthorityDebug = {
  issue: number
  mode: 'player-free-look'
  getState(): {
    alpha: number
    beta: number
    radius: number
    dragging: boolean
    recentering: boolean
  }
}

declare global {
  interface Window {
    __DROPiCameraAuthorityV3?: CameraAuthorityDebug
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const shortestAngleDelta = (from: number, to: number): number =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from))

const addCameraHelp = (): void => {
  if (document.querySelector('#dropi-camera-authority-help')) return

  const style = document.createElement('style')
  style.dataset.dropiCameraAuthority = String(CAMERA_ISSUE)
  style.textContent = `
    #dropi-camera-authority-help {
      position: fixed;
      left: 50%;
      top: max(8px, env(safe-area-inset-top));
      z-index: 13;
      transform: translateX(-50%);
      max-width: 45vw;
      padding: 6px 10px;
      border-radius: 9px;
      background: rgba(3, 15, 26, .68);
      border: 1px solid rgba(93, 214, 255, .2);
      color: rgba(225, 244, 250, .82);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .08em;
      text-align: center;
      pointer-events: none;
      user-select: none;
    }

    @media (orientation: landscape) and (max-height: 600px) {
      #dropi-camera-authority-help {
        top: max(6px, env(safe-area-inset-top));
        font-size: 7px;
        max-width: 36vw;
        padding: 5px 8px;
      }
    }
  `
  document.head.append(style)

  const help = document.createElement('div')
  help.id = 'dropi-camera-authority-help'
  help.textContent = 'DRAG WORLD = FREE LOOK · VIEW STAYS · RECENTER ONLY WHEN YOU ASK'
  document.body.append(help)
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  const activeCamera = scene?.activeCamera
  const canvas = document.querySelector<HTMLCanvasElement>('#renderCanvas')
  const recenterButton = document.querySelector<HTMLButtonElement>('#recenter')

  if (!scene || !hero || !(activeCamera instanceof ArcRotateCamera) || !canvas || !recenterButton) {
    window.requestAnimationFrame(boot)
    return
  }

  const camera = activeCamera
  camera.lowerRadiusLimit = CAMERA_MIN_RADIUS_M
  camera.upperRadiusLimit = CAMERA_MAX_RADIUS_M
  camera.angularSensibilityX = 1125
  camera.angularSensibilityY = 1450
  camera.inertia = 0.62

  let lockedAlpha = camera.alpha
  let lockedBeta = camera.beta
  let lockedRadius = clamp(camera.radius, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
  let dragging = false
  let recentering = false
  const activePointers = new Set<number>()

  const captureView = (): void => {
    lockedAlpha = camera.alpha
    lockedBeta = camera.beta
    lockedRadius = clamp(camera.radius, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
  }

  const beginWorldGesture = (event: PointerEvent): void => {
    activePointers.add(event.pointerId)
    dragging = true
    recentering = false
  }

  const updateWorldGesture = (): void => {
    if (!dragging) return
    // Babylon applies its ArcRotate input during the same interaction frame.
    // Capture on the next animation frame so the player's latest yaw/pitch/zoom
    // becomes the persistent camera state.
    window.requestAnimationFrame(captureView)
  }

  const endWorldGesture = (event: PointerEvent): void => {
    activePointers.delete(event.pointerId)
    if (activePointers.size > 0) return
    dragging = false
    window.requestAnimationFrame(captureView)
  }

  canvas.addEventListener('pointerdown', beginWorldGesture, { passive: true })
  canvas.addEventListener('pointermove', updateWorldGesture, { passive: true })
  window.addEventListener('pointerup', endWorldGesture, { passive: true })
  window.addEventListener('pointercancel', endWorldGesture, { passive: true })

  // Explicit zoom buttons live outside the canvas, so capture their result after
  // the button handler updates camera.radius.
  document.addEventListener('pointerdown', event => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest('#dropi-camera-zoom button')) return
    recentering = false
    window.setTimeout(() => {
      lockedRadius = clamp(camera.radius, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
    }, 0)
  }, { capture: true })

  recenterButton.addEventListener('pointerdown', () => {
    dragging = false
    activePointers.clear()
    lockedRadius = clamp(camera.radius, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
    recentering = true
  })

  window.addEventListener('blur', () => {
    activePointers.clear()
    dragging = false
    captureView()
  })

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return
    activePointers.clear()
    dragging = false
    captureView()
  })

  scene.onBeforeRenderObservable.add(() => {
    if (dragging) {
      // main.ts already suspends its follow while a canvas pointer is active.
      // Keep recording the user-selected view and never fight the gesture.
      lockedAlpha = camera.alpha
      lockedBeta = camera.beta
      lockedRadius = clamp(camera.radius, CAMERA_MIN_RADIUS_M, CAMERA_MAX_RADIUS_M)
      return
    }

    if (recentering) {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
      const blend = 1 - Math.exp(-RECENTER_RESPONSE * dt)
      const targetAlpha = hero.rotation.y - Math.PI / 2

      camera.alpha += shortestAngleDelta(camera.alpha, targetAlpha) * blend
      camera.beta += (RECENTER_BETA - camera.beta) * blend
      camera.radius = lockedRadius

      if (
        Math.abs(shortestAngleDelta(camera.alpha, targetAlpha)) < 0.01 &&
        Math.abs(camera.beta - RECENTER_BETA) < 0.01
      ) {
        camera.alpha = targetAlpha
        camera.beta = RECENTER_BETA
        lockedAlpha = camera.alpha
        lockedBeta = camera.beta
        recentering = false
      }
      return
    }

    // main.ts has a legacy timed auto-follow. This observer intentionally runs
    // after it and restores the player's chosen yaw/pitch/distance, making
    // camera orientation player-authoritative until RECENTER is explicitly used.
    camera.alpha = lockedAlpha
    camera.beta = lockedBeta
    camera.radius = lockedRadius
  })

  addCameraHelp()

  window.__DROPiCameraAuthorityV3 = {
    issue: CAMERA_ISSUE,
    mode: 'player-free-look',
    getState: () => ({
      alpha: camera.alpha,
      beta: camera.beta,
      radius: camera.radius,
      dragging,
      recentering,
    }),
  }
}

boot()
