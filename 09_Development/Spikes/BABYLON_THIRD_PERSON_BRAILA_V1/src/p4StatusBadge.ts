type P4Status = {
  loaded: boolean
  fallback: boolean
  roadSegments: number
  intersections: number
  streetProps: number
  lookTuned: boolean
  error?: string
}

const p4State = (): P4Status | undefined =>
  (window as unknown as { __DROPiAuthoredStreetLayerV1?: P4Status }).__DROPiAuthoredStreetLayerV1

const p4Badge = document.createElement('div')
p4Badge.id = 'dropi-p4-street-layer-status'
Object.assign(p4Badge.style, {
  position: 'fixed',
  right: '12px',
  top: '154px',
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
document.body.append(p4Badge)

const renderP4Badge = (): void => {
  const current = p4State()
  if (!current) {
    p4Badge.textContent = 'P4 AUTHORED STREET · LOADING'
    p4Badge.style.color = '#ffe5a6'
  } else if (current.loaded && !current.fallback) {
    p4Badge.textContent = `P4 AUTHORED STREET · ACTIVE · ${current.roadSegments} ROAD · ${current.streetProps} PROPS`
    p4Badge.style.color = '#baf2c5'
  } else if (current.error) {
    p4Badge.textContent = 'P4 AUTHORED STREET · FALLBACK'
    p4Badge.style.color = '#ffb5b5'
  } else {
    p4Badge.textContent = 'P4 AUTHORED STREET · LOADING'
    p4Badge.style.color = '#ffe5a6'
  }
  window.requestAnimationFrame(renderP4Badge)
}

renderP4Badge()

export {}
