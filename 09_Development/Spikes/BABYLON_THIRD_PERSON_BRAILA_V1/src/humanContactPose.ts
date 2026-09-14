import { AbstractMesh, Matrix, Mesh, TransformNode, Vector3, VertexBuffer } from '@babylonjs/core'
import { orientPalm, PoseRestore, solveTwoBone } from './contactKinematics'

export type SurfaceHeight = (x: number, z: number) => number
export type ContactReport = {
  minFootClearanceM: number; leftFootClearanceM: number; rightFootClearanceM: number
  handErrorM: number | null; carry: boolean; plantedFeet: number; feetVerticesChecked: number
  status: 'PASS' | 'FAIL'; failures: string[]; releasedPlants: number
}
type FootData = { mesh: AbstractMesh; positions: number[]; indices: number[]; weights: number[]; sides: number[] }
export class SkinFeetProbe {
  readonly data: FootData[]
  constructor(meshes: AbstractMesh[]) {
    this.data = meshes.filter(mesh => mesh.skeleton && /feet|shoe/i.test(mesh.name)).map(mesh => {
      const positions = mesh.getVerticesData(VertexBuffer.PositionKind)
      const indices = mesh.getVerticesData(VertexBuffer.MatricesIndicesKind)
      const weights = mesh.getVerticesData(VertexBuffer.MatricesWeightsKind)
      if (!positions || !indices || !weights || mesh.numBoneInfluencers > 4) throw new Error(`Unsupported shoe skin: ${mesh.name}`)
      const boneSides = new Map<number, number>()
      for (const bone of mesh.skeleton!.bones) boneSides.set(bone.getIndex(), /\.L$/.test(bone.name) ? -1 : /\.R$/.test(bone.name) ? 1 : 0)
      const sides: number[] = []
      for (let vertex = 0; vertex < positions.length / 3; vertex += 1) {
        let side = 0
        for (let slot = 0; slot < 4; slot += 1) side += (boneSides.get(indices[vertex * 4 + slot]!) ?? 0) * weights[vertex * 4 + slot]!
        sides.push(side < 0 ? -1 : 1)
      }
      return { mesh, positions: Array.from(positions), indices: Array.from(indices), weights: Array.from(weights), sides }
    })
    if (!this.data.length) throw new Error('No actual skinned shoe geometry found')
  }
  read(surface: SurfaceHeight): { left: number; right: number; vertices: number } {
    let left = Infinity, right = Infinity, vertices = 0
    for (const skeleton of new Set(this.data.map(item => item.mesh.skeleton!))) skeleton.prepare(true)
    const skinned = Vector3.Zero(), world = Vector3.Zero()
    for (const { mesh, positions, indices, weights, sides } of this.data) {
      mesh.computeWorldMatrix(true)
      const matrices = mesh.skeleton!.getTransformMatrices(mesh)
      // The mesh transform is invariant within this scan. Resolve it once, not
      // once per shoe vertex. Each subsequent IK/stance scan still reads anew.
      const worldMatrix = mesh.getWorldMatrix()
      for (let vertex = 0; vertex < positions.length / 3; vertex += 1) {
        const x = positions[vertex * 3]!, y = positions[vertex * 3 + 1]!, z = positions[vertex * 3 + 2]!
        let px = 0, py = 0, pz = 0
        for (let slot = 0; slot < 4; slot += 1) {
          const weight = weights[vertex * 4 + slot]!
          if (!weight) continue
          const offset = indices[vertex * 4 + slot]! * 16
          px += weight * (x * matrices[offset]! + y * matrices[offset + 4]! + z * matrices[offset + 8]! + matrices[offset + 12]!)
          py += weight * (x * matrices[offset + 1]! + y * matrices[offset + 5]! + z * matrices[offset + 9]! + matrices[offset + 13]!)
          pz += weight * (x * matrices[offset + 2]! + y * matrices[offset + 6]! + z * matrices[offset + 10]! + matrices[offset + 14]!)
        }
        skinned.set(px, py, pz)
        Vector3.TransformCoordinatesToRef(skinned, worldMatrix, world)
        const clearance = world.y - surface(world.x, world.z)
        if (sides[vertex] === -1) left = Math.min(left, clearance)
        else right = Math.min(right, clearance)
        vertices += 1
      }
    }
    if (![left, right].every(Number.isFinite)) throw new Error('Non-finite skinned foot measurement')
    return { left, right, vertices }
  }
}

