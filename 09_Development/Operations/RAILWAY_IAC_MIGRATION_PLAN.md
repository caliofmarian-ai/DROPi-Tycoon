# Railway Infrastructure as Code Migration Plan

Issue: #550
Owner lane: DT-04 CI / Railway Guardian
Status: PLAN ONLY — NOT AUTHORIZED FOR APPLY
Prepared against repository `main` `65413103c7ae4e1951ac63aacc8e1232643e0bd0` on 2026-09-09.

## 1. Objective

Migrate the existing canonical DROPi Tycoon Railway production service from deprecated per-service Config as Code (`game-web/railway.json`) to Railway project-level Infrastructure as Code (`.railway/railway.ts`) without creating, replacing, duplicating, or deleting Railway resources.

This document is deliberately plan-first. It does not authorize `railway config migrate --apply`, `railway config apply`, dashboard mutations, source changes, secret changes, new resources, or a deployment.

Railway documentation currently states that legacy `railway.json` / `railway.toml` Config as Code stops being read on 2026-12-01. Railway TypeScript IaC in `.railway/railway.ts` is the supported replacement.

Official references:

- https://docs.railway.com/infrastructure-as-code
- https://docs.railway.com/config-as-code
- https://docs.railway.com/deployments/healthchecks
- https://docs.railway.com/deployments/restart-policy

## 2. Canonical resources that must not change

| Resource | Canonical value |
| --- | --- |
| Workspace | `caliofmarian-ai's Projects` |
| Project | `DROPi-Tycoon` |
| Project ID | `5dbea950-2484-46e2-a64d-3040b8d42f3c` |
| Environment | `production` |
| Environment ID | `09e4bb35-9330-4191-b907-e2c45855ef5f` |
| Service | `DROPi-Tycoon` |
| Service ID | `27e4ba12-d290-4df9-b711-092be032a9f8` |
| Source repository | `caliofmarian-ai/DROPi-Tycoon` |
| Source branch | `main` |
| Root directory | `/game-web` |
| Canonical public domain | `dropi-tycoon-production.up.railway.app` |
| Public target port | `8080` |
| Private network endpoint | `dropi-tycoon` |
| Current region | `europe-west4-drams3a` |
| Current replicas | `1` |

No migration plan is acceptable if it proposes a new project, new environment, new service, new generated public domain, replacement of any resource above, or a change away from the canonical GitHub source and `main` branch.

## 3. Verified live baseline

The Railway project was inspected directly before this plan was created.

At the inspection checkpoint:

- environment staged changes: none;
- environment unmerged changes: none reported;
- service count in production: one canonical `DROPi-Tycoon` service;
- attached volumes: none;
- buckets: none;
- latest deployment: `f019a2a4-c11e-4d91-9c1e-36d946b408ed`;
- latest deployment status: `SUCCESS`;
- latest deployment commit: `65413103c7ae4e1951ac63aacc8e1232643e0bd0`;
- latest deployment branch: `main`;
- runtime command observed: `npm run start` -> `node server/server.mjs`;
- runtime listener observed: `0.0.0.0:8080`;
- canonical `/` requests observed returning HTTP 200;
- no new fatal runtime error was observed in the inspected deployment logs.

The latest build log proves that the deployment actually loaded `game-web/Dockerfile` and built the current Node 22.12.0 image.

The latest build/deploy log also proves that Railway ran the configured deployment healthcheck:

- path: `/api/authority/status`;
- retry window: 60 seconds;
- result: `Healthcheck succeeded!` on the first attempt.

This is the production behavior the migration must preserve.

## 4. Current two-source configuration behavior

The service currently has two relevant configuration layers.

### 4.1 Railway dashboard/service state

Direct service inspection currently reports:

- source: GitHub `caliofmarian-ai/DROPi-Tycoon` on `main`;
- root: `/game-web`;
- dashboard build model: `RAILPACK` with `npm run build`;
- dashboard start command: `npm run start`;
- runtime: V2;
- one replica in `europe-west4-drams3a`;
- canonical public domain on port 8080.

