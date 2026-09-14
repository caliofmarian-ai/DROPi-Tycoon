// Load before main.ts. This covers asynchronous asset preparation with an
// explicit loading screen; it does not fake readiness or hide terminal errors.
export {}
const root = document.documentElement
root.dataset.evaluation = 'loading'
root.dataset.diagnostics = 'closed'
const style = document.createElement('style')
style.textContent = `
  #dropi-loading-screen { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:12px; padding:24px; background:#102331; color:#eaf4f7; font:500 14px/1.5 system-ui; text-align:center; }
  #dropi-loading-screen h2 { font-size:22px; letter-spacing:.04em; margin:0; }
  #dropi-loading-screen button { padding:10px 20px; border:1px solid #84b7ce; background:#1d4960; color:white; border-radius:8px; }
  html[data-evaluation="ready"] #dropi-loading-screen { display:none; }
  html[data-evaluation="loading"] #controls, html[data-evaluation="failed"] #controls { pointer-events:none; }
  html[data-diagnostics="closed"] #telemetry,
  html[data-diagnostics="closed"] [id^="dropi-p1-"], html[data-diagnostics="closed"] [id^="dropi-p2-"], html[data-diagnostics="closed"] [id^="dropi-p3-"], html[data-diagnostics="closed"] [id^="dropi-p4-"], html[data-diagnostics="closed"] [id^="dropi-p5-"],
  html[data-diagnostics="closed"] [id^="dropi-realism-"], html[data-diagnostics="closed"] #dropi-perf-rescue-v1,
  html[data-diagnostics="closed"] #dropi-natural-control-badge { display:none !important; }
  #dropi-diagnostics-toggle { position:fixed; left:12px; top:118px; z-index:35; border:1px solid rgba(205,230,240,.4); background:rgba(5,20,30,.8); color:#eaf4f7; border-radius:7px; padding:8px 10px; font:600 10px/1.2 system-ui; }
  #dropi-check-summary { position:fixed; left:12px; top:155px; z-index:34; max-width:280px; padding:5px 8px; background:rgba(5,20,30,.65); color:#e9dba4; font:500 10px/1.3 system-ui; pointer-events:none; }
  html[data-diagnostics="closed"] #hud { max-width: min(370px, 48vw); }
  html[data-diagnostics="closed"] #hud h1 { font-size:20px; margin:3px 0; }
  #truth { max-width: min(580px, 65vw); font-size:8px; }
  @media (max-height:500px) { #dropi-diagnostics-toggle { top:100px; } #dropi-check-summary { top:135px; font-size:9px; } }
`
document.head.append(style)
const screen = document.createElement('div'); screen.id = 'dropi-loading-screen'
const title = document.createElement('h2'); title.textContent = 'DROPi TYCOON'
const progress = document.createElement('div'); progress.textContent = 'Preparing the city and characters…'
const boundary = document.createElement('small'); boundary.textContent = 'TECHNICAL VISUAL EVALUATION · NOT AUTHENTIC GAMEPLAY'
const retry = document.createElement('button'); retry.textContent = 'RETRY'; retry.hidden = true; retry.addEventListener('click', () => window.location.reload())
screen.append(title, progress, boundary, retry); document.body.append(screen)
const toggle = document.createElement('button'); toggle.id = 'dropi-diagnostics-toggle'; toggle.textContent = 'DIAGNOSTICS'; toggle.setAttribute('aria-expanded', 'false')
toggle.addEventListener('click', () => {
  const open = root.dataset.diagnostics !== 'open'; root.dataset.diagnostics = open ? 'open' : 'closed'; toggle.setAttribute('aria-expanded', String(open))
})
const summary = document.createElement('div'); summary.id = 'dropi-check-summary'
document.body.append(toggle, summary)
const started = performance.now()
let ready = false
const globals = (): Record<string, any> => window as unknown as Record<string, any>
const timer = window.setInterval(() => {
  const g = globals()
  const checks = [
    ['Hero', Boolean(g.__DROPiRiggedHeroV1?.loaded && !g.__DROPiRiggedHeroV1?.fallback)],
    ['Pedestrians', g.__DROPiHumanoidPedestrians?.visibleHumans === 8],
    ['Facades', Boolean(g.__DROPiAuthoredEnvironmentV1?.loaded)],
    ['Buildings', Boolean(g.__DROPiAuthoredBlocksV1?.loaded)],
    ['Vehicles / vegetation', Boolean(g.__DROPiAuthoredStreetLifeV1?.loaded)],
    ['Street surfaces', Boolean(g.__DROPiAuthoredStreetLayerV1?.loaded)],
    ['Materials', g.__DROPiSurfaceFinish?.status === 'ACTIVE'],
    ['Contact controller', g.__DROPiContactRuntime?.status === 'ACTIVE'],
  ] as const
  const failures = [g.__DROPiBabylonSpikeFailure?.message, g.__DROPiRiggedHeroV1?.error, g.__DROPiHumanoidPedestrians?.error, g.__DROPiAuthoredEnvironmentV1?.error, g.__DROPiAuthoredBlocksV1?.error, g.__DROPiAuthoredStreetLifeV1?.error, g.__DROPiAuthoredStreetLayerV1?.error, g.__DROPiSurfaceFinish?.error, g.__DROPiContactRuntime?.status === 'FAIL' ? g.__DROPiContactRuntime.error : ''].filter(Boolean)
  const complete = checks.every(([, ok]) => ok)
  if (!ready) {
    progress.textContent = checks.filter(([, ok]) => !ok).map(([label]) => label).join(' · ') || 'Preparing first complete frame…'
    if (failures.length || performance.now() - started > 75000) {
      root.dataset.evaluation = 'failed'; retry.hidden = false
      progress.textContent = `Loading failed: ${String(failures[0] ?? progress.textContent).slice(0, 220)}`
    } else if (complete) { ready = true; root.dataset.evaluation = 'ready' }
  }
  const mechanical = g.__DROPiContactRuntime?.mechanicalStatus ?? 'UNKNOWN'
  const resolution = g.__DROPiRenderQuality
  const sha = g.__DROPiBabylonSpike?.buildSha?.slice(0, 8) ?? '…'
  summary.textContent = `EVAL ${sha} · CONTACT ${mechanical}${resolution?.overloaded ? ' · FRAME BUDGET EXCEEDED' : ''}`
  summary.style.color = mechanical === 'FAIL' || failures.length ? '#ffb6ac' : '#e9dba4'
  g.__DROPiEvaluationReadiness = { status: ready ? 'READY' : root.dataset.evaluation === 'failed' ? 'FAIL' : 'LOADING', checks: Object.fromEntries(checks), error: failures[0] ?? '', visualAcceptance: 'UNKNOWN' }
}, 250)
window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true })
