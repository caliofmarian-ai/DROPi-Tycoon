import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const renderedGate = fileURLToPath(new URL('./verifyRenderedEvaluation.mjs', import.meta.url))
const evidencePath = path.resolve('dist/evidence/verification.json')

const runGate = () => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [renderedGate], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // GitHub-hosted runners can expose an unusable session-bus address.
      // Chrome does not need D-Bus for this headless software-WebGL gate.
      DBUS_SESSION_BUS_ADDRESS: 'unix:path=/tmp/dropi-headless-no-dbus',
    },
  })
  child.once('error', reject)
  child.once('exit', code => resolve(code ?? 1))
})

let exitCode = await runGate()
if (exitCode === 0) process.exit(0)

let retryableStartupFailure = false
try {
  const evidence = JSON.parse(await readFile(evidencePath, 'utf8'))
  retryableStartupFailure = String(evidence.error ?? '').includes('Browser did not start:')
} catch {
  // Missing/invalid evidence is not a retryable rendered regression.
}

if (!retryableStartupFailure) process.exit(exitCode)

console.warn('Rendered gate hit a transient Chrome startup failure; retrying once with a fresh browser profile.')
await new Promise(resolve => setTimeout(resolve, 2000))
exitCode = await runGate()
process.exit(exitCode)
