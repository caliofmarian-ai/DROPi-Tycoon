import {
  Color3,
  Color4,
  DirectionalLight,
  EngineStore,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core'

const ISSUE = 759
const query = new URLSearchParams(window.location.search)
const ownerEvalLoopback =
  window.location.hostname === '127.0.0.1' &&
  window.location.port === '17832'
const recovery =
  ownerEvalLoopback ||
  query.get('recoveryOpening') === '1' ||
  query.get('recoveryOpening') === 'force'

type RecoveryDawnDebug = {
  issue: number
  active: boolean
  lighting: 'RECOVERY_PREDAWN_PRESENTATION' | 'BYPASSED'
  sleepingPlaceMaterialized: boolean
  authorityBoundary: 'PRESENTATION_ONLY_NOT_WORLD_CLOCK'
}

const publish = (state: RecoveryDawnDebug): void => {
  ;(window as unknown as { __DROPiRecoveryDawnPresentationV1?: RecoveryDawnDebug })
    .__DROPiRecoveryDawnPresentationV1 = { ...state }
}

const state: RecoveryDawnDebug = {
  issue: ISSUE,
  active: recovery,
  lighting: recovery ? 'RECOVERY_PREDAWN_PRESENTATION' : 'BYPASSED',
  sleepingPlaceMaterialized: false,
  authorityBoundary: 'PRESENTATION_ONLY_NOT_WORLD_CLOCK',
}
publish(state)

if (recovery) {
  const boot = (): void => {
    const scene = EngineStore.LastCreatedScene
    const hero = scene?.getTransformNodeByName('hero')
    const ambient = scene?.getLightByName('ambient')
    const sun = scene?.getLightByName('sun')

    if (
      !scene ||
      !(hero instanceof TransformNode) ||
      !(ambient instanceof HemisphericLight) ||
      !(sun instanceof DirectionalLight)
    ) {
      window.requestAnimationFrame(boot)
      return
    }

    scene.clearColor = new Color4(0.055, 0.09, 0.135, 1)
    scene.fogColor = new Color3(0.06, 0.10, 0.15)
    scene.fogDensity = 0.0042
    scene.environmentIntensity = 0.5
    scene.imageProcessingConfiguration.exposure = 0.78
    scene.imageProcessingConfiguration.contrast = 1.08

    ambient.intensity = 0.34
    ambient.diffuse = new Color3(0.50, 0.60, 0.74)
    ambient.groundColor = new Color3(0.10, 0.115, 0.14)

    sun.intensity = 0.30
    sun.diffuse = new Color3(0.95, 0.72, 0.50)
    sun.direction = new Vector3(-0.72, -0.42, 0.34)
    sun.position = new Vector3(42, 34, -38)

    const forward = new Vector3(Math.sin(hero.rotation.y), 0, Math.cos(hero.rotation.y))
    const behind = hero.position.subtract(forward.scale(2.55))
    const right = new Vector3(Math.cos(hero.rotation.y), 0, -Math.sin(hero.rotation.y))

    const cardboardMat = new StandardMaterial('recovery-cardboard-mat', scene)
    cardboardMat.diffuseColor = new Color3(0.37, 0.27, 0.17)
    cardboardMat.specularColor = new Color3(0.025, 0.025, 0.025)

    const blanketMat = new StandardMaterial('recovery-blanket-mat', scene)
    blanketMat.diffuseColor = new Color3(0.16, 0.18, 0.20)
    blanketMat.specularColor = new Color3(0.015, 0.015, 0.015)

    const bottleMat = new StandardMaterial('recovery-bottle-mat', scene)
    bottleMat.diffuseColor = new Color3(0.34, 0.49, 0.55)
    bottleMat.alpha = 0.58
    bottleMat.specularColor = new Color3(0.36, 0.42, 0.44)

    const cupMat = new StandardMaterial('recovery-cup-mat', scene)
    cupMat.diffuseColor = new Color3(0.76, 0.75, 0.70)
    cupMat.specularColor = new Color3(0.07, 0.07, 0.07)

    const concreteMat = new StandardMaterial('recovery-overhang-mat', scene)
    concreteMat.diffuseColor = new Color3(0.23, 0.25, 0.27)
    concreteMat.specularColor = new Color3(0.035, 0.035, 0.035)

    const cardboard = MeshBuilder.CreateBox('recovery-sleeping-cardboard', {
      width: 1.75,
      height: 0.035,
      depth: 0.86,
    }, scene)
    cardboard.position.copyFrom(behind)
    cardboard.position.y = 0.105
    cardboard.rotation.y = hero.rotation.y
    cardboard.material = cardboardMat
    cardboard.isPickable = false
    cardboard.checkCollisions = false

    const blanket = MeshBuilder.CreateBox('recovery-sleeping-blanket', {
      width: 1.2,
      height: 0.09,
      depth: 0.65,
    }, scene)
    blanket.position.copyFrom(behind.add(right.scale(-0.08)))
    blanket.position.y = 0.17
    blanket.rotation.y = hero.rotation.y + 0.06
    blanket.rotation.z = -0.035
    blanket.material = blanketMat
    blanket.isPickable = false
    blanket.checkCollisions = false

    const bottle = MeshBuilder.CreateCylinder('recovery-water-bottle', {
      height: 0.42,
      diameter: 0.11,
      tessellation: 12,
    }, scene)
    bottle.position.copyFrom(behind.add(right.scale(1.03)))
    bottle.position.y = 0.25
    bottle.material = bottleMat
    bottle.isPickable = false
    bottle.checkCollisions = false

    const cup = MeshBuilder.CreateCylinder('recovery-small-cup', {
      height: 0.14,
      diameterTop: 0.105,
      diameterBottom: 0.075,
      tessellation: 12,
    }, scene)
    cup.position.copyFrom(behind.add(right.scale(0.80)).add(forward.scale(-0.15)))
    cup.position.y = 0.145
    cup.material = cupMat
    cup.isPickable = false
    cup.checkCollisions = false

    const wall = MeshBuilder.CreateBox('recovery-overhang-wall', {
      width: 0.35,
      height: 3.5,
      depth: 6.5,
    }, scene)
    wall.position.copyFrom(behind.add(right.scale(-1.65)))
    wall.position.y = 1.75
    wall.rotation.y = hero.rotation.y
    wall.material = concreteMat
    wall.isPickable = false
    wall.checkCollisions = false

    const canopy = MeshBuilder.CreateBox('recovery-overhang-canopy', {
      width: 3.3,
      height: 0.28,
      depth: 5.8,
    }, scene)
    canopy.position.copyFrom(behind.add(right.scale(-0.35)).add(forward.scale(-0.25)))
    canopy.position.y = 3.08
    canopy.rotation.y = hero.rotation.y
    canopy.material = concreteMat
    canopy.isPickable = false
    canopy.checkCollisions = false

    state.sleepingPlaceMaterialized = true
    scene.metadata = {
      ...(scene.metadata ?? {}),
      dropiRecoveryDawnPresentationV1: true,
      dropiRecoveryClockAuthority: 'NOT_OWNED_PRESENTATION_ONLY',
    }
    publish(state)
  }

  boot()
}
