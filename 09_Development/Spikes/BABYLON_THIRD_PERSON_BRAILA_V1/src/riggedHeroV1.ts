import {
  AbstractMesh,
  AnimationGroup,
  DirectionalLight,
  EngineStore,
  Node,
  SceneLoader,
  ShadowGenerator,
  TransformNode,
} from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

const ISSUE = 726
const MOTION_ISSUE = 725
const ASSET_ROOT = '/assets/characters/p1/'
const CHARACTER_FILE = 'Regular_Male_FullBody.gltf'
const ANIMATION_FILE = 'universal-animation-library.glb'
const TARGET_HEIGHT_M = 1.78
const SOLE_LOCAL_Y_M = 0.018

type RiggedHeroDebug = {
  issue: number
  motionIssue: number
  loaded: boolean
  fallback: boolean
  heightM: number | null
  meshCount: number
  skeletonCount: number
  animation: string
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'
  soleLocalY: number
  error?: string
}

const getControls = (): { getSpeed?: () => number } | undefined =>
  (window as unknown as { __DROPiNaturalControls?: { getSpeed?: () => number } }).__DROPiNaturalControls

const publish = (state: RiggedHeroDebug): void => {
  ;(window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroDebug }).__DROPiRiggedHeroV1 = { ...state }
}

const worldBounds = (meshes: AbstractMesh[]): { minY: number; maxY: number } => {
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const mesh of meshes) {
    if (mesh.getTotalVertices() <= 0) continue
    mesh.computeWorldMatrix(true)
    const box = mesh.getBoundingInfo().boundingBox
    minY = Math.min(minY, box.minimumWorld.y)
    maxY = Math.max(maxY, box.maximumWorld.y)
  }
  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return { minY: 0, maxY: 1 }
  return { minY, maxY }
}

const proceduralVisibilitySnapshot = new Map<AbstractMesh, boolean>()

const isProceduralHeroPresentation = (mesh: AbstractMesh): boolean => {
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

const hideProceduralHero = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  for (const mesh of scene.meshes) {
    if (!isProceduralHeroPresentation(mesh)) continue
    if (!proceduralVisibilitySnapshot.has(mesh)) proceduralVisibilitySnapshot.set(mesh, mesh.isEnabled())
    mesh.setEnabled(false)
  }
}

const restoreProceduralHero = (): void => {
  for (const [mesh, wasEnabled] of proceduralVisibilitySnapshot.entries()) {
    if (!mesh.isDisposed()) mesh.setEnabled(wasEnabled)
  }
}

const addRiggedShadowCasters = (meshes: AbstractMesh[]): void => {
  const scene = EngineStore.LastCreatedScene
  const sun = scene?.getLightByName('sun')
  if (!(sun instanceof DirectionalLight)) return
  const shadowGenerator = sun.getShadowGenerator()
  if (!(shadowGenerator instanceof ShadowGenerator)) return
  for (const mesh of meshes) {
    if (mesh.getTotalVertices() <= 0) continue
    shadowGenerator.addShadowCaster(mesh, false)
    mesh.receiveShadows = false
  }
}

const buildTargetMap = (
  transformNodes: TransformNode[],
  meshes: AbstractMesh[],
  skeletons: ReturnType<typeof SceneLoader.ImportMeshAsync> extends Promise<infer R>
    ? R extends { skeletons: infer S } ? S : never
    : never,
): Map<string, Node> => {
  const targets = new Map<string, Node>()
  const add = (node: Node): void => {
    if (!node.name || targets.has(node.name)) return
    targets.set(node.name, node)
  }
  transformNodes.forEach(add)
  meshes.forEach(add)
  for (const skeleton of skeletons) {
    for (const bone of skeleton.bones) {
      const node = bone.getTransformNode()
      if (node) add(node)
    }
  }
  return targets
}

const cloneLocomotion = async (
  targetMap: Map<string, Node>,
): Promise<Map<string, AnimationGroup>> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return new Map()
  const source = await SceneLoader.ImportMeshAsync('', ASSET_ROOT, ANIMATION_FILE, scene)
  const selected = new Set(['Idle_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop'])
  const cloned = new Map<string, AnimationGroup>()

  for (const group of source.animationGroups) {
    group.stop()
    if (!selected.has(group.name)) continue
    const copy = group.clone(`dropi-hero-${group.name}`, oldTarget => {
      const direct = targetMap.get(oldTarget.name)
      if (direct) return direct
      const shortName = oldTarget.name.includes('|') ? oldTarget.name.split('|').at(-1) : oldTarget.name
      return shortName ? targetMap.get(shortName) ?? null : null
    })
    cloned.set(group.name, copy)
  }

  source.meshes.forEach(mesh => mesh.setEnabled(false))
  source.transformNodes.forEach(node => node.setEnabled(false))
  return cloned
}

