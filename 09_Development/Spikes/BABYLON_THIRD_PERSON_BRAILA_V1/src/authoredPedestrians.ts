import { AbstractMesh, EngineStore, Mesh, Scene, SceneLoader, TransformNode, Vector3 } from '@babylonjs/core'
import type { AssetContainer, InstantiatedEntries } from '@babylonjs/core/assetContainer'
import { Matrix } from '@babylonjs/core/Maths/math.vector'
import '@babylonjs/loaders/glTF'
import { createWalkMixer, planarSpeed } from './authoredWalk'
import { createWalkableSurfaceIndex } from './walkableSurfaceIndex'

export type FootRoles = { leftFoot: string; rightFoot: string; leftToe: string; rightToe: string }
export type PedestrianSpec = { file: string; idle: string; walk: string; roles: FootRoles; originalWalk: string; nativeRig: boolean }
export type HumanInstance = {
  root: Mesh; entries: InstantiatedEntries; meshes: AbstractMesh[]
  soles: TransformNode[]; mixer: ReturnType<typeof createWalkMixer>; dispose(): void
}
export type HumanAssets = { containers: AssetContainer[]; pedestrians: PedestrianSpec[]; hero: PedestrianSpec }
const ASSET_ROOT = '/assets/characters/human-motion/'
const sharedAssets = new WeakMap<Scene, Promise<HumanAssets>>()
export const loadHumanAssets = (scene: Scene): Promise<HumanAssets> => {
  const existing = sharedAssets.get(scene)
  if (existing) return existing
  const loading = (async (): Promise<HumanAssets> => {
    const containers: AssetContainer[] = []
    try {
      const response = await fetch(`${ASSET_ROOT}MANIFEST.json`, { signal: AbortSignal.timeout(45000) })
      if (!response.ok) throw new Error(`Humanoid manifest HTTP ${response.status}`)
      const manifest = await response.json() as { pedestrians: PedestrianSpec[]; hero: PedestrianSpec }
      if (manifest.pedestrians?.length !== 2 || !manifest.hero?.nativeRig || !/^walk/i.test(manifest.hero.originalWalk)) throw new Error('Verified native walking character manifest required')
      for (const spec of manifest.pedestrians) containers.push(await SceneLoader.LoadAssetContainerAsync(ASSET_ROOT, spec.file, scene))
      if (scene.isDisposed) throw new Error('Scene disposed while loading shared humans')
      scene.onDisposeObservable.addOnce(() => { containers.forEach(container => container.dispose()); sharedAssets.delete(scene) })
      return { containers, pedestrians: manifest.pedestrians, hero: manifest.hero }
    } catch (error) { containers.forEach(container => container.dispose()); throw error }
  })()
  sharedAssets.set(scene, loading)
  return loading
}
const boundsOf = (meshes: AbstractMesh[]): { min: Vector3; max: Vector3 } => {
  const min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)
  for (const mesh of meshes) {
    mesh.computeWorldMatrix(true)
    const bounds = mesh.getBoundingInfo().boundingBox
    min.minimizeInPlace(bounds.minimumWorld); max.maximizeInPlace(bounds.maximumWorld)
  }
  if (![min.x, min.y, min.z, max.x, max.y, max.z].every(Number.isFinite)) throw new Error('Non-finite humanoid bounds')
  return { min, max }
}

/** Complete native rig clone. Geometry/materials shared; skeleton/pose independent. */
export const createPedestrian = (scene: Scene, container: AssetContainer, spec: PedestrianSpec, name: string, heightM: number): HumanInstance => {
  const root = new Mesh(name, scene)
  const normalization = new TransformNode(`${name}/normalization`, scene)
  normalization.parent = root
  const entries = container.instantiateModelsToScene(source => `${name}/${source}`, false, { doNotInstantiate: true })
  try {
    if (!entries.skeletons.length) throw new Error(`${name}: no independent skeleton`)
    entries.animationGroups.forEach(group => group.stop())
    entries.rootNodes.forEach(node => { node.parent = normalization })
    const meshes = root.getChildMeshes(false).filter(mesh => mesh.getTotalVertices() > 0)
    if (meshes.length !== container.meshes.filter(mesh => mesh.getTotalVertices() > 0).length) throw new Error(`${name}: incomplete humanoid hierarchy`)
    const nodes = root.getDescendants(false).filter((node): node is TransformNode => node instanceof TransformNode)
    const find = (source: string): TransformNode => {
      const matches = nodes.filter(node => node.name === `${name}/${source}`)
      if (matches.length !== 1) throw new Error(`${name}: ambiguous joint ${source}`)
      return matches[0]!
    }
    const lf = find(spec.roles.leftFoot), rf = find(spec.roles.rightFoot), lt = find(spec.roles.leftToe), rt = find(spec.roles.rightToe)
    ;[lf, rf, lt, rt].forEach(node => node.computeWorldMatrix(true))
    const forward = lt.getAbsolutePosition().subtract(lf.getAbsolutePosition()).add(rt.getAbsolutePosition().subtract(rf.getAbsolutePosition()))
    forward.y = 0
    if (forward.lengthSquared() < 0.00001) throw new Error(`${name}: foot frame cannot establish visual forward`)
    normalization.rotation.y = -Math.atan2(forward.x, forward.z)
    const original = boundsOf(meshes), sourceHeight = original.max.y - original.min.y
    if (sourceHeight < 0.01 || !Number.isFinite(heightM) || heightM <= 0) throw new Error('Invalid humanoid height')
    normalization.scaling.setAll(heightM / sourceHeight)
    const fitted = boundsOf(meshes)
    normalization.position.set(-(fitted.min.x + fitted.max.x) / 2, -fitted.min.y, -(fitted.min.z + fitted.max.z) / 2)
    boundsOf(meshes)
    const soles = [lf, rf, lt, rt].map((joint, index) => {
      joint.computeWorldMatrix(true)
      const position = joint.getAbsolutePosition()
      const marker = new TransformNode(`${name}/sole-${index}`, scene)
      marker.parent = joint
      marker.position.copyFrom(Vector3.TransformCoordinates(new Vector3(position.x, 0, position.z), Matrix.Invert(joint.getWorldMatrix())))
      return marker
    })
    for (const mesh of meshes) {
      mesh.checkCollisions = false; mesh.isPickable = false; mesh.receiveShadows = false
      mesh.metadata = { ...(mesh.metadata ?? {}), dropiAuthoredHuman: true }
    }
    const idle = entries.animationGroups.find(group => group.name === `${name}/${spec.idle}`)
    const walk = entries.animationGroups.find(group => group.name === `${name}/${spec.walk}`)
    if (!idle || !walk) throw new Error(`${name}: missing native authored idle/walk`)
    const mixer = createWalkMixer(idle, walk)
    root.isPickable = false; root.checkCollisions = false
    return { root, entries, meshes, soles, mixer, dispose: () => { mixer.stop(); entries.dispose(); root.dispose() } }
  } catch (error) { entries.dispose(); root.dispose(); throw error }
}

