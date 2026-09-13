import { EngineStore, Mesh, TransformNode } from '@babylonjs/core'

const ISSUE = 725
const SKIN_SOLE_CLEARANCE_M = 0.014

type RiggedHeroState = {
  loaded: boolean
  fallback: boolean
  animation: string
}

type GroundContactState = {
  surfaceY: number
  minFootClearance: number
  visualAuthority: 'PROCEDURAL_PROXY' | 'RIGGED_SOLE'
}

type P5HeroPolishState = {
  issue: number
  active: boolean
  riggedStatus: 'LOADING' | 'ACTIVE' | 'FALLBACK'
  ghostMeshes: number
  carryMode: 'NONE' | 'CENTERED_TWO_HAND_PROXY'
  skinnedClearance: number | null
  groundClampCorrections: number
}

declare global {
  interface Window {
    __DROPiP5HeroPolish?: P5HeroPolishState
  }
}

const proceduralSnapshot = new Map<Mesh, boolean>()

const isLegacyHeroMesh = (mesh: Mesh): boolean => {
  const exact = new Set([
    'hero-torso',
    'hero-head',
    'hero-leg-l',
    'hero-leg-r',
    'hero-arm-l',
    'hero-arm-r',
  ])
  return (
    exact.has(mesh.name) ||
    mesh.name.startsWith('realism-v2-hero-') ||
    mesh.name.startsWith('target-hero-') ||
    mesh.name.startsWith('hero-motion-')
  )
}

const hideLegacyHero = (): number => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return 0
  let hidden = 0
  for (const mesh of scene.meshes) {
    if (!(mesh instanceof Mesh) || !isLegacyHeroMesh(mesh)) continue
    if (!proceduralSnapshot.has(mesh)) proceduralSnapshot.set(mesh, mesh.isEnabled())
    if (mesh.isEnabled()) hidden += 1
    mesh.isVisible = false
    mesh.setEnabled(false)
  }
  return hidden
}

const restoreLegacyHero = (): void => {
  for (const [mesh, wasEnabled] of proceduralSnapshot.entries()) {
    if (mesh.isDisposed()) continue
    mesh.setEnabled(wasEnabled)
    mesh.isVisible = wasEnabled
  }
}

const riggedState = (): RiggedHeroState | undefined =>
  (window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroState }).__DROPiRiggedHeroV1

const groundState = (): GroundContactState | undefined =>
  (window as unknown as { __DROPiGroundContactV1?: GroundContactState }).__DROPiGroundContactV1

const speed = (): number =>
  (window as unknown as { __DROPiNaturalControls?: { getSpeed?: () => number } }).__DROPiNaturalControls?.getSpeed?.() ?? 0

const isUnderRoot = (mesh: Mesh, root: Mesh): boolean => {
  if (mesh === root) return true
  let parent = mesh.parent
  while (parent) {
    if (parent === root) return true
    parent = parent.parent
  }
  return false
}

const skinnedMinY = (root: Mesh): number | null => {
  const scene = root.getScene()
  let minY = Number.POSITIVE_INFINITY
  for (const mesh of scene.meshes) {
    if (!(mesh instanceof Mesh) || !mesh.isEnabled() || mesh.getTotalVertices() <= 0) continue
    if (!isUnderRoot(mesh, root)) continue
    // applySkeleton=true makes the check follow the animated rig rather than the
    // static bind-pose bounds that previously let a foot disappear into asphalt.
    mesh.refreshBoundingInfo(true)
    mesh.computeWorldMatrix(true)
    minY = Math.min(minY, mesh.getBoundingInfo().boundingBox.minimumWorld.y)
  }
  return Number.isFinite(minY) ? minY : null
}

