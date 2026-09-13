import { ArcRotateCamera, EngineStore, Mesh, TransformNode, Vector3 } from '@babylonjs/core'

const ISSUE = 731

type CoherenceStatus = {
  issue: number
  controls: 'PENDING' | 'PASS' | 'FAIL'
  facing: 'PENDING' | 'PASS' | 'FAIL'
  hqSignClear: 'PASS' | 'FAIL'
  heroLocalSemantics: 'PASS' | 'FAIL'
  worstControlDot: number | null
  worstFacingDot: number | null
}

declare global {
  interface Window {
    __DROPiNaturalControls?: {
      getJoystick(): { x: number; y: number; magnitude: number }
    }
    __DROPiCoherenceProbe?: CoherenceStatus
  }
}

const boxesIntersect = (a: Mesh, b: Mesh): boolean => {
  a.computeWorldMatrix(true)
  b.computeWorldMatrix(true)
  const ab = a.getBoundingInfo().boundingBox
  const bb = b.getBoundingInfo().boundingBox
  return (
    ab.minimumWorld.x <= bb.maximumWorld.x && ab.maximumWorld.x >= bb.minimumWorld.x &&
    ab.minimumWorld.y <= bb.maximumWorld.y && ab.maximumWorld.y >= bb.minimumWorld.y &&
    ab.minimumWorld.z <= bb.maximumWorld.z && ab.maximumWorld.z >= bb.minimumWorld.z
  )
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  const camera = scene?.activeCamera
  if (
    !scene || !(hero instanceof TransformNode) || !(camera instanceof ArcRotateCamera) ||
    !scene.metadata?.dropiPresentationCoherenceFix
  ) {
    window.requestAnimationFrame(boot)
    return
  }

  const sign = scene.getMeshByName('sign-plane-DROPi HQ')
  const canopy = scene.getMeshByName('realism-hq-canopy')
  const backpack = scene.getMeshByName('realism-v2-hero-backpack')
  const parcel = scene.getMeshByName('hero-parcel')

  const status: CoherenceStatus = {
    issue: ISSUE,
    controls: 'PENDING',
    facing: 'PENDING',
    hqSignClear: sign instanceof Mesh && canopy instanceof Mesh && !boxesIntersect(sign, canopy) ? 'PASS' : 'FAIL',
    heroLocalSemantics:
      backpack instanceof Mesh && parcel instanceof Mesh && backpack.position.z < 0 && parcel.position.z > 0
        ? 'PASS'
        : 'FAIL',
    worstControlDot: null,
    worstFacingDot: null,
  }
  window.__DROPiCoherenceProbe = status

  const badge = document.createElement('div')
  badge.id = 'dropi-coherence-probe'
  Object.assign(badge.style, {
    position: 'fixed',
    right: '12px',
    top: '69px',
    zIndex: '20',
    padding: '5px 8px',
    borderRadius: '8px',
    background: 'rgba(7,20,28,.72)',
    border: '1px solid rgba(255,255,255,.14)',
    color: '#eaf7fb',
    font: '800 8px/1 system-ui',
    letterSpacing: '.05em',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.append(badge)

  let previous = hero.position.clone()
  let controlSamples = 0
  let facingSamples = 0

  const render = (): void => {
    const overallFail = status.controls === 'FAIL' || status.facing === 'FAIL' ||
      status.hqSignClear === 'FAIL' || status.heroLocalSemantics === 'FAIL'
    const pending = status.controls === 'PENDING' || status.facing === 'PENDING'
    badge.textContent = `COHERENCE ${overallFail ? 'FAIL' : pending ? 'TESTING' : 'PASS'} · #${ISSUE}`
    badge.style.color = overallFail ? '#ffb5b5' : pending ? '#ffe5a6' : '#baf2c5'
  }
  render()

  scene.onBeforeRenderObservable.add(() => {
    const delta = hero.position.subtract(previous)
    previous.copyFrom(hero.position)
    delta.y = 0
    if (delta.lengthSquared() < 0.00001) return
    const actual = delta.normalize()

    const visibleFront = new Vector3(Math.sin(hero.rotation.y), 0, Math.cos(hero.rotation.y)).normalize()
    const facingDot = Vector3.Dot(visibleFront, actual)
    status.worstFacingDot = status.worstFacingDot === null ? facingDot : Math.min(status.worstFacingDot, facingDot)
    facingSamples += 1
    if (facingSamples >= 8) status.facing = facingDot >= 0.72 ? 'PASS' : 'FAIL'

    const joystick = window.__DROPiNaturalControls?.getJoystick()
    if (joystick && joystick.magnitude >= 0.45) {
      const target = camera.getTarget()
      const forward = target.subtract(camera.position)
      forward.y = 0
      if (forward.lengthSquared() > 0.0001) {
        forward.normalize()
        const right = new Vector3(forward.z, 0, -forward.x)
        const expected = forward.scale(-joystick.y).add(right.scale(joystick.x))
        expected.y = 0
        if (expected.lengthSquared() > 0.0001) {
          expected.normalize()
          const controlDot = Vector3.Dot(expected, actual)
          status.worstControlDot = status.worstControlDot === null
            ? controlDot
            : Math.min(status.worstControlDot, controlDot)
          controlSamples += 1
          if (controlSamples >= 8) status.controls = controlDot >= 0.72 ? 'PASS' : 'FAIL'
        }
      }
    }

    window.__DROPiCoherenceProbe = { ...status }
    render()
  })
}

boot()
