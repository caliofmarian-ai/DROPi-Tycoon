# Issue #554 — Visual Storytelling / Characters / Dialogue

Date: 2026-09-09
Branch: `agent/visual-storytelling-characters`
Base: current `main` at reconciliation time
Status: TECHNICAL RECONCILIATION — CI REQUIRED

## Goal

Provide a governed, Android-safe visual-storytelling presentation layer for the recurring cast without creating a second mission/economy model, inventing world truth, or generating/promoting unapproved portrait art.

## Current reconciliation

This PR has been rebuilt onto current `main` and reconciled with the merged:

- Story Bible and Campaign canon;
- stable first-hour narrative IDs/content contract;
- Mission Framework;
- canonical Brăila first-hour authored mission registry;
- Act I continuation / Familiar Routes contracts.

The six-file DT-10 lane is preserved. No Brăila geometry, semantic zoom, Save schema, economy authority, cargo authority, capability authority or mission state machine is owned here.

## Implemented

### 1. Reusable recurring-character visual language

`game-web/src/narrative/visualStorytelling.ts` defines stable presentation identities for:

- Ana Stoica — dispatcher / mentor;
- Radu Marin — coworker / friendly competitor;
- Mirela Stan — merchant;
- Petru Neagu — recurring household customer;
- Daria Iancu — producer / business owner;
- Elena Dobre — trainer / instructor;
- Victor Lupu — competitor / rival.

Each identity combines silhouette, hair, clothing, role accent, equipment cue, badge and home/work context. The system has a future governed runtime-texture slot but currently uses procedural identity portraits so no candidate crop is mislabeled as production art.

### 2. Android-safe dialogue presentation

`game-web/src/ui/NarrativePresentation.ts` provides a fixed-screen Phaser overlay rather than a separate scene.

Supported presentation elements include:

- portrait / identity panel;
- character name, role and context;
- short dialogue;
- Continue action;
- up to three player choices;
- chapter, outcome and opportunity beats;
- read-only mission/objective references;
- bounded camera/environment focus requests;
- Android Back / Escape handling;
- exactly-once presentation completion;
- deterministic choice callbacks.

The overlay owns no mission, money, cargo, qualification, settlement or world truth.

### 3. Exact game-context preservation

The overlay is instantiated inside the existing `GameWorldScene` fixed-screen UI layer so future authoritative adapters can present a beat without replacing the world scene.

While a narrative presentation is open:

- movement resolves to zero;
- Action and transport switching are blocked;
- world drag and pinch initiation are blocked;
- zoom/global-map transition is blocked;
- scene navigation is blocked;
- hero position is not changed by the presentation layer;
- camera state is not changed by dialogue;
- active order/cargo/economy state is not changed by dialogue.

### 4. Canonical first-hour presentation contracts

The prepared First Shift sequence binds presentation beats to stable Story Director identities:

- First Shift card → `beat:braila:first-day:a-place-to-start` / `line:prologue:first-shift-card`;
- Ana brief → `beat:braila:first-day:the-first-standard` / `line:ana:first-standard`;
- Radu meeting → `beat:braila:first-day:the-first-standard` / `line:radu:first-meeting`;
- clean first consequence → `beat:braila:first-day:first-consequence` / `line:ana:first-consequence-clean`;
- next opportunity → `beat:braila:first-day:tomorrow-has-more-than-one-direction`.

The same beats now carry read-only bindings to the merged DT-09 canonical mission IDs, authored refs, signals and fact IDs from `brailaFirstHourAuthoredRegistry.ts`.

### 5. No speculative auto-triggering

The earlier branch implementation started the opening sequence from screen/open-state heuristics and selected the first-delivery consequence from a revenue heuristic.

That behavior has been removed during reconciliation.

`GameWorldScene` does **not** automatically present First Shift or consequence sequences merely because:

- the world screen opened;
- a current-session WeakSet has not seen the world;
- Company revenue is zero;
- an arbitrary local timer/heuristic elapsed.