/** A stale support lock is optional, not permission to stretch or break a leg. */
export const tryFootPlant = (
  upper: TransformNode, lower: TransformNode, foot: TransformNode, tip: TransformNode,
  target: Vector3, pole: Vector3,
): { planted: boolean; errorM: number } => {
  const rollback = new PoseRestore()
  for (const joint of [upper, lower, foot]) rollback.save(joint)
  try {
    const result = solveTwoBone(upper, lower, tip, target, pole)
    if (!Number.isFinite(result.errorM)) throw new Error('Non-finite support solve')
    if (!result.reached || result.clamped) {
      rollback.restore()
      for (const joint of [upper, lower, foot, tip]) joint.computeWorldMatrix(true)
      return { planted: false, errorM: result.errorM }
    }
    foot.setAbsolutePosition(target); foot.computeWorldMatrix(true)
    return { planted: true, errorM: result.errorM }
  } catch (error) {
    rollback.restore()
    for (const joint of [upper, lower, foot, tip]) joint.computeWorldMatrix(true)
    throw error
  }
}

type Leg = { upper: TransformNode; lower: TransformNode; foot: TransformNode; tip: TransformNode; lock: Vector3 | null; side: number }
type Arm = { upper: TransformNode; lower: TransformNode; wrist: TransformNode; palm: TransformNode; forward: Vector3; normal: Vector3; side: number }
export class HumanContactPose {
  readonly restorePose = new PoseRestore()
  readonly probe: SkinFeetProbe
  readonly legs: Leg[]
  readonly arms: Arm[]
  private previousHeading: number | null = null
  private previousPosition: Vector3 | null = null
  constructor(readonly root: Mesh, readonly base: TransformNode, readonly surface: SurfaceHeight, readonly parcel?: Mesh) {
    const nodes = root.getDescendants(false).filter((node): node is TransformNode => node instanceof TransformNode => false)
    const node = (name: string): TransformNode => {
      const matches = nodes.filter(candidate => candidate.name.endsWith(`/${name}`))
      if (matches.length !== 1) throw new Error(`Contact adapter requires exact joint ${name}; found ${matches.length}`)
      return matches[0]!
    }
    const pointInRoot = (n: TransformNode): Vector3 => Vector3.TransformCoordinates(n.computeWorldMatrix(true).getTranslation(), Matrix.Invert(root.computeWorldMatrix(true)))
    this.probe = new SkinFeetProbe(root.getChildMeshes(false))
    this.legs = ['L', 'R'].map(side => {
      const upper = node(`UpperLeg.${side}`), lower = node(`LowerLeg.${side}`), foot = node(`Foot.${side}`)
      const tip = new TransformNode(`${root.name}/contact-ankle-${side}`, root.getScene()); tip.parent = lower
      foot.computeWorldMatrix(true)
      tip.position.copyFrom(Vector3.TransformCoordinates(foot.getAbsolutePosition(), Matrix.Invert(lower.computeWorldMatrix(true))))
      return { upper, lower, foot, tip, lock: null, side: Math.sign(pointInRoot(foot).x) || (side === 'L' ? -1 : 1) }
    })
    this.arms = parcel ? ['L', 'R'].map(side => {
      const upper = node(`UpperArm.${side}`), lower = node(`LowerArm.${side}`), wrist = node(`Wrist.${side}`)
      const middle = node(`Middle2.${side}`), index = node(`Index1.${side}`), pinky = node(`Pinky1.${side}`)
      wrist.computeWorldMatrix(true); middle.computeWorldMatrix(true); index.computeWorldMatrix(true); pinky.computeWorldMatrix(true)
      const inverse = Matrix.Invert(wrist.getWorldMatrix())
      const forward = Vector3.TransformCoordinates(middle.getAbsolutePosition(), inverse).normalize()
      const across = Vector3.TransformNormal(index.getAbsolutePosition().subtract(pinky.getAbsolutePosition()), inverse).normalize()
      const normal = Vector3.Cross(forward, across).normalize()
      const palm = new TransformNode(`${root.name}/contact-palm-${side}`, root.getScene()); palm.parent = wrist
      palm.position.copyFrom(Vector3.TransformCoordinates(middle.getAbsolutePosition(), inverse).scale(.48))
      return { upper, lower, wrist, palm, forward, normal, side: Math.sign(pointInRoot(wrist).x) || (side === 'L' ? -1 : 1) }
    }) : []
  }
  restore(): void { this.restorePose.restore() }
  clearPlants(): void { for (const leg of this.legs) leg.lock = null }
  apply(dt: number, speed: number): ContactReport {
    if (!Number.isFinite(dt) || !Number.isFinite(speed)) throw new Error('Invalid contact frame inputs')
    const failures: string[] = []
    let releasedPlants = 0
    this.base.computeWorldMatrix(true)
    const position = this.base.getAbsolutePosition().clone()
    const forward = Vector3.TransformNormal(Vector3.Forward(), this.root.computeWorldMatrix(true)).normalize()
    const heading = Math.atan2(forward.x, forward.z)
    const turned = this.previousHeading === null ? false : Math.abs(Math.atan2(Math.sin(heading - this.previousHeading), Math.cos(heading - this.previousHeading))) > .3
    const relocated = this.previousPosition !== null && Vector3.Distance(position, this.previousPosition) > .5
    const continuous = dt > 0 && dt <= .2 && !turned && !relocated
    if (!continuous) this.clearPlants()
    this.previousHeading = heading; this.previousPosition = position.clone()
    position.y = this.surface(position.x, position.z) + .006
    this.base.setAbsolutePosition(position); this.base.computeWorldMatrix(true)
    let feet = this.probe.read(this.surface)
    const requestedLift = Math.max(0, .006 - Math.min(feet.left, feet.right)), appliedLift = Math.min(.3, requestedLift)
    if (requestedLift > .3) failures.push('EXCESSIVE_GROUND_CORRECTION')
    position.y += appliedLift
    this.base.setAbsolutePosition(position); this.base.computeWorldMatrix(true)
    feet = { ...feet, left: feet.left + appliedLift, right: feet.right + appliedLift }
    for (const [index, leg] of this.legs.entries()) {
      leg.foot.computeWorldMatrix(true)
      const native = leg.foot.getAbsolutePosition().clone()
      const clearance = index === 0 ? feet.left : feet.right, other = index === 0 ? feet.right : feet.left
      if (leg.lock && (clearance > other + .065 || Math.hypot(leg.lock.x - native.x, leg.lock.z - native.z) > .16 || !continuous)) leg.lock = null
      // Do not clear and immediately re-acquire a support lock in the very same
      // skipped/relocated frame. Resume planting on the next continuous pose.
      if (continuous && !leg.lock && clearance <= .022 && (speed > .08 || Math.abs(clearance - other) < .025)) leg.lock = native.clone()
      if (!leg.lock) continue
      for (const joint of [leg.upper, leg.lower, leg.foot]) this.restorePose.save(joint)
      leg.tip.position.copyFrom(Vector3.TransformCoordinates(native, Matrix.Invert(leg.lower.computeWorldMatrix(true))))
      const target = native.clone(); target.x = leg.lock.x; target.z = leg.lock.z
      const pole = Vector3.TransformCoordinates(new Vector3(leg.side * .13, .55, .65), this.root.computeWorldMatrix(true))
      const solved = tryFootPlant(leg.upper, leg.lower, leg.foot, leg.tip, target, pole)
      if (!solved.planted) { leg.lock = null; releasedPlants += 1 }
    }
    // Always measure real skinned shoes after planting or rollback. Releasing an
    // unreachable optional lock is NOT a ground-clearance success by itself.
    feet = this.probe.read(this.surface)
    const requestedCorrection = Math.max(0, .006 - Math.min(feet.left, feet.right)), correction = Math.min(.15, requestedCorrection)
    if (requestedCorrection > .15) failures.push('RESIDUAL_GROUND_PENETRATION')
    if (correction > 0) {
      position.y += correction; this.base.setAbsolutePosition(position); this.base.computeWorldMatrix(true)
      feet = this.probe.read(this.surface)
    }
    let handErrorM: number | null = null
    const carrying = Boolean(this.parcel?.isEnabled())
    if (carrying && this.parcel) {
      const parcel = this.parcel
      const rootMatrix = this.root.computeWorldMatrix(true), inverseRoot = Matrix.Invert(rootMatrix)
      const arms = this.arms.map(arm => {
        const local = (node: TransformNode): Vector3 => Vector3.TransformCoordinates(node.computeWorldMatrix(true).getTranslation(), inverseRoot)
        const upper = local(arm.upper), lower = local(arm.lower), wrist = local(arm.wrist)
        return { upper, reach: Vector3.Distance(upper, lower) + Vector3.Distance(lower, wrist) }
      })
      const reach = Math.min(...arms.map(arm => arm.reach))
      const shoulders = arms.reduce((sum, arm) => sum.addInPlace(arm.upper), Vector3.Zero()).scale(1 / arms.length)
      const center = new Vector3(0, shoulders.y - reach * .52, Math.max(.23, shoulders.z + reach * .60))
      parcel.parent = this.root; parcel.position.copyFrom(center); parcel.rotationQuaternion = null; parcel.rotation.set(0, 0, 0)
      const bounds = parcel.getBoundingInfo().boundingBox, localSize = bounds.maximum.subtract(bounds.minimum)
      parcel.scaling.set(.36 / localSize.x, .24 / localSize.y, .24 / localSize.z); parcel.computeWorldMatrix(true)
      handErrorM = 0
      for (const arm of this.arms) {
        for (const joint of [arm.upper, arm.lower, arm.wrist]) this.restorePose.save(joint)
        const grip = Vector3.TransformCoordinates(new Vector3(arm.side * .183, center.y, center.z), rootMatrix)
        const direction = Vector3.TransformNormal(Vector3.Forward(), rootMatrix).normalize()
        const inward = Vector3.TransformNormal(new Vector3(-arm.side, 0, 0), rootMatrix).normalize()
        const pole = Vector3.TransformCoordinates(new Vector3(arm.side * .55, center.y - .05, center.z - .35), rootMatrix)
        let errorM = Infinity
        for (let iteration = 0; iteration < 10 && errorM > .001; iteration += 1) {
          orientPalm(arm.wrist, arm.forward, arm.normal, direction, inward)
          const offset = Vector3.TransformNormal(arm.palm.position, arm.wrist.getWorldMatrix())
          solveTwoBone(arm.upper, arm.lower, arm.wrist, grip.subtract(offset), pole)
          orientPalm(arm.wrist, arm.forward, arm.normal, direction, inward)
          arm.palm.computeWorldMatrix(true)
          errorM = Vector3.Distance(arm.palm.getAbsolutePosition(), grip)
        }
        handErrorM = Math.max(handErrorM, errorM)
      }
      if (!Number.isFinite(handErrorM) || handErrorM > .025) failures.push('HAND_SOCKET_GAP')
    }
    if (Math.min(feet.left, feet.right) < -.002) failures.push('FOOT_PENETRATION')
    return { minFootClearanceM: Math.min(feet.left, feet.right), leftFootClearanceM: feet.left, rightFootClearanceM: feet.right, handErrorM, carry: carrying, plantedFeet: this.legs.filter(leg => leg.lock).length, feetVerticesChecked: feet.vertices, releasedPlants, status: failures.length ? 'FAIL' : 'PASS', failures }
  }
  dispose(): void { this.restore(); this.legs.forEach(leg => leg.tip.dispose()); this.arms.forEach(arm => arm.palm.dispose()) }
}
