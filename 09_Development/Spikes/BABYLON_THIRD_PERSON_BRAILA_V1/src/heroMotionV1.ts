import { EngineStore, Mesh, MeshBuilder, TransformNode, Vector3 } from '@babylonjs/core'

const ISSUE = 725

type RiggedHeroState = {
  loaded: boolean
  fallback: boolean
  animation: string
}

const smooth = (current: number, target: number, rate: number, dt: number): number => {
  const t = 1 - Math.exp(-rate * dt)
  return current + (target - current) * t
}

const joint = (
  parent: TransformNode,
  name: string,
  position: Vector3,
): TransformNode => {
  const node = new TransformNode(name, parent.getScene())
  node.parent = parent
  node.position.copyFrom(position)
  return node
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode) || !scene.metadata?.dropiRealismV2) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiHeroMotionV1) return

  const preferRigged = Boolean((window as unknown as { __DROPiPreferRiggedHero?: boolean }).__DROPiPreferRiggedHero)
  if (preferRigged) {
    const rigged = (window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroState }).__DROPiRiggedHeroV1
    if (!rigged || (!rigged.loaded && rigged.animation !== 'FALLBACK_PROCEDURAL')) {
      window.requestAnimationFrame(boot)
      return
    }
    if (rigged.loaded && !rigged.fallback) {
      scene.metadata = { ...(scene.metadata ?? {}), dropiHeroMotionSuppressedByP5: true }
      return
    }
  }

  const leftArm = scene.getMeshByName('realism-v2-hero-arm--1')
  const rightArm = scene.getMeshByName('realism-v2-hero-arm-1')
  const leftHand = scene.getMeshByName('realism-v2-hero-hand--1')
  const rightHand = scene.getMeshByName('realism-v2-hero-hand-1')
  const leftLeg = scene.getMeshByName('realism-v2-hero-leg--1')
  const rightLeg = scene.getMeshByName('realism-v2-hero-leg-1')
  const leftFoot = scene.getMeshByName('realism-v2-hero-foot--1')
  const rightFoot = scene.getMeshByName('realism-v2-hero-foot-1')
  const torso = scene.getMeshByName('realism-v2-hero-torso')
  const head = scene.getMeshByName('realism-v2-hero-head')
  const hair = scene.getMeshByName('realism-v2-hero-hair')
  const backpack = scene.getMeshByName('realism-v2-hero-backpack')
  const parcel = scene.getMeshByName('hero-parcel')

  if (
    !(leftArm instanceof Mesh) || !(rightArm instanceof Mesh) ||
    !(leftHand instanceof Mesh) || !(rightHand instanceof Mesh) ||
    !(leftLeg instanceof Mesh) || !(rightLeg instanceof Mesh) ||
    !(leftFoot instanceof Mesh) || !(rightFoot instanceof Mesh) ||
    !(torso instanceof Mesh) || !(head instanceof Mesh) || !(hair instanceof Mesh) ||
    !(backpack instanceof Mesh)
  ) {
    window.requestAnimationFrame(boot)
    return
  }

  const presentationRoot = scene.getTransformNodeByName('hero-visual-ground-root')
  const motionRoot = presentationRoot instanceof TransformNode ? presentationRoot : hero

  const shoulderL = joint(motionRoot, 'hero-motion-shoulder-l', new Vector3(-.31, 1.38, 0))
  const shoulderR = joint(motionRoot, 'hero-motion-shoulder-r', new Vector3(.31, 1.38, 0))
  const elbowL = joint(shoulderL, 'hero-motion-elbow-l', new Vector3(0, -.34, 0))
  const elbowR = joint(shoulderR, 'hero-motion-elbow-r', new Vector3(0, -.34, 0))
  const hipL = joint(motionRoot, 'hero-motion-hip-l', new Vector3(-.135, .72, 0))
  const hipR = joint(motionRoot, 'hero-motion-hip-r', new Vector3(.135, .72, 0))
  const kneeL = joint(hipL, 'hero-motion-knee-l', new Vector3(0, -.36, 0))
  const kneeR = joint(hipR, 'hero-motion-knee-r', new Vector3(0, -.36, 0))

  leftArm.parent = shoulderL
  leftArm.position.set(0, -.17, 0)
  leftArm.scaling.y = .52
  leftArm.rotation.set(0, 0, -.045)
  rightArm.parent = shoulderR
  rightArm.position.set(0, -.17, 0)
  rightArm.scaling.y = .52
  rightArm.rotation.set(0, 0, .045)

  const forearmL = MeshBuilder.CreateCylinder('hero-motion-forearm-l', {
    height: .33,
    diameter: .13,
    tessellation: 12,
  }, scene)
  forearmL.parent = elbowL
  forearmL.position.set(0, -.165, 0)
  forearmL.material = leftArm.material

  const forearmR = MeshBuilder.CreateCylinder('hero-motion-forearm-r', {
    height: .33,
    diameter: .13,
    tessellation: 12,
  }, scene)
  forearmR.parent = elbowR
  forearmR.position.set(0, -.165, 0)
  forearmR.material = rightArm.material

  leftHand.parent = elbowL
  leftHand.position.set(0, -.36, 0)
  rightHand.parent = elbowR
  rightHand.position.set(0, -.36, 0)

  leftLeg.parent = hipL
  leftLeg.position.set(0, -.18, 0)
  leftLeg.scaling.y = .52
  leftLeg.rotation.set(0, 0, 0)
  rightLeg.parent = hipR
  rightLeg.position.set(0, -.18, 0)
  rightLeg.scaling.y = .52
  rightLeg.rotation.set(0, 0, 0)

  const shinL = MeshBuilder.CreateCylinder('hero-motion-shin-l', {
    height: .34,
    diameter: .16,
    tessellation: 12,
  }, scene)
  shinL.parent = kneeL
  shinL.position.set(0, -.17, 0)
  shinL.material = leftLeg.material

  const shinR = MeshBuilder.CreateCylinder('hero-motion-shin-r', {
    height: .34,
    diameter: .16,
    tessellation: 12,
  }, scene)
  shinR.parent = kneeR
  shinR.position.set(0, -.17, 0)
  shinR.material = rightLeg.material

  leftFoot.parent = kneeL
  leftFoot.position.set(0, -.37, .075)
  rightFoot.parent = kneeR
  rightFoot.position.set(0, -.37, .075)

  const base = {
    torsoY: torso.position.y,
    torsoZ: torso.position.z,
    headY: head.position.y,
    hairY: hair.position.y,
    packY: backpack.position.y,
  }

  let previousPosition = hero.position.clone()
  let previousHeading = hero.rotation.y
  let smoothedSpeed = 0
  let turnVelocity = 0
  let gaitPhase = 0
  let idleClock = 0

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, .05)
    if (dt <= 0) return
    idleClock += dt

    const displacement = Vector3.Distance(hero.position, previousPosition)
    const rawSpeed = displacement / dt
    previousPosition.copyFrom(hero.position)
    smoothedSpeed = smooth(smoothedSpeed, rawSpeed, 9.5, dt)

    const headingDelta = Math.atan2(
      Math.sin(hero.rotation.y - previousHeading),
      Math.cos(hero.rotation.y - previousHeading),
    )
    previousHeading = hero.rotation.y
    turnVelocity = smooth(turnVelocity, headingDelta / dt, 10, dt)

    const moving = smoothedSpeed > .075
    const speed01 = Math.min(1, smoothedSpeed / 2.65)
    const cycleHz = 1.28 + speed01 * .72
    if (moving) gaitPhase += dt * Math.PI * 2 * cycleHz

    const carry = Boolean(parcel?.isEnabled())
    const stride = moving ? Math.sin(gaitPhase) : 0
    const opposite = -stride
    const strideAmplitude = .40 * speed01
    const armAmplitude = (carry ? .11 : .34) * speed01

    const kneeBendL = moving ? Math.max(0, -stride) * .54 * speed01 : 0
    const kneeBendR = moving ? Math.max(0, -opposite) * .54 * speed01 : 0
    const elbowBendL = carry ? .46 : .12 + Math.max(0, stride) * .12 * speed01
    const elbowBendR = carry ? .46 : .12 + Math.max(0, opposite) * .12 * speed01

    const carryPitch = carry ? -.27 : 0
    shoulderL.rotation.x = smooth(shoulderL.rotation.x, carryPitch - stride * armAmplitude, 13, dt)
    shoulderR.rotation.x = smooth(shoulderR.rotation.x, carryPitch + stride * armAmplitude, 13, dt)
    elbowL.rotation.x = smooth(elbowL.rotation.x, elbowBendL, 15, dt)
    elbowR.rotation.x = smooth(elbowR.rotation.x, elbowBendR, 15, dt)

    hipL.rotation.x = smooth(hipL.rotation.x, stride * strideAmplitude, 14, dt)
    hipR.rotation.x = smooth(hipR.rotation.x, opposite * strideAmplitude, 14, dt)
    kneeL.rotation.x = smooth(kneeL.rotation.x, kneeBendL, 15, dt)
    kneeR.rotation.x = smooth(kneeR.rotation.x, kneeBendR, 15, dt)

    const footRollL = moving ? -stride * .10 * speed01 - kneeBendL * .20 : 0
    const footRollR = moving ? -opposite * .10 * speed01 - kneeBendR * .20 : 0
    leftFoot.rotation.x = smooth(leftFoot.rotation.x, footRollL, 16, dt)
    rightFoot.rotation.x = smooth(rightFoot.rotation.x, footRollR, 16, dt)

    const bob = moving
      ? Math.abs(Math.sin(gaitPhase * 2)) * .014 * speed01
      : Math.sin(idleClock * 1.7) * .0035
    const counter = moving ? Math.sin(gaitPhase) * .036 * speed01 : Math.sin(idleClock * .7) * .008
    const turnLean = Math.max(-.065, Math.min(.065, turnVelocity * .015))

    torso.position.y = base.torsoY + bob
    torso.position.z = base.torsoZ + (moving ? Math.cos(gaitPhase * 2) * .005 * speed01 : 0)
    torso.rotation.x = smooth(torso.rotation.x, moving ? .035 * speed01 : 0, 9, dt)
    torso.rotation.y = smooth(torso.rotation.y, counter, 10, dt)
    torso.rotation.z = smooth(torso.rotation.z, turnLean, 11, dt)
    head.position.y = base.headY + bob * .70
    hair.position.y = base.hairY + bob * .70
    backpack.position.y = base.packY + bob * .82
    backpack.rotation.z = smooth(backpack.rotation.z, turnLean * .38, 10, dt)

    if (!moving) {
      const turnPose = Math.max(-.14, Math.min(.14, turnVelocity * .032))
      hipL.rotation.z = smooth(hipL.rotation.z, -turnPose * .15, 10, dt)
      hipR.rotation.z = smooth(hipR.rotation.z, turnPose * .15, 10, dt)
      shoulderL.rotation.z = smooth(shoulderL.rotation.z, -.055 - turnPose * .10, 10, dt)
      shoulderR.rotation.z = smooth(shoulderR.rotation.z, .055 - turnPose * .10, 10, dt)
    } else {
      hipL.rotation.z = smooth(hipL.rotation.z, 0, 12, dt)
      hipR.rotation.z = smooth(hipR.rotation.z, 0, 12, dt)
      shoulderL.rotation.z = smooth(shoulderL.rotation.z, -.045, 12, dt)
      shoulderR.rotation.z = smooth(shoulderR.rotation.z, .045, 12, dt)
    }
  })

  scene.metadata = { ...(scene.metadata ?? {}), dropiHeroMotionV1: true }
  ;(window as Window & { __DROPiHeroMotionV1?: { issue: number; mode: string } }).__DROPiHeroMotionV1 = {
    issue: ISSUE,
    mode: 'velocity-driven-four-joint-gait-local-forward',
  }
}

boot()
