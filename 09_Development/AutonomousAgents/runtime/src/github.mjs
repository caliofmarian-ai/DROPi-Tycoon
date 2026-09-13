const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function encodePath(value) {
  return value.split('/').map(encodeURIComponent).join('/')
}

export class GitHubClient {
  constructor(config) {
    this.config = config
    this.owner = config.repository.owner
    this.repo = config.repository.repo
    this.base = config.githubApiBase
  }

  async request(method, path, body, { accept = 'application/vnd.github+json', allow404 = false } = {}) {
    const response = await fetch(`${this.base}${path}`, {
      method,
      headers: {
        Accept: accept,
        Authorization: `Bearer ${this.config.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'DROPi-DT00-Autonomous-Runtime',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (allow404 && response.status === 404) return null
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`GitHub ${method} ${path} failed: ${response.status} ${text.slice(0, 600)}`)
    }
    if (response.status === 204) return null
    const text = await response.text()
    return text ? JSON.parse(text) : null
  }

  repoPath(suffix = '') {
    return `/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}${suffix}`
  }

  async getMainSha() {
    const ref = await this.request('GET', this.repoPath(`/git/ref/heads/${encodePath(this.config.mainBranch)}`))
    return ref.object.sha
  }

  async listOpenIssues({ limit = 100 } = {}) {
    const data = await this.request(
      'GET',
      this.repoPath(`/issues?state=open&sort=updated&direction=desc&per_page=${Math.min(limit, 100)}`),
    )
    return data.filter((item) => !item.pull_request)
  }

  async getIssue(number) {
    return this.request('GET', this.repoPath(`/issues/${number}`))
  }

  async listIssueComments(number, { perPage = 100 } = {}) {
    return this.request('GET', this.repoPath(`/issues/${number}/comments?per_page=${perPage}`))
  }

  async ensureLabel(name, color = '6f42c1', description = 'Managed by DT-00 autonomous runtime') {
    const encoded = encodeURIComponent(name)
    const existing = await this.request('GET', this.repoPath(`/labels/${encoded}`), undefined, { allow404: true })
    if (existing) return existing
    try {
      return await this.request('POST', this.repoPath('/labels'), { name, color, description })
    } catch (error) {
      // Another runtime instance may have created it after the read.
      const retry = await this.request('GET', this.repoPath(`/labels/${encoded}`), undefined, { allow404: true })
      if (retry) return retry
      throw error
    }
  }

  async ensureRuntimeLabels() {
    const labels = [
      ['agent:eligible', '1f883d'],
      ['agent:claimed', '8250df'],
      ['agent:running', '8250df'],
      ['agent:audit', 'bf8700'],
      ['agent:rework', 'fbca04'],
      ['agent:merge-ready', '1f883d'],
      ['agent:blocked', 'd1242f'],
      ['agent:done', '1f883d'],
      ['agent:external-authority', 'd1242f'],
    ]
    for (const [name, color] of labels) await this.ensureLabel(name, color)
  }

  async addLabels(number, labels) {
    if (!labels.length) return null
    return this.request('POST', this.repoPath(`/issues/${number}/labels`), { labels })
  }

  async removeLabel(number, label) {
    return this.request(
      'DELETE',
      this.repoPath(`/issues/${number}/labels/${encodeURIComponent(label)}`),
      undefined,
      { allow404: true },
    )
  }

  async replaceAgentStateLabels(number, nextLabel) {
    const agentStateLabels = [
      'agent:eligible', 'agent:claimed', 'agent:running', 'agent:audit', 'agent:rework',
      'agent:merge-ready', 'agent:blocked', 'agent:done', 'agent:external-authority',
    ]
    for (const label of agentStateLabels) {
      if (label !== nextLabel) await this.removeLabel(number, label)
    }
    if (nextLabel) await this.addLabels(number, [nextLabel])
  }

  async comment(number, body) {
    return this.request('POST', this.repoPath(`/issues/${number}/comments`), { body })
  }

  async createIssue({ title, body, labels = [] }) {
    return this.request('POST', this.repoPath('/issues'), { title, body, labels })
  }

  async closeIssue(number) {
    return this.request('PATCH', this.repoPath(`/issues/${number}`), { state: 'closed', state_reason: 'completed' })
  }

  async openPullRequest({ title, body, head, base = this.config.mainBranch, draft = false }) {
    return this.request('POST', this.repoPath('/pulls'), { title, body, head, base, draft })
  }

  async getPullRequest(number) {
    return this.request('GET', this.repoPath(`/pulls/${number}`))
  }

  async waitForMergeability(number, timeoutMs = 120_000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const pr = await this.getPullRequest(number)
      if (pr.mergeable === true) return pr
      if (pr.mergeable === false) throw new Error(`PR #${number} is not mergeable`)
      await sleep(3000)
    }
    throw new Error(`Timed out waiting for mergeability of PR #${number}`)
  }

  async listWorkflowRunsForSha(sha, { event } = {}) {
    const query = new URLSearchParams({ head_sha: sha, per_page: '100' })
    if (event) query.set('event', event)
    const data = await this.request('GET', this.repoPath(`/actions/runs?${query}`))
    return data.workflow_runs || []
  }

  async waitForWorkflowGate(sha, { timeoutMs, event, requireAtLeastOne = true } = {}) {
    const deadline = Date.now() + timeoutMs
    let last = []
    let stableCompletedPasses = 0
    while (Date.now() < deadline) {
      last = await this.listWorkflowRunsForSha(sha, { event })
      if (last.length === 0) {
        stableCompletedPasses = 0
        await sleep(5000)
        continue
      }
      const pending = last.filter((run) => run.status !== 'completed')
      const failed = last.filter((run) => run.status === 'completed' && run.conclusion !== 'success' && run.conclusion !== 'skipped')
      if (failed.length) {
        return {
          decision: 'FAIL',
          runs: last.map(projectRun),
          failures: failed.map((run) => `${run.name}:${run.conclusion}`),
        }
      }
      if (pending.length === 0) {
        stableCompletedPasses += 1
        if (stableCompletedPasses >= 2) {
          return { decision: 'PASS', runs: last.map(projectRun), failures: [] }
        }
      } else {
        stableCompletedPasses = 0
      }
      await sleep(5000)
    }
    if (!requireAtLeastOne && last.length === 0) return { decision: 'PASS', runs: [], failures: [] }
    return {
      decision: 'UNKNOWN',
      runs: last.map(projectRun),
      failures: [`workflow gate timed out for ${sha}`],
    }
  }

  async mergePullRequest(number, expectedHeadSha, { method = 'merge' } = {}) {
    return this.request('PUT', this.repoPath(`/pulls/${number}/merge`), {
      sha: expectedHeadSha,
      merge_method: method,
      commit_title: `Autonomous DT merge PR #${number}`,
      commit_message: 'Merged by DT-00 after exact-head CI, independent audit and applicable evidence gates passed.',
    })
  }

  async deleteBranch(branch) {
    return this.request('DELETE', this.repoPath(`/git/refs/heads/${encodePath(branch)}`), undefined, { allow404: true })
  }

  async getCommit(sha) {
    return this.request('GET', this.repoPath(`/commits/${sha}`))
  }

  async claimIssue(issue, runId) {
    await this.replaceAgentStateLabels(issue.number, 'agent:claimed')
    await this.comment(
      issue.number,
      `<!-- DT00_CLAIM:${runId} -->\n🤖 **DT-00 autonomous claim**\n\nRun: \`${runId}\`\nBase reconciliation begins from current canonical \`${this.config.mainBranch}\`.`,
    )
    await this.replaceAgentStateLabels(issue.number, 'agent:running')
  }

  async blockIssue(issueNumber, reason, { externalAuthority = false } = {}) {
    await this.replaceAgentStateLabels(issueNumber, externalAuthority ? 'agent:external-authority' : 'agent:blocked')
    await this.comment(issueNumber, `🤖 **DT-00 autonomous stop**\n\nStatus: \`${externalAuthority ? 'OWNER_OR_EXTERNAL_AUTHORITY_REQUIRED' : 'BLOCKED'}\`\n\n${reason}`)
  }

  async reportToOwner(markdown) {
    return this.comment(this.config.reportIssueNumber, markdown)
  }
}

function projectRun(run) {
  return {
    id: run.id,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    event: run.event,
    head_sha: run.head_sha,
    html_url: run.html_url,
  }
}
