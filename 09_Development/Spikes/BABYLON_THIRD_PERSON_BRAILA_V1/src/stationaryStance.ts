import { Matrix, TransformNode, Vector3 } from '@babylonjs/core'
import { PoseRestore } from './contactKinematics'
import { tryFootPlant } from './humanContactPose'
import type { ContactReport, HumanContactPose } from './humanContactPose'

export type StanceReport = ContactReport & {
  idleSupport: 'MOVING' | 'SETTLING' | 'SUPPORTED' | 'UNREACHABLE'
  pelvisLoweringM: number
  maxIdleFootClearanceM: number | null
}
const SOLE_CLEARANCE_M = .006
const IDLE_SUPPORT_TOLERANCE_M = .025
const MAX_PELVIS_LOWERING_M = .24

/** Both stationary soles need support; min(left,right) >= 0 is insufficient. */
export class StationaryStance {
  private first = true
  private stillTime = 0
  constructor(readonly pose: HumanContactPose) {}

  apply(dt: number, speed: number, original: ContactReport): StanceReport {
    if (!Number.isFinite(dt) || !Number.isFinite(speed)) throw new Error('Invalid idle stance frame')
    if (speed > .01) {
      this.first = false; this.stillTime = 0
      return { ...original, idleSupport: 'MOVING', pelvisLoweringM: 0, maxIdleFootClearanceM: null }
    }
    // Initial idle is already standing; on stopping, let walk-to-idle blend
    // finish rather than forcing an animated swing foot onto the ground.
    this.stillTime = this.first ? .3 : this.stillTime + Math.max(0, Math.min(dt, .1))
    this.first = false
    if (this.stillTime < .25) return { ...original, idleSupport: 'SETTLING', pelvisLoweringM: 0, maxIdleFootClearanceM: null }
    const pose = this.pose
    let feet = pose.probe.read(pose.surface)
    const maximum = Math.max(feet.left, feet.right)
    if (original.status !== 'PASS') return { ...original, idleSupport: 'UNREACHABLE', pelvisLoweringM: 0, maxIdleFootClearanceM: maximum }
    if (maximum <= IDLE_SUPPORT_TOLERANCE_M) return { ...original, idleSupport: 'SUPPORTED', pelvisLoweringM: 0, maxIdleFootClearanceM: maximum }
    const requestedLowering = maximum - SOLE_CLEARANCE_M
    const unsupported = (): StanceReport => ({
      ...original, status: 'FAIL', failures: [...original.failures, 'IDLE_FOOT_UNSUPPORTED'],
      idleSupport: 'UNREACHABLE', pelvisLoweringM: 0, maxIdleFootClearanceM: maximum,
    })
    if (requestedLowering > MAX_PELVIS_LOWERING_M) return unsupported()
    const rollback = new PoseRestore()
    rollback.save(pose.base)
    const joints: TransformNode[] = []
    for (const leg of pose.legs) {
      leg.lock = null
      for (const node of [leg.upper, leg.lower, leg.foot, leg.tip]) {
        rollback.save(node); pose.restorePose.save(node); joints.push(node)
      }
      leg.foot.computeWorldMatrix(true)
      leg.tip.position.copyFrom(Vector3.TransformCoordinates(leg.foot.getAbsolutePosition(), Matrix.Invert(leg.lower.computeWorldMatrix(true))))
    }
    const undo = (): void => {
      rollback.restore(); pose.base.computeWorldMatrix(true)
      for (const joint of joints) joint.computeWorldMatrix(true)
      pose.clearPlants()
    }
    try {
      // The low-side leg must reach without stretching. Lower the visual pelvis
      // and bend the high-side knee; do not change canonical actor position.
      const basePosition = pose.base.getAbsolutePosition().clone()
      basePosition.y -= requestedLowering
      pose.base.setAbsolutePosition(basePosition); pose.base.computeWorldMatrix(true)
      let solved = true
      for (let iteration = 0; iteration < 4; iteration += 1) {
        feet = pose.probe.read(pose.surface)
        if (Math.min(feet.left, feet.right) >= -.002 && Math.max(feet.left, feet.right) <= IDLE_SUPPORT_TOLERANCE_M) break
        for (const [index, leg] of pose.legs.entries()) {
          leg.foot.computeWorldMatrix(true)
          const target = leg.foot.getAbsolutePosition().clone()
          target.y += SOLE_CLEARANCE_M - (index === 0 ? feet.left : feet.right)
          const pole = Vector3.TransformCoordinates(new Vector3(leg.side * .13, .55, .65), pose.root.computeWorldMatrix(true))
          if (!tryFootPlant(leg.upper, leg.lower, leg.foot, leg.tip, target, pole).planted) { solved = false; break }
        }
        if (!solved) break
      }
      feet = pose.probe.read(pose.surface)
      if (!solved || Math.min(feet.left, feet.right) < -.002 || Math.max(feet.left, feet.right) > IDLE_SUPPORT_TOLERANCE_M) {
        undo(); return unsupported()
      }
      // Root translation moves the parcel and both posed arms together. Swing
      // animation is untouched; no additional horizontal plant locks are claimed.
      return {
        ...original, minFootClearanceM: Math.min(feet.left, feet.right),
        leftFootClearanceM: feet.left, rightFootClearanceM: feet.right,
        feetVerticesChecked: feet.vertices, plantedFeet: pose.legs.filter(leg => leg.lock).length,
        idleSupport: 'SUPPORTED', pelvisLoweringM: requestedLowering,
        maxIdleFootClearanceM: Math.max(feet.left, feet.right),
      }
    } catch (error) { undo(); throw error }
  }
}
