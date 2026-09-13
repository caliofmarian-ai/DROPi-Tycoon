import { mkdtemp, mkdir, rm, writeFile, chmod } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'

const PROTECTED_PREFIXES = [
  '.git/',
  '.github/',
  '09_Development/AutonomousAgents/runtime/',
  '09_Development/AI_Project_Memory/AUTONOMOUS_AGENT_POLICY.json',
  '09_Development/AUTONOMOUS_MULTI_AGENT_OPERATION.md',
]

function execFileSafe(command, args, { cwd, env = {}, input, timeoutMs = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { PATH: process.env.PATH, HOME: process.env.HOME || os.homedir(), LANG: 'C.UTF-8', ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const stdout = []
    const stderr = []
    let settled = false
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      if (!settled) reject(new Error(`${command} timed out after ${timeoutMs}ms`))
      settled = true
    }, timeoutMs)
    child.stdout.on('data', (chunk) => stdout.push(chunk))
    child.stderr.on('data', (chunk) => stderr.push(chunk))
    child.on('error', (error) => {
      clearTimeout(timer)
      if (!settled) reject(error)
      settled = true
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (settled) return
      settled = true
      const out = Buffer.concat(stdout).toString('utf8')
      const err = Buffer.concat(stderr).toString('utf8')
      if (code === 0) resolve({ stdout: out, stderr: err })
      else reject(new Error(`${command} exited ${code}: ${err.slice(0, 3000)}`))
    })
    if (input !== undefined) child.stdin.end(input)
    else child.stdin.end()
  })
}

function extractPatchPaths(patchText) {
  const paths = new Set()
  const regex = /^diff --git a\/(.+?) b\/(.+)$/gm
  let match
  while ((match = regex.exec(patchText)) !== null) {
    paths.add(match[1])
    paths.add(match[2])
  }
  return [...paths]
}

export function validatePatchScope(patchText, { allowProtectedPaths = false } = {}) {
  if (!patchText || typeof patchText !== 'string') throw new Error('Patch is empty')
  if (Buffer.byteLength(patchText, 'utf8') > 12 * 1024 * 1024) throw new Error('Patch exceeds 12 MiB runtime limit')
  const paths = extractPatchPaths(patchText)
  if (!paths.length) throw new Error('Patch contains no git diff paths')
  for (const file of paths) {
    if (file.includes('..') || file.startsWith('/') || file.includes('\0')) throw new Error(`Unsafe patch path: ${file}`)
    if (!allowProtectedPaths && PROTECTED_PREFIXES.some((prefix) => file === prefix || file.startsWith(prefix))) {
      throw new Error(`Autonomous patch touches protected control-plane path: ${file}`)
    }
  }
  return paths
}

export class GitWorkspace {
  constructor(config, issueNumber, runId) {
    this.config = config
    this.issueNumber = issueNumber
    this.runId = runId
    this.dir = null
    this.branch = `agent/issue-${issueNumber}-${runId.slice(0, 8)}`
  }

  async prepare(baseSha) {
    await mkdir(this.config.workspaceRoot, { recursive: true })
    this.dir = await mkdtemp(path.join(this.config.workspaceRoot, `issue-${this.issueNumber}-`))
    const repoUrl = `https://github.com/${this.config.repository.fullName}.git`
    await execFileSafe('git', ['clone', '--no-tags', repoUrl, this.dir], { timeoutMs: 180_000 })
    await execFileSafe('git', ['checkout', '--detach', baseSha], { cwd: this.dir })
    await execFileSafe('git', ['checkout', '-b', this.branch], { cwd: this.dir })
    await execFileSafe('git', ['config', 'user.name', 'DROPi DT-00 Autonomous Runtime'], { cwd: this.dir })
    await execFileSafe('git', ['config', 'user.email', 'dropi-autonomous@users.noreply.github.com'], { cwd: this.dir })
    return this
  }

  async applyPatch(patchText, options = {}) {
    const paths = validatePatchScope(patchText, options)
    await execFileSafe('git', ['apply', '--index', '--binary', '--whitespace=nowarn', '-'], {
      cwd: this.dir,
      input: patchText,
      timeoutMs: 120_000,
    })
    const status = await execFileSafe('git', ['status', '--porcelain=v1'], { cwd: this.dir })
    if (!status.stdout.trim()) throw new Error('Patch applied but produced no staged changes')
    return { paths, status: status.stdout.trim() }
  }

  async commit(message) {
    await execFileSafe('git', ['commit', '-m', message], { cwd: this.dir })
    const { stdout } = await execFileSafe('git', ['rev-parse', 'HEAD'], { cwd: this.dir })
    return stdout.trim()
  }

  async push() {
    const askpassDir = await mkdtemp(path.join(os.tmpdir(), 'dropi-git-auth-'))
    const askpassPath = path.join(askpassDir, 'askpass.sh')
    await writeFile(
      askpassPath,
      '#!/bin/sh\ncase "$1" in\n  *Username*) printf "%s\\n" "x-access-token" ;;\n  *Password*) printf "%s\\n" "$DT_GITHUB_TOKEN" ;;\n  *) exit 1 ;;\nesac\n',
      { mode: 0o700 },
    )
    await chmod(askpassPath, 0o700)
    try {
      await execFileSafe('git', ['push', '--set-upstream', 'origin', this.branch], {
        cwd: this.dir,
        env: {
          GIT_ASKPASS: askpassPath,
          GIT_TERMINAL_PROMPT: '0',
          DT_GITHUB_TOKEN: this.config.githubToken,
        },
        timeoutMs: 180_000,
      })
    } finally {
      await rm(askpassDir, { recursive: true, force: true })
    }
  }

  async headSha() {
    const { stdout } = await execFileSafe('git', ['rev-parse', 'HEAD'], { cwd: this.dir })
    return stdout.trim()
  }

  async cleanup() {
    if (this.dir) await rm(this.dir, { recursive: true, force: true })
  }
}
