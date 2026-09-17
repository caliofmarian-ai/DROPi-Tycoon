import { EngineStore, Mesh, TransformNode } from '@babylonjs/core'
import { HumanContactPose } from './humanContactPose'
import { StationaryStance } from './stationaryStance'
import type { StanceReport } from './stationaryStance'
import { surfaceSampler } from './authoredPedestrians'
import { planarSpeed } from './authoredWalk'

export type ActorContactFailure = { actor: string; position: { x: number; y: number; z: number }; speed: number; dt: number; report: StanceReport }
export type ContactRuntimeState = {
  status: 'LOADING' | 'ACTIVE' | 'FAIL'; mechanicalStatus: 'UNKNOWN' | 'PASS' | 'FAIL'
  humanCount: number; hero: StanceReport | null; worstFootClearanceM: number | null
  poseCostMs: number; error: string; visualAcceptance: 'UNKNOWN'
  sampleId: number; renderedSampleId: number; sampledAtMs: number
  actorFailures: ActorContactFailure[]
  firstFailedSample: { sampleId: number; actors: ActorContactFailure[] } | null
}
let started = false
const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) { window.setTimeout(boot, 100); return }
  if (started) return
  started = true
  const state: ContactRuntimeState = { status: 'LOADING', mechanicalStatus: 'UNKNOWN', humanCount: 0, hero: null, worstFootClearanceM: null, poseCostMs: 0, error: '', visualAcceptance: 'UNKNOWN', sampleId: 0, renderedSampleId: 0, sampledAtMs: 0, actorFailures: [], firstFailedSample: null }
  const publish = (): void => { (window as unknown as { __DROPiContactRuntime?: ContactRuntimeState }).__DROPiContactRuntime = { ...state } }
  publish()
  const start = performance.now()
  const attach = (): void => {
    if (scene.isDisposed) return
    const heroRoot = scene.getMeshByName('p1-rigged-hero-root')
    const visualRoot = scene.getTransformNodeByName('hero-visual-ground-root')
    const npcRoots = Array.from({ length: 8 }, (_, index) => scene.getMeshByName(`npc-human-${index}`))
    if (!(heroRoot instanceof Mesh) || !(visualRoot instanceof TransformNode) || npcRoots.some(root => !(root instanceof Mesh))) {
      if (performance.now() - start > 60000) { state.status = 'FAIL'; state.error = 'Required hero/pedestrian rigs did not initialize'; publish(); return }
      window.setTimeout(attach, 100); return
    }
    const poses: HumanContactPose[] = []
    try {
      const parcel = scene.getMeshByName('hero-parcel')
      if (!(parcel instanceof Mesh)) throw new Error('Mission parcel presentation missing')
      const ground = surfaceSampler(scene)
      poses.push(new HumanContactPose(heroRoot, visualRoot, ground, parcel))
      for (const root of npcRoots as Mesh[]) poses.push(new HumanContactPose(root, root, ground))
      const stances = poses.map(pose => new StationaryStance(pose))
      const previous = poses.map(pose => pose.base.getAbsolutePosition().clone())
      let pending = true, previousPlants = 0
      const restoreObserver = scene.onBeforeAnimationsObservable.add(() => poses.forEach(pose => pose.restore()))
      const frameObserver = scene.onBeforeRenderObservable.add(() => { pending = true })
      const applyObserver = scene.onBeforeActiveMeshesEvaluationObservable.add(() => {
        if (!pending || state.status === 'FAIL') return
        pending = false
        const startedAt = performance.now()
        try {
          const dt = scene.getEngine().getDeltaTime() / 1000
          const failed: ActorContactFailure[] = []
          const reports = poses.map((pose, index) => {
            const p = pose.base.getAbsolutePosition(), old = previous[index]!
            const speed = planarSpeed(p.x - old.x, p.z - old.z, dt)
            old.copyFrom(p)
            // One contact owner: native motion/plant/carry, then stationary
            // split-height support, then the completed rendered sample.
            const report = stances[index]!.apply(dt, speed, pose.apply(dt, speed))
            if (report.status !== 'PASS') failed.push({ actor: pose.root.name, position: { x: p.x, y: p.y, z: p.z }, speed, dt, report })
            return report
          })
          state.hero = reports[0]!
          state.worstFootClearanceM = Math.min(...reports.map(report => report.minFootClearanceM))
          state.mechanicalStatus = reports.every(report => report.status === 'PASS') ? 'PASS' : 'FAIL'
          state.actorFailures = failed
          state.poseCostMs = performance.now() - startedAt
          state.sampleId += 1; state.sampledAtMs = performance.now()
          if (failed.length && !state.firstFailedSample) state.firstFailedSample = { sampleId: state.sampleId, actors: failed }
          const controls = (window as unknown as { __DROPiNaturalControls?: { getSpeed(): number } }).__DROPiNaturalControls
          if (state.hero.plantedFeet > previousPlants && (controls?.getSpeed() ?? 0) > .08) window.dispatchEvent(new Event('dropi:foot-contact'))
          previousPlants = state.hero.plantedFeet
          ;(window as unknown as { __DROPiGroundContactV1?: unknown }).__DROPiGroundContactV1 = {
            issue: 725, mode: 'skinned-contact-ik-v2', status: state.hero.status,
            surfaceY: ground(visualRoot.getAbsolutePosition().x, visualRoot.getAbsolutePosition().z),
            minFootClearance: state.hero.minFootClearanceM, visualLiftY: visualRoot.position.y, visualAuthority: 'RIGGED_SKIN_GEOMETRY',
          }
        } catch (error) {
          state.status = 'FAIL'; state.mechanicalStatus = 'FAIL'; state.error = error instanceof Error ? error.message : String(error)
          poses.forEach(pose => { pose.restore(); pose.clearPlants() }); publish()
        }
      })
      const completeObserver = scene.onAfterRenderObservable.add(() => {
        if (state.status !== 'ACTIVE' || state.sampleId <= state.renderedSampleId) return
        state.renderedSampleId = state.sampleId
        publish()
      })
      scene.onDisposeObservable.addOnce(() => {
        scene.onBeforeAnimationsObservable.remove(restoreObserver)
        scene.onBeforeRenderObservable.remove(frameObserver)
        scene.onBeforeActiveMeshesEvaluationObservable.remove(applyObserver)
        scene.onAfterRenderObservable.remove(completeObserver)
        poses.forEach(pose => pose.dispose())
      })
      scene.metadata = { ...(scene.metadata ?? {}), dropiContactPoseV1: true }
      for (const pose of poses) pose.root.metadata = { ...(pose.root.metadata ?? {}), dropiContactOwner: true }
      state.status = 'ACTIVE'; state.humanCount = poses.length; publish()
    } catch (error) {
      poses.forEach(pose => pose.dispose())
      state.status = 'FAIL'; state.error = error instanceof Error ? error.message : String(error); publish()
    }
  }
  attach()
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') boot()
