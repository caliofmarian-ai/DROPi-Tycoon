export {}

type StartupCinematicStatus =
  | 'BYPASSED'
  | 'SKIPPED_SEEN'
  | 'LOADING'
  | 'PLAYING'
  | 'ENDED_WAITING_FOR_GAME'
  | 'READY_TO_CONTINUE'
  | 'VIDEO_UNAVAILABLE'
  | 'DISMISSED'

declare global {
  interface Window {
    __DROPiStartupCinematicV1?: {
      issue: 769
      status: StartupCinematicStatus
      requested: boolean
      forceReplay: boolean
      seenAtStart: boolean
      gameReadiness: 'UNKNOWN' | 'LOADING' | 'READY' | 'FAIL'
      videoSrc: string
      videoEnded: boolean
      videoFailed: boolean
      dismissed: boolean
    }
    __DROPiEvaluationReadiness?: {
      status?: 'LOADING' | 'READY' | 'FAIL'
      error?: string
    }
  }
}

const ISSUE = 769 as const
const VIDEO_SRC = '/assets/cinematics/startup-world-presentation-v1.mp4'
const SEEN_KEY = 'dropi:presentation:startup-world-film:v1'

const setCinematicAudio = (active: boolean): void => {
  document.documentElement.dataset.cinematicAudio = active ? 'active' : 'gameplay'
  window.dispatchEvent(new CustomEvent('dropi:cinematic-audio-state', { detail: { active } }))
}

const installReplayButton = (): void => {
  if (document.querySelector('#dropi-replay-startup-film')) return
  const button = document.createElement('button')
  button.id = 'dropi-replay-startup-film'
  button.type = 'button'
  button.textContent = 'REPLAY INTRO'
  Object.assign(button.style, {
    position: 'fixed',
    right: '12px',
    top: '46px',
    zIndex: '38',
    minHeight: '34px',
    padding: '7px 11px',
    borderRadius: '9px',
    border: '1px solid rgba(210,239,251,.46)',
    background: 'rgba(7,36,52,.82)',
    color: '#eefaff',
    font: '800 9px/1 system-ui',
    letterSpacing: '.05em',
  } satisfies Partial<CSSStyleDeclaration>)
  button.addEventListener('click', () => {
    const next = new URL(window.location.href)
    next.searchParams.set('startupCinematic', 'force')
    window.location.href = next.toString()
  })
  document.body.append(button)
}

const query = new URLSearchParams(window.location.search)
const mode = query.get('startupCinematic')
const requested = mode === '1' || mode === 'force'
const forceReplay = mode === 'force'

