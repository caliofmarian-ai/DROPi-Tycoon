import { Color3, EngineStore, Mesh, Vector3 } from '@babylonjs/core'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { RawCubeTexture } from '@babylonjs/core/Materials/Textures/rawCubeTexture'
import { Constants } from '@babylonjs/core/Engines/constants'
import { SphericalPolynomial } from '@babylonjs/core/Maths/sphericalPolynomial'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import '@babylonjs/core/Engines/Extensions/engine.rawTexture'
import { allPresentationStagesSettled } from './completeAssetPresentation'

export const facadeDetailVisible = (distance: number, currentlyVisible: boolean): boolean =>
  Number.isFinite(distance) && distance < (currentlyVisible ? 64 : 56)

let started = false
const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (scene?.isDisposed) return
  if (!scene || !allPresentationStagesSettled(scene.metadata) || !scene.metadata?.dropiPerformanceRescueV1) { setTimeout(boot, 100); return }
  if (started) return
  started = true
  const state = { status: 'LOADING', materialCount: 0, atlasCount: 0, omittedTextures: 0, detailGroupsVisible: 0, detailGroupsTotal: 0, skyFill: 'ANALYTICAL_NOT_PHOTOGRAPHIC_HDR', visualAcceptance: 'UNKNOWN', error: '' }
  const publish = (): void => { (window as unknown as { __DROPiSurfaceFinish?: typeof state }).__DROPiSurfaceFinish = { ...state } }
  publish()
  void (async () => {
    try {
      const response = await fetch('/assets/environment/restored/PROVENANCE.json', { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error(`Restored material manifest HTTP ${response.status}`)
      const manifest = await response.json() as { textures: unknown[]; omitted: unknown[] }
      state.atlasCount = manifest.textures.length; state.omittedTextures = manifest.omitted.length
      const size = 32, faces: Uint8Array[] = []
      for (let face = 0; face < 6; face += 1) {
        const data = new Uint8Array(size * size * 4)
        for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
          const u = 2 * (x + .5) / size - 1, v = 2 * (y + .5) / size - 1
          const directions = [new Vector3(1, -v, -u), new Vector3(-1, -v, u), new Vector3(u, 1, v), new Vector3(u, -1, -v), new Vector3(u, -v, 1), new Vector3(-u, -v, -1)]
          const elevation = directions[face]!.normalize().y
          const t = Math.max(0, Math.min(1, (elevation + .12) / .95))
          const sky = Color3.Lerp(new Color3(.36, .36, .32), new Color3(.48, .68, .84), t)
          const offset = (y * size + x) * 4
          data[offset] = Math.round(sky.r * 255); data[offset + 1] = Math.round(sky.g * 255); data[offset + 2] = Math.round(sky.b * 255); data[offset + 3] = 255
        }
        faces.push(data)
      }
      const environment = new RawCubeTexture(scene, faces, size, Constants.TEXTUREFORMAT_RGBA, Constants.TEXTURETYPE_UNSIGNED_BYTE, true, false)
      environment.name = 'dropi-shared-sky-fill'; environment.gammaSpace = false
      const irradiance = new SphericalPolynomial()
      irradiance.xx.set(.25, .28, .31); irradiance.yy.set(.25, .28, .31); irradiance.zz.set(.25, .28, .31)
      irradiance.y.set(.04, .07, .10)
      environment.sphericalPolynomial = irradiance
      scene.environmentTexture = environment; scene.environmentIntensity = .65
      for (const material of scene.materials) {
        if (!(material instanceof PBRMaterial)) continue
        material.unfreeze()
        const name = material.name.split('/').at(-1)?.toLowerCase() ?? ''
        if (name.includes('glass') || name === 'windows') {
          material.roughness = .17; material.metallic = .06
          // Opaque authored car glazing stays opaque: no invented empty interior.
          if (name === 'windows') material.albedoColor = new Color3(.10, .17, .22)
        } else if (name === 'black' || name.includes('rubber')) { material.roughness = .93; material.metallic = 0 }
        else if (name === 'blue' || name === 'lightblue') { material.roughness = .32; material.metallic = .28 }
        else if (name === 'grey' || name.includes('metal')) { material.roughness = .54; material.metallic = .16 }
        if (material.albedoTexture) material.albedoTexture.anisotropicFilteringLevel = 4
        state.materialCount += 1
      }
      const groups = scene.transformNodes.filter(node => node.name.startsWith('p2-window-') && !node.name.includes('/'))
      state.detailGroupsTotal = groups.length
      let elapsed = 0
      const observer = scene.onBeforeRenderObservable.add(() => {
        elapsed += scene.getEngine().getDeltaTime() / 1000
        if (elapsed < .5) return
        elapsed = 0
        const camera = scene.activeCamera
        if (!camera) return
        let visible = 0
        for (const group of groups) {
          const show = facadeDetailVisible(Vector3.Distance(group.getAbsolutePosition(), camera.globalPosition), group.isEnabled())
          group.setEnabled(show)
          if (show) visible += 1
        }
        state.detailGroupsVisible = visible
        const sun = scene.getLightByName('sun')
        const shadows = sun instanceof DirectionalLight ? sun.getShadowGenerator() : null
        if (shadows instanceof ShadowGenerator) {
          const hero = scene.getTransformNodeByName('hero')
          const shadowMap = shadows.getShadowMap()
          if (hero && shadowMap) shadowMap.renderList = scene.meshes.filter(mesh => {
            if (!mesh.isEnabled() || !mesh.isVisible || mesh.getTotalVertices() <= 0) return false
            if (mesh.skeleton) return !mesh.name.startsWith('npc-human-') || Vector3.DistanceSquared(mesh.getBoundingInfo().boundingBox.centerWorld, hero.position) < 28 * 28
            return (mesh.metadata?.dropiQualityCaster === true || mesh.name.startsWith('p3-car-') || mesh.name.startsWith('p3-shell-') || ['dropi-hq', 'maras-market', 'customer-block', 'hero-parcel'].includes(mesh.name)) && Vector3.DistanceSquared(mesh.getBoundingInfo().boundingBox.centerWorld, hero.position) < 70 * 70
          })
        }
        publish()
      })
      scene.onDisposeObservable.addOnce(() => { scene.onBeforeRenderObservable.remove(observer); environment.dispose() })
      scene.metadata = { ...(scene.metadata ?? {}), dropiSurfaceFinish: true }
      state.status = 'ACTIVE'; publish()
    } catch (error) {
      state.status = 'FAIL'; state.error = error instanceof Error ? error.message : String(error); publish()
    }
  })()
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') boot()
