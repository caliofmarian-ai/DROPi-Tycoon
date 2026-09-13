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

const hideProceduralHero = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  const exact = new Set([
    'hero-torso',
    'hero-head',
    'hero-leg-l',
    'hero-leg-r',
    'hero-arm-l',
    'hero-arm-r',
  ])
  for (const mesh of scene.meshes) {
    if (
      exact.has(mesh.name) ||
      mesh.name.startsWith('realism-v2-hero-') ||
      mesh.name.startsWith('target-hero-')
    ) {
      mesh.setEnabled(false)
    }
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

  // The source animation rig is only a transfer carrier. Disable it after
  // retargeting so it never appears as a second character in the world.
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

  play('Idle_Loop', 1)
  scene.onBeforeRenderObservable.add(() => {
    const speed = getControls()?.getSpeed?.() ?? 0
    if (speed < 0.16) {
      play('Idle_Loop', 1)
      return
    }
    if (speed > 3.6 && groups.has('Sprint_Loop')) {
      play('Sprint_Loop', 0.78 + Math.min(0.28, (speed - 3.6) * 0.18))
      return
    }
    // The available audited library exposes forward jog rather than a dedicated
    // walk clip. Slow the no-root-motion jog for ordinary courier traversal.
    play('Jog_Fwd_Loop', 0.55 + Math.min(0.38, speed / 7.5))
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
    animation: 'FALLBACK_PROCEDURAL',
    assetMode: 'PINNED_BUILD_TIME_CANDIDATE',
    soleLocalY: SOLE_LOCAL_Y_M,
  }
  publish(state)

  try {
    const result = await SceneLoader.ImportMeshAsync('', ASSET_ROOT, CHARACTER_FILE, scene)
    const importedRoot = result.meshes[0]
    if (!(importedRoot instanceof AbstractMesh)) throw new Error('Imported character has no root mesh')

    importedRoot.parent = visualRoot
    importedRoot.name = 'p1-rigged-hero-root'
    importedRoot.rotationQuaternion = null
    // Quaternius characters face -Z in their authored frame. DROPi #731 defines
    // visible hero front as local +Z, so the adapter owns this single 180° turn.
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
    state.error = error instanceof Error ? error.message : String(error)
    state.loaded = false
    state.fallback = true
    state.animation = 'FALLBACK_PROCEDURAL'
    publish(state)
    console.warn('P1 rigged hero unavailable; keeping governed procedural fallback.', error)
    scene.metadata = { ...(scene.metadata ?? {}), dropiRiggedHeroV1: false }
  } finally {
    loading = false
  }
}

void boot()
