import { describe, expect, it, beforeEach } from 'vitest'
import {
  AUDIO_CUE_TONES,
  GameAudioController,
  getAudioController,
  getCueTones,
  resetAudioControllerForTests,
  type AudioCue,
} from '../src/systems/audioSystem'

const ALL_CUES: readonly AudioCue[] = [
  'ui-tap',
  'positive',
  'negative',
  'order-accepted',
  'delivery-success',
  'delivery-failure',
  'purchase',
  'employee-hired',
]

describe('audioSystem — pure cue configuration', () => {
  it('defines a tone sequence for every required cue', () => {
    for (const cue of ALL_CUES) {
      const tones = getCueTones(cue)
      expect(tones.length).toBeGreaterThan(0)
      for (const tone of tones) {
        expect(tone.frequency).toBeGreaterThan(0)
        expect(tone.durationMs).toBeGreaterThan(0)
        expect(typeof tone.type).toBe('string')
      }
    }
  })

  it('is deterministic (same reference/data across calls)', () => {
    expect(getCueTones('purchase')).toBe(AUDIO_CUE_TONES.purchase)
    expect(getCueTones('delivery-failure')).toEqual(AUDIO_CUE_TONES['delivery-failure'])
  })
})

describe('audioSystem — GameAudioController (Node/no-WebAudio environment)', () => {
  beforeEach(() => {
    resetAudioControllerForTests()
  })

  it('is enabled by default and respects setEnabled/isEnabled', () => {
    const controller = new GameAudioController()
    expect(controller.isEnabled()).toBe(true)
    controller.setEnabled(false)
    expect(controller.isEnabled()).toBe(false)
    controller.setEnabled(true)
    expect(controller.isEnabled()).toBe(true)
  })

  it('honors an explicit initial enabled state', () => {
    const controller = new GameAudioController(false)
    expect(controller.isEnabled()).toBe(false)
  })

  it('never throws when AudioContext is unavailable (Node test environment)', () => {
    const controller = new GameAudioController()
    expect(() => controller.unlock()).not.toThrow()
    expect(() => controller.play('ui-tap')).not.toThrow()
    expect(() => controller.play('delivery-success')).not.toThrow()
  })

  it('no-ops (does not throw) when disabled, without needing WebAudio', () => {
    const controller = new GameAudioController(false)
    expect(() => controller.play('purchase')).not.toThrow()
  })

  it('shares a single process-wide controller instance via getAudioController', () => {
    const first = getAudioController()
    const second = getAudioController()
    expect(first).toBe(second)
  })

  it('resetAudioControllerForTests produces a fresh instance', () => {
    const first = getAudioController()
    resetAudioControllerForTests()
    const second = getAudioController()
    expect(first).not.toBe(second)
  })
})
