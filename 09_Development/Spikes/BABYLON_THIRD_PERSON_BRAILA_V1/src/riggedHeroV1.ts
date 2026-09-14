import { AbstractMesh, AnimationGroup, DirectionalLight, EngineStore, Node, SceneLoader, ShadowGenerator, TransformNode, Vector3 } from '@babylonjs/core'
import type { AssetContainer } from '@babylonjs/core/assetContainer'
import '@babylonjs/loaders/glTF'
import { createWalkMixer, planarSpeed } from './authoredWalk'

const ASSET_ROOT = '/assets/characters/p1/'
const WALK_ROOT = '/assets/characters/human-motion/'
const TARGET_HEIGHT_M = 1.78
const SOLE_LOCAL_Y_M = 0.018

type RiggedHeroDebug = {
  issue: number; motionIssue: number; loaded: boolean; fallback: boolean
  heightM: number | null; meshCount: number; skeletonCount: number; animation: string
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'; soleLocalY: number
  gait?: 'AUTHORED_WALK'; measuredSpeed?: number; walkWeight?: number; error?: string
}
type WalkManifest = { hero: { file: string; walk: string; originalWalk: string; targetCount: number; restTranslations: Record<string, { source: number[]; target: number[] }> } }
const publish = (state: RiggedHeroDebug): void => {
  ;(window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroDebug }).__DROPiRiggedHeroV1 = { ...state }
}
const worldBounds = (meshes: AbstractMesh[]): { minY: number; maxY: number } => {
  let minY = Infinity, maxY = -Infinity
  for (const mesh of meshes) {
    if (mesh.getTotalVertices() <= 0) continue
    mesh.computeWorldMatrix(true)
    const b = mesh.getBoundingInfo().boundingBox
    minY = Math.min(minY, b.minimumWorld.y); maxY = Math.max(maxY, b.maximumWorld.y)
  }
  if (!Number.isFinite(minY) || !Number.isFinite(maxY) || maxY - minY < 0.01) throw new Error('Invalid rigged hero bounds')
  return { minY, maxY }
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

const retargetGroup = (source: AnimationGroup, targetMap: Map<string, Node>, translations?: WalkManifest['hero']['restTranslations']): AnimationGroup => {
  const resolve = (oldTarget: Node): Node => {
    const name = oldTarget.name.split('|').at(-1) ?? oldTarget.name
    const target = targetMap.get(name)
    if (!target) throw new Error(`Unmapped ${source.name} target: ${name}`)
    return target
  }
  source.targetedAnimations.forEach(track => resolve(track.target as Node))
  const result = source.clone(`dropi-hero-${source.name}`, resolve, true)
  if (result.targetedAnimations.length !== source.targetedAnimations.length) { result.dispose(); throw new Error('Incomplete animation retarget') }
  if (translations) for (const track of result.targetedAnimations) {
    if (track.animation.targetProperty !== 'position') continue
    const name = (track.target as Node).name, rest = translations[name]
    if (!rest) continue
    const delta = Vector3.FromArray(rest.target).subtract(Vector3.FromArray(rest.source))
    const keys = track.animation.getKeys().map(key => {
      if (!(key.value instanceof Vector3)) throw new Error(`Unsupported translation key for ${name}`)
      const value = key.value.add(delta)
      // The simulation root remains the only horizontal travel authority.
      if (/^(root|armature)$/i.test(name)) { value.x = rest.target[0]!; value.z = rest.target[2]! }
      return { ...key, value }
    })
    track.animation.setKeys(keys)
  }
  return result
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
  const state: RiggedHeroDebug = { issue: 726, motionIssue: 725, loaded: false, fallback: true, heightM: null, meshCount: 0, skeletonCount: 0, animation: 'LOADING_RIGGED', assetMode: 'PINNED_BUILD_TIME_CANDIDATE', soleLocalY: SOLE_LOCAL_Y_M }
  publish(state); hideProceduralHero()
  const carriers: AssetContainer[] = [], clones: AnimationGroup[] = []
  let result: Awaited<ReturnType<typeof SceneLoader.ImportMeshAsync>> | undefined
  try {
    const response = await fetch(`${WALK_ROOT}MANIFEST.json`, { signal: AbortSignal.timeout(45000) })
    if (!response.ok) throw new Error(`Walk manifest HTTP ${response.status}`)
    const manifest = await response.json() as WalkManifest
    if (!manifest.hero || manifest.hero.walk !== 'Walk_Loop' || !/^walk/i.test(manifest.hero.originalWalk)) throw new Error('Verified authored walk manifest required; no jog proxy fallback')
    result = await SceneLoader.ImportMeshAsync('', ASSET_ROOT, 'Regular_Male_FullBody.gltf', scene)
    const importedRoot = result.meshes[0]
    if (!(importedRoot instanceof AbstractMesh)) throw new Error('Imported character has no root mesh')
    importedRoot.setEnabled(false)
    importedRoot.parent = visualRoot; importedRoot.name = 'p1-rigged-hero-root'
    // Preserve the accepted #731 adapter. Do not change controls/camera handedness.
    importedRoot.rotationQuaternion = null; importedRoot.rotation.y = Math.PI
    const visibleMeshes = result.meshes.filter(mesh => mesh.getTotalVertices() > 0)
    let bounds = worldBounds(visibleMeshes)
    importedRoot.scaling.scaleInPlace(TARGET_HEIGHT_M / (bounds.maxY - bounds.minY))
    bounds = worldBounds(visibleMeshes)
    importedRoot.position.y += visualRoot.getAbsolutePosition().y + SOLE_LOCAL_Y_M - bounds.minY
    bounds = worldBounds(visibleMeshes)
    const targets = new Map<string, Node>()
    for (const node of [...result.transformNodes, ...result.meshes]) if (node.name && !targets.has(node.name)) targets.set(node.name, node)
    for (const skeleton of result.skeletons) for (const bone of skeleton.bones) {
      const node = bone.getTransformNode(); if (node && !targets.has(node.name)) targets.set(node.name, node)
    }
    carriers.push(await SceneLoader.LoadAssetContainerAsync(ASSET_ROOT, 'universal-animation-library.glb', scene))
    carriers.push(await SceneLoader.LoadAssetContainerAsync(WALK_ROOT, manifest.hero.file, scene))
    const idleSource = carriers[0]!.animationGroups.find(group => group.name === 'Idle_Loop')
    const walkSource = carriers[1]!.animationGroups.find(group => group.name === manifest.hero.walk)
    if (!idleSource || !walkSource) throw new Error('Authored Idle_Loop / Walk_Loop missing')
    const idle = retargetGroup(idleSource, targets); clones.push(idle)
    const walk = retargetGroup(walkSource, targets, manifest.hero.restTranslations); clones.push(walk)
    carriers.forEach(carrier => carrier.dispose()); carriers.length = 0
    if (scene.isDisposed) throw new Error('Scene disposed during humanoid import')
    hideProceduralHero()
    const sun = scene.getLightByName('sun'), generator = sun instanceof DirectionalLight ? sun.getShadowGenerator() : null
    if (generator instanceof ShadowGenerator) for (const mesh of visibleMeshes) { generator.addShadowCaster(mesh, false); mesh.receiveShadows = false }
    const mixer = createWalkMixer(idle, walk)
    importedRoot.setEnabled(true)
    state.loaded = true; state.fallback = false; state.heightM = Number((bounds.maxY - bounds.minY).toFixed(3))
    state.meshCount = visibleMeshes.length; state.skeletonCount = result.skeletons.length; state.animation = 'Idle_Loop'; state.gait = 'AUTHORED_WALK'
    const previous = hero.position.clone()
    const observer = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000
      const speed = planarSpeed(hero.position.x - previous.x, hero.position.z - previous.z, dt)
      previous.copyFrom(hero.position)
      const gait = mixer.update(speed, dt)
      state.animation = gait.moving ? 'Walk_Loop' : 'Idle_Loop'; state.measuredSpeed = speed; state.walkWeight = gait.weight
      publish(state)
    })
    scene.onDisposeObservable.addOnce(() => { scene.onBeforeRenderObservable.remove(observer); mixer.stop(); clones.forEach(group => group.dispose()) })
    scene.metadata = { ...(scene.metadata ?? {}), dropiRiggedHeroV1: true }
    publish(state)
  } catch (error) {
    // A late animation failure must not leave a second, half-loaded character.
    clones.forEach(group => group.dispose()); carriers.forEach(carrier => carrier.dispose())
    result?.animationGroups.forEach(group => group.dispose())
    result?.meshes.forEach(mesh => { if (!mesh.isDisposed()) mesh.dispose() })
    result?.transformNodes.forEach(node => { if (!node.isDisposed()) node.dispose() })
    result?.skeletons.forEach(skeleton => skeleton.dispose())
    restoreProceduralHero()
    state.error = error instanceof Error ? error.message : String(error)
    state.loaded = false; state.fallback = true; state.animation = 'FALLBACK_PROCEDURAL'
    scene.metadata = { ...(scene.metadata ?? {}), dropiRiggedHeroV1: false }
    publish(state); console.warn('Authored walking hero failed; explicit procedural fallback.', error)
  }
}
void boot()
