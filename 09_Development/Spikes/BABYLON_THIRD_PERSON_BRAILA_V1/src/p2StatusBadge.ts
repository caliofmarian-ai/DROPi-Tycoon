type P2EnvironmentStatus = {
  loaded: boolean
  fallback: boolean
  buildingsUpgraded: number
  authoredWindows: number
  authoredDoors: number
  error?: string
}

const state = (): P2EnvironmentStatus | undefined =>
  (window as unknown as { __DROPiAuthoredEnvironmentV1?: P2EnvironmentStatus }).__DROPiAuthoredEnvironmentV1

const badge = document.createElement('div')
badge.id = 'dropi-p2-environment-status'
Object.assign(badge.style, {
  position: 'fixed',
  right: '12px',
  top: '110px',
  zIndex: '21',
  padding: '5px 8px',
  borderRadius: '8px',
  background: 'rgba(7,20,28,.76)',
  border: '1px solid rgba(255,255,255,.14)',
  color: '#ffe5a6',
  font: '800 8px/1 system-ui',
  letterSpacing: '.05em',
  pointerEvents: 'none',
} satisfies Partial<CSSStyleDeclaration>)
document.body.append(badge)

const render = (): void => {
  const current = state()
  if (!current) {
    badge.textContent = 'P2 AUTHORED CITY · LOADING'
    badge.style.color = '#ffe5a6'
  } else if (current.loaded && !current.fallback) {
    badge.textContent = `P2 AUTHORED CITY · ACTIVE · ${current.buildingsUpgraded} BLDG · ${current.authoredWindows} WINDOWS`
    badge.style.color = '#baf2c5'
  } else if (current.error) {
    badge.textContent = 'P2 AUTHORED CITY · FALLBACK'
    badge.style.color = '#ffb5b5'
  } else {
    badge.textContent = 'P2 AUTHORED CITY · LOADING'
    badge.style.color = '#ffe5a6'
  }
  window.requestAnimationFrame(render)
}

render()

export {}
