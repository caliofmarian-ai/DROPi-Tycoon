import { EngineStore, Mesh, TransformNode, Vector3 } from '@babylonjs/core'

const ISSUE = 725

const moveTowards = (current: number, target: number, rate: number, dt: number): number => {
  const t = 1 - Math.exp(-rate * dt)
  return current + (target - current) * t
}

const makeJoint = (
  hero: TransformNode,
  name: string,
  x: number,
  y: number,
  meshes: Mesh[],
): TransformNode => {
  const scene = hero.getScene()
  const joint = new TransformNode(name, scene)
  joint.parent = hero
  joint.position.set(x, y, 0)
  meshes.forEach(mesh => {
    const world = mesh.getAbsolutePosition().clone()
    mesh.parent = joint
    mesh.position.copyFrom(world.subtract(hero.getAbsolutePosition()).subtract(joint.position))
  })
  return joint
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode) || !scene.metadata?.dropiRealismV2) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiHeroMotionV1) return

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

  // Re-parent limbs around approximate anatomical pivots so rotations read as
  // shoulder/hip articulation rather than rigid cylinders spinning in place.
  const armL = makeJoint(hero, 'hero-motion-shoulder-l', -0.31, 1.38, [leftArm, leftHand])
  const armR = makeJoint(hero, 'hero-motion-shoulder-r', 0.31, 1.38, [rightArm, rightHand])
  const legL = makeJoint(hero, 'hero-motion-hip-l', -0.135, 0.72, [leftLeg, leftFoot])
  const legR = makeJoint(hero, 'hero-motion-hip-r', 0.135, 0.72, [rightLeg, rightFoot])

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

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
    if (dt <= 0) return

    const displacement = Vector3.Distance(hero.position, previousPosition)
    const rawSpeed = displacement / dt
    previousPosition.copyFrom(hero.position)
    smoothedSpeed = moveTowards(smoothedSpeed, rawSpeed, 8.5, dt)

    const headingDelta = Math.atan2(
      Math.sin(hero.rotation.y - previousHeading),
      Math.cos(hero.rotation.y - previousHeading),
    )
    previousHeading = hero.rotation.y
    turnVelocity = moveTowards(turnVelocity, headingDelta / dt, 9, dt)

    const moving = smoothedSpeed > 0.08
    const speed01 = Math.min(1, smoothedSpeed / 2.4)
    const cycleHz = 1.45 + speed01 * 0.75
    if (moving) gaitPhase += dt * Math.PI * 2 * cycleHz

    const carry = Boolean(parcel?.isEnabled())
    const stride = moving ? Math.sin(gaitPhase) : 0
    const stepLiftL = moving ? Math.max(0, Math.sin(gaitPhase)) : 0
    const stepLiftR = moving ? Math.max(0, Math.sin(gaitPhase + Math.PI)) : 0
    const settle = moving ? 1 : 0

    const legSwing = 0.52 * speed01 * settle
    const armSwing = (carry ? 0.12 : 0.42) * speed01 * settle
    const carryPitch = carry ? -0.52 : 0

    legL.rotation.x = stride * legSwing
    legR.rotation.x = -stride * legSwing
    armL.rotation.x = carryPitch - stride * armSwing
    armR.rotation.x = carryPitch + stride * armSwing

    // Natural-ish foot lift/plant illusion without changing authoritative hero Y.
    leftFoot.position.y = -0.64 + stepLiftL * 0.055 * speed01
    rightFoot.position.y = -0.64 + stepLiftR * 0.055 * speed01
    leftFoot.rotation.x = -stride * 0.10 * speed01
    rightFoot.rotation.x = stride * 0.10 * speed01

    const bob = moving ? Math.abs(Math.sin(gaitPhase * 2)) * 0.018 * speed01 : Math.sin(performance.now() * 0.0017) * 0.004
    const counter = moving ? Math.sin(gaitPhase) * 0.045 * speed01 : 0
    const turnLean = Math.max(-0.08, Math.min(0.08, turnVelocity * 0.018))

    torso.position.y = base.torsoY + bob
    torso.position.z = base.torsoZ + (moving ? Math.cos(gaitPhase * 2) * 0.008 * speed01 : 0)
    torso.rotation.y = counter
    torso.rotation.z = turnLean
    head.position.y = base.headY + bob * 0.72
    hair.position.y = base.hairY + bob * 0.72
    backpack.position.y = base.packY + bob * 0.86
    backpack.rotation.z = turnLean * 0.45

    // Small stance response while turning from rest so the body does not read
    // as a rigid column rotating around its center.
    if (!moving) {
      const turnPose = Math.max(-0.16, Math.min(0.16, turnVelocity * 0.035))
      legL.rotation.z = -turnPose * 0.18
      legR.rotation.z = turnPose * 0.18
      armL.rotation.z = -0.08 - turnPose * 0.12
      armR.rotation.z = 0.08 - turnPose * 0.12
    } else {
      legL.rotation.z = 0
      legR.rotation.z = 0
      armL.rotation.z = -0.08
      armR.rotation.z = 0.08
    }
  })

  scene.metadata = { ...(scene.metadata ?? {}), dropiHeroMotionV1: true }
  ;(window as Window & { __DROPiHeroMotionV1?: { issue: number; mode: string } }).__DROPiHeroMotionV1 = {
    issue: ISSUE,
    mode: 'velocity-driven-articulated-gait',
  }
}

boot()