const readSeen = (): boolean => {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

const writeSeen = (): void => {
  try {
    window.localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Presentation preference failure must never block gameplay.
  }
}

const seenAtStart = readSeen()
const state: NonNullable<Window['__DROPiStartupCinematicV1']> = {
  issue: ISSUE,
  status: requested ? 'LOADING' : 'BYPASSED',
  requested,
  forceReplay,
  seenAtStart,
  gameReadiness: 'UNKNOWN',
  videoSrc: VIDEO_SRC,
  videoEnded: false,
  videoFailed: false,
  dismissed: false,
}

const publish = (): void => {
  window.__DROPiStartupCinematicV1 = { ...state }
}

publish()

if (!requested) {
  state.status = 'BYPASSED'
  publish()
} else if (seenAtStart && !forceReplay) {
  state.status = 'SKIPPED_SEEN'
  installReplayButton()
  publish()
} else {
  const style = document.createElement('style')
  style.textContent = `
    #dropi-startup-cinematic {
      position: fixed;
      inset: 0;
      z-index: 140;
      overflow: hidden;
      background: #071522;
      color: #f4fbff;
      font-family: system-ui, sans-serif;
      opacity: 1;
      transition: opacity .65s ease;
    }
    #dropi-startup-cinematic.handoff {
      opacity: 0;
      pointer-events: none;
    }
    #dropi-startup-cinematic video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: #071522;
    }
    #dropi-startup-cinematic::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(180deg, rgba(4,14,24,.08) 40%, rgba(4,14,24,.68) 100%);
    }
    #dropi-startup-cinematic-ui {
      position: absolute;
      z-index: 2;
      inset: auto 0 0;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 18px;
      padding: 20px max(22px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(22px, env(safe-area-inset-left));
    }
    #dropi-startup-cinematic-copy {
      max-width: min(58vw, 560px);
      text-shadow: 0 2px 8px rgba(0,0,0,.78);
    }
    #dropi-startup-cinematic-copy strong {
      display: block;
      font-size: clamp(22px, 4.2vw, 44px);
      letter-spacing: .08em;
      line-height: 1;
    }
    #dropi-startup-cinematic-status {
      display: block;
      margin-top: 7px;
      font-size: clamp(11px, 1.8vw, 15px);
      opacity: .9;
    }
    #dropi-startup-cinematic-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    #dropi-startup-cinematic button {
      min-height: 46px;
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid rgba(210,239,251,.74);
      background: rgba(7,36,52,.88);
      color: white;
      font: 700 13px/1 system-ui;
      letter-spacing: .04em;
    }
    #dropi-startup-cinematic button[hidden] {
      display: none;
    }
  `
  document.head.append(style)

  const overlay = document.createElement('section')
  overlay.id = 'dropi-startup-cinematic'
  overlay.setAttribute('aria-label', 'DROPi Tycoon startup presentation')

  const video = document.createElement('video')
  video.id = 'dropi-startup-cinematic-video'
  video.src = VIDEO_SRC
  video.preload = 'auto'
  video.autoplay = true
  video.playsInline = true
  video.controls = false
  video.muted = false
  video.volume = 0.82

  const ui = document.createElement('div')
  ui.id = 'dropi-startup-cinematic-ui'

  const copy = document.createElement('div')
  copy.id = 'dropi-startup-cinematic-copy'
  const brand = document.createElement('strong')
  brand.textContent = 'DROPi TYCOON'
  const status = document.createElement('span')
  status.id = 'dropi-startup-cinematic-status'
  status.textContent = 'Preparing Brăila…'
  copy.append(brand, status)

  const actions = document.createElement('div')
  actions.id = 'dropi-startup-cinematic-actions'

  const playButton = document.createElement('button')
  playButton.type = 'button'
  playButton.textContent = 'PLAY INTRO'
  playButton.hidden = true

  const continueButton = document.createElement('button')
  continueButton.type = 'button'
  continueButton.textContent = 'CONTINUE TO GAME'
  continueButton.hidden = true

  actions.append(playButton, continueButton)
  ui.append(copy, actions)
  overlay.append(video, ui)
  document.body.append(overlay)

  const gameStatus = (): 'UNKNOWN' | 'LOADING' | 'READY' | 'FAIL' => {
    const current = window.__DROPiEvaluationReadiness?.status
    return current === 'LOADING' || current === 'READY' || current === 'FAIL'
      ? current
      : 'UNKNOWN'
  }

  const dismiss = (): void => {
    if (state.dismissed) return
    state.dismissed = true
    state.status = 'DISMISSED'
    writeSeen()
    video.pause()
    setCinematicAudio(false)
    overlay.classList.add('handoff')
    publish()
    window.setTimeout(() => {
      overlay.remove()
      installReplayButton()
    }, 680)
  }

  const attemptPlay = async (): Promise<void> => {
    setCinematicAudio(true)
    try {
      await video.play()
      playButton.hidden = true
      state.status = state.gameReadiness === 'READY' ? 'READY_TO_CONTINUE' : 'PLAYING'
      publish()
    } catch {
      playButton.hidden = false
      status.textContent = 'Tap PLAY INTRO, or continue when the city is ready.'
    }
  }

  playButton.addEventListener('click', () => {
    void attemptPlay()
  })

  continueButton.addEventListener('click', dismiss)

  video.addEventListener('playing', () => {
    state.status = state.gameReadiness === 'READY' ? 'READY_TO_CONTINUE' : 'PLAYING'
    publish()
  })

  video.addEventListener('ended', () => {
    state.videoEnded = true
    if (state.gameReadiness === 'READY') {
      state.status = 'READY_TO_CONTINUE'
      status.textContent = 'Brăila is ready.'
      continueButton.hidden = false
    } else {
      state.status = 'ENDED_WAITING_FOR_GAME'
      status.textContent = 'Film complete · finishing the city…'
    }
    publish()
  })

  video.addEventListener('error', () => {
    state.videoFailed = true
    state.status = state.gameReadiness === 'READY' ? 'READY_TO_CONTINUE' : 'VIDEO_UNAVAILABLE'
    video.hidden = true
    playButton.hidden = true
    status.textContent = state.gameReadiness === 'READY'
      ? 'Brăila is ready.'
      : 'Preparing the city…'
    continueButton.hidden = state.gameReadiness !== 'READY'
    publish()
  })

  const readinessTimer = window.setInterval(() => {
    state.gameReadiness = gameStatus()

    if (state.gameReadiness === 'FAIL') {
      window.clearInterval(readinessTimer)
      video.pause()
      setCinematicAudio(false)
      overlay.remove()
      publish()
      return
    }

    if (state.gameReadiness === 'READY') {
      continueButton.hidden = false
      state.status = 'READY_TO_CONTINUE'
      status.textContent = state.videoEnded || state.videoFailed
        ? 'Brăila is ready.'
        : 'Game ready · continue when you want.'
      publish()
    } else if (!state.videoEnded && !state.videoFailed) {
      status.textContent = 'Preparing Brăila…'
    }
  }, 200)

  window.addEventListener('pagehide', () => {
    window.clearInterval(readinessTimer)
  }, { once: true })

  void attemptPlay()
}
