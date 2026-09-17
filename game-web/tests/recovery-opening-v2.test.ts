import { describe, expect, it } from 'vitest'
import {
  BRAILA_RECOVERY_CHARACTER_BINDINGS,
  RECOVERY_AUTHORED_REFS,
  RECOVERY_BEAT_IDS,
  RECOVERY_LINE_COPY,
  buildMariaFirstReturnSequence,
  buildMariaTestOfferSequence,
  buildRecoveryPrologueSequence,
  isLegacyEmployeeFirstAuthoredRef,
  recoveryOpeningHeroCopy,
} from '../src/narrative/recoveryOpeningV2'

describe('recovery-first opening v2', () => {
  it('keeps Male and Female on the same canonical gameplay beats', () => {
    const male = buildRecoveryPrologueSequence('Male', 'Brăila')
    const female = buildRecoveryPrologueSequence('Female', 'Brăila')

    expect(male.beats.map(beat => beat.canonicalBeatRef)).toEqual(female.beats.map(beat => beat.canonicalBeatRef))
    expect(male.beats.map(beat => beat.kind)).toEqual(female.beats.map(beat => beat.kind))
    expect(male.beats[0].canonicalBeatRef).toBe(RECOVERY_BEAT_IDS.rise)
    expect(male.beats[2].canonicalBeatRef).toBe(RECOVERY_BEAT_IDS.searchWork)
    expect(male.sequenceId).not.toBe(female.sequenceId)
  })

  it('changes only parent presentation language in the rise monologue', () => {
    const male = recoveryOpeningHeroCopy('Male')
    const female = recoveryOpeningHeroCopy('Female')

    expect(male.parentNoun).toBe('father')
    expect(female.parentNoun).toBe('mother')
    expect(male.parentNounRo).toBe('tată')
    expect(female.parentNounRo).toBe('mamă')
    expect(male.riseMonologue.replace('father', 'parent')).toBe(female.riseMonologue.replace('mother', 'parent'))
  })

  it('binds Brăila opening merchant to Maria without reusing Mirela identity', () => {
    expect(BRAILA_RECOVERY_CHARACTER_BINDINGS.openingMerchant).toBe('maria-ionescu')
    expect(BRAILA_RECOVERY_CHARACTER_BINDINGS.openingMerchant).not.toBe('mirela-stan')

    const sequence = buildMariaTestOfferSequence({
      localityLabel: 'Brăila',
      shopLabel: "Maria's Market",
      mariaActorId: 'actor:maria-ionescu:braila',
      merchantTestMission: {
        missionId: 'mission:recovery:braila:maria-test',
        authoredRef: RECOVERY_AUTHORED_REFS.merchantTest,
        signalTypes: ['cargo-custody-established'],
        factIds: ['fact:met:maria-ionescu'],
      },
    })

    expect(sequence.beats[1].text).toBe(RECOVERY_LINE_COPY.mariaFirstTest)
    expect(sequence.beats[1].authorityBinding?.authoredRef).toBe(RECOVERY_AUTHORED_REFS.merchantTest)
    expect(sequence.beats[1].focusRequest?.targetId).toBe('actor:maria-ionescu:braila')
  })

  it('does not promise an in-kind food reward unless authority confirms it', () => {
    const withoutFood = buildMariaFirstReturnSequence({
      shopLabel: "Maria's Market",
      mariaActorId: 'actor:maria-ionescu:braila',
      returnMission: {
        missionId: 'mission:recovery:braila:maria-return',
        authoredRef: RECOVERY_AUTHORED_REFS.firstReturn,
      },
      foodRewardAuthorityConfirmed: false,
    })
    const withFood = buildMariaFirstReturnSequence({
      shopLabel: "Maria's Market",
      mariaActorId: 'actor:maria-ionescu:braila',
      returnMission: {
        missionId: 'mission:recovery:braila:maria-return',
        authoredRef: RECOVERY_AUTHORED_REFS.firstReturn,
      },
      foodRewardAuthorityConfirmed: true,
    })

    expect(withoutFood.beats[0].text).not.toContain('Take these')
    expect(withFood.beats[0].text).toBe(RECOVERY_LINE_COPY.mariaFirstReturn)
  })

  it('keeps legacy employee-first authored refs reserved instead of reinterpreting them', () => {
    expect(isLegacyEmployeeFirstAuthoredRef('story:braila:first-day:one-small-thing')).toBe(true)
    expect(isLegacyEmployeeFirstAuthoredRef(RECOVERY_AUTHORED_REFS.merchantTest)).toBe(false)
  })
})
