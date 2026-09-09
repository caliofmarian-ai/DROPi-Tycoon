# DROPi Tycoon — Independent Product / Release Audit

**Canonical auditor:** DT-16 — Independent Product / Release Auditor
**Audit refresh:** 2026-09-09
**Frozen audited `main`:** `8a8cb68d2ae0ecafc9d4215bde0226fce156a978`
**Release verdict:** **NO-GO**
**Effective unconditional P0 blockers:** **9**
**P1 risks:** **5**

This is a point-in-time independent release-gate audit. DT-16 changes no gameplay, economy, mission, persistence, Android, legal, Play Console or Railway behavior. It does not self-merge and does not treat issue labels or administrative closure as sufficient evidence of release readiness.

---

## 1. Executive conclusion

DROPi Tycoon has advanced materially since the previous DT-16 snapshot. Current `main` now includes #558 visual storytelling, #627 citywide mission distribution, #639 citywide capability/work access, #636 persistence-readiness governance, #638 the Player Economy persistence handoff, #640 location-portable relationships and #623 Hungary regional locality data. Earlier #625 Player Economy live-session composition, #586 Save continuity, #590 bundled Android runtime and #626 release-provenance evidence remain integrated.

The remaining release problem is increasingly **composition and proof**, not absence of subsystem design.

A new owner directive, #643, explicitly establishes **global functional-locality playability as a P0 release gate**. Country Catalog breadth is not enough: launch-supported localities must resolve to legitimate playable runtime behavior rather than dead map pins. Current `main` does not yet prove the required multi-locality lifecycle.

The release verdict is therefore **NO-GO** with **9 effective unconditional P0 blockers**.

---

## 2. Repository and production snapshot

Audited `main`:

`8a8cb68d2ae0ecafc9d4215bde0226fce156a978`

Latest audited merge:

- #623 — Hungary Budapest plus 19 vármegye regional localities.

Railway production deployment:

- project: `DROPi-Tycoon`;
- project ID: `5dbea950-2484-46e2-a64d-3040b8d42f3c`;
- production environment: `09e4bb35-9330-4191-b907-e2c45855ef5f`;
- service: `27e4ba12-d290-4df9-b711-092be032a9f8`;
- deployment: `de035e87-15bb-4eb7-b850-26bd77c4ef07`;
- exact commit: `8a8cb68d2ae0ecafc9d4215bde0226fce156a978`;
- status: **SUCCESS**.

GitHub deployment status for the audited SHA is also successful.

DT-16 performed no Railway mutation.

---

## 3. Effective P0 counting rule

DT-16 deduplicates release outcomes rather than counting every issue whose title contains `[P0]`.

- #614/#641 visual scale is evaluated inside the #317 Android/product-quality outcome rather than counted separately.
- #634/#645 are requirements inside #643 rather than separate release blockers.
- #566 remains administratively open in some searches, but its original source defect is technically retired through merged #586 and is not resurrected as a P0.
- #560/#562/#564 remain conditional while their corresponding online account/data-rights/chat capabilities remain disabled.

---

## 4. Material progress

### #558 visual storytelling merged

Merged #558 provides the narrative overlay, recurring-character presentation, modal input blocking and Android Back/Escape handling without taking mission/economy mutation authority.

However current-main tests intentionally keep speculative first-hour auto-wiring out of `GameWorldScene`. The visible layer is present, but authoritative first-hour trigger -> presentation -> acknowledgement wiring remains a separate integration step. Physical Android acceptance is also still absent.

### #627 citywide mission distribution merged

The selector now uses legitimate order/DeliveryMission identity, world-provided route classification, real causal priority, work-access gating and replay-safe exclusion/diversity. It does not invent cargo, demand, money or geography.

### #639 citywide capability/work access merged

Citywide eligibility now preserves real capability, qualification, vehicle/equipment, employer permission, cargo and Work Capacity authority. Larger maps cannot bypass these gates merely because a wider route exists.

### #636 persistence-readiness matrix merged

The matrix correctly separates local Save continuity, mission resume, Player Economy, capability/training, production, World Clock and future locality/relocation persistence. It also preserves the no-premature-PostgreSQL-cutover rule.

### #638 Player Economy persistence handoff merged

DT-03 now provides DT-02 with explicit owner/world/hero keys, state-port semantics, replay identities, atomicity expectations, fresh/legacy rules and no Company Money -> Personal Money conversion.

This materially reduces persistence-design uncertainty. Actual Save v2 serialization and visible UI cutover remain absent.

### Persistence governance drift

The merged #636 readiness matrix still describes #638 as `OPEN + BLOCKING`, although #638 merged later in the same wave. This is a **P1 governance drift**, not a new P0 and not a reason to invalidate #638.

### #591 AAB preparation ready

