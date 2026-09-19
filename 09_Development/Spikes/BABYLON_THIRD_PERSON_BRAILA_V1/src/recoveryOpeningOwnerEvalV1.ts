export {}

type HeroPresentation = 'male' | 'female'
type AccessMode = 'guest' | 'account'
type GuestProfile = {
  guestId: string
  createdAt: string
  heroPresentation: HeroPresentation | null
  mode: 'guest-local-eval'
}
type RecoveryEvalPhase =
  | 'BYPASSED'
  | 'WAITING_FOR_CITY'
  | 'ACCESS_CHOICE'
  | 'ACCOUNT_NOT_ENABLED'
  | 'CHOOSE_PRESENTATION'
  | 'PLAYING_FILM_1'
  | 'FILM_1_FAILED'
  | 'WORK_SEARCH'

declare global {
  interface Window {
    __DROPiRecoveryOpeningOwnerEvalV1?: {
      issue: 759
      phase: RecoveryEvalPhase
      requested: boolean
      heroPresentation: HeroPresentation | null
      accessMode: AccessMode | null
      guestProfileId: string | null
      filmSrc: string | null
      filmSeen: boolean
      noPhone: true
      noGps: true
      onFoot: true
      objective: string
    }
  }
}

const ISSUE = 759 as const
const OBJECTIVE = 'Walk the streets and look for work opportunities.'
const query = new URLSearchParams(window.location.search)
const mode = query.get('recoveryOpening')
const requested = mode === '1' || mode === 'force'
const forceReplay = mode === 'force'

const FILMS: Record<HeroPresentation, string> = {
  male: '/assets/cinematics/recovery-awakening-male-v1.mp4',
  female: '/assets/cinematics/recovery-awakening-female-v1.mp4',
}

const PRESENTATION_KEY = 'dropi:presentation:recovery-hero-sex:v1'
const GUEST_PROFILE_KEY = 'dropi:guest-profile:v1'
const seenKey = (hero: HeroPresentation): string => `dropi:story:recovery-rise:v1:${hero}`

const setCinematicAudio = (active: boolean): void => {
  document.documentElement.dataset.cinematicAudio = active ? 'active' : 'gameplay'
  window.dispatchEvent(new CustomEvent('dropi:cinematic-audio-state', { detail: { active } }))
}

const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Evaluation presentation persistence must never block the slice.
  }
}

const readGuestProfile = (): GuestProfile | null => {
  const raw = readStorage(GUEST_PROFILE_KEY)
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<GuestProfile>
    if (value.mode !== 'guest-local-eval' || typeof value.guestId !== 'string' || typeof value.createdAt !== 'string') return null
    const hero = value.heroPresentation === 'male' || value.heroPresentation === 'female'
      ? value.heroPresentation
      : null
    return { guestId: value.guestId, createdAt: value.createdAt, heroPresentation: hero, mode: 'guest-local-eval' }
  } catch {
    return null
  }
}

const createGuestId = (): string => {
  const cryptoId = globalThis.crypto?.randomUUID?.()
  return cryptoId ? `guest:${cryptoId}` : `guest:${Date.now()}:${Math.random().toString(36).slice(2)}`
}

const ensureGuestProfile = (): GuestProfile => {
  const existing = readGuestProfile()
  if (existing) return existing
  const created: GuestProfile = {
    guestId: createGuestId(),
    createdAt: new Date().toISOString(),
    heroPresentation: null,
    mode: 'guest-local-eval',
  }
  writeStorage(GUEST_PROFILE_KEY, JSON.stringify(created))
  return created
}

const saveGuestHero = (hero: HeroPresentation): GuestProfile => {
  const guest = ensureGuestProfile()
  const updated: GuestProfile = { ...guest, heroPresentation: hero }
  writeStorage(GUEST_PROFILE_KEY, JSON.stringify(updated))
  return updated
}

const existingGuest = readGuestProfile()
const storedHero = existingGuest?.heroPresentation ?? readStorage(PRESENTATION_KEY)
const initialHero: HeroPresentation | null =
  storedHero === 'male' || storedHero === 'female' ? storedHero : null

const state: NonNullable<Window['__DROPiRecoveryOpeningOwnerEvalV1']> = {
  issue: ISSUE,
  phase: requested ? 'WAITING_FOR_CITY' : 'BYPASSED',
  requested,
  heroPresentation: initialHero,
  accessMode: null,
  guestProfileId: existingGuest?.guestId ?? null,
  filmSrc: initialHero ? FILMS[initialHero] : null,
  filmSeen: initialHero ? readStorage(seenKey(initialHero)) === '1' : false,
  noPhone: true,
  noGps: true,
  onFoot: true,
  objective: OBJECTIVE,
}

