# AI Report 093 — RBATCH-013 Bicycle Ownership + Speed Increase Implementation

Date: 2026-09-01
Repository: `caliofmarian-ai/DROPi-Tycoon`
Batch: RBATCH-013
Epic: E-014 — Bicycle Ownership System
Milestone: M-006 — Company Management & Bicycle
Executable issues: ISSUE-012 / #198, ISSUE-013 / #199
Pull request: #257
Implementation branch: `openai/rbatch-013-bicycle-speed`
Base: `main` at `1b61399a4f169397d3a1525f50948a76ca84b1e5` (RBATCH-012 merge)
Status at report creation: implementation and planning validation complete; pending final report-head CI and merge

---

## 1. Objective

RBATCH-013 implements the Prototype v0.1 Bicycle ownership effect without creating a parallel vehicle model or entering Save/Load scope.

The canonical requirements are:

- the player starts on foot;
- the Bicycle is the first purchasable vehicle;
- Bicycle ownership is represented through the approved purchased-upgrade state;
- Bicycle ownership increases player movement speed;
- advanced vehicle mechanics remain out of scope.

The canonical material does not prescribe an exact numeric Bicycle speed. Therefore the implementation uses centralized, replaceable balancing values rather than embedding a fixed number in scene logic.

---

## 2. Implemented runtime behavior

### Ownership

`game-web/src/systems/bicycleSystem.ts` introduces pure, engine-independent ownership/effect resolution:

- `isBicycleOwned(company)` returns true only when `company.purchasedUpgradeLevels.Bicycle` is a positive safe integer;
- no `hasBicycle`, `bicycleOwned`, `ownsBicycle`, or other parallel canonical ownership field was added;
- the existing RBATCH-012 purchase flow remains the only acquisition path.

### Movement balancing

`game-web/src/config/balancing.ts` now centralizes:

- `WALKING_MOVEMENT_SPEED = 150` px/s — the established RBATCH-006 baseline;
- `BICYCLE_MOVEMENT_SPEED = 225` px/s — RBATCH-013 replaceable implementation balancing (+50% over walking).

The 225 px/s value is an implementation detail, not a newly asserted canonical rule.

### Runtime synchronization

`GameWorldScene.create()` now:

1. loads the active in-memory game session;
2. resolves effective movement speed from current company Bicycle ownership;
3. synchronizes `WorldState.player.movementSpeed` before player sprite/runtime movement begins;
4. writes the synchronized state back to the active in-memory session.

The movement formula itself remains unchanged and consumes:

`worldState.player.movementSpeed * deltaSeconds`

This preserves one movement-state path instead of bypassing PlayerState with a scene-level Bicycle constant.

### Purchase presentation

The Bicycle upgrade description now accurately states that the vehicle increases movement speed after purchase. Purchase price, exact-once deduction, affordability and max-level protection remain owned by RBATCH-012 logic and were not duplicated.

---

## 3. Explicit exclusions preserved

RBATCH-013 does not implement:

- Save/Load;
- localStorage or sessionStorage;
- autosave;
- persistence across application restarts;
- standalone Bicycle ownership state;
- mount/dismount or enter/exit mechanics;
- fuel;
- maintenance;
- vehicle damage;
- carrying-capacity effects;
- reward multipliers;
- reputation changes;
- delivery-radius changes;
- order-eligibility changes;
- advanced vehicle/fleet mechanics.

Those boundaries keep RBATCH-014 and later vehicle systems semantically separate.

---

## 4. Automated test coverage

New file:

`game-web/tests/bicycle.test.ts`

New RBATCH-013 tests: 17.

Coverage includes:

- no Bicycle ownership at initial state;
- ownership through positive purchased-upgrade level;
- rejection of zero, negative, fractional, NaN and infinite ownership levels;
- acquisition through the existing Bicycle purchase flow;
- absence of parallel Bicycle ownership fields in runtime state/types/session sources;
- walking baseline = 150 px/s;
- Bicycle movement speed = 225 px/s and greater than walking;
- walking speed before purchase;
- Bicycle speed after purchase;
- unrelated DeliverySpeed/Capacity/Efficiency levels do not activate Bicycle speed;
- immutable synchronization of stale WorldState movement speed;
- identity preservation when speed is already correct;
- purchase-to-speed success and unaffordable-purchase isolation;
- GameWorld synchronization occurs after session retrieval and before sprite creation;
- GameWorld movement continues through PlayerState movement speed;
- Bicycle system contains no persistent-storage or advanced-vehicle implementation.

