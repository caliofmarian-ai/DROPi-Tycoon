import { AssetContainer, Color3, Color4, DirectionalLight, EngineStore, HemisphericLight, Mesh, SceneLoader, StandardMaterial, Vector3 } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { fitCompleteModel, fitCompleteModelBox, instantiateCompleteModel, modelBounds, waitForPresentationStage } from './completeAssetPresentation'
import type { CompleteModel } from './completeAssetPresentation'

const STAGE = 'dropiAuthoredStreetLayerV1'
const ASSET_ROOT = '/assets/environment/p4/'
type P4Status = {
  issue: number; loaded: boolean; fallback: boolean; roadSegments: number; intersections: number
  streetProps: number; lookTuned: boolean; sourceModels: number
  collisionAuthority: 'EXISTING_PROCEDURAL_SURFACES'; assetMode: 'PINNED_BUILD_TIME_CANDIDATE'; error?: string
}
const publish = (state: P4Status): void => {
  ;(window as unknown as { __DROPiAuthoredStreetLayerV1?: P4Status }).__DROPiAuthoredStreetLayerV1 = { ...state }
}
let started = false
const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) { setTimeout(() => void boot(), 100); return }
  if (started) return
  started = true
  const state: P4Status = { issue: 726, loaded: false, fallback: true, roadSegments: 0, intersections: 0, streetProps: 0, lookTuned: false, sourceModels: 0, collisionAuthority: 'EXISTING_PROCEDURAL_SURFACES', assetMode: 'PINNED_BUILD_TIME_CANDIDATE' }
  const assets: AssetContainer[] = []
  const models: CompleteModel[] = []
  publish(state)
  try {
    await waitForPresentationStage(scene, 'dropiAuthoredStreetLifeV1')
    for (const file of ['Street_2Lane.gltf', 'Street_4WayIntersection.gltf', 'Sidewalk_Planter.gltf', 'Prop_Bollard.gltf', 'Prop_ManholeCover.gltf']) assets.push(await SceneLoader.LoadAssetContainerAsync(ASSET_ROOT, file, scene))
    if (scene.isDisposed) throw new Error('Scene disposed during P4 import')
    state.sourceModels = assets.length
    const street = assets[0]!, intersection = assets[1]!, planter = assets[2]!, bollard = assets[3]!, manhole = assets[4]!
    const mainRoad = scene.getMeshByName('road-main'), crossRoad = scene.getMeshByName('road-cross')
    if (!mainRoad || !crossRoad) throw new Error('Governed street surfaces missing')
    mainRoad.computeWorldMatrix(true); crossRoad.computeWorldMatrix(true)
    const mainTop = mainRoad.getBoundingInfo().boundingBox.maximumWorld.y + 0.003
    const crossTop = crossRoad.getBoundingInfo().boundingBox.maximumWorld.y + 0.003
    const finish = (model: CompleteModel): void => {
      for (const mesh of model.meshes) { mesh.receiveShadows = false; mesh.computeWorldMatrix(true); mesh.freezeWorldMatrix() }
    }
    const flat = (asset: AssetContainer, name: string, center: Vector3, width: number, depth: number, yaw: number): void => {
      const model = instantiateCompleteModel(asset, scene, name)
      models.push(model)
      fitCompleteModelBox(model, new Vector3(center.x, 0, center.z), { width, depth }, yaw)
      // Align the *top* of the visual road to the governed surface. Aligning its
      // bottom on top of asphalt can bury feet and the bottom of car wheels.
      model.root.position.y += center.y - modelBounds(model).max.y
      model.root.metadata = { dropiP4AuthoredStreet: true, collisionAuthority: 'procedural-underlay' }
      finish(model)
    }
    const prop = (asset: AssetContainer, name: string, position: Vector3, height: number, yaw = 0): void => {
      const model = instantiateCompleteModel(asset, scene, name)
      models.push(model); fitCompleteModel(model, position, { height }, yaw)
      model.root.metadata = { dropiP4StreetProp: true }; finish(model); state.streetProps += 1
    }
    ;[-56, -40, -24, -8, 24, 40, 56].forEach((x, index) => { flat(street, `p4-main-street-${index}`, new Vector3(x, mainTop, 0), 15.8, 11.65, 0); state.roadSegments += 1 })
    ;[-30, -15, 15, 30].forEach((z, index) => { flat(street, `p4-cross-street-${index}`, new Vector3(8, crossTop, z), 11.65, 15.8, Math.PI / 2); state.roadSegments += 1 })
    flat(intersection, 'p4-main-intersection', new Vector3(8, Math.max(mainTop, crossTop) + 0.001, 0), 12.2, 12.2, 0)
    state.intersections = 1
    const planters = [new Vector3(21, .16, 9.8), new Vector3(26, .16, 9.8), new Vector3(34, .16, 9.8), new Vector3(-32, .16, -7.2), new Vector3(-24, .16, -7.2)]
    planters.forEach((p, i) => prop(planter, `p4-planter-${i}`, p, .72, i % 2 ? Math.PI / 2 : 0))
    for (let x = -48, i = 0; x <= 48; x += 12, i += 1) prop(bollard, `p4-quay-bollard-${i}`, new Vector3(x, .17, -38.6), .82)
    ;[new Vector3(-30, .065, 2.6), new Vector3(29, .065, -2.5), new Vector3(8, .069, 20)].forEach((p, i) => prop(manhole, `p4-manhole-${i}`, p, .01, i * .4))
    if (state.roadSegments !== 11 || state.streetProps !== 17 || !models.every(model => model.meshes.every(mesh => mesh.isEnabled()))) throw new Error('P4 complete-model coverage check failed')
    scene.clearColor = new Color4(.61, .74, .82, 1); scene.fogColor = new Color3(.61, .74, .82); scene.fogDensity = .00255
    const ambient = scene.getLightByName('ambient')
    if (ambient instanceof HemisphericLight) { ambient.intensity = .56; ambient.diffuse = new Color3(.94, .97, 1); ambient.groundColor = new Color3(.31, .29, .25) }
    const sun = scene.getLightByName('sun')
    if (sun instanceof DirectionalLight) { sun.direction.set(-.40, -1, .27); sun.position.set(42, 68, -36); sun.intensity = 1.18; sun.diffuse = new Color3(1, .94, .85) }
    scene.imageProcessingConfiguration.exposure = 1.05; scene.imageProcessingConfiguration.contrast = 1.12
    const water = scene.getMaterialByName('danube')
    if (water instanceof StandardMaterial) { water.unfreeze(); water.diffuseColor = Color3.FromHexString('#2f6277'); water.specularColor = new Color3(.46, .54, .58); water.emissiveColor = new Color3(.018, .035, .042) }
    for (const mesh of scene.meshes) if (mesh.name.startsWith('lane-')) mesh.setEnabled(false)
    state.lookTuned = true; state.loaded = true; state.fallback = false
  } catch (error) {
    models.forEach(model => model.dispose())
    state.error = error instanceof Error ? error.message : String(error)
    console.warn('P4 presentation unavailable; previous streets retained.', error)
  } finally {
    if (!scene.isDisposed) {
      scene.metadata = { ...(scene.metadata ?? {}), [STAGE]: state.loaded, [`${STAGE}Settled`]: true }
      scene.onDisposeObservable.addOnce(() => assets.forEach(asset => asset.dispose()))
    } else assets.forEach(asset => asset.dispose())
    publish(state)
  }
}
void boot()
