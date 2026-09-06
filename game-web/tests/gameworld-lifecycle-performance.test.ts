import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const gameWorldSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)
const companySource = readFileSync(
  new URL('../src/scenes/CompanyManagementScene.ts', import.meta.url),
  'utf8',
)

describe('STAB-001 Android game-world lifecycle hardening', () => {
  it('debounces viewport changes instead of synchronously restarting the city on every resize event', () => {
    expect(gameWorldSource).toContain('const RESIZE_SETTLE_MS = 280')
    expect(gameWorldSource).toContain('this.scheduleResizeRestart()')
    expect(gameWorldSource).toContain('this.resizeRestartTimer?.remove()')
    expect(gameWorldSource).toContain('this.fixedUiCamera?.setSize(width, height)')
    expect(gameWorldSource).not.toContain('private readonly handleResize = (): void => {\n    this.syncRuntimeSession()\n    this.scene.restart()')
  })

  it('keeps the expensive GameWorld resident while the owner inspects Company screens', () => {
    expect(gameWorldSource).toContain("if (scene === 'CompanyManagement')")
    expect(gameWorldSource).toContain('this.scene.launch(scene)')
    expect(gameWorldSource).toContain('this.scene.sleep()')
    expect(companySource).toContain("this.scene.isSleeping('GameWorld')")
    expect(companySource).toContain("this.scene.wake('GameWorld')")
    expect(companySource).toContain('this.scene.stop()')
    expect(companySource).toContain("this.scene.start('GameWorld')")
  })

  it('rebuilds a sleeping world only when viewport or static world presentation actually changed', () => {
    expect(gameWorldSource).toContain('this.pendingLayoutRebuild ||')
    expect(gameWorldSource).toContain('this.getWorldVisualSignature(session.company) !== this.worldVisualSignature')
    expect(gameWorldSource).toContain('`${company.level}:${company.employees.length}:${ownsBicycle}`')
    expect(gameWorldSource).toContain('if (needsWorldRebuild) {\n      this.scene.restart()')
  })

  it('cleans sleep/wake and resize lifecycle resources deterministically', () => {
    expect(gameWorldSource).toContain('Phaser.Scenes.Events.SLEEP')
    expect(gameWorldSource).toContain('Phaser.Scenes.Events.WAKE')
    expect(gameWorldSource).toContain('this.events.off(Phaser.Scenes.Events.SLEEP, this.handleSleep, this)')
    expect(gameWorldSource).toContain('this.events.off(Phaser.Scenes.Events.WAKE, this.handleWake, this)')
    expect(gameWorldSource).toContain('this.resizeRestartTimer = undefined')
  })

  it('reduces non-critical presentation work without slowing direct player movement', () => {
    expect(gameWorldSource).toContain('const HUD_REFRESH_MS = 150')
    expect(gameWorldSource).toContain('const AMBIENT_UPDATE_MS = 33')
    expect(gameWorldSource).toContain('this.playerVisual.update(delta)')
    expect(gameWorldSource).toContain('this.ambientUpdateAccumulator >= AMBIENT_UPDATE_MS')
  })
})
