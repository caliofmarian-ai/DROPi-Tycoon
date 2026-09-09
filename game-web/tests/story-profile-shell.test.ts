import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BRAILA_FIRST_HOUR_MISSION_IDS } from '../src/missions/brailaFirstHourAuthoredRegistry'
import {
  MISSION_RESUME_CONTRACT_KIND,
  MISSION_RESUME_CONTRACT_VERSION,
} from '../src/missions/missionResumeContract'
import { MISSION_RUNTIME_VERSION } from '../src/missions/missionModel'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { createInitialOwnershipEconomyState } from '../src/systems/ownershipEconomySystem'
import { createInitialWorldIdentityState } from '../src/systems/worldIdentitySystem'
import { SUPPORTED_ANDROID_VIEWPORTS } from '../src/ui/mobileViewport'
import {
  projectSafeProfile,
  projectStoryRuntime,
  storyProfileShellLayout,
} from '../src/ui/StoryProfileShell'
import { TOUCH_TARGET_MIN_PX } from '../src/ui/theme'

const source = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8')

const missionResume = (status: 'Active' | 'Completed' | 'Failed', failureCount = 0, stageId = 'pickup') => ({
  kind: MISSION_RESUME_CONTRACT_KIND,
  version: MISSION_RESUME_CONTRACT_VERSION,
  runtime: {
    version: MISSION_RUNTIME_VERSION,
    missions: {
      [BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing]: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
        status,
        stageId,
        completedObjectiveIds: [],
        choices: [],
        processedEventIds: [],
        failureCount,
        emittedConsequenceIntentIds: [],
      },
    },
    completionReceipts: [],
  },
})

describe('DT-10 visible Story / Profile shell', () => {
  it('fails closed when Mission Runtime authority is missing or incompatible', () => {
    const missing = projectStoryRuntime(undefined)
    expect(missing.status).toBe('missing')
    expect(missing.lines.join(' ')).toContain('No chapter, dialogue, consequence or relationship fact is fabricated')

    const incompatible = projectStoryRuntime({ kind: 'wrong-contract' })
    expect(incompatible.status).toBe('incompatible')
    expect(incompatible.lines.join(' ')).toContain('Presentation is blocked')
  })

  it('projects current authoritative mission state without mutating Mission Runtime', () => {
    const resume = missionResume('Active')
    const before = JSON.stringify(resume)
    const projection = projectStoryRuntime(resume)

    expect(projection.status).toBe('connected')
    expect(projection.activeMissionId).toBe(BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing)
    expect(projection.lines.join(' ')).toContain('One Small Thing')
    expect(projection.oneSmallThingHistory).toBe('PENDING')
    expect(JSON.stringify(resume)).toBe(before)
  })

  it('derives CLEAN / RECOVERED / FAILED only from durable One Small Thing mission history', () => {
    expect(projectStoryRuntime(missionResume('Completed', 0)).oneSmallThingHistory).toBe('CLEAN')
    expect(projectStoryRuntime(missionResume('Completed', 2)).oneSmallThingHistory).toBe('RECOVERED')
    expect(projectStoryRuntime(missionResume('Failed', 1)).oneSmallThingHistory).toBe('FAILED')
  })

  it('labels the current player identity truthfully as local/offline and keeps rendered city separate from identity locality', () => {
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: false, activeTransport: 'walking' }
    const projection = projectSafeProfile({
      worldIdentity: createInitialWorldIdentityState(),
      ownershipEconomy: createInitialOwnershipEconomyState(),
      company: createInitialCompanyState(),
      world,
      renderedWorldName: 'Brăila',
    })
    const text = projection.lines.join('\n')

    expect(projection.localOnly).toBe(true)
    expect(text).toContain('Status: Local / offline prototype')
    expect(text).toContain('Authentication: Not configured')
    expect(text).toContain('Cloud account / sync: Not configured')
    expect(text).toContain('Origin / home locality: Not configured by identity authority')
    expect(text).toContain('Current locality: Not configured by identity authority')
    expect(text).toContain('Rendered world: Brăila · scene context only')
    expect(text).toContain('Personal Money:')
    expect(text).toContain('Company funds:')
  })

  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps Story/Profile shell and controls inside ${viewport.width}x${viewport.height}`, () => {
      const layout = storyProfileShellLayout(viewport.width, viewport.height)
      expect(layout.shell.left).toBeGreaterThanOrEqual(0)
      expect(layout.shell.top).toBeGreaterThanOrEqual(0)
      expect(layout.shell.left + layout.shell.width).toBeLessThanOrEqual(viewport.width)
      expect(layout.shell.top + layout.shell.height).toBeLessThanOrEqual(viewport.height)
      for (const control of [layout.close, layout.storyTab, layout.profileTab]) {
        expect(control.width).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
        expect(control.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX)
        expect(control.x - control.width / 2).toBeGreaterThanOrEqual(layout.shell.left)
        expect(control.x + control.width / 2).toBeLessThanOrEqual(layout.shell.left + layout.shell.width)
        expect(control.y - control.height / 2).toBeGreaterThanOrEqual(layout.shell.top)
        expect(control.y + control.height / 2).toBeLessThanOrEqual(layout.shell.top + layout.shell.height)
      }
    })
  }

  it('uses the existing HUD modal contract so Story/Profile blocks world controls and Android Back closes it', () => {
    const hudSource = source('../src/ui/UrbanHUD.ts')
    const shellSource = source('../src/ui/StoryProfileShell.ts')
    const worldSource = source('../src/scenes/GameWorldScene.ts')

    expect(hudSource).toContain('const MENU_ROW_COUNT = 5')
    expect(hudSource).toContain("['Story', () => this.openStoryProfile('story')]")
    expect(hudSource).toContain("['Account / Profile', () => this.openStoryProfile('profile')]")
    expect(hudSource).toContain('this.storyProfile.isOpen()')
    expect(hudSource).toContain('this.storyProfile.close()')
    expect(hudSource).toContain('this.storyProfile.destroy()')
    expect(worldSource).toContain('this.hud.isMenuOpen() || this.zoomGesture.isPinching() ? { x: 0, y: 0 }')
    expect(worldSource).toContain('if (!this.narrative.handleBack()) this.hud.toggleMenu()')
    expect(shellSource).not.toContain('applyMissionEvent(')
    expect(shellSource).not.toContain('startMission(')
    expect(shellSource).not.toContain('replaceGameSession(')
    expect(shellSource).not.toContain('autosaveIfApproved(')
  })

  it('reuses only the already production-ready delivery emblem and does not promote approved references directly', () => {
    const shellSource = source('../src/ui/StoryProfileShell.ts')
    expect(shellSource).toContain("const APPROVED_ORDERS_ICON_KEY = 'dropi-approved-orders-icon-v1'")
    expect(shellSource).not.toContain('Approved_References')
    expect(shellSource).not.toContain('.jpg')
    expect(shellSource).not.toContain('.png')
  })
})
