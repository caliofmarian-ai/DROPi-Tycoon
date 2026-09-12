# Report Metadata

- Report ID: `2026-09-12_558_DT04_MOBILE_CI_DETERMINISM_AND_UNIVERSAL_GATE`
- Report title: DT-04 Mobile Shell CI determinism and universal gate
- Date: 2026-09-12
- Project: DROPi Tycoon
- Task type: CI / repository-governance implementation
- Agent/model: DT-04 — CI / RAILWAY GUARDIAN / OpenAI Codex
- Repository: `caliofmarian-ai/DROPi-Tycoon`
- Branch: `agent/dt04-mobile-ci-determinism`
- Base commit: `d11b446d916f3910ecf4f457ec13deb5ae74e181`
- Resulting functional commit: `27357dcfd939f9991030c9da125c2df2578ce81b`
- Final report-containing commit: `N/A` — the containing commit cannot record its own SHA; live reconciliation is required.
- Pull Request: #714 — `[DT-04][CI] Make Mobile Shell gate deterministic and universal`
- Human approval status: Pending review

# Original Task Instruction

> DT-00 IMPLEMENTATION MISSION. From fresh verified current main, create a scoped branch/PR that: pins expo-doctor 1.20.4 as exact game-mobile devDependency and changes doctor script to local `expo-doctor`; updates package-lock deterministically; removes `paths` filters from game-mobile-ci.yml so validate-mobile-shell runs on every PR/push to main; adds `permissions: contents: read` and workflow_dispatch. Update only necessary legal/commercial dependency evidence if existing validators require it, preserving UNKNOWN. Add required report and DT-04 handoff. Run relevant local tests/builds. Push/open PR, but DO NOT merge or change branch protection/Railway yet. Report PR/head/CI status in Romanian.

# Objective

Make the existing `validate-mobile-shell` check reproducible and present on every pull request and every push to `main`, without changing Expo runtime packages, gameplay, Android runtime behavior, branch protection, Railway, or deployment state.

# Scope

The implementation is restricted to the Mobile Shell workflow, the development-only Expo Doctor tool declaration and lockfile, this historical report, and DT-04's durable handoff object.

# Files Inspected

- `.github/workflows/game-mobile-ci.yml`
- `.github/workflows/rbatch-010-ci.yml`
- `.github/workflows/production-docker-smoke.yml`
- `game-mobile/package.json`
- `game-mobile/package-lock.json`
- `game-web/package.json`
- `game-web/Dockerfile`
- `game-web/railway.json`
- `09_Development/AI_Project_Memory/BOOTSTRAP.md`
- `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`
- `09_Development/AI_REPORTING_PROTOCOL.md`
- `09_Development/GITHUB_WORKFLOW.md`
- `09_Development/AI_Project_Memory/CURRENT_STATE.json`
- `09_Development/AI_Project_Memory/HANDOFFS.json`
- `09_Development/AI_Project_Memory/DECISIONS.md`
- `09_Development/AI_Project_Memory/UNKNOWN_BLOCKERS.md`

# Files Created

- `09_Development/AI_Reports/2026-09-12_558_DT04_MOBILE_CI_DETERMINISM_AND_UNIVERSAL_GATE.md`

# Files Modified

- `.github/workflows/game-mobile-ci.yml`
- `game-mobile/package.json`
- `game-mobile/package-lock.json`
- DT-04 object only in `09_Development/AI_Project_Memory/HANDOFFS.json`

# Files Moved or Renamed

None.

# Files Deleted

None.

# Actions Performed

1. Re-read live GitHub and verified `main` at `d11b446d916f3910ecf4f457ec13deb5ae74e181` before implementation.
2. Enumerated all 16 pull requests that were open before creation of PR #714 and reconciled the material overlap with Expo-update PRs #686, #702 and #705.
3. Created fresh-main branch `agent/dt04-mobile-ci-determinism`.
4. Added exact development dependency `expo-doctor@1.20.4` and changed `npm run doctor` to execute the lockfile-provided `expo-doctor` binary.
5. Updated `game-mobile/package-lock.json` using npm `10.9.2`; the lockfile delta contains only the root devDependency and the exact `expo-doctor@1.20.4` package record.
6. Removed workflow-level `paths` filters, limited both PR and push triggers to `main`, added `workflow_dispatch`, and added `permissions: contents: read`.
7. Opened PR #714 without enabling auto-merge or changing branch protection or Railway.

