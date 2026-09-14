// Load before main.ts: readiness comes from the actual assets and rendered pose.
export {}
const root = document.documentElement
root.dataset.evaluation = 'loading'; root.dataset.diagnostics = 'closed'
const style = document.createElement('style')
style.textContent = `
  #dropi-loading-screen { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:12px; padding:24px; background:#102331; color:#eaf4f7; font:500 14px/1.5 system-ui; text-align:center; }
  #dropi-loading-screen h2 { font-size:22px; letter-spacing:.04em; margin:0; }
  #dropi-loading-screen button { padding:10px 20px; border:1px solid #84b7ce; background:#1d4960; color:white; border-radius:8px; }
  html[data-evaluation="ready"] #dropi-loading-screen { display:none; }
  html:not([data-evaluation="ready"]) #controls { pointer-events:none; }
  html[data-diagnostics="closed"] #telemetry,
  html[data-diagnostics="closed"] [id^="dropi-p1-"], html[data-diagnostics="closed"] [id^="dropi-p2-"], html[data-diagnostics="closed"] [id^="dropi-p3-"], html[data-diagnostics="closed"] [id^="dropi-p4-"], html[data-diagnostics="closed"] [id^="dropi-p5-"],
  html[data-diagnostics="closed"] [id^="dropi-realism-"], html[data-diagnostics="closed"] #dropi-perf-rescue-v1,
  html[data-diagnostics="closed"] #dropi-natural-control-badge,
  html[data-diagnostics="closed"] #dropi-camera-authority-help,
  html[data-diagnostics="closed"] #hud .eyebrow { display:none !important; }
  html[data-diagnostics="closed"] #hud { top:10px !important; left:10px !important; width:min(38vw,310px) !important; max-width:38vw !important; padding:8px 11px !important; border-radius:10px !important; }
  html[data-diagnostics="closed"] #hud h1 { font-size:14px !important; letter-spacing:.06em !important; margin:0 0 5px !important; }
  html[data-diagnostics="closed"] #objective { font-size:12px !important; line-height:1.25 !important; }
  html[data-diagnostics="closed"] #truth { position:fixed !important; top:auto !important; bottom:4px !important; left:50% !important; right:auto !important; transform:translateX(-50%) !important; width:46vw !important; max-width:520px !important; font:600 7px/1.2 system-ui !important; letter-spacing:.02em !important; text-align:center !important; padding:3px 6px !important; border-radius:5px !important; pointer-events:none !important; }
  html[data-diagnostics="closed"] #dropi-gps:not(.expanded) { top:10px !important; width:160px !important; padding:6px !important; backdrop-filter:none !important; }
  html[data-diagnostics="closed"] #dropi-gps:not(.expanded) canvas { height:85px !important; }
  html[data-diagnostics="closed"] #dropi-next-turn { top:12px !important; min-width:70px !important; font-size:10px !important; padding:6px !important; }
  #dropi-diagnostics-toggle { position:fixed; left:10px; top:100px; z-index:35; border:1px solid rgba(205,230,240,.4); background:rgba(5,20,30,.8); color:#eaf4f7; border-radius:7px; padding:8px 10px; font:600 9px/1.2 system-ui; }
  #dropi-check-summary { position:fixed; left:10px; top:136px; z-index:34; max-width:230px; padding:4px 6px; background:rgba(5,20,30,.65); color:#e9dba4; font:500 8px/1.3 system-ui; pointer-events:none; }
  html[data-diagnostics="open"] #dropi-camera-authority-help { position:fixed; bottom:30px; left:30%; padding:5px; background:#102331; color:white; font:500 9px/1.3 system-ui; }
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
const summary = document.createElement('div'); summary.id = 'dropi-check-summary'; document.body.append(toggle, summary)
const started = performance.now()
let ready = false, failed = false
const globals = (): Record<string, any> => window as unknown as Record<string, any>
const timer = window.setInterval(() => {
  const g = globals(), contact = g.__DROPiContactRuntime
  const checks = [
    ['Hero', Boolean(g.__DROPiRiggedHeroV1?.loaded && !g.__DROPiRiggedHeroV1?.fallback)],
    ['Pedestrians', g.__DROPiHumanoidPedestrians?.visibleHumans === 8],
    ['Facades', Boolean(g.__DROPiAuthoredEnvironmentV1?.loaded)],
    ['Buildings', Boolean(g.__DROPiAuthoredBlocksV1?.loaded)],
    ['Vehicles / vegetation', Boolean(g.__DROPiAuthoredStreetLifeV1?.loaded)],
    ['Street surfaces', Boolean(g.__DROPiAuthoredStreetLayerV1?.loaded)],
    ['Materials', g.__DROPiSurfaceFinish?.status === 'ACTIVE'],
    ['Contact controller', contact?.status === 'ACTIVE' && contact.renderedSampleId > 0 && contact.mechanicalStatus === 'PASS'],
  ] as const
  const failures = [g.__DROPiBabylonSpikeFailure?.message, g.__DROPiRiggedHeroV1?.error, g.__DROPiHumanoidPedestrians?.error, g.__DROPiAuthoredEnvironmentV1?.error, g.__DROPiAuthoredBlocksV1?.error, g.__DROPiAuthoredStreetLifeV1?.error, g.__DROPiAuthoredStreetLayerV1?.error, g.__DROPiSurfaceFinish?.error, contact?.status === 'FAIL' ? contact.error || 'Contact controller failed' : ''].filter(Boolean)
  const complete = checks.every(([, ok]) => ok)
  if (failures.length || (!ready && performance.now() - started > 75000)) {
    failed = true; ready = false; root.dataset.evaluation = 'failed'; retry.hidden = false
    progress.textContent = `Evaluation failed: ${String(failures[0] ?? checks.filter(([,ok]) => !ok).map(([label]) => label).join(' · ')).slice(0,220)}`
  } else if (!failed && !ready) {
    progress.textContent = checks.filter(([, ok]) => !ok).map(([label]) => label).join(' · ') || 'Preparing first complete frame…'
    if (complete) { ready = true; root.dataset.evaluation = 'ready' }
  }
  const mechanical = contact?.mechanicalStatus ?? 'UNKNOWN', resolution = g.__DROPiRenderQuality
  const sha = g.__DROPiBabylonSpike?.buildSha?.slice(0, 8) ?? '…'
  summary.textContent = `EVAL ${sha} · CONTACT ${mechanical}${resolution?.overloaded ? ' · FRAME BUDGET EXCEEDED' : ''}`
  summary.style.color = mechanical === 'FAIL' || failed ? '#ffb6ac' : '#e9dba4'
  g.__DROPiEvaluationReadiness = { status: failed ? 'FAIL' : ready ? 'READY' : 'LOADING', checks: Object.fromEntries(checks), error: failures[0] ?? '', visualAcceptance: 'UNKNOWN' }
}, 250)
window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true })
