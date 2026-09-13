type P3Status = {
  loaded: boolean
  fallback: boolean
  authoredShells: number
  sourceModels: number
  hiddenProceduralDetails: number
  error?: string
}

const p3State = (): P3Status | undefined =>
  (window as unknown as { __DROPiAuthoredBlocksV1?: P3Status }).__DROPiAuthoredBlocksV1

const p3Badge = document.createElement('div')
p3Badge.id = 'dropi-p3-authored-shells-status'
Object.assign(p3Badge.style, {
  position: 'fixed',
  right: '12px',
  top: '132px',
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
document.body.append(p3Badge)

const renderP3Badge = (): void => {
  const current = p3State()
  if (!current) {
    p3Badge.textContent = 'P3 AUTHORED SHELLS · LOADING'
    p3Badge.style.color = '#ffe5a6'
  } else if (current.loaded && !current.fallback) {
    p3Badge.textContent = `P3 AUTHORED SHELLS · ACTIVE · ${current.authoredShells} BLDG`
    p3Badge.style.color = '#baf2c5'
  } else if (current.error) {
    p3Badge.textContent = 'P3 AUTHORED SHELLS · FALLBACK'
    p3Badge.style.color = '#ffb5b5'
  } else {
    p3Badge.textContent = 'P3 AUTHORED SHELLS · LOADING'
    p3Badge.style.color = '#ffe5a6'
  }
  window.requestAnimationFrame(renderP3Badge)
}

renderP3Badge()

export {}
