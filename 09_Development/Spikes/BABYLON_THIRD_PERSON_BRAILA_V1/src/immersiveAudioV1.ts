import { EngineStore } from '@babylonjs/core'

const ISSUE = 722

type AudioBusName = 'master' | 'music' | 'ambience' | 'sfx' | 'vehicles' | 'voices' | 'ui'

type AudioDebug = {
  issue: number
  started: boolean
  muted: boolean
  cinematicActive: boolean
  buses: Record<AudioBusName, number>
}

declare global {
  interface Window {
    __DROPiAudioV1?: AudioDebug
  }
}

const buses: Record<AudioBusName, number> = {
  master: 0.9,
  music: 0.34,
  ambience: 0.64,
  sfx: 0.8,
  vehicles: 0.48,
  voices: 0.82,
  ui: 0.62,
}

let context: AudioContext | null = null
let gains: Partial<Record<AudioBusName, GainNode>> = {}
let muted = false
let cinematicActive = document.documentElement.dataset.cinematicAudio === 'active'
let started = false
let birdTimer: number | null = null
let lastStepAt = 0
let lastHeroX: number | null = null
let lastHeroZ: number | null = null
let vehiclePanner: PannerNode | null = null
let footstepNoise: AudioBuffer | null = null
let lastSpatialUpdateAt = 0

const dbSafe = (value: number): number => Math.max(0.0001, Math.min(1, value))

const updateDebug = (): void => {
  window.__DROPiAudioV1 = { issue: ISSUE, started, muted, cinematicActive, buses: { ...buses } }
}

const applyMasterMix = (timeConstant = 0.08): void => {
  const master = gains.master
  if (!master || !context) return
  const target = muted || cinematicActive ? 0.0001 : dbSafe(buses.master)
  master.gain.cancelScheduledValues(context.currentTime)
  master.gain.setTargetAtTime(target, context.currentTime, timeConstant)
}

window.addEventListener('dropi:cinematic-audio-state', event => {
  const detail = (event as CustomEvent<{ active?: boolean }>).detail
  cinematicActive = detail?.active === true
  document.documentElement.dataset.cinematicAudio = cinematicActive ? 'active' : 'gameplay'
  applyMasterMix(cinematicActive ? 0.045 : 0.22)
  updateDebug()
})

const createBusGraph = (audio: AudioContext): void => {
  const master = audio.createGain()
  master.gain.value = buses.master

  const limiter = audio.createDynamicsCompressor()
  limiter.threshold.value = -8
  limiter.knee.value = 10
  limiter.ratio.value = 6
  limiter.attack.value = 0.003
  limiter.release.value = 0.18

  master.connect(limiter).connect(audio.destination)
  gains.master = master

  ;(['music', 'ambience', 'sfx', 'vehicles', 'voices', 'ui'] as const).forEach(name => {
    const gain = audio.createGain()
    gain.gain.value = buses[name]
    gain.connect(master)
    gains[name] = gain
  })
}

const createNoiseBuffer = (audio: AudioContext, seconds = 2): AudioBuffer => {
  const length = Math.floor(audio.sampleRate * seconds)
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const channel = buffer.getChannelData(0)
  for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1
  return buffer
}

const startCityAmbience = (audio: AudioContext): void => {
  const ambienceBus = gains.ambience
  if (!ambienceBus) return

  const noise = audio.createBufferSource()
  noise.buffer = createNoiseBuffer(audio, 3)
  noise.loop = true
  const lowpass = audio.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 680
  lowpass.Q.value = 0.35
  const noiseGain = audio.createGain()
  noiseGain.gain.value = 0.14
  noise.connect(lowpass).connect(noiseGain).connect(ambienceBus)
  noise.start()

  const wind = audio.createBufferSource()
  wind.buffer = createNoiseBuffer(audio, 4)
  wind.loop = true
  const windFilter = audio.createBiquadFilter()
  windFilter.type = 'bandpass'
  windFilter.frequency.value = 1450
  windFilter.Q.value = 0.22
  const windGain = audio.createGain()
  windGain.gain.value = 0.035
  wind.connect(windFilter).connect(windGain).connect(ambienceBus)
  wind.start()

  ;[52, 79].forEach((frequency, index) => {
    const osc = audio.createOscillator()
    osc.type = index === 0 ? 'sine' : 'triangle'
    osc.frequency.value = frequency
    const gain = audio.createGain()
    gain.gain.value = index === 0 ? 0.03 : 0.015
    osc.connect(gain).connect(ambienceBus)
    osc.start()
  })
}

const chirp = (): void => {
  if (!context || context.state !== 'running' || muted) return
  const ambienceBus = gains.ambience
  if (!ambienceBus) return

  const now = context.currentTime
  const osc = context.createOscillator()
  const gain = context.createGain()
  const filter = context.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1100
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1850 + Math.random() * 450, now)
  osc.frequency.exponentialRampToValueAtTime(2600 + Math.random() * 600, now + 0.09)
  osc.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 300, now + 0.22)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
  osc.connect(filter).connect(gain).connect(ambienceBus)
  osc.start(now)
  osc.stop(now + 0.27)
}

const scheduleBirds = (): void => {
  const schedule = (): void => {
    const delay = 4200 + Math.random() * 6800
    birdTimer = window.setTimeout(() => {
      chirp()
      if (Math.random() > 0.55) window.setTimeout(chirp, 280 + Math.random() * 260)
      schedule()
    }, delay)
  }
  schedule()
}

