import { ArcRotateCamera, EngineStore, Mesh, TransformNode, Vector3 } from '@babylonjs/core'
import { coherenceMotionSample } from './coherenceSampling'

const ISSUE = 731

type CoherenceStatus = {
  issue: number
  controls: 'PENDING' | 'PASS' | 'FAIL'
  facing: 'PENDING' | 'PASS' | 'FAIL'
  hqSignClear: 'PASS' | 'FAIL'
  heroLocalSemantics: 'PASS' | 'FAIL'
  worstControlDot: number | null
  worstFacingDot: number | null
  skippedDiscontinuities: number
}
type NaturalControlsProbeView = { getJoystick(): { x: number; y: number; magnitude: number } }
declare global { interface Window { __DROPiCoherenceProbe?: CoherenceStatus } }
const getNaturalControls = (): NaturalControlsProbeView | undefined =>
  (window as Window & { __DROPiNaturalControls?: NaturalControlsProbeView }).__DROPiNaturalControls

const boxesIntersect = (a: Mesh, b: Mesh): boolean => {
  a.computeWorldMatrix(true); b.computeWorldMatrix(true)
  const ab = a.getBoundingInfo().boundingBox, bb = b.getBoundingInfo().boundingBox
  return ab.minimumWorld.x <= bb.maximumWorld.x && ab.maximumWorld.x >= bb.minimumWorld.x &&
    ab.minimumWorld.y <= bb.maximumWorld.y && ab.maximumWorld.y >= bb.minimumWorld.y &&
    ab.minimumWorld.z <= bb.maximumWorld.z && ab.maximumWorld.z >= bb.minimumWorld.z
}
const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero'), camera = scene?.activeCamera
  if (!scene || !(hero instanceof TransformNode) || !(camera instanceof ArcRotateCamera) || !scene.metadata?.dropiPresentationCoherenceFix) {
    window.requestAnimationFrame(boot); return
  }
  const sign = scene.getMeshByName('sign-plane-DROPi HQ'), canopy = scene.getMeshByName('realism-hq-canopy')
  const backpack = scene.getMeshByName('realism-v2-hero-backpack'), parcel = scene.getMeshByName('hero-parcel')
  const status: CoherenceStatus = {
    issue: ISSUE, controls: 'PENDING', facing: 'PENDING',
    hqSignClear: sign instanceof Mesh && canopy instanceof Mesh && !boxesIntersect(sign, canopy) ? 'PASS' : 'FAIL',
    heroLocalSemantics: backpack instanceof Mesh && parcel instanceof Mesh && backpack.position.z < 0 && parcel.position.z > 0 ? 'PASS' : 'FAIL',
    worstControlDot: null, worstFacingDot: null, skippedDiscontinuities: 0,
  }
  window.__DROPiCoherenceProbe = status
  const badge = document.createElement('div')
  badge.id = 'dropi-coherence-probe'
  Object.assign(badge.style, {
    position: 'fixed', right: '12px', top: '69px', zIndex: '20', padding: '5px 8px', borderRadius: '8px',
    background: 'rgba(7,20,28,.72)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf7fb',
    font: '800 8px/1 system-ui', letterSpacing: '.05em', pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.append(badge)
  const previous = hero.position.clone()
  let controlSamples = 0, facingSamples = 0
  const render = (): void => {
    const failed = status.controls === 'FAIL' || status.facing === 'FAIL' || status.hqSignClear === 'FAIL' || status.heroLocalSemantics === 'FAIL'
    const pending = status.controls === 'PENDING' || status.facing === 'PENDING'
    badge.textContent = `COHERENCE ${failed ? 'FAIL' : pending ? 'TESTING' : 'PASS'} · #${ISSUE}`
    badge.style.color = failed ? '#ffb5b5' : pending ? '#ffe5a6' : '#baf2c5'
  }
  render()
  scene.onBeforeRenderObservable.add(() => {
    const delta = hero.position.subtract(previous)
    previous.copyFrom(hero.position)
    const sample = coherenceMotionSample(delta.x, delta.z, scene.getEngine().getDeltaTime() / 1000)
    if (sample.kind !== 'TRAVEL') {
      if (sample.kind === 'DISCONTINUITY') {
        status.skippedDiscontinuities += 1
        window.__DROPiCoherenceProbe = { ...status }
      }
      // Preserve PENDING/PASS/FAIL and the worst valid sample across relocation.
      // Neither restarting nor standing still supplies new directional evidence.
      return
    }
    const actual = new Vector3(sample.x, 0, sample.z)
    const visibleFront = new Vector3(Math.sin(hero.rotation.y), 0, Math.cos(hero.rotation.y)).normalize()
    const facingDot = Vector3.Dot(visibleFront, actual)
    status.worstFacingDot = status.worstFacingDot === null ? facingDot : Math.min(status.worstFacingDot, facingDot)
    facingSamples += 1
    if (facingSamples >= 8) status.facing = facingDot >= .72 ? 'PASS' : 'FAIL'
    const joystick = getNaturalControls()?.getJoystick()
    if (joystick && joystick.magnitude >= .45) {
      const forward = camera.getTarget().subtract(camera.position)
      forward.y = 0
      if (forward.lengthSquared() > .0001) {
        forward.normalize()
        const right = new Vector3(forward.z, 0, -forward.x)
        const expected = forward.scale(-joystick.y).add(right.scale(joystick.x))
        expected.y = 0
        if (expected.lengthSquared() > .0001) {
          expected.normalize()
          const dot = Vector3.Dot(expected, actual)
          status.worstControlDot = status.worstControlDot === null ? dot : Math.min(status.worstControlDot, dot)
          controlSamples += 1
          if (controlSamples >= 8) status.controls = dot >= .72 ? 'PASS' : 'FAIL'
        }
      }
    }
    window.__DROPiCoherenceProbe = { ...status }; render()
  })
}
boot()