# Findings

- The previous `npx -y expo-doctor` command fetched mutable tool state and had produced contradictory results on the same application dependency set.
- The path-filtered Mobile Shell workflow left exact-current-`main` mobile evidence absent after changes outside `game-mobile/**` and `game-web/**`.
- `expo-doctor@1.20.4` is development-only. Existing commercial/provenance validation passes without changes, so no legal/commercial evidence file was modified and no `UNKNOWN` was promoted.
- PR #705 changes Expo runtime dependency patches and currently has a separate repository validation failure. PR #714 does not absorb that broader runtime dependency update.
- The production Railway service and `main` branch rules remain unchanged by this task.

# Recommendations

After PR #714 receives independent DT-00 audit and is merged, establish a protected-main ruleset with exact required checks `validate`, `validate-mobile-shell`, and `production-image-smoke`. Only after those gates are stable should Railway `Wait for CI` be enabled and its repository configuration path reconciled. These follow-up actions are not authorized inside PR #714.

# Validation Performed

- Node `22.13.0` and npm `10.9.2`: `npm ci` in `game-mobile`.
- Production-mode bundled runtime preparation and validation.
- Mobile release version/input validation.
- Mobile TypeScript validation.
- Expo public production configuration generation.
- Exact pinned `expo-doctor@1.20.4` execution.
- Node `22.12.0` and npm `10.9.2`: `npm ci` in `game-web`.
- Production dependency audit at `high` threshold.
- Full Vitest suite plus isolated replay of the one timed-out test file.
- TypeScript/Vite production build.
- Production bundle regression guard.
- Third-party inventory/notices/provenance consistency validation.
- `git diff --check`.

# Validation Results

- Mobile deterministic install: PASS.
- Bundled runtime prepare/validate: PASS.
- Release version/input validation: PASS.
- Mobile TypeScript: PASS.
- Expo public configuration generation: PASS.
- Pinned Expo Doctor: `21/21 PASS` in the initial exact-version validation. A later retry reached `19/21` solely because DNS access to `exp.host` failed; no package incompatibility was reported. Exact-head GitHub CI remains authoritative.
- Web production dependency audit: PASS, 0 vulnerabilities.
- Full Vitest first run: 156 files PASS, 3 SKIPPED, 1 timing timeout in `tests/city-domain.test.ts`; no assertion failed.
- Isolated replay of `tests/city-domain.test.ts`: PASS, 11/11 tests.
- Web TypeScript/Vite production build: PASS.
- Production bundle regression guard: PASS.
- Third-party inventory/notices/provenance consistency: PASS.
- Whitespace validation: PASS.
- Final report-containing exact-head GitHub CI: PENDING at report creation.

# Unresolved Issues

- Final exact-head results for `validate`, `validate-mobile-shell`, and `production-image-smoke` remain live mutable evidence and must be read from GitHub after the containing commit is pushed.
- External Expo API availability remains outside repository control; a genuine remote service outage can still correctly make the online diagnostics fail closed.
- `main` remains unprotected and Railway `source.checkSuites` remains `false` until a separate DT-00-authorized governance action.
- The effective Railway restart-policy evidence remains UNKNOWN; this PR does not change it.

# Final Result/Status

`IMPLEMENTED — EXACT_HEAD_CI_PENDING`

There is `NO PLAYER-VISIBLE CHANGE`. The PR changes only CI determinism, workflow coverage, and durable operational evidence.

# Follow-up Actions

1. Push the report/handoff-containing commit.
2. Re-read live `main`, PR #714 head, diff/mergeability, and exact-head checks.
3. Require `validate`, `validate-mobile-shell`, and `production-image-smoke` to be SUCCESS on the same final head.
4. Hand PR #714 to DT-00 for independent re-audit; do not self-merge or enable auto-merge.
