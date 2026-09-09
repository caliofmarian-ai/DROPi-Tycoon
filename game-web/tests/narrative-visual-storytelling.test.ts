import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  BRAILA_FIRST_HOUR_AUTHORED_REFS,
  BRAILA_FIRST_HOUR_FACT_IDS,
  BRAILA_FIRST_HOUR_MISSION_IDS,
  BRAILA_FIRST_HOUR_SIGNALS,
} from '../src/missions/brailaFirstHourAuthoredRegistry'
import {
  ENVIRONMENTAL_STORY_PRESENTATION_RULES,
  FIRST_DELIVERY_CONSEQUENCE_SEQUENCE,
  FIRST_HOUR_VISUAL_STORY_MAP,
  FIRST_SHIFT_OPENING_SEQUENCE,
  NARRATIVE_CHARACTER_VISUALS,
  NARRATIVE_PRESENTATION_VERSION,
  NARRATIVE_RUNTIME_ASSET_REFERENCES,
  type NarrativePresentationSequence,
} from '../src/narrative/visualStorytelling'
import {
  NarrativePresentationSession,
  narrativeDialogueLayout,
} from '../src/ui/NarrativePresentation'
import { SUPPORTED_ANDROID_VIEWPORTS, viewportEdgeInset } from '../src/ui/mobileViewport'
import { TOUCH_TARGET_MIN_PX } from '../src/ui/theme'

const source = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8')

const rectInside = (
  rect: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
): boolean => rect.left >= 0 && rect.top >= 0 && rect.left + rect.width <= width && rect.top + rect.height <= height

const sequence = (id: string): NarrativePresentationSequence => ({
  version: NARRATIVE_PRESENTATION_VERSION,
  sequenceId: id,
  beats: [
    {
      beatId: 'first',
      kind: 'dialogue',
      characterId: 'ana-stoica',
      text: 'First beat.',
      dismissible: true,
    },
    {
      beatId: 'second',
      kind: 'opportunity',
      text: 'Second beat.',
      dismissible: true,
    },
  ],
})

