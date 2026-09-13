import { EngineStore, Mesh, TransformNode } from '@babylonjs/core'

const ISSUE = 725

type RiggedHeroState = {
  loaded: boolean
  fallback: boolean
  animation: string
}

type P5HeroPolishState = {
  issue: number
  active: boolean
  riggedStatus: 'LOADING' | 'ACTIVE' | 'FALLBACK'
  ghostMeshes: number
  carryMode: 'NONE' | 'CENTERED_TWO_HAND_PROXY'
}

declare global {
  interface Window {
    __DROPiPreferRiggedHero?: boolean
    __DROPiP5HeroPolish?: P5HeroPolishState
  }
}

window.__DROPiPreferRiggedHero = true

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
    mesh.setEnabled(false)
  }
  return hidden
}

const restoreLegacyHero = (): void => {
  for (const [mesh, wasEnabled] of proceduralSnapshot.entries()) {
    if (!mesh.isDisposed()) mesh.setEnabled(wasEnabled)
  }
}

const riggedState = (): RiggedHeroState | undefined =>
  (window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroState }).__DROPiRiggedHeroV1

const speed = (): number =>
  (window as unknown as { __DROPiNaturalControls?: { getSpeed?: () => number } }).__DROPiNaturalControls?.getSpeed?.() ?? 0

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
  }
  window.__DROPiP5HeroPolish = { ...state }

  let restoredFallback = false
  let parcelClock = 0

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
    parcelClock += dt
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
      mesh => mesh instanceof Mesh && isLegacyHeroMesh(mesh) && mesh.isEnabled(),
    ) as Mesh[]
    if (state.riggedStatus === 'ACTIVE' || state.riggedStatus === 'LOADING') {
      ghosts.forEach(mesh => mesh.setEnabled(false))
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
      const bob = Math.sin(parcelClock * (3.4 + movement * 2.0)) * 0.008 * movement
      parcel.position.set(0, 1.02 + bob, 0.34)
      parcel.rotation.set(0.06, 0, 0)
      state.carryMode = 'CENTERED_TWO_HAND_PROXY'
    } else {
      state.carryMode = 'NONE'
    }

    badge.textContent = `P5 HERO POLISH · ${state.riggedStatus} · GHOST ${state.ghostMeshes} · ${state.carryMode === 'NONE' ? 'NO CARRY' : 'CARRY'}`
    badge.style.color = state.riggedStatus === 'ACTIVE' && state.ghostMeshes === 0 ? '#baf2c5' : '#ffe5a6'
    window.__DROPiP5HeroPolish = { ...state }
  })

  scene.metadata = { ...(scene.metadata ?? {}), dropiP5HeroPolishV1: true }
}

void boot()