const startAnimationDriver = (
  groups: Map<string, AnimationGroup>,
  state: RiggedHeroDebug,
): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  let active: AnimationGroup | null = null
  let activeName = ''
  let moving = false
  let smoothedRatio = 0.56

  const play = (name: string, speedRatio: number): void => {
    const next = groups.get(name) ?? groups.get('Idle_Loop')
    if (!next) return
    if (active !== next) {
      active?.stop()
      next.start(true, speedRatio)
      active = next
      activeName = name
    } else {
      next.speedRatio = speedRatio
    }
    state.animation = activeName
    publish(state)
  }

  play('Idle_Loop', 0.92)
  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
    const currentSpeed = getControls()?.getSpeed?.() ?? 0

    if (moving) {
      if (currentSpeed < 0.10) moving = false
    } else if (currentSpeed > 0.24) {
      moving = true
    }

    if (!moving) {
      play('Idle_Loop', 0.92)
      return
    }

    // P5 deliberately does not enter Sprint_Loop during ordinary courier travel.
    // The available audited library has no dedicated walk clip, so Jog_Fwd_Loop
    // is used as a slow no-root-motion walk proxy. Hysteresis plus smoothed playback
    // removes the previous rapid idle/jog switches and sprint-like leg cadence.
    const desiredRatio = 0.46 + Math.min(0.30, currentSpeed * 0.065)
    const blend = 1 - Math.exp(-8 * dt)
    smoothedRatio += (desiredRatio - smoothedRatio) * blend
    play('Jog_Fwd_Loop', smoothedRatio)
  })
}

let loading = false

const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  const visualRoot = scene?.getTransformNodeByName('hero-visual-ground-root')
  if (
    !scene || !(hero instanceof TransformNode) || !(visualRoot instanceof TransformNode) ||
    !scene.metadata?.dropiGroundContactV1
  ) {
    window.requestAnimationFrame(() => void boot())
    return
  }
  if (scene.metadata?.dropiRiggedHeroV1 || loading) return
  loading = true

  const state: RiggedHeroDebug = {
    issue: ISSUE,
    motionIssue: MOTION_ISSUE,
    loaded: false,
    fallback: true,
    heightM: null,
    meshCount: 0,
    skeletonCount: 0,
    animation: 'LOADING_RIGGED',
    assetMode: 'PINNED_BUILD_TIME_CANDIDATE',
    soleLocalY: SOLE_LOCAL_Y_M,
  }
  publish(state)
  hideProceduralHero()

  try {
    const result = await SceneLoader.ImportMeshAsync('', ASSET_ROOT, CHARACTER_FILE, scene)
    const importedRoot = result.meshes[0]
    if (!(importedRoot instanceof AbstractMesh)) throw new Error('Imported character has no root mesh')

    importedRoot.parent = visualRoot
    importedRoot.name = 'p1-rigged-hero-root'
    importedRoot.rotationQuaternion = null
    importedRoot.rotation.y = Math.PI

    const visibleMeshes = result.meshes.filter(mesh => mesh.getTotalVertices() > 0)
    let bounds = worldBounds(visibleMeshes)
    const sourceHeight = Math.max(0.01, bounds.maxY - bounds.minY)
    const scale = TARGET_HEIGHT_M / sourceHeight
    importedRoot.scaling.scaleInPlace(scale)

    bounds = worldBounds(visibleMeshes)
    const visualRootY = visualRoot.getAbsolutePosition().y
    importedRoot.position.y += visualRootY + SOLE_LOCAL_Y_M - bounds.minY
    bounds = worldBounds(visibleMeshes)

    const targetMap = buildTargetMap(result.transformNodes, result.meshes, result.skeletons)
    const animationGroups = await cloneLocomotion(targetMap)
    if (!animationGroups.has('Idle_Loop') || !animationGroups.has('Jog_Fwd_Loop')) {
      throw new Error('Required P1 locomotion clips did not retarget to the character rig')
    }

    hideProceduralHero()
    addRiggedShadowCasters(visibleMeshes)

    state.loaded = true
    state.fallback = false
    state.heightM = Number((bounds.maxY - bounds.minY).toFixed(3))
    state.meshCount = visibleMeshes.length
    state.skeletonCount = result.skeletons.length
    state.animation = 'Idle_Loop'
    publish(state)
    startAnimationDriver(animationGroups, state)

    scene.metadata = { ...(scene.metadata ?? {}), dropiRiggedHeroV1: true }
  } catch (error) {
    restoreProceduralHero()
    state.error = error instanceof Error ? error.message : String(error)
    state.loaded = false
    state.fallback = true
    state.animation = 'FALLBACK_PROCEDURAL'
    publish(state)
    console.warn('P1 rigged hero unavailable; restoring governed procedural fallback.', error)
    scene.metadata = { ...(scene.metadata ?? {}), dropiRiggedHeroV1: false }
  } finally {
    loading = false
  }
}

void boot()
