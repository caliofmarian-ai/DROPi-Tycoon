import type Phaser from 'phaser'
import {
  NARRATIVE_CHARACTER_VISUALS,
  type NarrativeCameraFocusRequest,
  type NarrativeCharacterVisual,
  type NarrativeChoice,
  type NarrativeObjectiveTransition,
  type NarrativePresentationBeat,
  type NarrativePresentationSequence,
} from '../narrative/visualStorytelling'
import { MIN_TOUCH_TARGET_PX, normalizeViewport, viewportEdgeInset } from './mobileViewport'
import { COLORS, RADII, TYPOGRAPHY } from './theme'

export interface NarrativeLayoutRect {
  left: number
  top: number
  width: number
  height: number
}

export interface NarrativeDialogueLayout {
  compactLandscape: boolean
  panel: NarrativeLayoutRect
  portrait: NarrativeLayoutRect
  text: NarrativeLayoutRect
  roleLine: NarrativeLayoutRect
  action: NarrativeLayoutRect
  choices: readonly NarrativeLayoutRect[]
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const choiceRects = (
  panel: NarrativeLayoutRect,
  count: number,
  compactLandscape: boolean,
  edge: number,
): NarrativeLayoutRect[] => {
  const safeCount = clamp(Math.floor(count), 0, 3)
  if (safeCount === 0) return []
  const gap = 8
  const buttonHeight = MIN_TOUCH_TARGET_PX
  const availableWidth = panel.width - edge * 2
  if (compactLandscape || panel.width >= 620) {
    const width = Math.max(MIN_TOUCH_TARGET_PX, (availableWidth - gap * (safeCount - 1)) / safeCount)
    return Array.from({ length: safeCount }, (_, index) => ({
      left: panel.left + edge + index * (width + gap),
      top: panel.top + panel.height - edge - buttonHeight,
      width,
      height: buttonHeight,
    }))
  }
  return Array.from({ length: safeCount }, (_, index) => ({
    left: panel.left + edge,
    top: panel.top + panel.height - edge - (safeCount - index) * buttonHeight - (safeCount - index - 1) * gap,
    width: availableWidth,
    height: buttonHeight,
  }))
}

/**
 * Pure geometry for the narrative overlay. Compact Android landscape keeps the
 * dialogue above the permanent thumb-control band instead of covering the joystick/action stack.
 */
export const narrativeDialogueLayout = (
  width: number,
  height: number,
  choiceCount = 0,
): NarrativeDialogueLayout => {
  const viewport = normalizeViewport(width, height)
  const compactLandscape = viewport.width > viewport.height && viewport.height <= 440
  const edge = viewportEdgeInset(viewport.width, viewport.height)
  const portraitMode = viewport.width < viewport.height

  if (compactLandscape) {
    const reservedThumbBand = 124
    const panelTop = Math.max(edge + 46, 50)
    const panelBottom = Math.max(panelTop + 150, viewport.height - reservedThumbBand)
    const panelHeight = Math.max(150, panelBottom - panelTop)
    const sideReserve = clamp(Math.round(viewport.width * 0.12), 70, 112)
    const panel: NarrativeLayoutRect = {
      left: sideReserve,
      top: panelTop,
      width: Math.max(360, viewport.width - sideReserve * 2),
      height: panelHeight,
    }
    const portraitSize = clamp(panel.height - 36, 88, 116)
    const portrait: NarrativeLayoutRect = {
      left: panel.left + 16,
      top: panel.top + 18,
      width: portraitSize,
      height: portraitSize,
    }
    const textLeft = portrait.left + portrait.width + 16
    const actionHeight = MIN_TOUCH_TARGET_PX
    const hasChoices = choiceCount > 0
    const textBottomReserve = hasChoices ? actionHeight + 18 : actionHeight + 12
    const text: NarrativeLayoutRect = {
      left: textLeft,
      top: panel.top + 47,
      width: Math.max(150, panel.left + panel.width - 16 - textLeft),
      height: Math.max(48, panel.height - 58 - textBottomReserve),
    }
    const action: NarrativeLayoutRect = {
      left: panel.left + panel.width - 152,
      top: panel.top + panel.height - 12 - actionHeight,
      width: 136,
      height: actionHeight,
    }
    return {
      compactLandscape,
      panel,
      portrait,
      text,
      roleLine: { left: textLeft, top: panel.top + 17, width: text.width, height: 24 },
      action,
      choices: choiceRects(panel, choiceCount, true, 12),
    }
  }

  const panelWidth = Math.min(760, viewport.width - edge * 2)
  const actionHeight = MIN_TOUCH_TARGET_PX
  const stackedChoiceHeight = choiceCount > 0 && portraitMode
    ? clamp(choiceCount, 1, 3) * actionHeight + (clamp(choiceCount, 1, 3) - 1) * 8 + 16
    : actionHeight + 16
  const panelHeight = portraitMode
    ? Math.min(390, Math.max(286, viewport.height * 0.46))
    : Math.min(260, Math.max(210, viewport.height * 0.33))
  const panel: NarrativeLayoutRect = {
    left: (viewport.width - panelWidth) / 2,
    top: viewport.height - edge - panelHeight,
    width: panelWidth,
    height: panelHeight,
  }
  const portraitSize = portraitMode ? 90 : 108
  const portrait: NarrativeLayoutRect = {
    left: panel.left + 18,
    top: panel.top + 18,
    width: portraitSize,
    height: portraitSize,
  }
  const textLeft = portrait.left + portrait.width + 18
  const text: NarrativeLayoutRect = {
    left: textLeft,
    top: panel.top + 52,
    width: Math.max(150, panel.left + panel.width - 18 - textLeft),
    height: Math.max(64, panel.height - 66 - stackedChoiceHeight),
  }
  const action: NarrativeLayoutRect = {
    left: panel.left + panel.width - 170,
    top: panel.top + panel.height - 14 - actionHeight,
    width: 152,
    height: actionHeight,
  }
  return {
    compactLandscape,
    panel,
    portrait,
    text,
    roleLine: { left: textLeft, top: panel.top + 18, width: text.width, height: 28 },
    action,
    choices: choiceRects(panel, choiceCount, false, 14),
  }
}

export interface NarrativeAdvanceResult {
  changed: boolean
  completed: boolean
  dismissed: boolean
  enteredBeat?: NarrativePresentationBeat
  choice?: NarrativeChoice
}

/**
 * Deterministic presentation-only state. It never owns mission, cargo, economy or world truth.
 * Sequence completion and choice callbacks are exactly-once for the lifetime of this session.
 */
export class NarrativePresentationSession {
  private active?: NarrativePresentationSequence
  private beatIndex = 0
  private readonly finishedSequenceIds = new Set<string>()
  private readonly selectedChoiceIds = new Set<string>()