---

## 5. Validation evidence

### Initial code validation

GitHub Actions run: `33556490775`

Result: SUCCESS

- automated tests: 221/221 PASS across 7 test files;
- RBATCH-013 tests: 17/17 PASS;
- TypeScript + Vite production build: PASS;
- production-server HTTP smoke: PASS;
- PR-range CRLF-aware whitespace validation: PASS;
- archived `Game/` unchanged guard: PASS;
- canonical planning YAML syntax/count validation: PASS;
- active planning crosswalk: PASS.

### Clean post-reconciliation validation

Validated head before this report commit:

`76aa84fd19b8c01028baa7a7cefdfcea719fd2ea`

GitHub Actions run: `33557307755`

Result: SUCCESS

- automated tests: 221/221 PASS;
- TypeScript + Vite production build: PASS;
- production-server HTTP smoke: PASS;
- PR-range whitespace validation: PASS;
- archived `Game/` unchanged: PASS;
- planning YAML syntax/count validation: PASS;
- permanent active planning crosswalk through RBATCH-013: PASS.

### Reconciliation tooling correction history

Two temporary reconciliation attempts failed without altering gameplay code:

1. run `33556757305` failed because the temporary helper regex stopped immediately after the YAML `label_names:` key and therefore did not include its list entries;
2. run `33557063630` successfully prepared and verified all planning changes, but GitHub correctly rejected its push because an Actions token without workflow permission attempted to update the permanent CI workflow.

The corrective path was:

- harden the temporary issue-block parser;
- let Actions commit only ordinary planning/documentation files;
- update the permanent CI workflow separately through the authorized GitHub connector;
- delete all temporary reconciliation artifacts;
- rerun the permanent CI on the clean branch head.

These were tooling/governance corrections, not product-runtime defects.

---

## 6. Planning reconciliation

The branch now records the actual repository state:

- RBATCH-012 / E-013: MERGED in PR #256; Railway/public gameplay verification still pending;
- ISSUE-010 and ISSUE-011: completed through PR #256 with `status:done` in canonical planning data;
- RBATCH-013 / E-014: PR #257 validation complete, pending merge;
- ISSUE-012 and ISSUE-013: PR #257 implementation validated, pending merge;
- M-006 remains `In Progress` because RBATCH-013 is not merged at report creation time;
- RBATCH-014 remains blocked by ODR-001 and ODR-003.

The permanent `DROPi Tycoon Prototype CI` crosswalk gate now validates this state through RBATCH-013.

---

## 7. Exact changed-file set before this report

1. `.github/workflows/rbatch-010-ci.yml`
2. `00_Project/PROJECT_STATUS.md`
3. `09_Development/CHANGELOG.md`
4. `09_Development/Planning/BATCH_ARCHITECTURE.md`
5. `09_Development/Planning/EPIC_CATALOG.md`
6. `09_Development/Planning/ISSUE_CATALOG.md`
7. `09_Development/Planning/github_creation_plan.yaml`
8. `game-web/src/config/balancing.ts`
9. `game-web/src/scenes/GameWorldScene.ts`
10. `game-web/src/state/gameState.ts`
11. `game-web/src/systems/bicycleSystem.ts`
12. `game-web/src/systems/upgradeSystem.ts`
13. `game-web/tests/bicycle.test.ts`

This report becomes the fourteenth final PR file.

No dependency or lockfile file is changed by RBATCH-013.

---

## 8. Public/Railway verification

Railway/public gameplay verification is not claimed by this report.

After deployment, public verification should confirm:

1. a new game begins at walking speed;
2. a successful delivery provides enough money for the current Bicycle purchase path;
3. Bicycle purchase changes ownership through purchased-upgrade state;
4. returning to GameWorld preserves that ownership;
5. movement is visibly faster after Bicycle purchase;
6. order rewards, reputation, delivery radii and carrying behavior remain unchanged;
7. no Save/Load or advanced vehicle behavior appears.

Until observed publicly, that verification remains pending.

---

## 9. Verdict

RBATCH-013 implementation is technically validated and bounded correctly.

At report creation, the only remaining pre-merge step is final CI validation of the branch head that includes this persistent report, followed by a SHA-protected merge if all gates remain green.
