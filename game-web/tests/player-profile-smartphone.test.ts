import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { createInitialOwnershipEconomyState } from '../src/systems/ownershipEconomySystem'
import { createInitialPersonalProgressionState } from '../src/systems/personalCapabilitySystem'
import { createFreshLocalWorldIdentity } from '../src/systems/worldIdentitySystem'
import {
  SMARTPHONE_LIVE_APPS,
  buildPlayerProfileSnapshot,
  buildSmartphoneSnapshot,
} from '../src/ui/PlayerSmartphone'

const source = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8')

const objectiveFor = (world: ReturnType<typeof createInitialWorldState>) => ({
  point: { x: world.player.x + 30, y: world.player.y + 40 },
  title: 'Collect at Corner Shop',
  action: 'Pick up parcel',
})

describe('DT-21 truthful player profile presentation', () => {
  it('makes the local player profile discoverable from supplied authoritative inputs', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    const ownership = createInitialOwnershipEconomyState()
    const progression = createInitialPersonalProgressionState()
    const identity = createFreshLocalWorldIdentity('wi-profile-test', 'acct-profile-test')

    progression.experiencePoints = 275
    progression.progressionPoints = 3
    progression.learnedCapabilityIds.push('BicycleOperation')
    company.companyName = 'DROPi Local Logistics'

    const snapshot = buildSmartphoneSnapshot(
      world,
      company,
      ownership,
      objectiveFor(world),
      progression,
      identity,
    )

    expect(SMARTPHONE_LIVE_APPS).toContainEqual({ id: 'profile', label: 'Profile' })
    expect(snapshot.profile.heading).toBe('PLAYER PROFILE')
    expect(snapshot.profile.lines).toContain('Identity: Local player')
    expect(snapshot.profile.lines).toContain('World profile: Fresh local world')
    expect(snapshot.profile.lines).toContain('Progress: 275 XP · 3 pts')
    expect(snapshot.profile.lines).toContain('Capabilities: 3 learned')
    expect(snapshot.profile.lines).toContain('Company context: DROPi Local Logistics')
    expect(snapshot.profile.lines.some(line => line.startsWith('Company: '))).toBe(false)
    expect(snapshot.profile.lines).toContain('Online account: FUTURE')
    expect(snapshot.profile.lines).toContain('Username & avatar: FUTURE')
  })

  it('fails closed when authoritative profile inputs are missing', () => {
    const company = createInitialCompanyState()
    company.companyName = 'Context Only Ltd'

    const profile = buildPlayerProfileSnapshot(company)

    expect(profile.lines).toContain('Identity: UNAVAILABLE')
    expect(profile.lines).toContain('World profile: UNAVAILABLE')
    expect(profile.lines).toContain('Progress: UNAVAILABLE')
    expect(profile.lines).toContain('Capabilities: UNAVAILABLE')
    expect(profile.lines).toContain('Company context: Context Only Ltd')
    expect(profile.lines).not.toContain('Identity: Local player')
    expect(profile.lines).not.toContain('World profile: Legacy local world')
    expect(profile.lines).not.toContain('Progress: 0 XP · 0 pts')
  })

  it('does not synthesize ownership/economy state when the smartphone has no session authority', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()

    const snapshot = buildSmartphoneSnapshot(
      world,
      company,
      undefined,
      objectiveFor(world),
    )

    expect(snapshot.assets.lines).toContain('Personal Money: UNAVAILABLE')
    expect(snapshot.assets.lines).toContain('Your shares: UNAVAILABLE')
    expect(snapshot.assets.lines).toContain('Treasury shares: UNAVAILABLE')
    expect(snapshot.profile.lines).toContain('Identity: UNAVAILABLE')
    expect(snapshot.profile.lines).toContain('Progress: UNAVAILABLE')
  })

  it('never exposes internal account, hero or world-instance identifiers in the player-facing profile', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    const ownership = createInitialOwnershipEconomyState()
    const progression = createInitialPersonalProgressionState()
    const identity = createFreshLocalWorldIdentity('wi-private-profile-test', 'acct-private-profile-test')

    const snapshot = buildSmartphoneSnapshot(
      world,
      company,
      ownership,
      objectiveFor(world),
      progression,
      identity,
    )
    const playerFacingProjection = JSON.stringify(snapshot.profile)

    expect(playerFacingProjection).not.toContain(identity.accountId)
    expect(playerFacingProjection).not.toContain(identity.heroActorId)
    expect(playerFacingProjection).not.toContain(identity.worldInstanceId)
  })

  it('keeps profile presentation read-only, fail-closed, and outside repair/auth authority', () => {
    const phoneSource = source('../src/ui/PlayerSmartphone.ts')

    expect(phoneSource).not.toContain("fetch('/api/authority")
    expect(phoneSource).not.toContain('CreatePublicProfile')
    expect(phoneSource).not.toContain('SetDisplayName')
    expect(phoneSource).not.toContain('createInitialPersonalProgressionState')
    expect(phoneSource).not.toContain('createInitialWorldIdentityState')
    expect(phoneSource).not.toContain('getOrCreateGameSession')
    expect(phoneSource).not.toContain('sanitizeOwnershipEconomyState')
    expect(phoneSource).not.toContain('sanitizePersonalProgression')
    expect(phoneSource).not.toContain('sanitizeWorldIdentityState')
    expect(phoneSource).toContain('peekGameSession()')
  })
})
