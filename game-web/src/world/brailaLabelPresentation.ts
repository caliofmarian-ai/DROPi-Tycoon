import type Phaser from 'phaser'
import {
  LOCALITY_PRESENTATION_BASELINE,
  isLocalityLabelVisibleAtLevel,
  localityLabelScaleCompensation,
  selectLocalityScreenLabels,
  type LocalityLabelRole,
  type LocalityScreenBox,
  type LocalityScreenLabelCandidate,
} from './localityPresentationProfile'
import { cityFitZoom, cityScaleLevel, type MapViewport, type SemanticMapLevel } from './semanticMapCamera'

/** Brăila is the premium calibration consumer, not the global presentation authority. */
export const BRAILA_PRESENTATION_PROFILE = LOCALITY_PRESENTATION_BASELINE
export type BrailaLabelRole = LocalityLabelRole
export type BrailaScreenLabelCandidate = LocalityScreenLabelCandidate

export const BRAILA_LABEL_RULES = BRAILA_PRESENTATION_PROFILE.labelRules
/** Keeps fixed-screen labels readable even at the 10x-city semantic overview zoom. */
export const BRAILA_LABEL_MAX_SCREEN_COMPENSATION = BRAILA_PRESENTATION_PROFILE.maxScreenCompensation

export interface BrailaPresentationLabel {
  text: Phaser.GameObjects.Text
  role: BrailaLabelRole
  priority?: number
}

export const isBrailaLabelVisibleAtLevel = (role: BrailaLabelRole, level: SemanticMapLevel): boolean =>
  isLocalityLabelVisibleAtLevel(BRAILA_PRESENTATION_PROFILE, role, level)

/**
 * World labels are kept out of the fixed Android HUD without coupling the map renderer to HUD objects.
 * These rectangles mirror the owner-reviewed landscape controls conservatively: header + mission,
 * minimap/zoom, joystick, action stack and attribution. Hiding a world label is preferable to drawing
 * it under a thumb target or mission panel.
 *
 * This remains a Brăila runtime adapter. Generic HUD/smartphone geometry is not authored here.
 */
export const brailaReservedScreenBoxes = (width: number, height: number): readonly LocalityScreenBox[] => {
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  const portrait = w < 600
  const headerHeight = portrait ? 72 : 44
  const mapWidth = Math.max(88, Math.min(150, Math.round(w * 0.13)))
  const minimapLeft = w - mapWidth - 12
  const minimapTop = headerHeight + 10
  const minimapHeight = mapWidth * 0.75
  const objectiveWidth = portrait
    ? Math.max(150, minimapLeft - 30)
    : Math.min(360, Math.max(220, minimapLeft - 32))
  const objectiveHeight = portrait ? 82 : 52
  const actionWidth = Math.min(150, Math.max(124, w * 0.15))

  return [
    { left: 0, top: 0, right: w, bottom: headerHeight + 2 },
    { left: 5, top: headerHeight + 2, right: 16 + objectiveWidth, bottom: headerHeight + 12 + objectiveHeight },
    { left: minimapLeft - 8, top: minimapTop - 8, right: w, bottom: Math.min(h, minimapTop + minimapHeight + 126) },
    { left: 0, top: Math.max(headerHeight, h - 152), right: 154, bottom: h },
    { left: Math.max(0, w - actionWidth - 30), top: Math.max(headerHeight, h - 132), right: w, bottom: h },
    { left: Math.max(0, w / 2 - 152), top: Math.max(headerHeight, h - 34), right: Math.min(w, w / 2 + 152), bottom: h },
  ]
}

export const selectBrailaScreenLabels = (
  candidates: readonly BrailaScreenLabelCandidate[],
  level: SemanticMapLevel,
  viewport: MapViewport,
  reserved: readonly LocalityScreenBox[] = [],
): readonly string[] => selectLocalityScreenLabels(
  BRAILA_PRESENTATION_PROFILE,
  candidates,
  level,
  viewport,
  reserved,
)

const labelScreenBox = (text: Phaser.GameObjects.Text, camera: Phaser.Cameras.Scene2D.Camera): LocalityScreenBox => {
  const zoom = camera.zoom
  const x = camera.x + (text.x - camera.worldView.x) * zoom
  const y = camera.y + (text.y - camera.worldView.y) * zoom
  const width = text.displayWidth * zoom
  const height = text.displayHeight * zoom
  return {
    left: x - width * text.originX,
    top: y - height * text.originY,
    right: x + width * (1 - text.originX),
    bottom: y + height * (1 - text.originY),
  }
}

/**
 * Runtime controller for Brăila presentation labels. It changes only presentation state: no road,
 * collision, delivery, economy or player coordinates are touched. Screen-fixed label sizing makes
 * each semantic level readable while the collision pass removes the HQ/shop/street pile-up.
 */
export const installBrailaLabelPresentation = (
  scene: Phaser.Scene,
  labels: readonly BrailaPresentationLabel[],
  cityWidth: number,
  cityHeight: number,
): void => {
  // Some art-unit tests deliberately use a minimal scene double with no camera/event systems.
  // In the real Phaser runtime both systems exist; presentation should remain a no-op in headless doubles.
  const runtimeScene = scene as Partial<Phaser.Scene>
  const events = runtimeScene.events
  const cameras = runtimeScene.cameras
  if (!events || !cameras?.main) return

  const states = labels.map((entry, index) => ({
    ...entry,
    id: `${entry.role}:${entry.text.name || entry.text.text}:${index}`,
    baseScaleX: entry.text.scaleX,
    baseScaleY: entry.text.scaleY,
    baseAlpha: entry.text.alpha,
  }))
  let lastSignature = ''

  const sync = (): void => {
    const camera = cameras.main
    const signature = [
      Math.round(camera.zoom * 10000), Math.round(camera.worldView.x), Math.round(camera.worldView.y),
      Math.round(camera.width), Math.round(camera.height),
    ].join(':')
    if (signature === lastSignature) return
    lastSignature = signature

    const fit = cityFitZoom(camera.width, camera.height, cityWidth, cityHeight)
    const level = cityScaleLevel(camera.zoom, fit)
    const viewport: MapViewport = { left: camera.x, top: camera.y, width: camera.width, height: camera.height }

    for (const state of states) {
      const compensation = localityLabelScaleCompensation(
        BRAILA_PRESENTATION_PROFILE,
        state.role,
        camera.zoom,
      )
      state.text.setScale(state.baseScaleX * compensation, state.baseScaleY * compensation)
      state.text.setVisible(false).setAlpha(state.baseAlpha)
    }

    const candidates = states.map(state => ({
      id: state.id,
      role: state.role,
      priority: state.priority,
      box: labelScreenBox(state.text, camera),
    }))
    const accepted = new Set(selectBrailaScreenLabels(
      candidates,
      level,
      viewport,
      brailaReservedScreenBoxes(camera.width, camera.height),
    ))
    for (const state of states) state.text.setVisible(accepted.has(state.id))
  }

  const cleanup = (): void => { events.off('update', sync) }
  events.on('update', sync)
  events.once('shutdown', cleanup)
  sync()
}
