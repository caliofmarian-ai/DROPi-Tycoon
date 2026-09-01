# RBATCH-014 Save/Load Implementation Report

## Report metadata

- Project: DROPi Tycoon
- Date: 2026-09-01
- Batch: RBATCH-014 — Save/Load Implementation
- Epic: E-015 — Save & Load System
- Milestone: M-007 — Save & Load System
- Pull request: #259
- Branch: `openai/rbatch-014-save-load`
- Base at implementation start: `576670e1ee6e0797627999d6fb2283ee5b81999b`
- Clean pre-report validated head: `8930fddaf0403f060e15f7b95815cb6409ffa2f3`
- Clean pre-report GitHub Actions run: `33559954563`
- Result: PASS — pending final report-head CI and merge

---

## Owner decisions resolved

The Project Owner resolved both owner-gated persistence decisions on 2026-09-01 before implementation proceeded.

### ODR-001

**Decision A — do not persist player position in Prototype v0.1.**

Implementation consequence:

- player coordinates are excluded from the v1 save payload;
- WorldState is regenerated on load;
- the player returns at the normal prototype starting position;
- active order, carrying state and other transient world state are reset rather than restored.

This is a v0.1 scope decision, not a prohibition on richer world persistence in later save-format versions.

### ODR-003

**Decision B — persist only TutorialStatus from GameSettings in Prototype v0.1.**

Implementation consequence:

- `tutorialCompleted` is serialized;
- Language, Sound, Music and Difficulty are intentionally outside the v1 save contract;
- later save-format versions may add settings through an explicit compatible evolution path.

The decisions are recorded in `09_Development/Implementation_Preparation/OWNER_DECISION_REGISTER.md`.

---

## Long-term visual-quality direction

During RBATCH-014 the Project Owner explicitly clarified that the current prototype visuals are temporary and are not the intended final quality bar for DROPi Tycoon.

That direction is now recorded canonically in `00_Project/ROADMAP.md` version 2.3.0:

- Prototype v0.1 remains deliberately minimal in implementation scope;
- the word `minimal` does not limit later visual quality, depth, ambition or production value;
- later phases may substantially improve art, environments, buildings, vehicles, characters, animation, lighting, visual effects, UI presentation and other production-quality presentation layers;
- economy, logistics, progression, Save/Load, simulation state and game rules must remain sufficiently decoupled from temporary rendering/assets so higher-fidelity presentation does not require rewriting core game logic.

RBATCH-014 follows this architecture: save semantics are domain-level and rendering-independent.

---

## Implemented Save/Load architecture

### Versioned one-slot save contract

`game-web/src/persistence/saveSystem.ts` introduces:

- `SAVE_FORMAT_VERSION = 1`;
- one primary local save slot;
- one staging slot used for interrupted-write recovery;
- one best-effort backup key for corrupted/incompatible raw data before confirmed replacement;
- a pure `SaveGameV1` payload independent from Phaser and rendering.

### Persisted v1 state

The v1 payload contains:

- company name;
- money;
- company level;
- reputation;
- purchased upgrade levels;
- TutorialStatus (`tutorialCompleted`).

### Explicitly excluded v1 state

The v1 payload does not contain:

- player x/y position;
- WorldState;
- active order;
- current order identifier;
- package-carrying state;
- tap target or movement state;
- transient simulation state;
- Language;
- Sound;
- Music;
- Difficulty.

### Restore behavior

`restoreGameSessionFromSave`:

- reconstructs a fresh prototype WorldState;
- restores company progression;
- restores TutorialStatus;
- resets active-order/transient state;
- derives Bicycle ownership from `purchasedUpgradeLevels.Bicycle`;
- synchronizes effective movement speed from the restored upgrade state.

This preserves the RBATCH-013 ownership model without storing redundant Bicycle state.

### Validation and corruption handling

`decodeSave` and `inspectSaveSlot` distinguish:

- missing save;
- valid compatible save;
- structurally corrupted save;
- incompatible save-format version;
- valid staging recovery.

Recoverable invalid individual fields receive safe defaults. Structurally invalid or incompatible saves are not silently loaded or silently overwritten.

### Interrupted-write recovery

Writes are staging-first:

1. serialize the current approved save payload;
2. write staging;
3. write primary;
4. remove staging only after primary succeeds.

