import { EngineStore, Mesh, TransformNode } from '@babylonjs/core'

const ISSUE = 725
const BASE_FOOT_SOLE_Y = 0.02
const SOLE_CLEARANCE_M = 0.012
const HARD_CLEARANCE_M = 0.004

type GroundSurface = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  topY: number
}

type GroundContactDebug = {
  issue: number
  mode: 'visual-root-ground-clamp-v1'
  status: 'PASS' | 'FAIL'
  surfaceY: number
  visualLiftY: number
  minFootClearance: number
  visualAuthority: 'PROCEDURAL_PROXY' | 'RIGGED_SOLE'
}

type RiggedGroundingState = {
  loaded: boolean
  soleLocalY: number
}

const riggedGrounding = (): RiggedGroundingState | undefined =>
  (window as unknown as { __DROPiRiggedHeroV1?: RiggedGroundingState }).__DROPiRiggedHeroV1

const isWalkableSurface = (mesh: Mesh): boolean =>
  mesh.name === 'ground' ||
  mesh.name === 'quay' ||
  mesh.name.startsWith('road-') ||
  mesh.name.startsWith('sidewalk-')

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode) || !scene.metadata?.dropiHeroMotionV1 || !scene.metadata?.dropiVisualTargetJumpV1) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiGroundContactV1) return

  const leftFoot = scene.getMeshByName('realism-v2-hero-foot--1')
  const rightFoot = scene.getMeshByName('realism-v2-hero-foot-1')
  if (!(leftFoot instanceof Mesh) || !(rightFoot instanceof Mesh)) {
    window.requestAnimationFrame(boot)
    return
  }

  const visualRoot = new TransformNode('hero-visual-ground-root', scene)
  visualRoot.parent = hero

  const reparentIfDirectHeroChild = (node: TransformNode | Mesh | null): void => {
    if (node && node.parent === hero) node.parent = visualRoot
  }

  ;[
    scene.getTransformNodeByName('hero-motion-shoulder-l'),
    scene.getTransformNodeByName('hero-motion-shoulder-r'),
    scene.getTransformNodeByName('hero-motion-hip-l'),
    scene.getTransformNodeByName('hero-motion-hip-r'),
  ].forEach(node => reparentIfDirectHeroChild(node))

  ;[
    scene.getMeshByName('realism-v2-hero-torso'),
    scene.getMeshByName('realism-v2-hero-head'),
    scene.getMeshByName('realism-v2-hero-hair'),
    scene.getMeshByName('realism-v2-hero-backpack'),
    scene.getMeshByName('hero-parcel'),
    scene.getMeshByName('target-hero-neck'),
    scene.getMeshByName('target-hero-jacket-panel'),
    scene.getMeshByName('target-hero-strap-l'),
    scene.getMeshByName('target-hero-strap-r'),
  ].forEach(mesh => reparentIfDirectHeroChild(mesh))

  const surfaces: GroundSurface[] = scene.meshes
    .filter(mesh => mesh instanceof Mesh && isWalkableSurface(mesh as Mesh))
    .map(mesh => {
      mesh.computeWorldMatrix(true)
      const box = mesh.getBoundingInfo().boundingBox
      return {
        minX: box.minimumWorld.x,
        maxX: box.maximumWorld.x,
        minZ: box.minimumWorld.z,
        maxZ: box.maximumWorld.z,
        topY: box.maximumWorld.y,
      }
    })

  const surfaceYAt = (x: number, z: number): number => {
    let best = -Infinity
    for (const surface of surfaces) {
      if (x < surface.minX || x > surface.maxX || z < surface.minZ || z > surface.maxZ) continue
      best = Math.max(best, surface.topY)
    }
    return Number.isFinite(best) ? best : 0
  }

  const debug: GroundContactDebug = {
    issue: ISSUE,
    mode: 'visual-root-ground-clamp-v1',
    status: 'PASS',
    surfaceY: 0,
    visualLiftY: 0,
    minFootClearance: Number.POSITIVE_INFINITY,
    visualAuthority: 'PROCEDURAL_PROXY',
  }

  const publish = (): void => {
    ;(window as Window & { __DROPiGroundContactV1?: GroundContactDebug }).__DROPiGroundContactV1 = { ...debug }
  }
  publish()

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
    const groundY = surfaceYAt(hero.position.x, hero.position.z)
    const rigged = riggedGrounding()

    // Once the P1 skinned hero is live, ground the authored rig by its calibrated
    // sole plane. Do not keep driving the whole body from the hidden procedural
    // feet because their old gait proxy would reintroduce artificial vertical bob.
    if (rigged?.loaded) {
      const heroBaseY = hero.getAbsolutePosition().y
      const targetLift = groundY + SOLE_CLEARANCE_M - heroBaseY - rigged.soleLocalY
      if (targetLift > visualRoot.position.y) {
        visualRoot.position.y = targetLift
      } else {
        const t = 1 - Math.exp(-10 * dt)
        visualRoot.position.y += (targetLift - visualRoot.position.y) * t
      }

      const clearance = heroBaseY + visualRoot.position.y + rigged.soleLocalY - groundY
      if (clearance < HARD_CLEARANCE_M) visualRoot.position.y += HARD_CLEARANCE_M - clearance

      debug.surfaceY = groundY
      debug.visualLiftY = visualRoot.position.y
      debug.minFootClearance = heroBaseY + visualRoot.position.y + rigged.soleLocalY - groundY
      debug.status = debug.minFootClearance >= -0.002 ? 'PASS' : 'FAIL'
      debug.visualAuthority = 'RIGGED_SOLE'
      publish()
      return
    }

    const targetLift = groundY + SOLE_CLEARANCE_M - BASE_FOOT_SOLE_Y
    if (targetLift > visualRoot.position.y) {
      visualRoot.position.y = targetLift
    } else {
      const t = 1 - Math.exp(-10 * dt)
      visualRoot.position.y += (targetLift - visualRoot.position.y) * t
    }

    leftFoot.computeWorldMatrix(true)
    rightFoot.computeWorldMatrix(true)
    let minFootY = Math.min(
      leftFoot.getBoundingInfo().boundingBox.minimumWorld.y,
      rightFoot.getBoundingInfo().boundingBox.minimumWorld.y,
    )

    const hardFloor = groundY + HARD_CLEARANCE_M
    if (minFootY < hardFloor) {
      visualRoot.position.y += hardFloor - minFootY
      visualRoot.computeWorldMatrix(true)
      leftFoot.computeWorldMatrix(true)
      rightFoot.computeWorldMatrix(true)
      minFootY = Math.min(
        leftFoot.getBoundingInfo().boundingBox.minimumWorld.y,
        rightFoot.getBoundingInfo().boundingBox.minimumWorld.y,
      )
    }

    const clearance = minFootY - groundY
    debug.surfaceY = groundY
    debug.visualLiftY = visualRoot.position.y
    debug.minFootClearance = clearance
    debug.status = clearance >= -0.002 ? 'PASS' : 'FAIL'
    debug.visualAuthority = 'PROCEDURAL_PROXY'
    publish()
  })

  scene.metadata = { ...(scene.metadata ?? {}), dropiGroundContactV1: true }
}

boot()
