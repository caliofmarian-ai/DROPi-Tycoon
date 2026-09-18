export {}

type HeroPresentation = 'male' | 'female'
type RecoveryEvalPhase =
  | 'BYPASSED'
  | 'WAITING_FOR_CITY'
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
      filmSrc: string | null
      filmSeen: boolean
      noPhone: true
      noGps: true
      onFoot: true
      objective: string
    }
    __DROPiStartupCinematicV1?: {
      status?: string
    }
    __DROPiEvaluationReadiness?: {
      status?: 'LOADING' | 'READY' | 'FAIL'
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
const seenKey = (hero: HeroPresentation): string => `dropi:story:recovery-rise:v1:${hero}`

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

const storedHero = readStorage(PRESENTATION_KEY)
const initialHero: HeroPresentation | null =
  storedHero === 'male' || storedHero === 'female' ? storedHero : null

const state: NonNullable<Window['__DROPiRecoveryOpeningOwnerEvalV1']> = {
  issue: ISSUE,
  phase: requested ? 'WAITING_FOR_CITY' : 'BYPASSED',
  requested,
  heroPresentation: initialHero,
  filmSrc: initialHero ? FILMS[initialHero] : null,
  filmSeen: initialHero ? readStorage(seenKey(initialHero)) === '1' : false,
  noPhone: true,
  noGps: true,
  onFoot: true,
  objective: OBJECTIVE,
}

const publish = (): void => {
  window.__DROPiRecoveryOpeningOwnerEvalV1 = { ...state }
}
publish()

if (requested) {
  const style = document.createElement('style')
  style.textContent = `
    #dropi-recovery-choice,
    #dropi-recovery-film {
      position: fixed;
      inset: 0;
      z-index: 135;
      font-family: system-ui, sans-serif;
      color: #f5fbff;
    }
    #dropi-recovery-choice {
      display: none;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at 50% 28%, rgba(67,99,116,.18), transparent 32%),
        linear-gradient(180deg, #071522, #0c1c28);
    }
    #dropi-recovery-choice .panel {
      width: min(680px, 88vw);
      padding: 26px;
      border-radius: 18px;
      border: 1px solid rgba(180,218,233,.34);
      background: rgba(8,27,39,.94);
      box-shadow: 0 24px 70px rgba(0,0,0,.45);
      text-align: center;
    }
    #dropi-recovery-choice .eyebrow {
      font-size: 10px;
      letter-spacing: .16em;
      opacity: .72;
    }
    #dropi-recovery-choice h2 {
      margin: 8px 0 8px;
      font-size: clamp(22px, 4vw, 38px);
    }
    #dropi-recovery-choice p {
      margin: 0 auto 18px;
      max-width: 560px;
      color: #cfe0e8;
      font-size: 13px;
      line-height: 1.45;
    }
    #dropi-recovery-choice .actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }
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
    #dropi-recovery-film {
      display: none;
      overflow: hidden;
      background: #050b0f;
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

  const startupFinished = (): boolean => {
    const startup = window.__DROPiStartupCinematicV1?.status
    return !startup || ['BYPASSED', 'SKIPPED_SEEN', 'DISMISSED'].includes(startup)
  }

  const cityReady = (): boolean => window.__DROPiEvaluationReadiness?.status === 'READY'

  const updateObjective = (): void => {
    const objective = document.querySelector<HTMLElement>('#objective')
    if (objective) objective.textContent = OBJECTIVE
  }

  const startWorkSearch = (): void => {
    if (!state.heroPresentation) return
    writeStorage(PRESENTATION_KEY, state.heroPresentation)
    writeStorage(seenKey(state.heroPresentation), '1')
    state.phase = 'WORK_SEARCH'
    state.filmSeen = true
    choice.style.display = 'none'
    film.style.display = 'none'
    video.pause()
    statusBadge.hidden = false
    document.documentElement.dataset.recoveryOpening = 'work-search'
    updateObjective()
    window.dispatchEvent(new CustomEvent('dropi:recovery-work-search-start'))
    publish()
  }

  const playFilm = async (hero: HeroPresentation): Promise<void> => {
    state.heroPresentation = hero
    state.filmSrc = FILMS[hero]
    state.filmSeen = readStorage(seenKey(hero)) === '1'
    writeStorage(PRESENTATION_KEY, hero)
    choice.style.display = 'none'

    if (state.filmSeen && !forceReplay) {
      startWorkSearch()
      return
    }

    state.phase = 'PLAYING_FILM_1'
    film.style.display = 'block'
    video.src = FILMS[hero]
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

    if (initialHero && readStorage(seenKey(initialHero)) === '1' && !forceReplay) {
      state.heroPresentation = initialHero
      startWorkSearch()
      return
    }

    state.phase = 'CHOOSE_PRESENTATION'
    choice.style.display = 'flex'
    publish()
  }, 200)

  window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true })
}