PR #591 is now repository-side ready/mergeable and contains the canonical mobile lockfile, pinned npm, release-input validation, release preflight and deterministic AAB technical attestation tooling.

The actual production EAS AAB, EAS build ID, AAB SHA-256 attestation output, Play Internal/App Bundle Explorer/pre-launch evidence and physical Android acceptance are still absent. #568 therefore remains P0.

### New owner P0 #643

#643 requires the full lifecycle to work across launch-supported localities:

`choose/start locality -> enter city -> legitimate work -> pickup/custody -> delivery -> work/economy settlement -> story consequence -> save -> relaunch -> continue -> relocate -> enter another functional locality`

Required proof includes Brăila, another Romanian locality, a non-Romanian European locality and a materially different locality archetype/scale.

Current Country Catalog expansion does not satisfy this gate. #645 is still dependent on a governed `PlayableLocalityInstance` handoff, while #644/#647/#648 are partial locality-safe domain work.

---

## 5. Effective unconditional P0 blockers

### P0-01 — Player Economy final persistence + player-visible cutover

Merged #625 establishes legitimate live-session Personal Money, Work Capacity, productive-work receipts, wages, living obligations and hardship/recovery. Merged #638 provides the persistence handoff.

Current gaps:

- Save v2 still has no Player Economy payload/state port;
- `GameSessionState` does not directly contain the aggregate;
- visible player UI has not cut over to Personal Money / Work Capacity as authoritative product truth;
- process-kill/relaunch proof of employee-economy continuity is absent.

Open #648 adds locality-safe semantics but explicitly does not implement Save/UI.

**Release state:** P0 OPEN.

### P0-02 — Authoritative visible first-hour Story/Mission runtime

Merged Story/Mission foundations and #558 presentation are strong, but current main still lacks one authoritative visible chain:

`real work/mission/economy facts -> Story trigger -> DT-10 presentation -> presentation receipt -> mission acknowledgement -> persistence/replay protection`.

#647 advances the executable Story handoff but does not itself change `GameWorldScene` or the overlay.

Owner Android acceptance of the resulting first-hour presentation remains required.

**Release state:** P0 OPEN.

### P0-03 — #317 Android product-quality owner acceptance

Merged visible work is not equivalent to `ANDROID_VERIFIED`.

The installed landscape candidate must prove coherent premium presentation, readable semantic zoom, stable camera/pinch, no HUD/story/control overlap, correct Back/input behavior, living-city behavior, accepted city scale, sustained performance and absence of developer/debug-style presentation.

#614/#641 large-city scale remains inside this gate rather than being double-counted.

**Release state:** P0 OPEN.

### P0-04 — Bundled Android runtime physical acceptance

Merged #590 fixes the source architecture: production Phaser is bundled in Android rather than depending on the public Railway game page.

Still required on the exact candidate:

- offline cold launch;
- bundled assets load;
- no remote-game fallback;
- Back/touch/drag/pinch;
- background/resume;
- Save/relaunch stability;
- controlled separation of backend/network failure from local-runtime failure.

**Release state:** P0 OPEN.

### P0-05 — #568 exact production AAB + attestation/testing evidence

Repository preparation is close through #591, but the actual release artifact evidence remains missing:

- production EAS build ID;
- exact AAB artifact and SHA-256;
- final manifest/permissions/native-library validation;
- Play Internal/App Bundle Explorer evidence;
- pre-launch report;
- physical testing of the exact artifact.

**Release state:** P0 OPEN.

### P0-06 — #569 privacy / Data Safety / App Content completion

Administrative issue closure is not release proof.

Still required against the final artifact/backend truth:

- publishable Privacy Policy and final owner/controller/contact facts;
- final data-flow/SDK/backend reconciliation;
- Data Safety answers;
- Ads declaration;
- target-age decision;
- IARC;
- app-access/reviewer state where applicable;
- final AAB permission declaration consistency;
- re-audit if accounts, analytics, ads, billing, push, support or UGC activate.

**Release state:** P0 OPEN.

### P0-07 — #565 commercial IP/license/provenance clearance

Merged #626 intentionally keeps `commercialReleaseReady=false`.

Remaining material gates include:

- DROPi / DROPi Tycoon name/logo/icon clearance;
- branding chain-of-title/source facts;
- generated runtime-art provider/tool/date/terms/input/derivative evidence;
- qualified ODbL characterization for the final distributed artifact;
- final mobile/native dependency licence closure against the exact #568 build.

**Release state:** P0 OPEN.

### P0-08 — #571 Play Console verification/signing/testing/production access

Required owner/account-specific evidence includes account verification, package registration, Play App Signing/upload certificate state, internal testing, any applicable closed-test requirement, App Bundle Explorer/pre-launch review and production-access state.

