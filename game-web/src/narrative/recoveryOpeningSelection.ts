import {
  RECOVERY_AUTHORED_REFS,
  RECOVERY_BEAT_IDS,
  type HeroPresentationSex,
  type RecoveryPresentationAuthority,
} from './recoveryOpeningV2'
import {
  NARRATIVE_PRESENTATION_VERSION,
  type NarrativeChoice,
  type NarrativePresentationSequence,
} from './visualStorytelling'

export const RECOVERY_PRESENTATION_SELECTION_SEQUENCE_ID = 'recovery-opening:hero-presentation-selection:v1' as const

export const RECOVERY_PRESENTATION_CHOICE_RESULT_REFS: Readonly<Record<HeroPresentationSex, string>> = Object.freeze({
  Male: 'recovery-opening:presentation-sex:Male',
  Female: 'recovery-opening:presentation-sex:Female',
})

const choice = (sex: HeroPresentationSex): NarrativeChoice => ({
  choiceId: `recovery-opening:choose-${sex.toLowerCase()}`,
  label: sex,
  resultRef: RECOVERY_PRESENTATION_CHOICE_RESULT_REFS[sex],
})

export const heroPresentationSexFromChoiceResult = (resultRef: string): HeroPresentationSex | null => {
  if (resultRef === RECOVERY_PRESENTATION_CHOICE_RESULT_REFS.Male) return 'Male'
  if (resultRef === RECOVERY_PRESENTATION_CHOICE_RESULT_REFS.Female) return 'Female'
  return null
}

/**
 * Presentation-only onboarding choice. The owning runtime must project the chosen option
 * into the authoritative mission choice objective before the recovery prologue can start.
 */
export const buildRecoveryPresentationSelectionSequence = (
  localityLabel: string,
  selectionMission: RecoveryPresentationAuthority,
): NarrativePresentationSequence => {
  if (!localityLabel.trim()) throw new Error('localityLabel is required')
  if (!selectionMission.missionId.trim() || !selectionMission.authoredRef.trim()) {
    throw new Error('selectionMission authority is required')
  }

  return {
    version: NARRATIVE_PRESENTATION_VERSION,
    sequenceId: RECOVERY_PRESENTATION_SELECTION_SEQUENCE_ID,
    beats: [{
      beatId: 'recovery-v2:choose-presentation',
      kind: 'chapter',
      chapterLabel: 'NEW BEGINNING',
      contextLabel: localityLabel,
      text: 'Choose how your hero is presented. Story, opportunity, rewards and progression are identical.',
      dismissible: false,
      choices: [choice('Male'), choice('Female')],
      canonicalBeatRef: RECOVERY_BEAT_IDS.rise,
      canonicalLineRef: 'line:hero:recovery-presentation-choice',
      authorityBinding: {
        missionId: selectionMission.missionId,
        authoredRef: selectionMission.authoredRef || RECOVERY_AUTHORED_REFS.rise,
        signalTypes: selectionMission.signalTypes ?? [],
        factIds: selectionMission.factIds ?? [],
      },
    }],
  }
}
