import Phaser from 'phaser'
import {
  buttonPalette,
  chipPalette,
  COLORS,
  panelBorderColor,
  rectCenterX,
  rectCenterY,
  type ButtonTone,
  type ChipTone,
  type PanelTone,
  type RectShape,
} from './theme'

/**
 * Phaser drawing helpers built on top of the pure theme.ts tokens (Owner
 * Quality Gate #317, Workstream A). Kept separate from theme.ts so the
 * tokens/pure helpers remain importable from plain node-environment tests
 * without pulling in the Phaser runtime.
 */

/**
 * Draws a rounded, shadowed card treatment shared by every management/product
 * surface. Returns the Graphics object so callers may destroy/replace it on
 * refresh cycles.
 */
export const drawPanel = (
  scene: Phaser.Scene,
  rect: RectShape,
  options: { tone?: PanelTone; radius?: number; fillAlpha?: number; depth?: number } = {},
): Phaser.GameObjects.Graphics => {
  const tone = options.tone ?? 'default'
  const radius = options.radius ?? 14
  const fillAlpha = options.fillAlpha ?? 0.97

  const graphics = scene.add.graphics()
  if (typeof options.depth === 'number') {
    graphics.setDepth(options.depth)
  }

  // Soft drop shadow for depth/hierarchy.
  graphics.fillStyle(0x000000, 0.28)
  graphics.fillRoundedRect(rect.left + 3, rect.top + 5, rect.width, rect.height, radius)

  graphics.fillStyle(COLORS.surface, fillAlpha)
  graphics.fillRoundedRect(rect.left, rect.top, rect.width, rect.height, radius)

  graphics.lineStyle(2, panelBorderColor(tone), tone === 'default' ? 0.6 : 0.85)
  graphics.strokeRoundedRect(rect.left, rect.top, rect.width, rect.height, radius)

  return graphics
}

export interface ThemedButton {
  background: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  setEnabled: (enabled: boolean) => void
  setLabel: (text: string) => void
}

/**
 * Rounded, color-toned button primitive. Only the returned background
 * graphics is interactive, matching the existing project convention of one
 * input owner per control.
 */
export const createThemedButton = (
  scene: Phaser.Scene,
  rect: RectShape,
  text: string,
  tone: ButtonTone,
  onTap: () => void,
  options: { fontSize?: number; radius?: number; container?: Phaser.GameObjects.Layer } = {},
): ThemedButton => {
  const palette = buttonPalette(tone)
  const radius = options.radius ?? Math.min(16, rect.height / 2.4)
  const fontSize = options.fontSize ?? 16

  const background = scene.add.graphics()
  const paint = (fill: number, alpha: number) => {
    background.clear()
    background.fillStyle(0x000000, 0.22)
    background.fillRoundedRect(rect.left + 2, rect.top + 3, rect.width, rect.height, radius)
    background.fillStyle(fill, alpha)
    background.fillRoundedRect(rect.left, rect.top, rect.width, rect.height, radius)
    background.lineStyle(2, palette.border, 0.9)
    background.strokeRoundedRect(rect.left, rect.top, rect.width, rect.height, radius)
  }
  paint(palette.fill, 1)

  background.setInteractive(
    new Phaser.Geom.Rectangle(rect.left, rect.top, rect.width, rect.height),
    Phaser.Geom.Rectangle.Contains,
  )

  const label = scene.add
    .text(rectCenterX(rect), rectCenterY(rect), text, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: palette.text,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: Math.max(48, rect.width - 10) },
    })
    .setOrigin(0.5)

  if (options.container) {
    options.container.add(background)
    options.container.add(label)
  }

  background.on('pointerover', () => paint(palette.fillHover, 1))
  background.on('pointerout', () => paint(palette.fill, 1))
  background.on(
    'pointerdown',
    (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation()
      onTap()
    },
  )

  return {
    background,
    label,
    setEnabled: (enabled: boolean) => {
      if (enabled) {
        background.setInteractive(
          new Phaser.Geom.Rectangle(rect.left, rect.top, rect.width, rect.height),
          Phaser.Geom.Rectangle.Contains,
        )
        background.setAlpha(1)
        label.setAlpha(1)
      } else {
        background.disableInteractive()
        background.setAlpha(0.5)
        label.setAlpha(0.75)
      }
    },
    setLabel: (nextText: string) => label.setText(nextText),
  }
}

/** Small pill-shaped status/economic indicator (e.g. "Owned", "Lvl 3", "$1,240"). */
export const createStatusChip = (
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
  text: string,
  tone: ChipTone = 'neutral',
  fontSize = 13,
): { background: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text } => {
  const palette = chipPalette(tone)
  const label = scene.add
    .text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: palette.text,
      fontStyle: 'bold',
    })
    .setOrigin(0.5)

  const paddingX = 10
  const width = label.width + paddingX * 2
  const height = Math.max(20, label.height + 6)
  const left = centerX - width / 2
  const top = centerY - height / 2

  const background = scene.add.graphics()
  background.fillStyle(palette.fill, 0.92)
  background.fillRoundedRect(left, top, width, height, height / 2)
  background.lineStyle(1.5, palette.border, 0.85)
  background.strokeRoundedRect(left, top, width, height, height / 2)

  label.setPosition(centerX, centerY)
  label.setDepth(1)

  return { background, label }
}