If the primary write is interrupted or corrupted while a valid staging payload remains, the next inspection can recover from staging.

### Platform-local adapter

`game-web/src/persistence/browserSaveStorage.ts` is the web-runtime adapter for browser-local storage.

The canonical `06_Technical/SAVE_SYSTEM.md` was corrected from archived GDevelop-specific wording to a replaceable platform-local storage boundary. Future Android packaging may provide an equivalent device-local adapter without changing save schema/domain logic.

---

## Main Menu integration

`MainMenuScene` now provides save-aware behavior:

- no save: `Start Game` remains the first-run path;
- valid compatible save: `Continue Game` and `Start New Game` are available;
- corrupted/incompatible save: Continue is withheld and a player-facing warning is shown;
- local storage unavailable: the condition is surfaced without crashing;
- Continue re-inspects the slot before loading;
- repaired or staging-recovered data is normalized back to the primary slot;
- replacing an existing valid/corrupted/incompatible save requires an explicit in-game Confirm/Cancel decision;
- unreadable raw data is preserved as a best-effort backup before confirmed replacement;
- no browser-native `window.confirm` dependency is used.

This implements ISSUE-009 together with ISSUE-015/017 rather than creating a parallel overwrite path.

---

## Autosave policy

The canonical Prototype v0.1 autosave whitelist is implemented as exactly:

- `delivery-completed`;
- `upgrade-purchased`;
- `progression-changed`;
- `tutorial-step-completed`.

Current runtime integration:

- successful upgrade purchase → autosave;
- completed delivery after settlement → autosave;
- failed delivery settlement that changes progression/reputation → autosave as progression change.

Explicitly rejected as generic autosave triggers:

- scene exit;
- player movement;
- order acceptance;
- package pickup;
- other transient events.

No manual-save feature was added because it is not required by the canonical v0.1 save contract.

---

## Session-state changes

The runtime session now includes a `GameSettingsState` containing `tutorialCompleted`.

`gameSession.ts` supports:

- fresh session creation with initial settings;
- compatible `replaceGameSession` updates while preserving settings;
- full session replacement for validated loaded state.

These changes remain independent from the visual rendering layer.

---

## Automated test coverage

A new deterministic suite `game-web/tests/save-system.test.ts` adds 20 tests covering:

- exact v1 serialization fields;
- ODR-001 exclusion of player/world/order state;
- ODR-003 exclusion of non-TutorialStatus settings;
- ignoring unapproved extra compatible fields;
- progression restoration;
- fresh player/world/order regeneration;
- Bicycle movement-speed restoration from upgrade ownership;
- safe defaults for invalid recoverable fields;
- malformed JSON;
- non-object root;
- missing format version;
- unknown format version;
- missing structural company data;
- staging-first write semantics;
- staging recovery from corrupted primary data;
- failed primary write retaining staging data;
- missing-slot inspection;
- corrupted raw backup preservation;
- exact autosave whitelist;
- rejection of unapproved transient autosave events;
- approved autosave persistence.

`game-web/tests/mainmenu.test.ts` was extended to verify:

- first-launch actions remain present;
- Continue / Start New Game integration;
- overwrite confirmation and corrupted-save preservation;
- no `sessionStorage` / `window.confirm` shortcut;
- single input ownership for menu controls.

---

## Validation evidence

### Initial implementation run

GitHub Actions run `33559283892` completed successfully.

- Test files: 8 passed / 8
- Tests: 242 passed / 242
- TypeScript + Vite production build: PASS
- Production HTTP smoke: PASS
- PR-range whitespace validation: PASS
- archived `Game/` unchanged guard: PASS
- canonical planning YAML syntax/count validation: PASS

### Canonical planning reconciliation

Owner-gated planning was advanced only after the implementation gates were green.

Current branch planning records:

- M-007: In Progress;
- ODR-001/003 gate: RESOLVED;
- E-015: PR #259 validation complete; pending merge;
- RBATCH-014: PR #259 validation complete; pending merge;
- ISSUE-009/014/015/016/017: PR #259 implementation validated; pending merge;
- their labels: `status:in-progress` until merge.

The permanent GitHub Actions crosswalk was advanced to enforce this exact state.