const sharedRuntime = window as unknown as {
  __DROPiStartupCinematicV1?: { status?: string }
  __DROPiEvaluationReadiness?: { status?: 'LOADING' | 'READY' | 'FAIL' }
}

const publish = (): void => {
  window.__DROPiRecoveryOpeningOwnerEvalV1 = { ...state }
}
publish()

if (requested) {
  const style = document.createElement('style')
  style.textContent = `
    #dropi-access-choice,
    #dropi-recovery-choice,
    #dropi-recovery-film {
      position: fixed;
      inset: 0;
      z-index: 135;
      font-family: system-ui, sans-serif;
      color: #f5fbff;
    }
    #dropi-access-choice,
    #dropi-recovery-choice {
      display: none;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at 50% 28%, rgba(67,99,116,.18), transparent 32%),
        linear-gradient(180deg, #071522, #0c1c28);
    }
    #dropi-access-choice .panel,
    #dropi-recovery-choice .panel {
      width: min(680px, 88vw);
      padding: 26px;
      border-radius: 18px;
      border: 1px solid rgba(180,218,233,.34);
      background: rgba(8,27,39,.94);
      box-shadow: 0 24px 70px rgba(0,0,0,.45);
      text-align: center;
    }
    #dropi-access-choice .eyebrow,
    #dropi-recovery-choice .eyebrow {
      font-size: 10px;
      letter-spacing: .16em;
      opacity: .72;
    }
    #dropi-access-choice h2,
    #dropi-recovery-choice h2 {
      margin: 8px 0 8px;
      font-size: clamp(22px, 4vw, 38px);
    }
    #dropi-access-choice p,
    #dropi-recovery-choice p {
      margin: 0 auto 18px;
      max-width: 560px;
      color: #cfe0e8;
      font-size: 13px;
      line-height: 1.45;
    }
    #dropi-access-choice .actions,
    #dropi-recovery-choice .actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }
    #dropi-access-choice button,
    #dropi-recovery-choice button,
    #dropi-recovery-film button {
      min-width: 142px;
      min-height: 48px;
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid rgba(194,230,244,.7);
      background: #123f57;
      color: white;
      font: 800 13px/1 system-ui;
      letter-spacing: .05em;
    }
    #dropi-access-choice .secondary {
      display: block;
      margin-top: 12px;
      color: rgba(207,224,232,.72);
      font-size: 11px;
      line-height: 1.4;
    }
    #dropi-access-choice .account-note {
      display: none;
      margin: 16px auto 0;
      max-width: 560px;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid rgba(246,205,98,.3);
      background: rgba(61,44,11,.3);
      color: #f3df9f;
      font-size: 11px;
      line-height: 1.45;
    }
    #dropi-recovery-film {
      display: none;
      overflow: hidden;
      background: #050b0f;
      opacity: 1;
      transition: opacity .75s ease;
    }
    #dropi-recovery-film.handoff {
      opacity: 0;
      pointer-events: none;
    }
    #dropi-recovery-film video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: #050b0f;
    }
    #dropi-recovery-film .film-ui {
      position: absolute;
      inset: auto max(18px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) auto;
      z-index: 2;
      display: flex;
      gap: 10px;
    }
    #dropi-recovery-film .film-status {
      position: absolute;
      left: max(18px, env(safe-area-inset-left));
      bottom: max(20px, env(safe-area-inset-bottom));
      z-index: 2;
      max-width: min(58vw, 520px);
      padding: 8px 10px;
      border-radius: 9px;
      background: rgba(5,18,27,.68);
      font: 650 11px/1.35 system-ui;
    }
    #dropi-recovery-status {
      position: fixed;
      left: 50%;
      top: max(8px, env(safe-area-inset-top));
      z-index: 29;
      transform: translateX(-50%);
      padding: 6px 10px;
      border-radius: 9px;
      border: 1px solid rgba(246,205,98,.38);
      background: rgba(5,20,30,.82);
      color: #f8d773;
      font: 800 10px/1 system-ui;
      letter-spacing: .06em;
      pointer-events: none;
    }
  `
  document.head.append(style)

  const access = document.createElement('section')
  access.id = 'dropi-access-choice'
  const hasGuestProgress = Boolean(existingGuest)
  access.innerHTML = `
    <div class="panel">
      <div class="eyebrow">DROPi TYCOON · PLAYER ACCESS</div>
      <h2>Choose how you want to start</h2>
      <p>You can experience the recovery opening as a Guest without creating an online account first.</p>
      <div class="actions">
        <button type="button" data-access="guest">${hasGuestProgress ? 'CONTINUE AS GUEST' : 'CONTINUE AS GUEST'}</button>
        <button type="button" data-access="account">SIGN IN / CREATE ACCOUNT</button>
      </div>
      <span class="secondary">${hasGuestProgress
        ? 'Local Guest progress found on this device. Continuing will keep that progress.'
        : 'Guest progress is saved locally on this device and can be claimed into a registered account later.'}</span>
      <div class="account-note" data-account-note>
        Online Google/email authentication is not enabled in this owner-evaluation build yet. Continue as Guest to test the real opening. Production account creation is tracked under #772.
      </div>
    </div>
  `
  document.body.append(access)

  const choice = document.createElement('section')
  choice.id = 'dropi-recovery-choice'
  choice.innerHTML = `
    <div class="panel">
      <div class="eyebrow">OWNER EVALUATION · PRESENTATION CHOICE</div>
      <h2>Choose your protagonist</h2>
      <p>Male and Female have identical story, missions, rewards and difficulty. This evaluation choice only selects presentation for Story Film 1.</p>
      <div class="actions">
        <button type="button" data-hero="male">MALE</button>
        <button type="button" data-hero="female">FEMALE</button>
      </div>
    </div>
  `
  document.body.append(choice)

  const film = document.createElement('section')
  film.id = 'dropi-recovery-film'
  const video = document.createElement('video')
  video.preload = 'auto'
  video.playsInline = true
  video.controls = false
  video.muted = false
  video.volume = 0.9
  const filmStatus = document.createElement('div')
  filmStatus.className = 'film-status'
  filmStatus.textContent = 'Story Film 1 · Recovery Awakening'
  const filmUi = document.createElement('div')
  filmUi.className = 'film-ui'
  const playButton = document.createElement('button')
  playButton.type = 'button'
  playButton.textContent = 'PLAY FILM'
  playButton.hidden = true
  const skipButton = document.createElement('button')
  skipButton.type = 'button'
  skipButton.textContent = 'SKIP FILM'
  filmUi.append(playButton, skipButton)
  film.append(video, filmStatus, filmUi)
  document.body.append(film)

  const statusBadge = document.createElement('div')
  statusBadge.id = 'dropi-recovery-status'
  statusBadge.textContent = 'RECOVERY · ON FOOT · NO PHONE · NO GPS'
  statusBadge.hidden = true
  document.body.append(statusBadge)

  const evalControls = document.createElement('div')
  evalControls.id = 'dropi-recovery-eval-controls'
  Object.assign(evalControls.style, {
    position: 'fixed',
    right: '12px',
    top: '88px',
    zIndex: '38',
    display: 'none',
    gap: '7px',
    flexDirection: 'column',
  } satisfies Partial<CSSStyleDeclaration>)

  const replayFilmButton = document.createElement('button')
  replayFilmButton.type = 'button'
  replayFilmButton.textContent = 'REPLAY STORY FILM'
  const changeHeroButton = document.createElement('button')
  changeHeroButton.type = 'button'
  changeHeroButton.textContent = 'CHANGE HERO (EVAL)'

  for (const button of [replayFilmButton, changeHeroButton]) {
    Object.assign(button.style, {
      minHeight: '34px',
      padding: '7px 10px',
      borderRadius: '9px',
      border: '1px solid rgba(246,205,98,.45)',
      background: 'rgba(5,20,30,.82)',
      color: '#f8d773',
      font: '800 9px/1 system-ui',
      letterSpacing: '.04em',
    } satisfies Partial<CSSStyleDeclaration>)
  }

  evalControls.append(replayFilmButton, changeHeroButton)
  document.body.append(evalControls)

  const startupFinished = (): boolean => {
    const startup = sharedRuntime.__DROPiStartupCinematicV1?.status
    return !startup || ['BYPASSED', 'SKIPPED_SEEN', 'DISMISSED'].includes(startup)
  }

  const cityReady = (): boolean => sharedRuntime.__DROPiEvaluationReadiness?.status === 'READY'

  const updateObjective = (): void => {
    const objective = document.querySelector<HTMLElement>('#objective')
    if (objective) objective.textContent = OBJECTIVE
  }

  const showHeroChoice = (): void => {
    state.phase = 'CHOOSE_PRESENTATION'
    setCinematicAudio(true)
    access.style.display = 'none'
    choice.style.display = 'flex'
    publish()
  }

  const continueAsGuest = (): void => {
    const guest = ensureGuestProfile()
    state.accessMode = 'guest'
    state.guestProfileId = guest.guestId
    state.heroPresentation = guest.heroPresentation ?? initialHero
    state.filmSrc = state.heroPresentation ? FILMS[state.heroPresentation] : null
    state.filmSeen = state.heroPresentation ? readStorage(seenKey(state.heroPresentation)) === '1' : false
    access.style.display = 'none'

    if (state.heroPresentation && state.filmSeen && !forceReplay) {
      startWorkSearch()
      return
    }

    showHeroChoice()
  }

  const startWorkSearch = (): void => {
    if (!state.heroPresentation) return
    writeStorage(PRESENTATION_KEY, state.heroPresentation)
    writeStorage(seenKey(state.heroPresentation), '1')
    state.phase = 'WORK_SEARCH'
    state.filmSeen = true
    choice.style.display = 'none'
    video.pause()
    setCinematicAudio(false)
    document.documentElement.dataset.recoveryOpening = 'work-search'
    updateObjective()
    window.dispatchEvent(new CustomEvent('dropi:recovery-work-search-start'))
    publish()

    if (film.style.display !== 'none') {
      film.classList.add('handoff')
      window.setTimeout(() => {
        film.style.display = 'none'
        film.classList.remove('handoff')
        statusBadge.hidden = false
        evalControls.style.display = 'flex'
      }, 780)
    } else {
      statusBadge.hidden = false
      evalControls.style.display = 'flex'
    }
  }

  const playFilm = async (hero: HeroPresentation, replay = false): Promise<void> => {
    state.heroPresentation = hero
    state.filmSrc = FILMS[hero]
    state.filmSeen = readStorage(seenKey(hero)) === '1'
    writeStorage(PRESENTATION_KEY, hero)
    if (state.accessMode === 'guest') {
      const guest = saveGuestHero(hero)
      state.guestProfileId = guest.guestId
    }
    choice.style.display = 'none'

    if (state.filmSeen && !forceReplay && !replay) {
      startWorkSearch()
      return
    }

    state.phase = 'PLAYING_FILM_1'
    evalControls.style.display = 'none'
    statusBadge.hidden = true
    film.style.display = 'block'
    video.src = FILMS[hero]
    setCinematicAudio(true)
    publish()

    try {
      await video.play()
      playButton.hidden = true
    } catch {
      playButton.hidden = false
      filmStatus.textContent = 'Tap PLAY FILM, or skip to continue the evaluation.'
    }
  }

  for (const button of choice.querySelectorAll<HTMLButtonElement>('[data-hero]')) {
    button.addEventListener('click', () => {
      const hero = button.dataset.hero
      if (hero === 'male' || hero === 'female') void playFilm(hero)
    })
  }

  playButton.addEventListener('click', () => {
    if (!state.heroPresentation) return
    void video.play().then(() => {
      playButton.hidden = true
      filmStatus.textContent = 'Story Film 1 · Recovery Awakening'
    }).catch(() => undefined)
  })

  replayFilmButton.addEventListener('click', () => {
    if (!state.heroPresentation) return
    void playFilm(state.heroPresentation, true)
  })

  changeHeroButton.addEventListener('click', () => {
    video.pause()
    setCinematicAudio(false)
    evalControls.style.display = 'none'
    statusBadge.hidden = true
    film.style.display = 'none'
    showHeroChoice()
  })

  for (const button of access.querySelectorAll<HTMLButtonElement>('[data-access]')) {
    button.addEventListener('click', () => {
      const mode = button.dataset.access
      if (mode === 'guest') {
        continueAsGuest()
        return
      }
      if (mode === 'account') {
        state.phase = 'ACCOUNT_NOT_ENABLED'
        state.accessMode = 'account'
        const note = access.querySelector<HTMLElement>('[data-account-note]')
        if (note) note.style.display = 'block'
        publish()
      }
    })
  }

  skipButton.addEventListener('click', startWorkSearch)
  video.addEventListener('ended', startWorkSearch)
  video.addEventListener('error', () => {
    state.phase = 'FILM_1_FAILED'
    filmStatus.textContent = 'Film unavailable · continue to the first mission.'
    playButton.hidden = true
    skipButton.textContent = 'CONTINUE TO FIRST MISSION'
    publish()
  })

  const timer = window.setInterval(() => {
    if (!cityReady() || !startupFinished()) return
    window.clearInterval(timer)

    state.phase = 'ACCESS_CHOICE'
    state.accessMode = null
    setCinematicAudio(true)
    access.style.display = 'flex'
    publish()
  }, 200)

  window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true })
}
