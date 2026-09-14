import { Matrix, Quaternion, TransformNode, Vector3 } from '@babylonjs/core'

const EPS = 1e-7
export const finiteVector = (v: Vector3): boolean => [v.x, v.y, v.z].every(Number.isFinite)
export const rotationBetween = (from: Vector3, to: Vector3): Quaternion => {
  if (!finiteVector(from) || !finiteVector(to) || from.lengthSquared() < EPS || to.lengthSquared() < EPS) throw new Error('Invalid IK direction')
  const a = from.normalizeToNew(), b = to.normalizeToNew()
  const dot = Math.max(-1, Math.min(1, Vector3.Dot(a, b)))
  if (dot > 1 - EPS) return Quaternion.Identity()
  if (dot < -1 + EPS) {
    const basis = Math.abs(a.x) < 0.8 ? Vector3.Right() : Vector3.Up()
    return Quaternion.RotationAxis(Vector3.Cross(a, basis).normalize(), Math.PI)
  }
  const axis = Vector3.Cross(a, b)
  return new Quaternion(axis.x, axis.y, axis.z, 1 + dot).normalize()
}

/** Transform both directions into the parent frame, including mirrored glTF roots. */
export const aimJoint = (joint: TransformNode, tip: TransformNode, targetWorld: Vector3): void => {
  joint.computeWorldMatrix(true); tip.computeWorldMatrix(true)
  const origin = joint.getAbsolutePosition()
  const inverse = joint.parent instanceof TransformNode ? Matrix.Invert(joint.parent.computeWorldMatrix(true)) : Matrix.Identity()
  const current = Vector3.TransformNormal(tip.getAbsolutePosition().subtract(origin), inverse)
  const desired = Vector3.TransformNormal(targetWorld.subtract(origin), inverse)
  const delta = rotationBetween(current, desired)
  const rotation = joint.rotationQuaternion ?? Quaternion.FromEulerVector(joint.rotation)
  joint.rotationQuaternion = delta.multiply(rotation).normalize()
  joint.computeWorldMatrix(true); tip.computeWorldMatrix(true)
}

export type TwoBoneResult = { reached: boolean; errorM: number; clamped: boolean }
/** Analytical two-link IK. The elbow pole is explicit; bone lengths are never scaled. */
export const solveTwoBone = (
  upper: TransformNode, lower: TransformNode, tip: TransformNode, target: Vector3, pole: Vector3,
): TwoBoneResult => {
  upper.computeWorldMatrix(true); lower.computeWorldMatrix(true); tip.computeWorldMatrix(true)
  const a = upper.getAbsolutePosition().clone(), b = lower.getAbsolutePosition().clone(), c = tip.getAbsolutePosition().clone()
  const l1 = Vector3.Distance(a, b), l2 = Vector3.Distance(b, c), ray = target.subtract(a)
  const requested = ray.length()
  if (Math.min(l1, l2, requested) < EPS || !finiteVector(pole)) throw new Error('Degenerate two-bone chain')
  const distance = Math.max(Math.abs(l1 - l2) + 1e-5, Math.min(l1 + l2 - 1e-5, requested))
  const direction = ray.scale(1 / requested)
  let normal = pole.subtract(a)
  normal.subtractInPlace(direction.scale(Vector3.Dot(normal, direction)))
  if (normal.lengthSquared() < EPS) {
    normal = b.subtract(a)
    normal.subtractInPlace(direction.scale(Vector3.Dot(normal, direction)))
  }
  if (normal.lengthSquared() < EPS) normal = Vector3.Cross(direction, Math.abs(direction.y) < .8 ? Vector3.Up() : Vector3.Right())
  normal.normalize()
  const along = (l1 * l1 - l2 * l2 + distance * distance) / (2 * distance)
  const bend = Math.sqrt(Math.max(0, l1 * l1 - along * along))
  const elbow = a.add(direction.scale(along)).add(normal.scale(bend))
  const reachable = a.add(direction.scale(distance))
  aimJoint(upper, lower, elbow)
  aimJoint(lower, tip, reachable)
  tip.computeWorldMatrix(true)
  const errorM = Vector3.Distance(tip.getAbsolutePosition(), target)
  return { reached: errorM < .015, errorM, clamped: Math.abs(distance - requested) > .001 }
}

/** Orient a palm's local forward and normal to world targets without Euler sign guesses. */
export const orientPalm = (
  wrist: TransformNode, localForward: Vector3, localNormal: Vector3, forwardWorld: Vector3, normalWorld: Vector3,
): void => {
  const inverse = wrist.parent instanceof TransformNode ? Matrix.Invert(wrist.parent.computeWorldMatrix(true)) : Matrix.Identity()
  const desiredForward = Vector3.TransformNormal(forwardWorld, inverse).normalize()
  const desiredNormal = Vector3.TransformNormal(normalWorld, inverse).normalize()
  let q = wrist.rotationQuaternion ?? Quaternion.FromEulerVector(wrist.rotation)
  let rotation = Matrix.Identity(); q.toRotationMatrix(rotation)
  const currentForward = Vector3.TransformNormal(localForward, rotation).normalize()
  q = rotationBetween(currentForward, desiredForward).multiply(q).normalize()
  q.toRotationMatrix(rotation)
  const currentNormal = Vector3.TransformNormal(localNormal, rotation)
  currentNormal.subtractInPlace(desiredForward.scale(Vector3.Dot(currentNormal, desiredForward))).normalize()
  const projectedNormal = desiredNormal.subtract(desiredForward.scale(Vector3.Dot(desiredNormal, desiredForward))).normalize()
  const angle = Math.atan2(Vector3.Dot(Vector3.Cross(currentNormal, projectedNormal), desiredForward), Vector3.Dot(currentNormal, projectedNormal))
  wrist.rotationQuaternion = Quaternion.RotationAxis(desiredForward, angle).multiply(q).normalize()
  wrist.computeWorldMatrix(true)
}

/** Restore the animation result before the next evaluation; no accumulating IK offsets. */
export class PoseRestore {
  private snapshots = new Map<TransformNode, { rotation: Quaternion | null; euler: Vector3; position: Vector3 }>()
  save(node: TransformNode): void {
    if (!this.snapshots.has(node)) this.snapshots.set(node, { rotation: node.rotationQuaternion?.clone() ?? null, euler: node.rotation.clone(), position: node.position.clone() })
  }
  restore(): void {
    for (const [node, pose] of this.snapshots) {
      if (node.isDisposed()) continue
      node.rotationQuaternion = pose.rotation?.clone() ?? null
      node.rotation.copyFrom(pose.euler); node.position.copyFrom(pose.position)
    }
    this.snapshots.clear()
  }
}