Temporary reconciliation artifacts used to perform the deterministic documentation update were removed before final validation.

### Clean pre-report validation

GitHub Actions run `33559954563` on clean branch head `8930fddaf0403f060e15f7b95815cb6409ffa2f3` completed successfully.

Exact automated-test breakdown:

- `orderSystem.test.ts`: 73
- `save-system.test.ts`: 20
- `hud.test.ts`: 80
- `bicycle.test.ts`: 17
- `notification-display.test.ts`: 12
- `company-management.test.ts`: 22
- `mainmenu.test.ts`: 13
- `gamehud-propagation.test.ts`: 5

Total: **242/242 PASS across 8 test files**.

Additional gates:

- TypeScript (`tsc`) + Vite production build: PASS;
- production server HTTP smoke: PASS;
- CRLF-aware PR-range whitespace validation: PASS;
- archived `Game/` unchanged: PASS;
- planning YAML counts/syntax: PASS;
- active planning crosswalk through RBATCH-014: PASS.

---

## Non-blocking technical observations

The current dependency tree reports two npm audit findings (one moderate, one high). RBATCH-014 does not change `package.json` or the lockfile; dependency remediation is therefore not bundled into this Save/Load batch and should be handled as separate technical maintenance rather than silently mixed into persistence implementation.

The production build also emits the existing large-chunk warning for the main client bundle. Code splitting / bundle optimization is a later optimization concern and is not a correctness failure for RBATCH-014.

GitHub Actions currently warns that some third-party action releases target deprecated Node 20 internals while the workflow forces them onto the current runner default. The DROPi Tycoon application build itself is explicitly validated on Node 22.12.0.

---

## Exact clean pre-report changed-file set

1. `.github/workflows/rbatch-010-ci.yml`
2. `00_Project/PROJECT_STATUS.md`
3. `00_Project/ROADMAP.md`
4. `06_Technical/SAVE_SYSTEM.md`
5. `09_Development/CHANGELOG.md`
6. `09_Development/Implementation_Preparation/OWNER_DECISION_REGISTER.md`
7. `09_Development/Planning/BATCH_ARCHITECTURE.md`
8. `09_Development/Planning/EPIC_CATALOG.md`
9. `09_Development/Planning/ISSUE_CATALOG.md`
10. `09_Development/Planning/MILESTONE_ARCHITECTURE.md`
11. `09_Development/Planning/github_creation_plan.yaml`
12. `game-web/src/persistence/browserSaveStorage.ts`
13. `game-web/src/persistence/saveSystem.ts`
14. `game-web/src/scenes/CompanyManagementScene.ts`
15. `game-web/src/scenes/GameWorldScene.ts`
16. `game-web/src/scenes/MainMenuScene.ts`
17. `game-web/src/state/gameSession.ts`
18. `game-web/src/state/gameState.ts`
19. `game-web/src/types/game.ts`
20. `game-web/tests/mainmenu.test.ts`
21. `game-web/tests/save-system.test.ts`

This report becomes the 22nd final changed file.

---

## Post-merge public verification plan

Public/Railway gameplay verification is not claimed by this report.

After the merged build is publicly deployed, validate at minimum:

1. a first launch without save shows Start Game rather than Continue;
2. perform a qualifying autosave event such as successful upgrade purchase or settled delivery;
3. return/reload and confirm Continue Game appears;
4. Continue restores company money/level/reputation/purchased upgrades/TutorialStatus;
5. Bicycle ownership still produces the Bicycle movement-speed effect after Continue;
6. player position returns to the normal starting position;
7. active order is reset rather than restored;
8. Start New Game with existing progress requires explicit Confirm/Cancel;
9. Cancel preserves existing progress;
10. confirmed replacement creates fresh progress;
11. malformed/incompatible local data does not crash the runtime and is not silently overwritten;
12. normal delivery, economy, HUD, CompanyManagement and navigation behavior remains intact.

---

## Conclusion

RBATCH-014 establishes a versioned, validated, locally persistent Prototype v0.1 progression foundation while deliberately keeping transient world state and temporary visual technology outside the save contract.

This provides the immediate Continue/overwrite/autosave behavior required by the prototype and preserves a clean path for later richer world persistence, Android packaging, and substantially higher visual fidelity without coupling those future improvements to the current prototype rendering implementation.