export const surfaceSampler = (scene: Scene): ((x: number, z: number) => number) => {
  const surfaces = scene.meshes.filter(mesh => mesh instanceof Mesh && (mesh.name === 'ground' || mesh.name === 'quay' || mesh.name.startsWith('road-') || mesh.name.startsWith('sidewalk-'))).map(mesh => {
    mesh.computeWorldMatrix(true)
    const b = mesh.getBoundingInfo().boundingBox
    return { min: b.minimumWorld.clone(), max: b.maximumWorld.clone() }
  })
  return createWalkableSurfaceIndex(surfaces)
}

let started = false
const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.getTransformNodeByName('hero')) { window.setTimeout(() => void boot(), 100); return }
  if (started) return
  started = true
  const anchors = scene.meshes.filter((mesh): mesh is Mesh => mesh instanceof Mesh && /^npc-\d+$/.test(mesh.name)).sort((a, b) => a.name.localeCompare(b.name))
  const state = { status: 'LOADING', expected: anchors.length, visibleHumans: 0, capsuleFallbacks: 0, error: '', visualAcceptance: 'UNKNOWN' }
  const publish = (): void => { (window as unknown as { __DROPiHumanoidPedestrians?: typeof state }).__DROPiHumanoidPedestrians = { ...state } }
  const humans: HumanInstance[] = [], visibility = anchors.map(anchor => anchor.isVisible)
  anchors.forEach(anchor => { anchor.isVisible = false })
  publish()
  try {
    if (anchors.length !== 8) throw new Error(`Expected 8 existing NPC roots; found ${anchors.length}`)
    const assets = await loadHumanAssets(scene)
    if (scene.isDisposed) throw new Error('Scene disposed while loading humans')
    const ground = surfaceSampler(scene)
    anchors.forEach((anchor, index) => {
      const human = createPedestrian(scene, assets.containers[index % 2]!, assets.pedestrians[index % 2]!, `npc-human-${index}`, index % 2 ? 1.68 : 1.76)
      humans.push(human)
      const p = anchor.getAbsolutePosition()
      human.root.position.set(p.x, ground(p.x, p.z) + 0.008, p.z)
      human.root.rotation.y = anchor.rotation.y
      human.root.metadata = { simulationAuthority: anchor.name, presentationOnly: true }
    })
    const previous = anchors.map(anchor => anchor.getAbsolutePosition().clone())
    const observer = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000
      anchors.forEach((anchor, index) => {
        const human = humans[index]!, p = anchor.getAbsolutePosition(), old = previous[index]!
        const dx = p.x - old.x, dz = p.z - old.z, speed = planarSpeed(dx, dz, dt)
        old.copyFrom(p)
        human.root.position.x = p.x; human.root.position.z = p.z
        if (!human.root.metadata?.dropiContactOwner) human.root.position.y = ground(p.x, p.z) + 0.008
        if (speed > 0.06) {
          const desired = Math.atan2(dx, dz)
          const delta = Math.atan2(Math.sin(desired - human.root.rotation.y), Math.cos(desired - human.root.rotation.y))
          human.root.rotation.y += delta * (1 - Math.exp(-16 * Math.min(dt, 0.1)))
        }
        human.mixer.update(speed, dt)
        if (!human.root.metadata?.dropiContactOwner) {
          let requiredLift = 0
          for (const marker of human.soles) {
            marker.computeWorldMatrix(true)
            const sole = marker.getAbsolutePosition()
            requiredLift = Math.max(requiredLift, ground(sole.x, sole.z) + 0.006 - sole.y)
          }
          human.root.position.y += requiredLift
        }
        anchor.isVisible = false
      })
    })
    scene.onDisposeObservable.addOnce(() => { scene.onBeforeRenderObservable.remove(observer); humans.forEach(human => human.dispose()) })
    state.status = 'ACTIVE'; state.visibleHumans = humans.length; state.capsuleFallbacks = 0
    scene.metadata = { ...(scene.metadata ?? {}), dropiHumanoidPedestrians: true }
  } catch (error) {
    humans.forEach(human => human.dispose())
    anchors.forEach((anchor, index) => { if (!anchor.isDisposed()) anchor.isVisible = visibility[index] ?? true })
    state.status = 'FAIL'; state.capsuleFallbacks = anchors.length; state.error = error instanceof Error ? error.message : String(error)
    console.warn('Authored pedestrian load failed; explicit capsule fallback, not acceptance.', error)
  }
  publish()
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') void boot()