/**
 * Workstream F — baseline procedural audio system (Owner Quality Gate #317).
 *
 * No downloaded/third-party sound files: every cue is a short WebAudio tone
 * sequence generated at runtime. The module is safe to import under plain
 * Node (vitest) because it never touches `window`/`AudioContext` at module
 * scope — only lazily, inside guarded functions/methods.
 */

export type AudioCue =
  | 'ui-tap'
  | 'positive'
  | 'negative'
  | 'order-accepted'
  | 'delivery-success'
  | 'delivery-failure'
  | 'purchase'
  | 'employee-hired'

export interface CueTone {
  frequency: number
  durationMs: number
  type: OscillatorType
}

/** Centralized, replaceable cue tuning (implementation-level, not project canon). */
export const AUDIO_CUE_TONES: Readonly<Record<AudioCue, readonly CueTone[]>> = {
  'ui-tap': [{ frequency: 720, durationMs: 45, type: 'sine' }],
  positive: [
    { frequency: 660, durationMs: 90, type: 'sine' },
    { frequency: 880, durationMs: 110, type: 'sine' },
  ],
  negative: [{ frequency: 220, durationMs: 160, type: 'square' }],
  'order-accepted': [
    { frequency: 520, durationMs: 80, type: 'triangle' },
    { frequency: 660, durationMs: 100, type: 'triangle' },
  ],
  'delivery-success': [
    { frequency: 660, durationMs: 90, type: 'sine' },
    { frequency: 880, durationMs: 90, type: 'sine' },
    { frequency: 1046, durationMs: 140, type: 'sine' },
  ],
  'delivery-failure': [
    { frequency: 300, durationMs: 120, type: 'sawtooth' },
    { frequency: 220, durationMs: 160, type: 'sawtooth' },
  ],
  purchase: [
    { frequency: 494, durationMs: 70, type: 'triangle' },
    { frequency: 740, durationMs: 120, type: 'triangle' },
  ],
  'employee-hired': [
    { frequency: 587, durationMs: 90, type: 'sine' },
    { frequency: 784, durationMs: 90, type: 'sine' },
    { frequency: 988, durationMs: 130, type: 'sine' },
  ],
}

export const getCueTones = (cue: AudioCue): readonly CueTone[] => AUDIO_CUE_TONES[cue]

type BrowserAudioContextWindow = typeof globalThis & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

const getAudioContextConstructor = (): (new () => AudioContext) | null => {
  if (typeof window === 'undefined') return null
  const browserWindow = window as BrowserAudioContextWindow
  return browserWindow.AudioContext ?? browserWindow.webkitAudioContext ?? null
}

/**
 * Small WebAudio-backed cue player. Respects the sound-enabled setting and
 * browser/WebView autoplay-unlock restrictions: the underlying AudioContext
 * is only created/resumed from `unlock()`, which callers must invoke from a
 * genuine user gesture handler (e.g. a pointerdown callback).
 */
export class GameAudioController {
  private context: AudioContext | null = null
  private enabled: boolean

  constructor(initialEnabled = true) {
    this.enabled = initialEnabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /** Creates/resumes the AudioContext. Must run inside a user gesture handler. */
  unlock(): void {
    if (this.context) {
      if (this.context.state === 'suspended') {
        this.context.resume().catch(() => {
          /* Autoplay restrictions are expected in some contexts; no error spam. */
        })
      }
      return
    }

    const AudioContextCtor = getAudioContextConstructor()
    if (!AudioContextCtor) return

    try {
      this.context = new AudioContextCtor()
    } catch {
      this.context = null
    }
  }

  /** Plays a short procedural cue. Silently no-ops when disabled/unavailable. */
  play(cue: AudioCue): void {
    if (!this.enabled) return
    if (!this.context) {
      this.unlock()
    }
    const context = this.context
    if (!context) return

    try {
      let startTime = context.currentTime
      for (const tone of getCueTones(cue)) {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = tone.type
        oscillator.frequency.setValueAtTime(tone.frequency, startTime)

        const peak = 0.16
        gain.gain.setValueAtTime(0.0001, startTime)
        gain.gain.linearRampToValueAtTime(peak, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.durationMs / 1000)

        oscillator.connect(gain).connect(context.destination)
        oscillator.start(startTime)
        oscillator.stop(startTime + tone.durationMs / 1000 + 0.02)

        startTime += tone.durationMs / 1000
      }
    } catch {
      /* Never let audio failures interrupt gameplay or spam errors. */
    }
  }
}

let sharedController: GameAudioController | null = null

/** Process-wide controller instance shared by every scene. */
export const getAudioController = (): GameAudioController => {
  if (!sharedController) {
    sharedController = new GameAudioController()
  }
  return sharedController
}

/** Test-only reset so each spec starts from a clean singleton. */
export const resetAudioControllerForTests = (): void => {
  sharedController = null
}
