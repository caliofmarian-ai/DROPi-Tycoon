import { DirectionalLight, EngineStore, Mesh, StandardMaterial } from '@babylonjs/core'

const ISSUE = 720

const mergeStaticMeshes = (label: string, meshes: Mesh[]): void => {
  const candidates = meshes.filter(mesh => mesh.isEnabled() && !mesh.parent && mesh.getTotalVertices() > 0)
  if (candidates.length < 2) return
  const material = candidates[0]?.material
  if (!material || !candidates.every(mesh => mesh.material === material)) return

  candidates.forEach(mesh => mesh.computeWorldMatrix(true))
  const merged = Mesh.MergeMeshes(candidates, true, true)
  if (!merged) return
  merged.name = `perf-merged-${label}`
  merged.material = material
  merged.receiveShadows = candidates.some(mesh => mesh.receiveShadows)
  merged.freezeWorldMatrix()
}

const reduceDrawCalls = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return

  const meshes = (): Mesh[] => scene.meshes.filter(mesh => mesh instanceof Mesh) as Mesh[]

  mergeStaticMeshes('windows', meshes().filter(mesh => mesh.name.includes('-w-')))
  mergeStaticMeshes('road-lines', meshes().filter(mesh => mesh.name.startsWith('lane-')))
  mergeStaticMeshes('tree-trunks', meshes().filter(mesh => mesh.name.startsWith('tree-trunk-')))
  mergeStaticMeshes('tree-canopies-v2', meshes().filter(mesh => mesh.name.startsWith('realism-v2-tree-canopy-')))
  mergeStaticMeshes('roofs', meshes().filter(mesh => mesh.name.endsWith('-roof')))
  mergeStaticMeshes('curbs', meshes().filter(mesh => mesh.name.startsWith('realism-curb-')))
  mergeStaticMeshes('pavers', meshes().filter(mesh => mesh.name.startsWith('realism-paver-')))
  mergeStaticMeshes('crosswalk', meshes().filter(mesh => mesh.name.startsWith('realism-crosswalk-')))
  mergeStaticMeshes('balcony-rails', meshes().filter(mesh => mesh.name.startsWith('realism-balcony-rail-') || mesh.name.startsWith('realism-balcony-top-')))
  mergeStaticMeshes('lamp-posts', meshes().filter(mesh => mesh.name.startsWith('realism-lamp-post-')))
  mergeStaticMeshes('lamp-heads', meshes().filter(mesh => mesh.name.startsWith('realism-lamp-head-')))
  mergeStaticMeshes('v2-plinths', meshes().filter(mesh => mesh.name.startsWith('realism-v2-plinth-')))
  mergeStaticMeshes('v2-cornices', meshes().filter(mesh => mesh.name.startsWith('realism-v2-cornice-')))
  mergeStaticMeshes('v2-entry-surrounds', meshes().filter(mesh => mesh.name.startsWith('realism-v2-entry-surround-')))
}

const trimShadowCost = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  const sun = scene.getLightByName('sun')
  if (!(sun instanceof DirectionalLight)) return
  const generator = sun.getShadowGenerator()
  if (!generator) return

  generator.useBlurExponentialShadowMap = false
  generator.usePoissonSampling = true
  generator.blurKernel = 4
  generator.bias = 0.0008

  const shadowMap = generator.getShadowMap()
  if (!shadowMap) return
  shadowMap.renderList = scene.meshes.filter(mesh => {
    const name = mesh.name
    return (
      name.startsWith('realism-v2-hero-') ||
      name === 'hero-parcel' ||
      name === 'dropi-hq' ||
      name === 'maras-market' ||
      name === 'customer-block' ||
      name === 'car-1-body' ||
      name === 'car-1-cabin'
    )
  })
}

const freezeStaticScene = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return

  scene.materials.forEach(material => {
    if (!(material instanceof StandardMaterial)) return
    if (material.name.startsWith('sign-mat-')) return
    material.freeze()
  })

  scene.meshes.forEach(mesh => {
    if (!(mesh instanceof Mesh) || mesh.parent) return
    const dynamic =
      mesh.name.startsWith('npc-') ||
      mesh.name.includes('marker') ||
      mesh.name.includes('route') ||
      mesh.name.includes('gps') ||
      mesh.name.includes('arrow')
    if (!dynamic) mesh.freezeWorldMatrix()
  })
}

const addBadge = (): void => {
  if (document.querySelector('#dropi-perf-rescue-v1')) return
  const badge = document.createElement('div')
  badge.id = 'dropi-perf-rescue-v1'
  badge.textContent = `PERF RESCUE V1 · #${ISSUE}`
  Object.assign(badge.style, {
    position: 'fixed',
    right: '12px',
    top: '50px',
    zIndex: '10',
    padding: '5px 8px',
    borderRadius: '8px',
    background: 'rgba(7, 20, 28, .62)',
    border: '1px solid rgba(255,255,255,.12)',
    color: 'rgba(235,245,248,.78)',
    font: '700 8px/1 system-ui',
    letterSpacing: '.06em',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.append(badge)
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.metadata?.dropiRealismV2) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiPerformanceRescueV1) return
  scene.metadata = { ...(scene.metadata ?? {}), dropiPerformanceRescueV1: true }

  reduceDrawCalls()
  trimShadowCost()
  freezeStaticScene()
  addBadge()
}

boot()