The direct settings representation does not show the healthcheck/restart configuration carried by the legacy repository Config as Code file.

### 4.2 Repository Config as Code

`game-web/railway.json` currently contains:

- build builder: `DOCKERFILE`;
- Dockerfile path: `Dockerfile`;
- healthcheck path: `/api/authority/status`;
- healthcheck timeout: `60` seconds;
- restart policy: `ON_FAILURE`;
- maximum restart retries: `3`.

This is not evidence of a broken production service. Railway documents that legacy Config as Code is evaluated during deployment and overrides dashboard values without updating the dashboard settings view. The latest deployment logs confirm that the Dockerfile and healthcheck overrides are active.

The migration must collapse this into one governed IaC source without accidentally reverting to the dashboard's different build/deploy defaults.

## 5. Migration safety invariants

Every preview, generated file, plan, and eventual apply must satisfy all of these invariants.

1. Existing project ID remains `5dbea950-2484-46e2-a64d-3040b8d42f3c`.
2. Existing production environment ID remains `09e4bb35-9330-4191-b907-e2c45855ef5f`.
3. Existing service ID remains `27e4ba12-d290-4df9-b711-092be032a9f8`.
4. Existing Railway-generated domain remains `dropi-tycoon-production.up.railway.app`.
5. Source remains `caliofmarian-ai/DROPi-Tycoon`, branch `main`.
6. Root remains `/game-web`.
7. Build continues to use `game-web/Dockerfile`; it must not silently switch to an unintended Railpack build.
8. Start behavior remains compatible with the Docker image and current `npm run start` / `node server/server.mjs` runtime.
9. Healthcheck remains `/api/authority/status` with a 60-second deployment window.
10. Restart behavior remains `ON_FAILURE`, maximum retries `3` unless a separately reviewed Railway limitation requires an explicit change.
11. Replica count remains one in `europe-west4-drams3a` unless a separately approved scaling change exists.
12. No variable is deleted, decrypted into source, or rotated as part of the migration.
13. No volume, bucket, domain, service, environment, or project is created or destroyed.
14. No stale branch is deployed.
15. No gameplay, economy, world, mission, Android, or product behavior is modified by this migration.

## 6. Required change freeze

The actual migration must run inside a short central-orchestrator change freeze.

Reason: Railway documents that a service cannot be managed by Config as Code and IaC at the same time. The migration step that clears the legacy Config File setting is therefore a state transition. An unrelated `main` merge during the transition could trigger a deployment while the configuration sources are being switched.

Before any mutating migration command:

- central orchestrator explicitly pauses merges that would trigger Railway deployment;
- confirm no Railway deployment is BUILDING, DEPLOYING, QUEUED, or NEEDS_APPROVAL;
- confirm `stagedChanges` is empty;
- record current `main` SHA and latest successful Railway deployment ID;
- record current service/environment/project IDs again;
- confirm canonical domain is responding;
- confirm the latest deployment healthcheck succeeded.

The freeze ends only after the approved migration/apply is complete and the canonical service has deployed and passed verification.

## 7. Phase A — safe preparation before owner approval

These steps are read-only or local-preview work. They do not authorize an infrastructure apply.

### A1. Use a clean checkout

Start from the exact latest `main` selected by the central orchestrator. Do not reuse a stale agent checkout.

Record:

```text
git rev-parse HEAD
railway --version
```

Use the same Railway CLI version for the reviewed migration preview and the later approved execution. Railway notes that generated TypeScript formatting can change between CLI versions.

### A2. Link only to the existing canonical resources

The working directory must link to the existing project/environment/service by ID. Never run project/service/environment creation commands.

Expected targeting values:

```text
project     5dbea950-2484-46e2-a64d-3040b8d42f3c
environment 09e4bb35-9330-4191-b907-e2c45855ef5f
service     27e4ba12-d290-4df9-b711-092be032a9f8
```

A suitable non-creative link command is:

```bash
railway link \
  --project 5dbea950-2484-46e2-a64d-3040b8d42f3c \
  --environment 09e4bb35-9330-4191-b907-e2c45855ef5f \
  --service 27e4ba12-d290-4df9-b711-092be032a9f8 \
  --json
```

Stop if Railway resolves any different project, environment, or service.

### A3. Preview Railway's migration generator only

Because this repository has one canonical Railway service, prefer the project-level migration form rather than a single-service named partial:

```bash
railway config migrate
```

Railway documents this command as a preview of the generated authoring file. Do not add `--apply` in Phase A.

The preview must be reviewed against Sections 2, 3, 4, and 5 of this document.

### A4. Secret handling

Do not use `--include-variables`.

Railway's importer uses `preserve()` for existing variable values by default so values stay on Railway instead of being written into source. Any generated preview or later authoring file must preserve that behavior.

No plan transcript containing secret values may be committed to GitHub.

### A5. Expected preview shape

The migration should produce one project-level TypeScript authoring file:

```text
.railway/railway.ts
```

The generated representation must describe the existing canonical service rather than a new service. It must preserve the deployment-effective Dockerfile/healthcheck/restart behavior, not merely copy the dashboard defaults that legacy Config as Code currently overrides.

If the preview cannot represent an invariant above, stop and investigate before requesting owner approval.

## 8. Owner approval gate A — authorize the source-of-truth transition

`railway config migrate --apply` is a mutating operation. Railway documents that it writes the IaC file and clears Railway Config File settings. It must not be run from this plan-only PR and must not be run without explicit owner approval.

After owner approval and only during the change freeze, the intended command is:

```bash
railway config migrate --apply
```

Do not use `--delete-files` in this first controlled transition. Retire `game-web/railway.json` through the reviewed migration branch after the generated IaC file has been inspected.

Immediately after the command:

1. inspect `.railway/railway.ts`;
2. inspect the Git diff;
3. confirm no secret values were written;
4. re-read live Railway state;
5. confirm no resource was created/deleted;
6. confirm no deployment was unintentionally triggered;
7. keep the merge/deploy freeze active.

If any invariant is violated, stop. Do not continue to `railway config apply`.

## 9. Migration branch contents after gate A

The implementation PR produced during the approved migration window should contain only the files necessary to establish the new source of truth, expected to include:

- `.railway/railway.ts` generated/imported from the existing canonical project and reviewed by DT-04;
- Railway-generated `.railway/README.md` if the CLI creates it and it contains no sensitive/local-only data;
- removal of `game-web/railway.json` once the IaC representation is verified;
- focused migration evidence/documentation updates.

Do not commit local Railway authentication/link state, tokens, decrypted variables, saved credentials, plan files containing sensitive content, unrelated generated files, or product changes.

## 10. Phase B — plan the exact infrastructure delta

Railway documents that `railway config plan` is read-only and does not apply changes.

After the legacy Config as Code ownership has been cleared during the approved transition and the IaC file has been generated, run:

```bash
railway config plan
railway config plan --json
railway config plan --detailed-exit-code
```

For a saved review artifact if required:

```bash
railway config plan --out railway-plan.json
```

Do not use `--show-values` for production review evidence.

### Mandatory plan acceptance

The reviewed plan must show:

```text
resources to add:     0
resources to destroy: 0
```

Changes are acceptable only when they are the intentional transfer of existing canonical service settings into IaC ownership.

Reject the plan if it proposes any of the following:

- create service/environment/project/domain;
- delete service/environment/project/domain;
- replace the canonical service;
- disconnect/reconnect the GitHub source unexpectedly;
- change `main` to another branch;
- change `/game-web` root;
- remove Dockerfile build behavior;
- remove `/api/authority/status` healthcheck;
- remove or weaken the intentional restart policy;
- delete or expose variables;
- change replica/region unintentionally;
- delete unrelated resources;
- deploy a stale commit.

