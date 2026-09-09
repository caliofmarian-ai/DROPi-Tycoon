import { beforeEach, describe, expect, it } from 'vitest'
import type { PlayerMobilityWorkAccessPresentationProjection } from '../src/capabilities/playerMobilityWorkAccessPresentation'
import type { GameSessionPlayerEconomyProjection } from '../src/economy/gameSessionPlayerEconomyComposition'
import { clearGameSession, startNewGameSession } from '../src/state/gameSession'
import { SMARTPHONE_LIVE_APPS, buildSmartphoneSnapshot } from '../src/ui/PlayerSmartphone'
import { buildPlayerProfilePresentation } from '../src/ui/PlayerProfilePresentation'
import { createInitialOwnershipEconomyState } from '../src/systems/ownershipEconomySystem'

describe('DT-10 #554 visible Account/Profile presentation', () => {
  beforeEach(() => clearGameSession())

  it('is discoverable in the existing phone and never invents authentication or locality identity', () => {
    const session = startNewGameSession()
    const profile = buildPlayerProfilePresentation(session)

    expect(SMARTPHONE_LIVE_APPS.some(app => app.id === 'profile' && app.label === 'Profile')).toBe(true)
    expect(profile.heading).toBe('PLAYER PROFILE')
    expect(profile.lines).toContain('Authority: LOCAL / OFFLINE · no authenticated session')
    expect(profile.lines).toContain('Home: Not yet authoritative')
    expect(profile.lines).toContain('Start: Not yet authoritative')
    expect(profile.lines).toContain('Current: Not yet authoritative')
    expect(profile.lines).toContain('Player Economy: Not mounted in this session')
    expect(profile.lines).toContain('Work access: Not mounted in this session')
    expect(profile.lines.join('\n')).not.toContain('Brăila')
    expect(profile.lines.join('\n')).not.toContain('Authenticated')
  })

  it('renders scoped locality, Player Economy and work-access projections only when supplied by their owners', () => {
    const session = startNewGameSession()
    const identity = session.worldIdentity
    const localityId = 'locality:fixture:second-city'
    const economy: GameSessionPlayerEconomyProjection = {
      worldInstanceId: identity.worldInstanceId,
      heroActorId: identity.heroActorId,
      mode: 'FreshEmployee',
      moneyAuthority: 'PlayerEconomy.PersonalMoney',
      personalMoneyBalanceMinor: 1500,
      employerTreasuryBalanceMinor: 98_500,
      legacyCompanyMoney: { authority: 'GameSession.CompanyState', balance: 0, isPersonalMoney: false },
      workCapacity: { current: 700, max: 1000, canPerformBasicDelivery: true },
      productiveWork: { receiptCount: 0, receipts: [] },
      currentShift: null,
      living: {
        financialStatus: 'Stable',
        housingStatus: 'Housed',
        arrearsMinor: 0,
        settledObligationCount: 0,
        insolvent: false,
        emergencyHousingActive: false,
      },
    }
    const workAccess: PlayerMobilityWorkAccessPresentationProjection = {
      version: 1,
      worldInstanceId: identity.worldInstanceId,
      heroActorId: identity.heroActorId,
      currentLocalityId: localityId,
      activities: [{
        activityId: 'WalkingLightDelivery',
        label: 'Walking light delivery',
        accessClass: 'ENTRY',
        eligible: true,
        allowedRouteClasses: ['local'],
        blockers: [],
      }],
      routes: [{
        routeClass: 'local',
        eligible: true,
        eligibleWorkActivityIds: ['WalkingLightDelivery'],
        blockingReasons: [],
      }],
    }

    const profile = buildPlayerProfilePresentation(session, {
      locality: {
        worldInstanceId: identity.worldInstanceId,
        heroActorId: identity.heroActorId,
        authorityRef: 'fixture:locality-authority',
        homeLocalityId: 'locality:fixture:home',
        startingLocalityId: localityId,
        currentLocalityId: localityId,
      },
      playerEconomy: economy,
      workAccess,
    })

    expect(profile.lines).toContain('Home: locality:fixture:home')
    expect(profile.lines).toContain(`Start: ${localityId}`)
    expect(profile.lines).toContain(`Current: ${localityId}`)
    expect(profile.lines).toContain('Player Economy: Work Capacity 700/1000 · basic delivery ready')
    expect(profile.lines).toContain('Work access: Walking light delivery')
  })

  it('fails closed on projections scoped to another hero/world', () => {
    const session = startNewGameSession()
    const profile = buildPlayerProfilePresentation(session, {
      locality: {
        worldInstanceId: 'world:other',
        heroActorId: 'actor:other',
        authorityRef: 'fixture:wrong-scope',
        currentLocalityId: 'locality:other',
      },
    })

    expect(profile.lines).toContain('Current: Not yet authoritative')
  })

  it('keeps the generic smartphone snapshot compatible while exposing an injected Profile surface', () => {
    const session = startNewGameSession()
    const profile = buildPlayerProfilePresentation(session)
    const world = session.world
    const snapshot = buildSmartphoneSnapshot(
      world,
      session.company,
      createInitialOwnershipEconomyState(),
      { point: { x: world.player.x, y: world.player.y }, title: 'Current objective', action: 'Action' },
      profile,
    )

    expect(snapshot.profile.heading).toBe('PLAYER PROFILE')
    expect(snapshot.profile.lines).toContain('Authority: LOCAL / OFFLINE · no authenticated session')
  })
})