  current(): NarrativePresentationBeat | undefined { return this.active?.beats[this.beatIndex] }
  isOpen(): boolean { return Boolean(this.active && this.current()) }
  activeSequenceId(): string | undefined { return this.active?.sequenceId }

  start(sequence: NarrativePresentationSequence): NarrativeAdvanceResult {
    if (sequence.beats.length === 0 || this.isOpen() || this.finishedSequenceIds.has(sequence.sequenceId)) {
      return { changed: false, completed: false, dismissed: false }
    }
    this.active = sequence
    this.beatIndex = 0
    return { changed: true, completed: false, dismissed: false, enteredBeat: this.current() }
  }

  continue(): NarrativeAdvanceResult {
    const current = this.current()
    if (!this.active || !current || (current.choices?.length ?? 0) > 0) {
      return { changed: false, completed: false, dismissed: false }
    }
    return this.advanceFromCurrent()
  }

  choose(choiceId: string): NarrativeAdvanceResult {
    const current = this.current()
    const choice = current?.choices?.find(candidate => candidate.choiceId === choiceId)
    if (!this.active || !current || !choice || this.selectedChoiceIds.has(choice.choiceId)) {
      return { changed: false, completed: false, dismissed: false }
    }
    this.selectedChoiceIds.add(choice.choiceId)
    const result = this.advanceFromCurrent()
    return { ...result, choice }
  }