A plan with any unexpected add/destroy operation is an automatic STOP condition, not a prompt to continue with `--confirm-destructive`.

## 11. Owner approval gate B — infrastructure apply

Even after a clean plan, `railway config apply` remains prohibited until the owner explicitly approves the reviewed plan.

The preferred controlled path is to pin the reviewed plan and apply that exact plan so drift is rejected:

```bash
railway config plan --out railway-plan.json
railway config apply --plan railway-plan.json --yes
```

Do not pass `--confirm-destructive` for this migration. A migration that requires destructive confirmation violates this plan and must be stopped/reworked.

Railway documents that saved plans fail if the live configuration etag changes or the `.railway/` tree no longer matches the planned tree. Treat such a failure as a safety success: re-read state and re-plan rather than forcing the apply.

## 12. Post-apply verification gate

After an owner-approved apply, verify all of the following before ending the change freeze.

### Identity and topology

- same project ID;
- same production environment ID;
- same service ID;
- same single canonical service;
- same generated public domain;
- no duplicate domain;
- no duplicate environment;
- no duplicate service;
- no unexpected staged changes.

### Source/build/deploy

- source repo remains `caliofmarian-ai/DROPi-Tycoon`;
- branch remains `main`;
- root remains `/game-web`;
- deployment is for the intended current `main` SHA;
- build log loads `game-web/Dockerfile`;
- runtime starts successfully;
- healthcheck runs against `/api/authority/status`;
- healthcheck succeeds before traffic switch;
- restart policy remains effective;
- one replica remains in the intended region.

### Runtime/network

- canonical `/` returns HTTP 200;
- canonical game assets return successfully;
- `/api/authority/status` returns 2xx;
- no new fatal runtime errors;
- no new upstream/proxy errors caused by migration.

### Repository

- `game-web/railway.json` is retired only after `.railway/railway.ts` is the reviewed source of truth;
- no secrets are present in Git history;
- CI remains green;
- Docker smoke remains green;
- migration evidence records IDs, SHAs, plan counts, deployment ID, and healthcheck result without recording secret values.

## 13. Rollback / abort rules

This migration prioritizes preserving the existing canonical service over completing the migration quickly.

Abort before apply if:

- project/environment/service identity differs;
- Railway is already staging unrelated infrastructure changes;
- a deployment is in progress;
- migration preview references a new service rather than the existing service;
- generated IaC omits deployment-effective Dockerfile, healthcheck, or restart behavior;
- variables are rendered as plaintext unexpectedly;
- plan contains any add/destroy operation;
- plan changes source branch/root/domain/region/replicas unexpectedly;
- repository `main` changes after the plan is reviewed;
- Railway live config changes after the plan is reviewed.

If a saved plan is rejected because of drift, do not bypass the protection. Re-inspect the canonical resources and produce a new plan.

If an owner-approved apply succeeds but the subsequent deployment fails, do not create replacement Railway resources. Preserve the project/service/environment/domain IDs, inspect logs, and revert only the migration-owned configuration necessary to restore the last known-good canonical behavior.

## 14. Explicitly prohibited commands/actions during plan-first work

Until owner approval, do not run:

```text
railway config migrate --apply
railway config apply
railway config apply --yes
railway config apply --confirm-destructive
railway config migrate --apply --delete-files
railway add
railway init
railway environment new
railway domain
railway service source connect
railway service source disconnect
railway delete
```

Also do not use Railway dashboard actions that create, replace, delete, disconnect, or redeploy infrastructure as a substitute for this reviewed process.

## 15. Current checkpoint verdict

The production service is healthy and correctly serving the central-orchestrator `main` checkpoint. The legacy Config as Code file is still actively providing deployment-effective Dockerfile and healthcheck settings, so it must not simply be deleted.

The safe next step is not an infrastructure apply. The safe next step is owner review of this plan, followed by a controlled change freeze and Railway CLI migration preview/execution against the exact existing resource IDs.

Issue #550 remains open until the owner-approved migration is actually applied and post-migration production verification passes.
