# AI Report 092 — RBATCH-012 CompanyManagement + Upgrade Purchase Flow

## Document Information

- Project: DROPi Tycoon
- Date: 2026-09-01
- Batch: RBATCH-012
- Epic: E-013 — Company Management Scene
- Milestone: M-006 — Company Management & Bicycle
- Executable issues: ISSUE-010 #196, ISSUE-011 #197
- Pull request: #256
- Branch: `openai/rbatch-012-company-management-upgrades`
- Base main commit: `34a8383f85e9bf45fd7680dfc26ad48b5fa56e27`
- Status at report creation: implementation and planning reconciliation validated; PR open and unmerged
- Railway/public gameplay verification: not claimed

---

## Objective

Implement the Prototype v0.1 CompanyManagement branch and upgrade-purchase path without entering the later Bicycle movement-effect or persistent Save/Load batches.

RBATCH-012 must allow the player to move safely between GameWorld and CompanyManagement, inspect company/economy state, purchase an affordable upgrade exactly once, receive clear feedback, and return to the same active runtime session.

---

## Canonical Scope

Authoritative sources reviewed before implementation:

- `09_Development/PROTOTYPE_V0.1.md`
- `09_Development/GAME_DATA_STRUCTURE.md`
- `09_Development/GAME_BALANCING_RULES.md`
- `09_Development/Implementation_Preparation/CANONICAL_TO_IMPLEMENTATION_TRACEABILITY_MATRIX.md`
- `09_Development/Planning/github_creation_plan.yaml`

Relevant requirements include the CompanyManagement company/economy overview, available-upgrade display, earned-money purchase path, purchase-success/failure feedback, canonical upgrade types, Bicycle as the first purchasable vehicle, and preservation of scene state.

Explicitly excluded from RBATCH-012:

- Bicycle movement-speed effect — owned by RBATCH-013.
- Persistent ownership across application restarts — owned by RBATCH-014 Save/Load.
- `localStorage`, save serialization, load validation, autosave, or overwrite semantics.
- Advanced vehicle mechanics.
- Hidden order-regeneration expansion.

---

## Pre-Implementation Defect Found

The existing GameWorld navigation button already opened CompanyManagement, but `GameWorldScene.create()` recreated both `WorldState` and `CompanyState` every time the scene started. Returning from CompanyManagement therefore discarded active order state, money and reputation.

The existing GameWorld and CompanyManagement navigation controls also assigned input to both the rectangle and its text label, allowing duplicate action ownership from a single physical tap.

RBATCH-012 corrects both defects inside the authorized scene-navigation scope.

---

## Implementation

### Expanded runtime company state

`game-web/src/types/game.ts` and `game-web/src/state/gameState.ts` now model the Prototype v0.1 company fields required by management/progression:

- company name;
- money;
- level;
- reputation;
- purchased upgrade levels.

Purchased upgrade levels are keyed by the known upgrade identifiers:

- `DeliverySpeed`;
- `Capacity`;
- `Efficiency`;
- `Bicycle`.

No persistent storage is introduced by this state expansion.

### In-memory runtime session

`game-web/src/state/gameSession.ts` owns the active runtime `WorldState + CompanyState` while the application is running.

- `Start Game` from MainMenu explicitly creates a fresh session.
- GameWorld resumes the existing session instead of recreating state on each scene entry.
- GameWorld synchronizes the session before entering CompanyManagement.
- CompanyManagement returns to the same session.
- Session state is memory-only and disappears when the application runtime is restarted.

This is scene-transition continuity, not Save/Load.

### Upgrade domain system

`game-web/src/systems/upgradeSystem.ts` provides a pure upgrade catalog and purchase function.

The canonical upgrade categories remain represented. The current Prototype v0.1 purchase surface exposes Bicycle as the available purchase while the other categories remain reserved and unavailable rather than being silently implemented with invented effects.

The purchase function:

- validates company money and current upgrade level;
- rejects unavailable upgrades;
- rejects unaffordable purchases without mutation;
- rejects a maxed one-time purchase without a second charge;
- deducts the configured cost exactly once on success;
- increments the purchased-upgrade level immutably;
- preserves unrelated company fields;
- emits clear success/failure feedback.

No Bicycle speed effect is applied by the purchase function.

### Bicycle balancing value

`BICYCLE_COST` is centralized in `game-web/src/config/balancing.ts` at **100 money**.

This is explicitly a replaceable balancing value, not a fixed canonical price. The repository canon requires early upgrades to be affordable but does not define an exact Bicycle price.

The current runtime contains one standard order paying 100 money and does not yet regenerate another order after completion. A cost of 200 would make the first canonical purchase unreachable in the current prototype. Setting the initial Bicycle price to 100 keeps the existing `Receive Payment → Company Management → Purchase Upgrade` prototype path executable without inventing order regeneration inside RBATCH-012.

### CompanyManagement scene

`CompanyManagementScene.ts` now provides:

- company name;
- money;
- level;
- reputation;
- current available upgrade;
- cost and ownership level;
- Purchase action;
- success/failure feedback;
- Owned state after purchase;
- Return to Game World;
- Main Menu navigation.

Interactive text duplication was removed. Each action has one input owner.

### Economy regression protection

`settleDeliveryOutcome()` now returns `{ ...company, money, reputation }` rather than reconstructing only the two economy fields. This preserves company name, level and purchased-upgrade state when a delivery settles.

Legacy RBATCH-009 tests were updated from whole-object equality to economy-field matching where appropriate, so they still assert the exact money/reputation outcomes without incorrectly prohibiting new canonical CompanyState fields.

---