const addBadge = (): HTMLElement => {
  const existing = document.querySelector<HTMLElement>('#dropi-p5-hero-polish-status')
  if (existing) return existing
  const badge = document.createElement('div')
  badge.id = 'dropi-p5-hero-polish-status'
  Object.assign(badge.style, {
    position: 'fixed',
    right: '12px',
    top: '176px',
    zIndex: '21',
    padding: '5px 8px',
    borderRadius: '8px',
    background: 'rgba(7,20,28,.76)',
    border: '1px solid rgba(255,255,255,.14)',
    color: '#ffe5a6',
    font: '800 8px/1 system-ui',
    letterSpacing: '.05em',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.append(badge)
  return badge
}

const compactOldBadges = (): void => {
  for (const selector of [
    '#dropi-p1-rigged-status',
    '#dropi-p2-environment-status',
    '#dropi-p3-authored-shells-status',
    '#dropi-p4-street-layer-status',
  ]) {
    const el = document.querySelector<HTMLElement>(selector)
    if (!el) continue
    el.style.opacity = '.28'
    el.style.transformOrigin = 'top right'
    el.style.transform = 'scale(.88)'
  }
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode)) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiP5HeroPolishV1) return

  const badge = addBadge()
  const state: P5HeroPolishState = {
    issue: ISSUE,
    active: true,
    riggedStatus: 'LOADING',
    ghostMeshes: 0,
    carryMode: 'NONE',
    skinnedClearance: null,
    groundClampCorrections: 0,
  }
  window.__DROPiP5HeroPolish = { ...state }

  let restoredFallback = false
  let parcelClock = 0
  let groundingFrame = 0

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
    parcelClock += dt
    groundingFrame += 1
    const rigged = riggedState()

    if (!rigged || !rigged.loaded) {
      if (rigged?.animation === 'FALLBACK_PROCEDURAL') {
        if (!restoredFallback) {
          restoreLegacyHero()
          restoredFallback = true
        }
        state.riggedStatus = 'FALLBACK'
      } else {
        hideLegacyHero()
        state.riggedStatus = 'LOADING'
      }
    } else if (!rigged.fallback) {
      hideLegacyHero()
      restoredFallback = false
      state.riggedStatus = 'ACTIVE'
    }

    const ghosts = scene.meshes.filter(
      mesh => mesh instanceof Mesh && isLegacyHeroMesh(mesh) && mesh.isEnabled() && mesh.isVisible,
    ) as Mesh[]
    if (state.riggedStatus === 'ACTIVE' || state.riggedStatus === 'LOADING') {
      ghosts.forEach(mesh => {
        mesh.isVisible = false
        mesh.setEnabled(false)
      })
      state.ghostMeshes = 0
    } else {
      state.ghostMeshes = ghosts.length
    }

    const parcel = scene.getMeshByName('hero-parcel')
    const visualRoot = scene.getTransformNodeByName('hero-visual-ground-root')
    if (
      state.riggedStatus === 'ACTIVE' &&
      parcel instanceof Mesh && parcel.isEnabled() &&
      visualRoot instanceof TransformNode
    ) {
      if (parcel.parent !== visualRoot) parcel.parent = visualRoot
      const movement = Math.min(1, speed() / 4.6)
      const bob = Math.sin(parcelClock * (2.8 + movement * 1.4)) * 0.004 * movement
      parcel.position.set(0, 1.00 + bob, 0.34)
      parcel.rotation.set(0.04, 0, 0)
      state.carryMode = 'CENTERED_TWO_HAND_PROXY'
    } else {
      state.carryMode = 'NONE'
    }

    // P0 originally grounded the rig from a calibrated sole plane. P5 adds a
    // measured animated-skin clamp at a reduced cadence so actual gait deformation
    // cannot push the shoe mesh below the current governed walkable surface.
    if (state.riggedStatus === 'ACTIVE' && visualRoot instanceof TransformNode && groundingFrame % 3 === 0) {
      const rigRoot = scene.getMeshByName('p1-rigged-hero-root')
      const ground = groundState()
      if (rigRoot instanceof Mesh && ground) {
        const minY = skinnedMinY(rigRoot)
        if (minY !== null) {
          const desiredMinY = ground.surfaceY + SKIN_SOLE_CLEARANCE_M
          const penetration = desiredMinY - minY
          if (penetration > 0) {
            visualRoot.position.y += Math.min(0.12, penetration)
            state.groundClampCorrections += 1
            state.skinnedClearance = SKIN_SOLE_CLEARANCE_M
          } else {
            state.skinnedClearance = minY - ground.surfaceY
          }
        }
      }
    }

    compactOldBadges()
    const clearance = state.skinnedClearance === null ? 'GROUND ?' : `GROUND ${Math.round(state.skinnedClearance * 1000)}mm`
    badge.textContent = `P5 HERO POLISH · ${state.riggedStatus} · GHOST ${state.ghostMeshes} · ${clearance} · ${state.carryMode === 'NONE' ? 'NO CARRY' : 'CARRY'}`
    badge.style.color = state.riggedStatus === 'ACTIVE' && state.ghostMeshes === 0 ? '#baf2c5' : '#ffe5a6'
    window.__DROPiP5HeroPolish = { ...state }
  })

  scene.metadata = { ...(scene.metadata ?? {}), dropiP5HeroPolishV1: true }
}

void boot()
