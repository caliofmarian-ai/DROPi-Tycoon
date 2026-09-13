type RiggedHeroStatus = {
  loaded: boolean
  fallback: boolean
  animation: string
  heightM: number | null
  error?: string
}

const state = (): RiggedHeroStatus | undefined =>
  (window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroStatus }).__DROPiRiggedHeroV1

const badge = document.createElement('div')
badge.id = 'dropi-p1-rigged-status'
Object.assign(badge.style, {
  position: 'fixed',
  right: '12px',
  top: '88px',
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
    badge.textContent = 'P1 RIGGED HERO · LOADING'
    badge.style.color = '#ffe5a6'
  } else if (current.loaded && !current.fallback) {
    const height = current.heightM === null ? '' : ` · ${current.heightM.toFixed(2)}m`
    badge.textContent = `P1 RIGGED HERO · ACTIVE · ${current.animation}${height}`
    badge.style.color = '#baf2c5'
  } else if (current.error) {
    badge.textContent = 'P1 RIGGED HERO · FALLBACK'
    badge.style.color = '#ffb5b5'
  } else {
    badge.textContent = 'P1 RIGGED HERO · LOADING'
    badge.style.color = '#ffe5a6'
  }
  window.requestAnimationFrame(render)
}

render()

export {}