/** Section header: small caps label used to introduce a card/group. */
export const createSectionHeader = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  fontSize = 13,
): Phaser.GameObjects.Text =>
  scene.add
    .text(x, y, text.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: COLORS.textMuted,
      fontStyle: 'bold',
    })
    .setOrigin(0, 0)

/**
 * Draws a compact horizontal capability bar (used for vehicle speed/capacity
 * indicators) instead of raw text-only labels.
 */
export const drawCapabilityBar = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  level: 1 | 2 | 3,
  tone: ChipTone = 'accent',
): Phaser.GameObjects.Graphics => {
  const palette = chipPalette(tone)
  const graphics = scene.add.graphics()
  const segmentGap = 3
  const segmentWidth = (width - segmentGap * 2) / 3
  for (let i = 0; i < 3; i += 1) {
    const filled = i < level
    graphics.fillStyle(filled ? palette.border : 0x1e293b, filled ? 0.95 : 0.6)
    graphics.fillRoundedRect(x + i * (segmentWidth + segmentGap), y, segmentWidth, height, 2)
  }
  return graphics
}

/** Backdrop gradient fill helper shared by full-screen management scenes. */
export const paintBackdrop = (scene: Phaser.Scene, width: number, height: number): void => {
  const graphics = scene.add.graphics()
  graphics.fillGradientStyle(
    COLORS.backgroundTop,
    COLORS.backgroundTop,
    COLORS.backgroundBottom,
    COLORS.backgroundBottom,
    1,
  )
  graphics.fillRect(0, 0, width, height)
}

export type VehicleGlyphType = 'Bicycle' | 'ElectricScooter' | 'Motorcycle' | 'DeliveryVan'

/**
 * Draws a small, code-drawn vehicle silhouette used by Vehicle Fleet cards and
 * the player world representation (Workstream C/D). No bitmap assets — pure
 * vector-like Graphics shapes recognisable at small landscape scale.
 */
export const drawVehicleGlyph = (
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
  scale: number,
  type: VehicleGlyphType,
  tone: number = COLORS.accent,
): Phaser.GameObjects.Graphics => {
  const graphics = scene.add.graphics()
  graphics.setPosition(centerX, centerY)
  const wheelRadius = 6 * scale

  const drawWheels = (spread: number) => {
    graphics.lineStyle(Math.max(1.5, 1.8 * scale), 0xe2e8f0, 0.9)
    graphics.fillStyle(0x0f172a, 1)
    graphics.fillCircle(-spread, wheelRadius * 0.9, wheelRadius)
    graphics.strokeCircle(-spread, wheelRadius * 0.9, wheelRadius)
    graphics.fillCircle(spread, wheelRadius * 0.9, wheelRadius)
    graphics.strokeCircle(spread, wheelRadius * 0.9, wheelRadius)
  }

  switch (type) {
    case 'Bicycle': {
      drawWheels(10 * scale)
      graphics.lineStyle(Math.max(1.6, 2 * scale), tone, 1)
      graphics.beginPath()
      graphics.moveTo(-10 * scale, wheelRadius * 0.9)
      graphics.lineTo(-2 * scale, -6 * scale)
      graphics.lineTo(10 * scale, wheelRadius * 0.9)
      graphics.lineTo(2 * scale, -6 * scale)
      graphics.lineTo(-10 * scale, wheelRadius * 0.9)
      graphics.strokePath()
      graphics.fillStyle(tone, 1)
      graphics.fillCircle(-2 * scale, -6 * scale, 2.2 * scale)
      break
    }
    case 'ElectricScooter': {
      drawWheels(9 * scale)
      graphics.lineStyle(Math.max(1.6, 2 * scale), tone, 1)
      graphics.beginPath()
      graphics.moveTo(-9 * scale, wheelRadius * 0.9)
      graphics.lineTo(8 * scale, wheelRadius * 0.9)
      graphics.strokePath()
      graphics.beginPath()
      graphics.moveTo(8 * scale, wheelRadius * 0.9)
      graphics.lineTo(8 * scale, -9 * scale)
      graphics.strokePath()
      graphics.lineStyle(Math.max(2, 2.4 * scale), tone, 1)
      graphics.beginPath()
      graphics.moveTo(4 * scale, -9 * scale)
      graphics.lineTo(10 * scale, -9 * scale)
      graphics.strokePath()
      break
    }
    case 'Motorcycle': {
      drawWheels(11 * scale)
      graphics.fillStyle(tone, 1)
      graphics.fillRoundedRect(-11 * scale, -4 * scale, 22 * scale, 8 * scale, 3 * scale)
      graphics.fillStyle(0x0f172a, 1)
      graphics.fillRoundedRect(-4 * scale, -10 * scale, 9 * scale, 6 * scale, 2 * scale)
      break
    }
    case 'DeliveryVan':
    default: {
      drawWheels(10 * scale)
      graphics.fillStyle(tone, 1)
      graphics.fillRoundedRect(-14 * scale, -12 * scale, 28 * scale, 14 * scale, 3 * scale)
      graphics.fillStyle(0x0c2436, 0.85)
      graphics.fillRoundedRect(-10 * scale, -9 * scale, 8 * scale, 6 * scale, 1.5 * scale)
      graphics.fillRoundedRect(1 * scale, -9 * scale, 8 * scale, 6 * scale, 1.5 * scale)
      break
    }
  }

  return graphics
}
