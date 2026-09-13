type P3ShellStatus = {
  loaded: boolean
  fallback: boolean
  authoredShells: number
  error?: string
}

type P3StreetStatus = {
  loaded: boolean
  fallback: boolean
  authoredVehicles: number
  authoredTrees: number
  error?: string
}

const p3ShellState = (): P3ShellStatus | undefined =>
  (window as unknown as { __DROPiAuthoredBlocksV1?: P3ShellStatus }).__DROPiAuthoredBlocksV1

const p3StreetState = (): P3StreetStatus | undefined =>
  (window as unknown as { __DROPiAuthoredStreetLifeV1?: P3StreetStatus }).__DROPiAuthoredStreetLifeV1

const p3Badge = document.createElement('div')
p3Badge.id = 'dropi-p3-quality-family-status'
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
  const shells = p3ShellState()
  const street = p3StreetState()
  const hardError = shells?.error || street?.error

  if (hardError) {
    p3Badge.textContent = 'P3 QUALITY FAMILY · FALLBACK'
    p3Badge.style.color = '#ffb5b5'
  } else if (shells?.loaded && !shells.fallback && street?.loaded && !street.fallback) {
    p3Badge.textContent = `P3 QUALITY FAMILY · ACTIVE · ${shells.authoredShells} BLDG · ${street.authoredVehicles} CARS · ${street.authoredTrees} TREES`
    p3Badge.style.color = '#baf2c5'
  } else {
    const shellText = shells?.loaded ? `${shells.authoredShells} BLDG` : 'SHELLS…'
    const streetText = street?.loaded ? `${street.authoredVehicles} CARS · ${street.authoredTrees} TREES` : 'STREET…'
    p3Badge.textContent = `P3 QUALITY FAMILY · LOADING · ${shellText} · ${streetText}`
    p3Badge.style.color = '#ffe5a6'
  }
  window.requestAnimationFrame(renderP3Badge)
}

renderP3Badge()

export {}
