import Phaser from 'phaser'
import { COLORS } from '../ui/theme'
import { drawVehicleGlyph, type VehicleGlyphType } from '../ui/themeControls'

/**
 * Workstream D — replaces the permanent placeholder cube with a recognizable
 * code-drawn player/operator representation. No bitmap assets: everything is
 * built from Phaser Graphics primitives. The person silhouette is drawn once
 * and only redrawn when its walking stance actually changes; the vehicle
 * glyph is (re)created only when the presentation state changes, not per
 * frame, to keep this cheap on Android.
 */
export type PlayerVisualState = 'Walking' | VehicleGlyphType

const PLAYER_ACCENT = COLORS.accent
const SKIN_TONE = 0xf2c9a0
const HAIR_TONE = 0x2a2a2a

/** Draws the walking human silhouette (head, torso, legs) used for every state. */
const drawPersonSilhouette = (graphics: Phaser.GameObjects.Graphics, legPhase: 0 | 1): void => {
  graphics.clear()

  // Legs — alternate stance gives a readable walking cue without per-frame rebuilds.
  graphics.fillStyle(0x1e293b, 1)
  if (legPhase === 0) {
    graphics.fillRoundedRect(-6, 6, 4, 12, 2)
    graphics.fillRoundedRect(2, 6, 4, 12, 2)
  } else {
    graphics.fillRoundedRect(-7, 6, 4, 11, 2)
    graphics.fillRoundedRect(3, 7, 4, 11, 2)
  }

  // Torso with a DROPi-associated accent vest.
  graphics.fillStyle(PLAYER_ACCENT, 1)
  graphics.fillRoundedRect(-8, -8, 16, 16, 5)
  graphics.lineStyle(1.5, 0x0c2436, 0.9)
  graphics.strokeRoundedRect(-8, -8, 16, 16, 5)

  // Head.
  graphics.fillStyle(SKIN_TONE, 1)
  graphics.fillCircle(0, -16, 6)
  graphics.fillStyle(HAIR_TONE, 1)
  graphics.fillRect(-6, -21, 12, 4)
}

export interface PlayerVisual {
  container: Phaser.GameObjects.Container
  /** Sets the presentation state (walking or riding a specific vehicle type). */
  setState: (state: PlayerVisualState) => void
  /** Sets left/right facing so movement direction reads clearly. */
  setFacing: (facingLeft: boolean) => void
  /** Cheap walking-stance toggle; never rebuilds the whole silhouette. */
  setMoving: (moving: boolean) => void
  destroy: () => void
}

/**
 * Creates the player's visual representation as a single Container so the
 * scene can treat it like the previous Sprite (position/camera-follow) while
 * swapping between walking and vehicle presentation states.
 */
export const createPlayerVisual = (
  scene: Phaser.Scene,
  x: number,
  y: number,
): PlayerVisual => {
  const container = scene.add.container(x, y)

  const personGraphics = scene.add.graphics()
  personGraphics.setDepth(1)
  container.add(personGraphics)

  let vehicleGraphics: Phaser.GameObjects.Graphics | null = null
  let currentState: PlayerVisualState = 'Walking'
  let currentLegPhase: 0 | 1 = 0
  drawPersonSilhouette(personGraphics, currentLegPhase)

  const redraw = (): void => {
    if (vehicleGraphics) {
      vehicleGraphics.destroy()
      vehicleGraphics = null
    }

    if (currentState === 'Walking') {
      personGraphics.setVisible(true)
      return
    }

    // Riding a vehicle: draw the vehicle glyph slightly below the person so
    // the rider silhouette still reads as a person on transport. A van fully
    // represents the player (no separate rider silhouette needed).
    const isVan = currentState === 'DeliveryVan'
    personGraphics.setVisible(!isVan)
    vehicleGraphics = drawVehicleGlyph(
      scene,
      0,
      isVan ? 0 : 8,
      isVan ? 1.6 : 1.2,
      currentState as VehicleGlyphType,
      PLAYER_ACCENT,
    )
    vehicleGraphics.setDepth(0)
    container.add(vehicleGraphics)
  }

  const setState = (state: PlayerVisualState): void => {
    if (state === currentState) return
    currentState = state
    redraw()
  }

  const setFacing = (facingLeft: boolean): void => {
    container.setScale(facingLeft ? -1 : 1, 1)
  }

  const setMoving = (moving: boolean): void => {
    const nextPhase: 0 | 1 = moving ? 1 : 0
    if (nextPhase === currentLegPhase) return
    currentLegPhase = nextPhase
    if (currentState === 'Walking') {
      drawPersonSilhouette(personGraphics, currentLegPhase)
    }
  }

  const destroy = (): void => {
    container.destroy(true)
  }

  return { container, setState, setFacing, setMoving, destroy }
}