Repository source cannot prove those account conditions.

**Release state:** P0 OPEN.

### P0-09 — #643 global functional-locality / onboarding / relocation proof

Current main does not prove that every launch-supported locality presented as meaningful is a legitimate playable locality.

Missing end-to-end proof includes:

- governed launch-locality readiness;
- Catalog -> `PlayableLocalityInstance` contract;
- starting outside Brăila;
- legitimate local employer/work/economy;
- locality-portable starter missions/story;
- Save/reload outside Brăila;
- replay-safe relocation;
- no silent Brăila fallback;
- destination-locality runtime after relocation;
- multi-locality Android performance/streaming evidence.

#634/#645 and related locality-safe work are grouped under this single effective P0.

**Release state:** P0 OPEN.

---

## 6. Conditional P0 gates not counted in the nine

These become unconditional only if the corresponding production capability is enabled:

- #560 — authenticated online account/profile authority;
- #562 — production account deletion/retention/data-rights lifecycle;
- #564 — public chat/UGC moderation/report/block/community safety.

---

## 7. P1 risks

1. **Cross-domain persistence composition + governance drift.** The critical chain is `world/locality -> hero -> order/cargo -> mission -> Player Economy -> capability -> production -> settlement/consequence -> Save/persistence`. #630/#638 improve ownership clarity, but final writers/cutovers are incomplete and #636 is already stale relative to #638.
2. **First-hour authority-to-presentation reconciliation.** #558 is merged, but authoritative trigger wiring and exactly-once presentation acknowledgement remain separate.
3. **Large-city physical Android performance.** #613/#629 improve scalability while #637/#641/#646 continue scale/budget/corridor work; physical startup/frame/memory/long-traversal evidence is still absent.
4. **Citywide/global breadth outrunning causal gameplay.** #627/#639 are merged, but real production/demand endpoints and #643 playable-locality runtime are incomplete.
5. **Authentic store/creator evidence remains downstream.** #561-family captures/claims must come from the exact owner-accepted build and must not market global playability before #643 proof exists.

---

## 8. First-minute / first-10-minute / first-hour verdict

### First minute

**PARTIAL / NOT RELEASE-ACCEPTED.** Visual-story infrastructure is merged, but authoritative trigger wiring, accepted Personal Money/Work Capacity UI, owner Android acceptance and locality-aware onboarding proof are still missing.

### First 10 minutes

**FAIL FOR COMMERCIAL TARGET.** Most domain pieces exist, but the player still lacks one installed causal chain from legitimate employee context through real work/cargo, consequence, Work Capacity, wage/Personal Money and the next meaningful goal.

### First hour

**FAIL FOR COMMERCIAL TARGET.** The release candidate must prove employee survival, Work Capacity, Personal Money, recurring relationships, failure/recovery, meaningful choice, capability/transport horizon, real demand/production causality, visible city consequence, save/relaunch and a clear next direction. After #643, the architecture must also prove that this lifecycle is not structurally Brăila-only.

---

## 9. Save / persistence audit

The original #566 source defect remains **RETIRED through merged #586**. Save v2 preserves bounded hero/order/cargo/mission continuity and exactly-once settlement protection.

The current persistence gap is later-stage integration:

- Player Economy is not yet in Save v2;
- richer capability/training evidence lacks final durable writer/cutover;
- production inventory/reservations/contracts lack final durable aggregate handoff;
- World Clock durable catch-up authority is incomplete;
- locality/home/start/current/relocation aggregate is absent;
- `PlayableLocalityInstance` persistence must wait for the owning world contract.

One single writer per state family remains mandatory.

---

## 10. Economy / mission / world audit

### Player Economy

**Domain/live-session maturity: STRONG. Player-facing release state: P0 INCOMPLETE.**

#625 + #638 establish a credible authoritative economy and persistence handoff. The remaining blocker is Save/UI/session cutover and release-device continuity, not basic arithmetic.

### Mission / narrative

**Domain maturity: STRONG. Player-facing composition: P0 INCOMPLETE.**

The repository now contains stable missions, first-hour content, replay-safe consequences, mission resume, citywide distribution, locality-portable relationships and visual presentation. The exact missing bridge is authoritative trigger -> visible presentation -> acknowledgement -> persistence.

### World / Living City

**Foundation: STRONGER. Release proof: INCOMPLETE.**

Brăila has governed source geometry, semantic labels, controlled crossings, sector-scoped ambient activation, citywide mission distribution and citywide work eligibility. #614/#641 still reflects an unresolved owner concern about city-scale perception. #643 expands the requirement from “Brăila feels right” to “launch localities are genuinely playable.”

---

## 11. Android / AAB / compliance audit

### Android