  dismiss(): NarrativeAdvanceResult {
    const current = this.current()
    if (!this.active || !current || current.dismissible === false) {
      return { changed: false, completed: false, dismissed: false }
    }
    this.finishedSequenceIds.add(this.active.sequenceId)
    this.active = undefined
    this.beatIndex = 0
    return { changed: true, completed: false, dismissed: true }
  }

  private advanceFromCurrent(): NarrativeAdvanceResult {
    if (!this.active) return { changed: false, completed: false, dismissed: false }
    if (this.beatIndex + 1 < this.active.beats.length) {
      this.beatIndex += 1
      return { changed: true, completed: false, dismissed: false, enteredBeat: this.current() }
    }
    this.finishedSequenceIds.add(this.active.sequenceId)
    this.active = undefined
    this.beatIndex = 0
    return { changed: true, completed: true, dismissed: false }
  }
}

export interface NarrativePresentationCallbacks {
  onComplete?: (sequenceId: string) => void
  onDismiss?: (sequenceId: string) => void
  onChoice?: (choice: NarrativeChoice) => void
  onFocusRequest?: (request: NarrativeCameraFocusRequest) => void
  onObjectiveTransition?: (transition: NarrativeObjectiveTransition) => void
}

const silhouetteWidth = (visual: NarrativeCharacterVisual, width: number): number => {
  switch (visual.silhouette) {
    case 'slim': return width * 0.46
    case 'broad': return width * 0.70
    case 'compact': return width * 0.55
    default: return width * 0.60
  }
}

/**
 * Premium, bounded Phaser overlay. It is intentionally not a scene: world/camera/cargo state
 * remains where it was, while GameWorld blocks incompatible input for the duration.
 */
export class NarrativePresentationOverlay {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly session = new NarrativePresentationSession()
  private beatObjects: Phaser.GameObjects.GameObject[] = []
  private callbacks: NarrativePresentationCallbacks = {}
  private completionSequenceId?: string

  constructor(scene: Phaser.Scene, layer: Phaser.GameObjects.Layer) {
    this.scene = scene
    this.root = scene.add.container(0, 0).setVisible(false)
    layer.add(this.root)
    const backdrop = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      scene.scale.width,
      scene.scale.height,
      0x020914,
      0.34,
    ).setInteractive({ useHandCursor: false })
    this.root.add(backdrop)
  }

  present(sequence: NarrativePresentationSequence, callbacks: NarrativePresentationCallbacks = {}): boolean {
    const result = this.session.start(sequence)
    if (!result.changed) return false
    this.callbacks = callbacks
    this.completionSequenceId = sequence.sequenceId
    this.root.setVisible(true)
    this.renderCurrent()
    if (result.enteredBeat) this.emitBeatRequests(result.enteredBeat)
    return true
  }

  isOpen(): boolean { return this.session.isOpen() && this.root.visible }

  /** Android Back / Escape consumes the modal. Non-dismissible authored beats consume Back without closing. */
  handleBack(): boolean {
    if (!this.isOpen()) return false
    const sequenceId = this.session.activeSequenceId()
    const result = this.session.dismiss()
    if (result.dismissed && sequenceId) {
      this.hideAndClear()
      this.callbacks.onDismiss?.(sequenceId)
      this.callbacks = {}
      this.completionSequenceId = undefined
    }
    return true
  }

  destroy(): void {
    this.destroyBeatObjects()
    this.root.destroy(true)
    this.callbacks = {}
    this.completionSequenceId = undefined
  }

