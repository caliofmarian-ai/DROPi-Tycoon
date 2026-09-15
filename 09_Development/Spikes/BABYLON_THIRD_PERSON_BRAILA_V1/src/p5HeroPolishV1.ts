import { EngineStore, Mesh, TransformNode } from '@babylonjs/core'
import { resizeParcelPresentation } from './completeAssetPresentation'
import type { ContactRuntimeState } from './humanContactRuntime'

type P5State = {
  issue: number; active: boolean; riggedStatus: 'LOADING' | 'ACTIVE' | 'FALLBACK'
  ghostMeshes: number; carryMode: 'NONE' | 'TWO_HAND_IK_CONTACT' | 'UNVERIFIED'
  skinnedClearance: number | null; handErrorM: number | null; mechanicalStatus: 'UNKNOWN' | 'PASS' | 'FAIL'
}
declare global { interface Window { __DROPiP5HeroPolish?: P5State } }
const legacy = (mesh: Mesh): boolean =>
  ['hero-torso', 'hero-head', 'hero-leg-l', 'hero-leg-r', 'hero-arm-l', 'hero-arm-r'].includes(mesh.name) ||
  mesh.name.startsWith('realism-v2-hero-') || mesh.name.startsWith('target-hero-') || mesh.name.startsWith('hero-motion-')
const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !(scene.getTransformNodeByName('hero') instanceof TransformNode)) { window.requestAnimationFrame(boot); return }
  if (scene.metadata?.dropiP5HeroPolishV1) return
  const cached = new Set(scene.meshes.filter((mesh): mesh is Mesh => mesh instanceof Mesh && legacy(mesh)))
  const meshObserver = scene.onNewMeshAddedObservable.add(mesh => { if (mesh instanceof Mesh && legacy(mesh)) cached.add(mesh) })
  const parcel = scene.getMeshByName('hero-parcel')
  if (parcel) resizeParcelPresentation(parcel)
  const state: P5State = { issue: 725, active: true, riggedStatus: 'LOADING', ghostMeshes: 0, carryMode: 'NONE', skinnedClearance: null, handErrorM: null, mechanicalStatus: 'UNKNOWN' }
  const badge = document.createElement('div')
  badge.id = 'dropi-p5-hero-polish-status'
  Object.assign(badge.style, { position: 'fixed', top: '176px', right: '12px', zIndex: '21', color: '#ffe5a6', background: 'rgba(7,20,28,.76)', padding: '5px 8px', font: '800 9px/1.2 system-ui', pointerEvents: 'none' })
  document.body.append(badge)
  let lastUI = 0, restored = false
  const observer = scene.onBeforeRenderObservable.add(() => {
    const rigged = (window as unknown as { __DROPiRiggedHeroV1?: { loaded: boolean; fallback: boolean; animation: string } }).__DROPiRiggedHeroV1
    const failed = rigged?.animation === 'FALLBACK_PROCEDURAL'
    state.riggedStatus = failed ? 'FALLBACK' : rigged?.loaded && !rigged.fallback ? 'ACTIVE' : 'LOADING'
    for (const mesh of cached) {
      if (mesh.isDisposed()) { cached.delete(mesh); continue }
      if (!failed) { mesh.isVisible = false; mesh.setEnabled(false) }
      else if (!restored) {
        // Restore one complete fallback family, not the original + V2 together.
        const isCurrentFallback = mesh.name.startsWith('realism-v2-hero-') || mesh.name.startsWith('target-hero-') || mesh.name.startsWith('hero-motion-')
        mesh.isVisible = isCurrentFallback; mesh.setEnabled(isCurrentFallback)
      }
    }
    restored = Boolean(failed)
    state.ghostMeshes = failed ? 0 : [...cached].filter(mesh => mesh.isEnabled() && mesh.isVisible).length
    const contact = (window as unknown as { __DROPiContactRuntime?: ContactRuntimeState }).__DROPiContactRuntime
    state.skinnedClearance = contact?.hero?.minFootClearanceM ?? null
    state.handErrorM = contact?.hero?.handErrorM ?? null
    state.mechanicalStatus = contact?.mechanicalStatus ?? 'UNKNOWN'
    state.carryMode = !parcel?.isEnabled() ? 'NONE' : contact?.hero?.carry && (state.handErrorM ?? Infinity) <= .025 ? 'TWO_HAND_IK_CONTACT' : 'UNVERIFIED'
    // No parcel positioning or whole-mesh CPU skinning here. The contact
    // controller is the sole pose/ground/carry writer for the active rig.
    if (performance.now() - lastUI > 250) {
      const feet = state.skinnedClearance === null ? '?' : `${Math.round(state.skinnedClearance * 1000)}mm`
      badge.textContent = `HERO · ${state.riggedStatus} · GHOST ${state.ghostMeshes} · FEET ${feet} · ${state.mechanicalStatus}`
      badge.style.color = state.mechanicalStatus === 'PASS' && state.ghostMeshes === 0 ? '#baf2c5' : '#ffe5a6'
      window.__DROPiP5HeroPolish = { ...state }; lastUI = performance.now()
    }
  })
  scene.onDisposeObservable.addOnce(() => { scene.onNewMeshAddedObservable.remove(meshObserver); scene.onBeforeRenderObservable.remove(observer); badge.remove() })
  scene.metadata = { ...(scene.metadata ?? {}), dropiP5HeroPolishV1: true }
}
boot()