**P0 NOT RELEASE-VERIFIED.** The exact candidate still needs bundled offline launch, menu -> locality, semantic zoom/pinch, safe controls, narrative input blocking, Back, crossing behavior, long traversal, process-kill/Continue, background/resume, network interruption, dense-city frame stability and memory/crash testing.

### AAB

#591 materially improves repository preparation, but no GO is possible before the exact AAB is built, attested, distributed through Play testing and physically exercised.

### Legal/privacy/IP

Final Play declarations and commercial IP/provenance remain fail-closed until exact final-artifact evidence and required owner/qualified-review inputs exist.

---

## 12. Most dangerous regression

The highest-risk regression is:

> **locality-aware world/order/mission/Player Economy/capability/production state becoming separate or Brăila-biased authorities across save/restart/relocation.**

Potential failures include duplicate/lost Personal Money or Work Capacity, stale locality/order/cargo references, wrong employer/economy after relocation, silent Brăila NPC/route fallback, production/mission/cargo disagreement, replayed wages/consequences and map nodes exposed as playable before runtime support exists.

Protection requires stable locality/world IDs, explicit owner ports, exactly-once receipts and one writer per state family.

---

## 13. Biggest missing player experience

> **One persistent, visible, locality-aware first-hour lifecycle that works in Brăila and at least one second governed locality, carries legitimate employee economy/story/work state, survives save/relaunch, and never silently falls back to Brăila.**

---

## 14. Recommended remediation order

1. DT-11 + DT-02: define/merge the #643 `PlayableLocalityInstance` owner contract and unblock #645 locality persistence.
2. DT-02 + DT-03: consume merged #638 into one governed Player Economy persistence implementation; no second writer.
3. DT-02: refresh #636 readiness governance after #638 and later owner handoffs.
4. DT-08 + DT-09 + DT-10: reconcile/merge #647 and implement the real first-hour trigger -> presentation -> acknowledgement chain.
5. DT-07: complete #631 real citywide production/demand endpoints and compose with merged #627/#639 without fake work.
6. DT-01 + DT-04 + DT-05: reconcile #641/#637/#646 and prove large-city scale under bounded Android budgets.
7. Owner: perform a consolidated #317 Android acceptance checkpoint after the visible city/story wave.
8. DT-14: merge repository-side #591 when orchestrator-authorized, then create the actual production AAB through the authenticated EAS path.
9. Owner + DT-14: perform exact-AAB physical/internal-track testing and close #568 evidence.
10. DT-13 + DT-14 + Owner: complete substantive #569 and #565 against the exact artifact.
11. Owner + DT-14: complete #571 Play Console verification/testing/production-access evidence.
12. DT-15: capture final store/creator assets only from the accepted exact build.

---

## 15. Owner release-candidate validation matrix

The eventual exact candidate should prove, on-device:

- semantic city/district/area/hero readability;
- stable pinch/zoom and controls;
- narrative overlay + Back/input behavior;
- legitimate First Shift / One Small Thing / consequence / First Pay timing;
- authoritative Work Capacity and Personal Money behavior;
- save -> full process termination -> Continue with no duplicate settlement;
- local vs cross-city route value and stable long traversal;
- offline bundled startup and background/resume;
- the same core lifecycle in Brăila, another Romanian locality, a non-Romanian European locality and a materially different locality archetype;
- start outside Brăila, local employer/work/story, save/reload there, replay-safe relocation and legitimate destination runtime;
- Play-delivered exact AAB package/version identity, App Bundle Explorer and pre-launch evidence.

---

## 16. Release verdict

### Verdict: NO-GO

### Effective unconditional P0 count: 9

1. Player Economy final persistence + player-visible cutover;
2. authoritative visible first-hour Story/Mission runtime;
3. #317 owner Android product-quality acceptance;
4. bundled-runtime physical release-candidate acceptance;
5. #568 exact production AAB + attestation/testing evidence;
6. substantive #569 privacy/Data Safety/App Content completion;
7. #565 commercial IP/license/provenance clearance;
8. #571 Play Console verification/signing/testing/production access;
9. #643 global functional-locality/onboarding/relocation end-to-end proof.

### P1 count: 5

1. cross-domain persistence composition + readiness-governance drift;
2. first-hour authority-to-presentation reconciliation;
3. large-city physical Android performance;
4. citywide/global breadth outrunning causal playable runtime;
5. authentic store/creator evidence downstream of the accepted build.

### Conditional P0s while disabled

- #560 authenticated online account/profile authority;
- #562 production account deletion/data-rights lifecycle;
- #564 public chat/UGC safety.

### DT-16 issue hygiene

No new DT-16 issue is required. #643 already owns the newly observed global-playability release blocker, while persistence-governance drift belongs to the existing DT-02 governance lane.

**DT-16 self-merge authorization:** none. Central orchestrator/owner retains merge authority for PR #573.