  private continueCurrent = (): void => {
    const result = this.session.continue()
    this.applyAdvanceResult(result)
  }

  private chooseCurrent = (choiceId: string): void => {
    const result = this.session.choose(choiceId)
    if (result.choice) this.callbacks.onChoice?.(result.choice)
    this.applyAdvanceResult(result)
  }

  private applyAdvanceResult(result: NarrativeAdvanceResult): void {
    if (!result.changed) return
    if (result.completed) {
      const sequenceId = this.completionSequenceId
      this.hideAndClear()
      if (sequenceId) this.callbacks.onComplete?.(sequenceId)
      this.callbacks = {}
      this.completionSequenceId = undefined
      return
    }
    this.renderCurrent()
    if (result.enteredBeat) this.emitBeatRequests(result.enteredBeat)
  }

  private emitBeatRequests(beat: NarrativePresentationBeat): void {
    if (beat.focusRequest) this.callbacks.onFocusRequest?.(beat.focusRequest)
    if (beat.objectiveTransition) this.callbacks.onObjectiveTransition?.(beat.objectiveTransition)
  }

  private hideAndClear(): void {
    this.root.setVisible(false)
    this.destroyBeatObjects()
  }

  private destroyBeatObjects(): void {
    this.beatObjects.forEach(object => object.destroy())
    this.beatObjects = []
  }