The presentation layer is now dormant until authoritative mission/narrative evidence is connected by the dedicated post-merge runtime integration task.

This prevents DT-10 from manufacturing mission timing or semantic history.

### 6. First-hour visual-story authority map

`FIRST_HOUR_VISUAL_STORY_MAP` now records concrete read-only authority bindings for:

- opening / Ana / Radu;
- Mirela / One Small Thing;
- Petru household relationship;
- capacity complication;
- first consequence;
- career horizon.

Bindings consume canonical mission IDs, authored refs, signal types and fact IDs. They do not emit or settle them.

CLEAN / RECOVERED / FAILED facts are recorded as possible authoritative history for Mirela and the first consequence. The current clean-consequence presentation may only be selected when the canonical CLEAN fact is proven. Variant selection for real runtime history belongs to the focused post-merge signal-integration PR.

### 7. Environmental storytelling contract

Rules remain prepared for:

- active employer depot;
- merchant product/economic identity;
- workshop before/after repair;
- district economic improvement;
- temporary disruption evidence;
- infrastructure opening.

Each requires authoritative state. No environmental consequence is fabricated by #554.

### 8. Asset governance

No new image generation was performed.

Approved human source capability already exists in governed repository source registers, but recurring NPC portraits are not production-ready in runtime. Candidate material was not copied into runtime and no asset lifecycle state was silently advanced.

See:

`08_Assets/Production/Manifests/NARRATIVE_VISUAL_STORYTELLING_ASSET_AUDIT.md`

The provenance audit preserves local governed source/manifests/issues/branch evidence while remaining compliant with the repository source-policy gate.

## Tests

`game-web/tests/narrative-visual-storytelling.test.ts` covers:

- supported Android viewport containment;
- 48 px minimum touch targets;
- compact-landscape dialogue placement;
- deterministic choice/result handling;
- exactly-once presentation completion;
- Back/dismiss semantics;
- game-context preservation;
- distinct recurring-character visual cues;
- canonical Story/Mission authority bindings;
- first-hour activation boundaries;
- runtime asset reference validity;
- modal input blocking and cleanup;
- absence of speculative screen/revenue auto-triggering;
- absence of mission/economy/cargo ownership in the presentation layer.

The previous brittle exact-method-line assertion was replaced with contract-level checks of the safe optional narrative access path and the actual input-blocking guards.

## Integration boundaries

### DT-08 — Story Director

Owns stable narrative identity, authored beat meaning and canonical dialogue/content intent. DT-10 consumes that canon.

### DT-09 — Missions & Campaign

Owns mission definitions, runtime state, mission events/signals, authoritative authored refs and mission-side resume behavior. DT-10 references those IDs read-only and does not emit mission transitions.

### DT-01 — Brăila visual / camera lane

#554 does not alter Brăila street geometry, map labels, semantic zoom architecture or global-map ownership. `NarrativeCameraFocusRequest` is a presentation request contract only.

### Economy / cargo / capability / persistence

The overlay does not settle money, mutate cargo/order state, grant capability, or write Save/mission facts.

## Verification workflow

Before merge this reconciled head must pass:

1. targeted visual-storytelling tests;
2. full DROPi Tycoon Prototype CI;
3. TypeScript and production build;
4. production bundle regression gate;
5. Production Docker Runtime Smoke;
6. source-policy and PR-range validation.

Under the current owner/orchestrator workflow, a clean technical result may be recorded as `ORCHESTRATOR_TECHNICALLY_VERIFIED` and #558 may then be marked Ready and self-merged.

A physical Android device test has **not** been performed or claimed in this reconciliation cycle. Device observation remains deferred post-merge QA; `ANDROID_VERIFIED` must not be claimed from this technical verification.

## Post-merge boundary

The next focused DT-10 PR is the separate runtime integration slice for authored first-hour / Familiar Routes signals. It will connect real DT-09/DT-08 authority to the visual layer, including truthful CLEAN / RECOVERED / FAILED variants and deterministic one-shot presentation receipts.

That work is intentionally not folded into #558.