const footstep = (onRoad: boolean): void => {
  if (!context || context.state !== 'running' || muted || !footstepNoise) return
  const sfxBus = gains.sfx
  if (!sfxBus) return
  const now = context.currentTime
  const source = context.createBufferSource()
  source.buffer = footstepNoise
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = onRoad ? 390 : 610
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(onRoad ? 0.2 : 0.17, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055)
  source.connect(filter).connect(gain).connect(sfxBus)
  source.start(now)
  source.stop(now + 0.06)
}

const uiClick = (accent = 1): void => {
  if (!context || context.state !== 'running' || muted) return
  const uiBus = gains.ui
  if (!uiBus) return
  const now = context.currentTime
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(410 * accent, now)
  osc.frequency.exponentialRampToValueAtTime(620 * accent, now + 0.045)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.1, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)
  osc.connect(gain).connect(uiBus)
  osc.start(now)
  osc.stop(now + 0.1)
}

const startVehicleEmitter = (audio: AudioContext): void => {
  const bus = gains.vehicles
  if (!bus) return
  const osc = audio.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = 72
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 185
  filter.Q.value = 0.55
  const gain = audio.createGain()
  gain.gain.value = 0.035
  const panner = audio.createPanner()
  panner.panningModel = 'HRTF'
  panner.distanceModel = 'inverse'
  panner.refDistance = 2.2
  panner.maxDistance = 48
  panner.rolloffFactor = 1.25
  osc.connect(filter).connect(gain).connect(panner).connect(bus)
  osc.start()
  vehiclePanner = panner
}

const updateSpatialAudio = (): void => {
  if (!context || !vehiclePanner) return
  const now = performance.now()
  if (now - lastSpatialUpdateAt < 66) return
  lastSpatialUpdateAt = now

  const scene = EngineStore.LastCreatedScene
  const camera = scene?.activeCamera
  const car = scene?.getTransformNodeByName('car-1')
  if (!scene || !camera || !car) return

  const cp = camera.position
  const carPos = car.getAbsolutePosition()
  const listener = context.listener
  listener.positionX.value = cp.x
  listener.positionY.value = cp.y
  listener.positionZ.value = cp.z
  vehiclePanner.positionX.value = carPos.x
  vehiclePanner.positionY.value = carPos.y
  vehiclePanner.positionZ.value = carPos.z
}

const updateFootsteps = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!hero || !context || context.state !== 'running') return

  const x = hero.position.x
  const z = hero.position.z
  if (lastHeroX === null || lastHeroZ === null) {
    lastHeroX = x
    lastHeroZ = z
    return
  }

  const dx = x - lastHeroX
  const dz = z - lastHeroZ
  lastHeroX = x
  lastHeroZ = z
  const movedSq = dx * dx + dz * dz
  const now = performance.now()
  if (movedSq > 0.000064 && now - lastStepAt > 385) {
    lastStepAt = now
    const onRoad = Math.abs(z) < 6 || (x > 2 && x < 14)
    footstep(onRoad)
  }
}

const createAudioToggle = (): void => {
  if (document.querySelector('#dropi-audio-toggle')) return
  const button = document.createElement('button')
  button.id = 'dropi-audio-toggle'
  button.type = 'button'
  button.textContent = 'AUDIO ON'
  button.setAttribute('aria-label', 'Toggle DROPi immersive audio')
  Object.assign(button.style, {
    position: 'fixed',
    right: '12px',
    bottom: '38px',
    zIndex: '30',
    minWidth: '76px',
    height: '30px',
    borderRadius: '9px',
    border: '1px solid rgba(255,255,255,.22)',
    background: 'rgba(5,18,28,.78)',
    color: '#e8f3f6',
    font: '800 9px/1 system-ui',
    letterSpacing: '.05em',
  } satisfies Partial<CSSStyleDeclaration>)

  button.addEventListener('pointerdown', event => {
    event.preventDefault()
    void ensureStarted().then(() => {
      muted = !muted
      const master = gains.master
      if (master && context) applyMasterMix(0.035)
      button.textContent = muted ? 'AUDIO OFF' : 'AUDIO ON'
      if (!muted) uiClick(1.05)
      updateDebug()
    })
  })
  document.body.append(button)
}

const ensureStarted = async (): Promise<void> => {
  if (!context) {
    context = new AudioContext({ latencyHint: 'interactive' })
    footstepNoise = createNoiseBuffer(context, 0.07)
    createBusGraph(context)
    applyMasterMix(0.02)
    startCityAmbience(context)
    startVehicleEmitter(context)
    scheduleBirds()
    started = true
    updateDebug()

    const scene = EngineStore.LastCreatedScene
    scene?.onBeforeRenderObservable.add(() => {
      updateFootsteps()
      updateSpatialAudio()
    })

    document.querySelector<HTMLButtonElement>('#interact')?.addEventListener('pointerdown', () => uiClick(1.18))
    document.querySelector<HTMLButtonElement>('#recenter')?.addEventListener('pointerdown', () => uiClick(0.88))
  }
  if (context.state !== 'running') await context.resume()
}

const armAudio = (): void => {
  const start = (): void => {
    void ensureStarted()
    window.removeEventListener('pointerdown', start, true)
    window.removeEventListener('keydown', start, true)
  }
  window.addEventListener('pointerdown', start, true)
  window.addEventListener('keydown', start, true)
}

const dispose = (): void => {
  if (birdTimer !== null) window.clearTimeout(birdTimer)
  birdTimer = null
  void context?.close()
  context = null
  footstepNoise = null
  started = false
  updateDebug()
}

window.addEventListener('beforeunload', dispose)
createAudioToggle()
armAudio()
updateDebug()
