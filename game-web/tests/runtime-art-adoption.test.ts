import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const sceneSource = readFileSync(new URL('../src/scenes/ApprovedAssetMainMenuScene.ts', import.meta.url), 'utf8')
const configSource = readFileSync(new URL('../src/config/gameConfig.ts', import.meta.url), 'utf8')
const runtimeAsset = new URL('../public/assets/production/icon-orders.webp', import.meta.url)

describe('ISSUE-412 — governed runtime art adoption', () => {
  it('reuses the approved orders candidate through a dedicated runtime asset path', () => {
    expect(existsSync(runtimeAsset)).toBe(true)
    expect(sceneSource).toContain("APPROVED_ORDERS_ICON_URL = '/assets/production/icon-orders.webp'")
    expect(sceneSource).toContain('this.load.image(APPROVED_ORDERS_ICON_KEY, APPROVED_ORDERS_ICON_URL)')
  })

  it('keeps the proven MainMenu behavior and makes the visual adoption non-blocking', () => {
    expect(sceneSource).toContain('extends MainMenuScene')
    expect(sceneSource).toContain('super.preload()')
    expect(sceneSource).toContain('super.create()')
    expect(sceneSource).toContain('if (!this.textures.exists(APPROVED_ORDERS_ICON_KEY)) return')
  })

  it('boots the approved-asset wrapper as the MainMenu implementation', () => {
    expect(configSource).toContain("import { ApprovedAssetMainMenuScene } from '../scenes/ApprovedAssetMainMenuScene'")
    expect(configSource).toContain('scene: [\n    ApprovedAssetMainMenuScene,')
  })
})
