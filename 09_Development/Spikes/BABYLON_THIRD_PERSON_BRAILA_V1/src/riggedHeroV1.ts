import { AbstractMesh, DirectionalLight, EngineStore, ShadowGenerator, TransformNode } from '@babylonjs/core'
import { createPedestrian, loadHumanAssets } from './authoredPedestrians'
import type { HumanInstance } from './authoredPedestrians'
import { planarSpeed } from './authoredWalk'

type RiggedHeroDebug = {
  issue: number; motionIssue: number; loaded: boolean; fallback: boolean
  heightM: number | null; meshCount: number; skeletonCount: number; animation: string
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'; soleLocalY: number
  gait?: 'NATIVE_AUTHORED_WALK'; clothing?: 'AUTHORED_CASUAL_HOODIE'
  measuredSpeed?: number; walkWeight?: number; error?: string
}
const publish = (state: RiggedHeroDebug): void => {
  ;(window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroDebug }).__DROPiRiggedHeroV1 = { ...state }
}
const legacy = (mesh: AbstractMesh): boolean =>
  ['hero-torso', 'hero-head', 'hero-leg-l', 'hero-leg-r', 'hero-arm-l', 'hero-arm-r'].includes(mesh.name) ||
  mesh.name.startsWith('realism-v2-hero-') || mesh.name.startsWith('target-hero-') || mesh.name.startsWith('hero-motion-')
const proceduralVisibility = new Map<AbstractMesh, boolean>()
const hideProceduralHero = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  for (const mesh of scene.meshes) if (legacy(mesh)) {
    if (!proceduralVisibility.has(mesh)) proceduralVisibility.set(mesh, mesh.isEnabled())
    mesh.setEnabled(false)
  }
}
const restoreProceduralHero = (): void => {
  for (const [mesh, enabled] of proceduralVisibility) if (!mesh.isDisposed()) mesh.setEnabled(enabled)
}
let started = false
const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero'), visualRoot = scene?.getTransformNodeByName('hero-visual-ground-root')
  if (!scene || !(hero instanceof TransformNode) || !(visualRoot instanceof TransformNode) || !scene.metadata?.dropiGroundContactV1) {
    window.requestAnimationFrame(() => void boot()); return
  }
  if (started) return
  started = true
  const state: RiggedHeroDebug = { issue: 726, motionIssue: 725, loaded: false, fallback: true, heightM: null, meshCount: 0, skeletonCount: 0, animation: 'LOADING_RIGGED', assetMode: 'PINNED_BUILD_TIME_CANDIDATE', soleLocalY: 0 }
  publish(state); hideProceduralHero()
  let human: HumanInstance | undefined
  try {
    const assets = await loadHumanAssets(scene)
    const index = assets.pedestrians.findIndex(spec => spec.file === assets.hero.file)
    if (index < 0 || !assets.hero.nativeRig) throw new Error('Native clothed hero source unavailable')
    if (scene.isDisposed) throw new Error('Scene disposed while loading hero')
    // Use the body's own native clips; mismatched UAL2 rest rotations were
    // rejected in CI. No approximate name-only cross-rig transfer remains.
    human = createPedestrian(scene, assets.containers[index]!, assets.hero, 'p1-rigged-hero-root', 1.78)
    human.root.parent = visualRoot
    human.root.metadata = { simulationAuthority: 'hero', presentationOnly: true, forward: 'FOOT_TO_TOE_ALIGNED_POSITIVE_Z' }
    hideProceduralHero()
    const sun = scene.getLightByName('sun'), generator = sun instanceof DirectionalLight ? sun.getShadowGenerator() : null
    if (generator instanceof ShadowGenerator) for (const mesh of human.meshes) generator.addShadowCaster(mesh, false)
    state.loaded = true; state.fallback = false; state.heightM = 1.78
    state.meshCount = human.meshes.length; state.skeletonCount = human.entries.skeletons.length
    state.animation = 'Idle_Loop'; state.gait = 'NATIVE_AUTHORED_WALK'; state.clothing = 'AUTHORED_CASUAL_HOODIE'
    const previous = hero.position.clone(), live = human
    const observer = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000
      const speed = planarSpeed(hero.position.x - previous.x, hero.position.z - previous.z, dt)
      previous.copyFrom(hero.position)
      const gait = live.mixer.update(speed, dt)
      state.animation = gait.moving ? 'Walk_Loop' : 'Idle_Loop'; state.measuredSpeed = speed; state.walkWeight = gait.weight
      publish(state)
    })
    scene.onDisposeObservable.addOnce(() => { scene.onBeforeRenderObservable.remove(observer); live.dispose() })
    scene.metadata = { ...(scene.metadata ?? {}), dropiRiggedHeroV1: true }
    publish(state)
  } catch (error) {
    human?.dispose(); restoreProceduralHero()
    state.error = error instanceof Error ? error.message : String(error)
    state.loaded = false; state.fallback = true; state.animation = 'FALLBACK_PROCEDURAL'
    scene.metadata = { ...(scene.metadata ?? {}), dropiRiggedHeroV1: false }
    publish(state); console.warn('Native clothed hero failed; explicit procedural fallback.', error)
  }
}
void boot()