## Automated Tests

New file: `game-web/tests/company-management.test.ts`

New RBATCH-012 coverage: **22 tests**.

Coverage includes:

- canonical upgrade identifier inventory;
- only Bicycle currently purchasable;
- centralized/reachable Bicycle cost;
- insufficient-money rejection at fresh state and one below price;
- exact-affordability purchase;
- exact-once deduction;
- immutability of CompanyState and nested upgrade-level state;
- preservation of unrelated company fields;
- duplicate/max-level purchase protection;
- reserved upgrade rejection;
- invalid negative-money rejection;
- new runtime session initialization;
- active session preservation;
- session replacement and reset behavior;
- delivery settlement preserving progression fields;
- MainMenu fresh-session ownership;
- GameWorld session reuse;
- navigation session synchronization;
- single input ownership;
- persistent-storage exclusion.

Repository-wide final count before this report commit: **204/204 tests passing**.

---

## Validation History

### Initial RBATCH-012 CI

GitHub Actions run `33554707582`:

- all 22 new RBATCH-012 tests passed;
- two legacy RBATCH-009 tests failed because they required the complete CompanyState object to equal only `{ money, reputation }`;
- the failure correctly exposed an outdated test assumption, not an economy regression.

Correction:

- exact economy outcomes remain asserted;
- legacy tests now allow the canonical CompanyState expansion;
- complete CompanyState inputs are used where strict typing requires them.

### Clean code validation

GitHub Actions run `33554869280`:

- **204/204 tests PASS**;
- TypeScript + Vite production build PASS;
- HTTP production-server smoke PASS;
- PR-range CRLF-aware `git diff --check` PASS;
- archived `Game/` guard PASS;
- planning YAML syntax/count validation PASS;
- active planning crosswalk validation PASS.

### Planning reconciliation

Planning was synchronized to the actual repository state:

- RBATCH-011 / E-012 → merged in PR #255, Railway/public verification pending;
- M-006 → In Progress;
- RBATCH-012 / E-013 → PR #256 validation complete, pending merge;
- ISSUE-005..008 → implementation complete/done while public verification remains tracked at batch level;
- ISSUE-010/011 → PR #256 validated, pending merge;
- ISSUE-009 remains RBATCH-014 / E-015 / M-007 and blocked by ODR-001/ODR-003.

The temporary reconciliation script/workflow was removed before final PR scope.

### Clean final-head validation before report

GitHub Actions run `33555587474` on head `b2bcad61618e8d7ad2aa8ec8d7b35b436fae1840`:

- **204/204 tests PASS**;
- TypeScript + Vite production build PASS;
- HTTP smoke PASS;
- CRLF-aware diff check PASS;
- archived `Game/` unchanged PASS;
- canonical planning YAML syntax/count PASS;
- active planning crosswalk through RBATCH-012 PASS.

A final CI run must still pass after this report commit before PR #256 is eligible for merge.

---

## Permanent CI Improvement

The reusable `DROPi Tycoon Prototype CI` crosswalk gate now verifies active planning through RBATCH-012, including:

- M-006 In Progress;
- RBATCH-010 and RBATCH-011 merged state;
- RBATCH-012 PR #256 active validated state;
- E-011/E-012 merged state;
- E-013 active PR #256 state;
- ISSUE-008 done;
- ISSUE-009 preserved under blocked RBATCH-014 Save/Load;
- ISSUE-010/011 assigned to RBATCH-012/E-013/M-006 and in progress;
- ISSUE-012/013 remain assigned to RBATCH-013.

This prevents code progress and canonical planning state from silently diverging again.

---

## PR Scope at Report Creation

Product/runtime changes:

- `game-web/src/config/balancing.ts`
- `game-web/src/scenes/CompanyManagementScene.ts`
- `game-web/src/scenes/GameWorldScene.ts`
- `game-web/src/scenes/MainMenuScene.ts`
- `game-web/src/state/gameSession.ts`
- `game-web/src/state/gameState.ts`
- `game-web/src/systems/economySettlement.ts`
- `game-web/src/systems/upgradeSystem.ts`
- `game-web/src/types/game.ts`
- `game-web/tests/company-management.test.ts`
- `game-web/tests/orderSystem.test.ts`

Governance/validation changes:

- `.github/workflows/rbatch-010-ci.yml`
- `00_Project/PROJECT_STATUS.md`
- `09_Development/CHANGELOG.md`
- `09_Development/Planning/BATCH_ARCHITECTURE.md`
- `09_Development/Planning/EPIC_CATALOG.md`
- `09_Development/Planning/ISSUE_CATALOG.md`
- `09_Development/Planning/MILESTONE_ARCHITECTURE.md`
- `09_Development/Planning/github_creation_plan.yaml`
- this Report 092.

No dependency or lockfile change is introduced.

Archived historical `Game/` remains unchanged.

---

## Post-Merge Verification — Not Yet Claimed

After Railway redeploy, public/mobile verification should confirm:

1. Start Game opens a fresh GameWorld session.
2. A successful delivery leaves the player with 100 money.
3. Company opens CompanyManagement without losing money/order/world state.
4. Bicycle displays with cost 100.
5. Purchase succeeds at 100 money and leaves money at 0.
6. Bicycle becomes Owned and cannot be charged twice.
7. Returning to GameWorld preserves company/upgrade state.
8. An unaffordable purchase provides clear feedback and does not mutate company state.
9. No Bicycle speed increase occurs yet; that belongs to RBATCH-013.
10. No persistent Save/Load behavior appears yet.

These observations must not be recorded as passed until actually observed in the deployed runtime.
