import Phaser from 'phaser'
import {
  buttonPalette,
  chipPalette,
  COLORS,
  CITY_COLORS,
  TYPOGRAPHY,
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
  graphics.fillStyle(0x00172c, 0.35)
  graphics.fillRoundedRect(rect.left, rect.top + 4, rect.width, rect.height, radius)

  graphics.fillStyle(COLORS.surface, fillAlpha)
  graphics.fillRoundedRect(rect.left, rect.top, rect.width, rect.height, radius)

  graphics.fillStyle(COLORS.surfaceRaised, 0.45)
  graphics.fillRoundedRect(rect.left + 2, rect.top + 2, rect.width - 4, Math.min(45, rect.height - 4), radius)
  graphics.lineStyle(1.5, panelBorderColor(tone), tone === 'default' ? 0.8 : 0.95)
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
  let enabled = true

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
      fontFamily: TYPOGRAPHY.family,
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

  const fitLabel = () => {
    label.setFontSize(fontSize)
    while ((label.width > rect.width - 16 || label.height > rect.height - 12) && parseInt(String(label.style.fontSize)) > 12) {
      label.setFontSize(parseInt(String(label.style.fontSize)) - 1)
    }
  }
  fitLabel()
  background.on('pointerover', () => { if (enabled) paint(palette.fillHover, 1) })
  background.on('pointerout', () => { if (enabled) paint(palette.fill, 1) })
  background.on(
    'pointerdown',
    (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation()
      if (enabled) onTap()
    },
  )

  return {
    background,
    label,
    setEnabled: (nextEnabled: boolean) => {
      enabled = nextEnabled
      paint(enabled ? palette.fill : COLORS.surfaceRaised, 1)
      if (nextEnabled) {
        background.setInteractive(
          new Phaser.Geom.Rectangle(rect.left, rect.top, rect.width, rect.height),
          Phaser.Geom.Rectangle.Contains,
        )
        background.setAlpha(1)
        label.setAlpha(1)
      } else {
        background.disableInteractive()
        background.setAlpha(0.7)
        label.setAlpha(0.75)
      }
    },
    setLabel: (nextText: string) => { label.setText(nextText); fitLabel() },
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
  graphics.fillStyle(COLORS.accent, 0.035)
  for (let x = 20; x < width; x += 64) {
    for (let y = 20; y < height; y += 64) graphics.fillCircle(x, y, 2)
  }
}

/** Text is measured by Phaser, so long saved names and large balances stay in their boxes. */
export const fitText = (
  scene: Phaser.Scene,
  rect: RectShape,
  value: string,
  size = 16,
  color: string = COLORS.textPrimary,
  bold = false,
  align: 'left' | 'center' | 'right' = 'left',
): Phaser.GameObjects.Text => {
  const text = scene.add.text(rect.left, rect.top, value, {
    fontFamily: TYPOGRAPHY.family, fontSize: `${size}px`, color,
    fontStyle: bold ? 'bold' : 'normal', align, wordWrap: { width: rect.width, useAdvancedWrap: true },
  })
  while ((text.height > rect.height || text.width > rect.width) && size > 12) {
    size -= 1
    text.setFontSize(size)
  }
  let shortened = value
  while ((text.height > rect.height || text.width > rect.width) && shortened.length > 0) {
    shortened = shortened.slice(0, -1)
    text.setText(`${shortened.trimEnd()}…`)
  }
  text.setPosition(
    align === 'center' ? rect.left + rect.width / 2 : align === 'right' ? rect.left + rect.width : rect.left,
    rect.top + rect.height / 2,
  ).setOrigin(align === 'center' ? 0.5 : align === 'right' ? 1 : 0, 0.5)
  return text
}

/** Original miniature headquarters, drawn locally without asset requests. */
export const drawHeadquarters = (scene: Phaser.Scene, rect: RectShape): void => {
  const g = scene.add.graphics()
  const scale = Math.min(rect.width / 240, rect.height / 132)
  g.setPosition(rectCenterX(rect), rectCenterY(rect)).setScale(scale)
  g.fillStyle(CITY_COLORS.shadow, 0.3)
  g.fillEllipse(0, 49, 210, 24)
  g.fillStyle(CITY_COLORS.lawn)
  g.fillRoundedRect(-116, 22, 232, 32, 12)
  g.fillStyle(CITY_COLORS.sidewalk)
  g.fillRoundedRect(-94, 32, 188, 16, 5)
  g.fillStyle(CITY_COLORS.wallShade)
  g.fillRect(-72, -30, 145, 66)
  g.fillStyle(CITY_COLORS.cream)
  g.fillRect(-72, -30, 124, 66)
  g.fillStyle(CITY_COLORS.roofBlue)
  g.fillRoundedRect(-80, -45, 163, 22, 5)
  g.fillStyle(COLORS.accent)
  g.fillRect(-75, -30, 153, 5)
  g.fillStyle(CITY_COLORS.glassShade)
  for (let x = -58; x < 30; x += 28) g.fillRoundedRect(x, -12, 19, 22, 2)
  g.fillStyle(CITY_COLORS.glass)
  for (let x = -56; x < 30; x += 28) g.fillRect(x, -10, 6, 18)
  g.fillStyle(CITY_COLORS.metal)
  g.fillRoundedRect(-18, 13, 28, 23, 2)
  g.fillStyle(CITY_COLORS.glass)
  g.fillRect(-14, 16, 9, 19)
  g.fillRect(-2, 16, 9, 19)
  g.fillStyle(CITY_COLORS.parcel)
  g.fillRect(35, 19, 19, 17)
  g.fillStyle(CITY_COLORS.tape)
  g.fillRect(42, 19, 4, 17)
  for (const x of [-100, 101]) {
    g.fillStyle(CITY_COLORS.trunk)
    g.fillRect(x - 3, 11, 6, 26)
    g.fillStyle(CITY_COLORS.leafDark)
    g.fillCircle(x, 7, 17)
    g.fillStyle(CITY_COLORS.leafLight)
    g.fillCircle(x - 4, 0, 14)
  }
  fitText(scene, { left: rectCenterX(rect) - 62 * scale, top: rectCenterY(rect) - 44 * scale,
    width: 124 * scale, height: 18 * scale }, 'DROPi HQ', Math.max(12, 14 * scale), '#ffffff', true, 'center')
}

export const drawEmployeePortrait = (scene: Phaser.Scene, rect: RectShape): void => {
  drawPanel(scene, rect, { tone: 'accent', radius: 14 })
  const g = scene.add.graphics()
  const s = Math.min(rect.width, rect.height) / 90
  g.setPosition(rectCenterX(rect), rectCenterY(rect)).setScale(s)
  g.fillStyle(COLORS.accentStrong)
  g.fillEllipse(0, 26, 65, 36)
  g.fillStyle(CITY_COLORS.skinShade)
  g.fillRoundedRect(-6, 10, 12, 13, 3)
  g.fillStyle(CITY_COLORS.hair)
  g.fillEllipse(0, -12, 39, 47)
  g.fillStyle(CITY_COLORS.skin)
  g.fillEllipse(0, -6, 33, 37)
  g.fillStyle(CITY_COLORS.hair)
  g.fillRoundedRect(-20, -28, 39, 16, 8)
  g.fillStyle(CITY_COLORS.metal)
  g.fillCircle(-7, -7, 2)
  g.fillCircle(7, -7, 2)
  g.lineStyle(2, 0xac643d)
  g.beginPath()
  g.arc(0, 0, 6, 0.2, Math.PI - 0.2)
  g.strokePath()
  g.fillStyle(COLORS.gold)
  g.fillRoundedRect(9, 22, 12, 8, 2)
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