  private addBeatObject<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.root.add(object)
    this.beatObjects.push(object)
    return object
  }

  private renderCurrent(): void {
    const beat = this.session.current()
    if (!beat) return
    this.destroyBeatObjects()
    const choices = beat.choices?.slice(0, 3) ?? []
    const layout = narrativeDialogueLayout(this.scene.scale.width, this.scene.scale.height, choices.length)
    const panel = this.addBeatObject(this.scene.add.graphics())
    panel.fillStyle(0x020b16, 0.97)
      .fillRoundedRect(layout.panel.left - 4, layout.panel.top - 4, layout.panel.width + 8, layout.panel.height + 8, RADII.panel + 2)
    panel.lineStyle(2, beat.kind === 'outcome' ? COLORS.gold : COLORS.accent, 0.92)
      .strokeRoundedRect(layout.panel.left - 4, layout.panel.top - 4, layout.panel.width + 8, layout.panel.height + 8, RADII.panel + 2)
    panel.fillStyle(COLORS.surface, 0.98)
      .fillRoundedRect(layout.panel.left, layout.panel.top, layout.panel.width, layout.panel.height, RADII.panel)

    if (beat.kind === 'chapter' || beat.kind === 'opportunity') this.renderChapterBeat(beat, layout)
    else this.renderDialogueBeat(beat, layout)

    if (choices.length > 0) {
      choices.forEach((choice, index) => this.renderButton(layout.choices[index], choice.label, () => this.chooseCurrent(choice.choiceId), index === 0))
    } else {
      this.renderButton(layout.action, beat.continueLabel ?? 'Continue', this.continueCurrent, true)
    }
  }

  private renderChapterBeat(beat: NarrativePresentationBeat, layout: NarrativeDialogueLayout): void {
    const centerX = layout.panel.left + layout.panel.width / 2
    const top = layout.panel.top + 24
    this.addBeatObject(this.scene.add.text(centerX, top, beat.chapterLabel ?? 'STORY', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: layout.compactLandscape ? '18px' : '22px',
      color: COLORS.textGold,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0))
    this.addBeatObject(this.scene.add.text(centerX, top + 34, beat.contextLabel ?? '', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '11px',
      color: COLORS.textMuted,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0))
    const bodyWidth = Math.max(220, layout.panel.width - 76)
    this.addBeatObject(this.scene.add.text(centerX, top + 62, beat.text, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: layout.compactLandscape ? '13px' : '15px',
      color: COLORS.textPrimary,
      align: 'center',
      lineSpacing: 5,
      wordWrap: { width: bodyWidth },
    }).setOrigin(0.5, 0))
  }

  private renderDialogueBeat(beat: NarrativePresentationBeat, layout: NarrativeDialogueLayout): void {
    const visual = beat.characterId ? NARRATIVE_CHARACTER_VISUALS[beat.characterId] : undefined
    if (visual) this.renderIdentityPortrait(visual, layout.portrait)
    const name = visual?.displayName ?? 'Story'
    const role = visual?.role ?? beat.contextLabel ?? ''
    this.addBeatObject(this.scene.add.text(layout.roleLine.left, layout.roleLine.top, name, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: layout.compactLandscape ? '15px' : '17px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
    }))
    this.addBeatObject(this.scene.add.text(layout.roleLine.left, layout.roleLine.top + 21, role, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '10px',
      color: COLORS.textGold,
      fontStyle: 'bold',
      wordWrap: { width: layout.roleLine.width },
    }))
    if (beat.contextLabel) {
      this.addBeatObject(this.scene.add.text(layout.roleLine.left, layout.roleLine.top + 37, beat.contextLabel, {
        fontFamily: TYPOGRAPHY.family,
        fontSize: '9px',
        color: COLORS.textMuted,
        wordWrap: { width: layout.roleLine.width },
      }))
    }
    this.addBeatObject(this.scene.add.text(layout.text.left, layout.text.top + 10, beat.text, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: layout.compactLandscape ? '12px' : '14px',
      color: COLORS.textPrimary,
      lineSpacing: 5,
      wordWrap: { width: layout.text.width },
    }))
  }

  private renderIdentityPortrait(visual: NarrativeCharacterVisual, rect: NarrativeLayoutRect): void {
    const g = this.addBeatObject(this.scene.add.graphics())
    g.fillStyle(0x061f35, 1).fillRoundedRect(rect.left, rect.top, rect.width, rect.height, 14)
    g.lineStyle(2, visual.accentFill, 0.92).strokeRoundedRect(rect.left, rect.top, rect.width, rect.height, 14)
    const cx = rect.left + rect.width / 2
    const headY = rect.top + rect.height * 0.36
    const headRadius = rect.width * 0.19
    g.fillStyle(visual.skinFill, 1).fillCircle(cx, headY, headRadius)

    g.fillStyle(0x2a2422, 1)
    if (visual.hair === 'bob' || visual.hair === 'wave') {
      g.fillEllipse(cx, headY - headRadius * 0.55, headRadius * 2.25, headRadius * 1.25)
      g.fillRect(cx - headRadius * 1.05, headY - headRadius * 0.35, headRadius * 0.35, headRadius * 1.35)
      if (visual.hair === 'wave') g.fillCircle(cx + headRadius * 0.9, headY, headRadius * 0.38)
    } else if (visual.hair === 'silver') {
      g.fillStyle(0xbfc5cf, 1).fillEllipse(cx, headY - headRadius * 0.55, headRadius * 2.05, headRadius * 0.85)
    } else if (visual.hair === 'tied') {
      g.fillEllipse(cx, headY - headRadius * 0.62, headRadius * 2, headRadius * 0.8)
      g.fillCircle(cx + headRadius * 1.06, headY - headRadius * 0.25, headRadius * 0.35)
    } else {
      g.fillEllipse(cx, headY - headRadius * 0.62, headRadius * 1.9, headRadius * 0.72)
      if (visual.hair === 'swept') g.fillTriangle(cx - headRadius, headY - headRadius * 0.55, cx + headRadius, headY - headRadius * 1.05, cx + headRadius * 0.45, headY - headRadius * 0.25)
    }

    const bodyWidth = silhouetteWidth(visual, rect.width)
    const bodyTop = headY + headRadius * 0.92
    const bodyHeight = rect.top + rect.height - 13 - bodyTop
    g.fillStyle(visual.clothingFill, 1).fillRoundedRect(cx - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight, 12)
    g.fillStyle(visual.accentFill, 0.96).fillRect(cx - bodyWidth / 2, bodyTop + 5, bodyWidth, 6)

    switch (visual.equipment) {
      case 'headset':
        g.lineStyle(3, visual.accentFill, 1).arc(cx, headY, headRadius * 1.18, Math.PI, Math.PI * 2, false)
        g.fillStyle(visual.accentFill, 1).fillCircle(cx + headRadius * 1.13, headY + 3, 3)
        break
      case 'courier-bag':
        g.fillStyle(0x1f2937, 1).fillRoundedRect(cx + bodyWidth * 0.2, bodyTop + bodyHeight * 0.28, bodyWidth * 0.42, bodyHeight * 0.5, 4)
        g.lineStyle(2, visual.accentFill, 0.9).lineBetween(cx - bodyWidth * 0.25, bodyTop + 4, cx + bodyWidth * 0.42, bodyTop + bodyHeight * 0.55)
        break
      case 'shop-apron':
        g.fillStyle(visual.accentFill, 0.75).fillRoundedRect(cx - bodyWidth * 0.28, bodyTop + 12, bodyWidth * 0.56, bodyHeight - 16, 6)
        break
      case 'walking-cane':
        g.lineStyle(3, visual.accentFill, 1).lineBetween(cx + bodyWidth * 0.46, bodyTop + 10, cx + bodyWidth * 0.58, rect.top + rect.height - 10)
        break
      case 'clipboard':
        g.fillStyle(0xf2d6a2, 1).fillRoundedRect(cx + bodyWidth * 0.08, bodyTop + bodyHeight * 0.28, bodyWidth * 0.36, bodyHeight * 0.45, 3)
        break
      case 'training-folder':
        g.fillStyle(visual.accentFill, 0.85).fillRoundedRect(cx - bodyWidth * 0.44, bodyTop + bodyHeight * 0.42, bodyWidth * 0.4, bodyHeight * 0.28, 3)
        break
      case 'route-case':
        g.fillStyle(0x27272a, 1).fillRoundedRect(cx + bodyWidth * 0.12, bodyTop + bodyHeight * 0.5, bodyWidth * 0.46, bodyHeight * 0.34, 4)
        g.lineStyle(2, visual.accentFill, 0.9).strokeRoundedRect(cx + bodyWidth * 0.12, bodyTop + bodyHeight * 0.5, bodyWidth * 0.46, bodyHeight * 0.34, 4)
        break
    }

    this.addBeatObject(this.scene.add.text(cx, rect.top + rect.height - 16, visual.badge, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '8px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
      backgroundColor: '#041c38',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 0.5))
  }

  private renderButton(rect: NarrativeLayoutRect | undefined, label: string, onTap: () => void, primary: boolean): void {
    if (!rect) return
    const chrome = this.addBeatObject(this.scene.add.graphics())
    chrome.fillStyle(primary ? COLORS.accentStrong : COLORS.surfaceRaised, 0.98)
      .fillRoundedRect(rect.left, rect.top, rect.width, rect.height, RADII.button)
    chrome.lineStyle(2, primary ? COLORS.gold : COLORS.accent, primary ? 0.95 : 0.72)
      .strokeRoundedRect(rect.left, rect.top, rect.width, rect.height, RADII.button)
    const hit = this.addBeatObject(this.scene.add.rectangle(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      Math.max(MIN_TOUCH_TARGET_PX, rect.width),
      Math.max(MIN_TOUCH_TARGET_PX, rect.height),
      0xffffff,
      0.001,
    ).setInteractive({ useHandCursor: true }))
    hit.on('pointerdown', onTap)
    this.addBeatObject(this.scene.add.text(rect.left + rect.width / 2, rect.top + rect.height / 2, label, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '11px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: Math.max(60, rect.width - 12) },
    }).setOrigin(0.5))
  }
}