describe('issue #554 visual storytelling presentation', () => {
  it.each(SUPPORTED_ANDROID_VIEWPORTS)(
    'keeps dialogue chrome within Android safe geometry at $width x $height',
    ({ width, height }) => {
      const layout = narrativeDialogueLayout(width, height)
      const edge = viewportEdgeInset(width, height)

      expect(rectInside(layout.panel, width, height)).toBe(true)
      expect(rectInside(layout.portrait, width, height)).toBe(true)
      expect(rectInside(layout.text, width, height)).toBe(true)
      expect(rectInside(layout.action, width, height)).toBe(true)
      expect(layout.action.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
      expect(layout.panel.left).toBeGreaterThanOrEqual(edge - 1)
      expect(layout.panel.top).toBeGreaterThanOrEqual(edge - 1)

      if (width > height && height <= 440) {
        expect(layout.compactLandscape).toBe(true)
        expect(layout.panel.top + layout.panel.height).toBeLessThanOrEqual(height - 72)
      }
    },
  )

  it.each(SUPPORTED_ANDROID_VIEWPORTS)(
    'lays out up to three deterministic choice targets at $width x $height',
    ({ width, height }) => {
      const layout = narrativeDialogueLayout(width, height, 3)
      expect(layout.choices).toHaveLength(3)
      for (const choice of layout.choices) {
        expect(rectInside(choice, width, height)).toBe(true)
        expect(choice.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
        expect(choice.width).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
      }
    },
  )

  it('completes a sequence exactly once and refuses duplicate completion', () => {
    const session = new NarrativePresentationSession()
    const story = sequence('test:exactly-once')

    const started = session.start(story)
    expect(started.changed).toBe(true)
    expect(started.enteredBeat?.beatId).toBe('first')
    expect(session.continue().enteredBeat?.beatId).toBe('second')

    const completed = session.continue()
    expect(completed.completed).toBe(true)
    expect(session.isOpen()).toBe(false)
    expect(session.continue().changed).toBe(false)
    expect(session.start(story).changed).toBe(false)
  })

  it('makes player choice results deterministic and non-repeatable', () => {
    const session = new NarrativePresentationSession()
    const story: NarrativePresentationSequence = {
      version: NARRATIVE_PRESENTATION_VERSION,
      sequenceId: 'test:choice',
      beats: [{
        beatId: 'choice',
        kind: 'dialogue',
        characterId: 'radu-marin',
        text: 'Which route do you take?',
        choices: [
          { choiceId: 'careful', label: 'Check the route', resultRef: 'result:careful' },
          { choiceId: 'fast', label: 'Take the familiar street', resultRef: 'result:fast' },
        ],
      }],
    }

    expect(session.start(story).changed).toBe(true)
    expect(session.continue().changed).toBe(false)
    const chosen = session.choose('careful')
    expect(chosen.choice).toEqual({ choiceId: 'careful', label: 'Check the route', resultRef: 'result:careful' })
    expect(chosen.completed).toBe(true)
    expect(session.choose('careful').changed).toBe(false)
    expect(session.choose('fast').changed).toBe(false)
  })

  it('does not mutate a captured game context while presentation state advances', () => {
    const context = {
      player: { x: 411, y: 263 },
      camera: { scrollX: 120, scrollY: 80, zoom: 1.15 },
      mission: { orderId: 'order-1', status: 'PickedUp' },
      cargo: { parcelIds: ['parcel-1'] },
    }
    const before = JSON.stringify(context)
    const session = new NarrativePresentationSession()

    session.start(sequence('test:context'))
    session.continue()
    session.continue()

    expect(JSON.stringify(context)).toBe(before)
  })

  it('supports safe Back dismissal without turning non-dismissible beats into completion', () => {
    const session = new NarrativePresentationSession()
    const locked: NarrativePresentationSequence = {
      version: NARRATIVE_PRESENTATION_VERSION,
      sequenceId: 'test:locked-back',
      beats: [{ beatId: 'locked', kind: 'dialogue', text: 'Required beat.', dismissible: false }],
    }
    expect(session.start(locked).changed).toBe(true)
    expect(session.dismiss()).toEqual({ changed: false, completed: false, dismissed: false })
    expect(session.isOpen()).toBe(true)
    expect(session.continue().completed).toBe(true)

    const dismissible = sequence('test:dismissible-back')
    expect(session.start(dismissible).changed).toBe(true)
    const dismissed = session.dismiss()
    expect(dismissed.dismissed).toBe(true)
    expect(dismissed.completed).toBe(false)
    expect(session.isOpen()).toBe(false)
  })

  it('keeps all recurring roles visually distinct without promoting candidate portraits', () => {
    const visuals = Object.values(NARRATIVE_CHARACTER_VISUALS)
    const roles = visuals.map(visual => visual.role)
    expect(roles).toContain('Dispatcher / Mentor')
    expect(roles).toContain('Coworker / Friendly Competitor')
    expect(roles).toContain('Merchant / Business Customer')
    expect(roles).toContain('Household Customer')
    expect(roles).toContain('Trainer / Instructor')
    expect(roles).toContain('Producer / Business Owner')
    expect(roles).toContain('Competitor / Rival Professional')
    expect(new Set(visuals.map(visual => `${visual.clothingFill}:${visual.equipment}:${visual.badge}`)).size).toBe(visuals.length)
    expect(visuals.every(visual => visual.portrait.kind === 'procedural-identity')).toBe(true)
  })

  it('binds visible beats to merged story canon and authored Mission Framework authority', () => {
    const [chapter, ana, radu] = FIRST_SHIFT_OPENING_SEQUENCE.beats
    const [consequence, opportunity] = FIRST_DELIVERY_CONSEQUENCE_SEQUENCE.beats

    expect(chapter.canonicalBeatRef).toBe('beat:braila:first-day:a-place-to-start')
    expect(chapter.canonicalLineRef).toBe('line:prologue:first-shift-card')
    expect(chapter.authorityBinding).toEqual({
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart,
      authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.placeToStart,
      signalTypes: [BRAILA_FIRST_HOUR_SIGNALS.reportedForWork],
      factIds: [BRAILA_FIRST_HOUR_FACT_IDS.metAna],
    })

    expect(ana.canonicalBeatRef).toBe('beat:braila:first-day:the-first-standard')
    expect(ana.canonicalLineRef).toBe('line:ana:first-standard')
    expect(ana.authorityBinding?.missionId).toBe(BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard)
    expect(ana.authorityBinding?.signalTypes).toEqual([BRAILA_FIRST_HOUR_SIGNALS.firstStandardAcknowledged])

    expect(radu.canonicalBeatRef).toBe('beat:braila:first-day:the-first-standard')
    expect(radu.canonicalLineRef).toBe('line:radu:first-meeting')
    expect(radu.authorityBinding?.factIds).toEqual([BRAILA_FIRST_HOUR_FACT_IDS.metRadu])
    expect(radu.objectiveTransition?.transitionRef).toBe(BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing)

    expect(consequence.canonicalBeatRef).toBe('beat:braila:first-day:first-consequence')
    expect(consequence.canonicalLineRef).toBe('line:ana:first-consequence-clean')
    expect(consequence.authorityBinding).toEqual({
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence,
      authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence,
      signalTypes: [BRAILA_FIRST_HOUR_SIGNALS.firstConsequencePresented],
      factIds: [BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean],
    })

    expect(opportunity.canonicalBeatRef).toBe('beat:braila:first-day:tomorrow-has-more-than-one-direction')
    expect(opportunity.authorityBinding?.missionId).toBe(BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow)
    expect(opportunity.objectiveTransition?.transitionRef).toBe(BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow)
  })

  it('maps the first hour to current authoritative mission signals and refuses to fake unavailable systems', () => {
    expect(FIRST_HOUR_VISUAL_STORY_MAP.map(beat => beat.id)).toEqual([
      'opening-story-moment',
      'first-merchant-relationship',
      'first-household-relationship',
      'first-complication',
      'first-mission-consequence',
      'producer-and-training-horizon',
    ])
    expect(FIRST_HOUR_VISUAL_STORY_MAP.slice(0, 5).every(beat => beat.activation === 'mission-signal-required')).toBe(true)
    expect(FIRST_HOUR_VISUAL_STORY_MAP.every(beat => beat.authorityBindings.length > 0)).toBe(true)
    expect(FIRST_HOUR_VISUAL_STORY_MAP.find(beat => beat.id === 'first-complication')?.authorityBindings[0]?.signalTypes)
      .toContain(BRAILA_FIRST_HOUR_SIGNALS.capacityOutcomeConfirmed)
    expect(FIRST_HOUR_VISUAL_STORY_MAP.find(beat => beat.id === 'producer-and-training-horizon')?.activation)
      .toBe('authoritative-state-required')
    expect(ENVIRONMENTAL_STORY_PRESENTATION_RULES.every(rule => rule.forbiddenShortcut.startsWith('Do not'))).toBe(true)
  })

  it('references only existing runtime assets and no candidate board crop', () => {
    for (const runtimePath of NARRATIVE_RUNTIME_ASSET_REFERENCES) {
      expect(runtimePath).not.toContain('Candidate')
      expect(runtimePath).not.toContain('Approved_References')
      expect(existsSync(new URL(`../public${runtimePath}`, import.meta.url))).toBe(true)
    }
  })

  it('blocks world input through the safe GameWorld modal path and cleans up the overlay', () => {
    const worldSource = source('../src/scenes/GameWorldScene.ts')
    const narrativeSource = source('../src/ui/NarrativePresentation.ts')

    expect(worldSource).toContain('new NarrativePresentationOverlay(this, this.fixedUiLayer)')
    expect(worldSource).toContain('this.narrative?.isOpen() ?? false')
    expect(worldSource).toContain('this.hud.isMenuOpen() || this.zoomGesture.isPinching() ? { x: 0, y: 0 }')
    expect(worldSource).toContain('(this.narrative?.isOpen() ?? false) ? { x: 0, y: 0 }')
    expect(worldSource).toContain('if (this.isModalOpen()) return')
    expect(worldSource).toContain('if (!this.narrative.handleBack()) this.hud.toggleMenu()')
    expect(worldSource).toContain('this.narrative.destroy()')
    expect(narrativeSource).toContain('this.destroyBeatObjects()')
    expect(narrativeSource).toContain('this.root.destroy(true)')
  })

  it('does not auto-fire narrative from screen-open or economy heuristics', () => {
    const worldSource = source('../src/scenes/GameWorldScene.ts')

    expect(worldSource).not.toContain('FIRST_SHIFT_OPENING_SEQUENCE')
    expect(worldSource).not.toContain('FIRST_DELIVERY_CONSEQUENCE_SEQUENCE')
    expect(worldSource).not.toContain('OPENING_NARRATIVE_SEEN')
    expect(worldSource).not.toContain('presentOpeningNarrative')
    expect(worldSource).not.toContain('this.narrative.present(')
    expect(worldSource).not.toContain('firstSettledDelivery')
  })

  it('keeps narrative presentation outside mission/economy authority and never restarts a scene', () => {
    const narrativeSource = source('../src/ui/NarrativePresentation.ts')
    const contractSource = source('../src/narrative/visualStorytelling.ts')

    expect(narrativeSource).not.toContain('performUrbanInteraction(')
    expect(narrativeSource).not.toContain('settleDeliveryOutcome(')
    expect(narrativeSource).not.toContain('createNextOrder(')
    expect(narrativeSource).not.toContain('scene.start(')
    expect(narrativeSource).not.toContain('scene.restart(')
    expect(narrativeSource).not.toContain('company.money')
    expect(narrativeSource).not.toContain('carryingPackage')
    expect(contractSource).not.toContain('applyMissionEvent(')
    expect(contractSource).not.toContain('startMission(')
  })
})
