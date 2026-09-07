# DROPi Tycoon — Issue Reconciliation Matrix

Date: 2026-09-07
Status: Reconciled — pending merge of this planning record
Parent issue: #357
Parent product umbrella: #348
Canonical baseline: PR #358 / merge `c6fbec32e360aad5d2420d14c61c1afbe1399062`

---

## 1. Purpose

This document records the completed reconciliation of the live GitHub backlog with the canonical DROPi Tycoon product architecture established on 2026-09-07.

The old linear Phase 0–9 plan, duplicated Epic -> RBATCH -> Placeholder hierarchy, and issue creation date no longer authorize implementation.

The live authority order is:

`VISION -> UNIVERSE_DESIGN -> BUSINESS_DESIGN -> LOGISTICS_DESIGN -> GDD / PROGRESSION -> domain canon -> ROADMAP -> this reconciliation -> executable issue -> implementation`.

Historical issue IDs, comments, PR links and CI evidence remain permanent lineage.

---

## 2. Classification vocabulary

- **KEEP** — still a valid active/future owner.
- **UPDATE** — useful owner retained with current canon/staging/dependencies.
- **MERGE-ABSORB** — useful scope moved into another owner; duplicate issue closed.
- **CLOSE-HISTORICAL** — implementation/planning lineage preserved but removed from active work.
- **MATERIALIZED-CHILD** — previously missing canonical scope now has a dedicated modern issue.

---

## 3. Execution model after reconciliation

### Epic

An Epic is a thematic container. It does not authorize implementation by itself.

### Legacy RBATCH

Legacy `RBATCH-*` IDs are historical planning lineage. Completed RBATCHes retain implementation evidence; unimplemented future RBATCH shells no longer impose a linear execution chain.

### Placeholder

Planning placeholders are not implementation commitments. Duplicate placeholders were closed once their scope had a canonical owner.

### Executable issue

One current executable issue owns each coherent implementation slice and must state its real canonical dependencies, scope boundaries, CI expectations and Android owner gate where visible.

---

## 4. Canonical Strategic Waves

| Wave | Purpose | Primary live anchors |
|---|---|---|
| W0 | Canon + backlog reconciliation | #357, #348 |
| W1 | Installed-mobile embodied gameplay quality and owner acceptance | #309, #317, #324, #325, #338, #339, #342 |
| W2 | Personal capability, smartphone and physical company progression | #343, #349, #352, #359, #215 |
| W3 | Local company society: formation, authorization, competition and local market | #360, #361, #329 |
| W4 | Valuation, ownership, shares, dividends and governance | #362 plus thematic E-034/E-041/E-042 |
| W5 | Server-authoritative identity and shared company society | #363, #328, #330, #334, #335, #364, E-044/#130 |
| W6 | Regional / multi-city / international multimodal expansion | #344, E-038/#124, E-039/#125, E-040/#126, later E-043/#129 |
| W7 | Advanced logistics technology, energy, drones, AI and automation | E-026..E-037 when current prerequisites exist |
| W8 | Mature infrastructure/community/frontier/off-world systems | E-045/#131, E-046/#132 and future dedicated children |
| W9 | Optional DROPi ecosystem-token review only | no token implementation issue authorized |

Strategic Waves express dependency order and product maturity, not one-PR releases.

---

## 5. Missing strategic bridge issues — now materialized

The six canonical gaps identified by #357 are resolved as planning owners:

| Issue | Canonical purpose |
|---|---|
| #359 | Personal profession / education / certification foundation |
| #360 | Company formation + fictional municipal authorization + finite local operating capacity |
| #361 | Multiple local companies + customer competition simulation |
| #362 | Company valuation + internal/external shares + dividends + governance + member-exit reconciliation |
| #363 | Server-authoritative identity/economy/shared-state migration architecture |
| #364 | Real-player company membership/employment/operational roles with NPC fallback |

These issues bridge the current playable company prototype to the living economic/company society defined by `UNIVERSE_DESIGN.md`, `BUSINESS_DESIGN.md`, `PROGRESSION.md` and #348.

---

## 6. Key dependency corrections

1. **Multiplayer authority no longer waits for worldwide expansion.** E-044/#130 now points to #359 -> #363 -> #328/#330 -> #364 before real shared economic ownership.
2. **Local competition no longer waits for drones/global markets.** E-035/#121 now uses #360 -> #361 in W3.
3. **Physical HQ and governance are separated.** #343/#352 own early visible HQ capability; #362 owns W4 ownership/governance foundations; E-041/#127 is thematic across both.
4. **Public-market foundations move earlier than global-empire scale.** E-042/#128 now specializes #362 rather than requiring the old Phase-8 chain.
5. **Worldwide network is not a multiplayer prerequisite.** E-043/#129 now follows #344 and later world maturity rather than blocking E-044.
6. **Multi-city architecture has one modern owner.** #331 was absorbed and closed; updated #344 owns active-region loading, World Access and multimodal hub/custody architecture.
7. **Vehicle maintenance has one executable owner.** #215 remains open and is aligned with #343/#352/#359; RBATCH-023/#155 was absorbed.
8. **Advanced capability requires people + infrastructure + prerequisites.** Money alone cannot activate every advanced transport/technology/service.
9. **Portable UI does not erase physical gameplay.** #349 smartphone may monitor/communicate but cannot bypass required physical HQ/facility actions.
10. **Country/world presentation is not one physical server by definition.** Technical shard/server topology remains an architecture concern.

---

## 7. Historical planning cleanup performed

### Completed early RBATCH lineage

Closed as `HISTORICAL/COMPLETED`, preserving implementation evidence:

- #142 RBATCH-010 — HUD + Notifications
- #143 RBATCH-011 — MainMenu Flow
- #144 RBATCH-012 — CompanyManagement + Upgrade Purchase Flow
- #145 RBATCH-013 — Bicycle Ownership + Speed Increase
- #146 RBATCH-014 — Save/Load Implementation

Their closure does not claim later Android/visual owner issues are accepted.

### Maintenance / old Phase-2 duplicates

- #155 RBATCH-023 — closed `HISTORICAL/ABSORBED`; executable scope moved to #215.
- #156 RBATCH-024 — closed `HISTORICAL/ABSORBED`.
- #219 ISSUE-033 — closed `HISTORICAL/ABSORBED`.
- #220 ISSUE-034 — closed `HISTORICAL/ABSORBED`.

### Future RBATCH execution shells

All unimplemented future RBATCH shells #157–#186 are closed `HISTORICAL/SUPERSEDED` as execution authorities. Their design themes remain represented by their parent Epics and current canon. Modern executable children will be created only when current Strategic Wave prerequisites are ready.

### Planning placeholders

All 32 planning placeholders #221–#252 are closed `HISTORICAL/ABSORBED`. Their scope was not rejected; it is owned by canonical documents, thematic Epics and/or modern executable issues.

### Duplicate multi-city owner

#331 is closed `not_planned` after its useful active-city/multi-city architecture was explicitly absorbed into updated #344.

---

## 8. Legacy Epic reconciliation

Legacy Epics remain thematic unless separately closed by actual completion evidence.

### Merged early-system Epics

#97–#101 remain classified **UPDATE** as merged-system lineage. Their stale Railway-era wording must not override current installed-Android owner quality/acceptance issues or the phone/physical-world canon.

### Fleet / world / logistics / economy / automation Epics

- #107 E-021 — **UPDATED**; points to current fleet/HQ/maintenance/personal-capability owners.
- #108–#120 — **UPDATE**; themes retained, old Phase dependencies no longer automatic execution authority.
- #121 E-035 — **UPDATED**; local competition now W3 through #360/#361.
- #122–#123 — **UPDATE**; AI optimization remains later W7 and does not block W5 authority work.
- #124 E-038 — **UPDATE**; W6 specialization of #344, not a second multi-city architecture.
- #125 E-039 — **UPDATE**; cross-border specialization after World Access exists.
- #126 E-040 — **UPDATE**; intermodal gateway specialization of #344.
- #127 E-041 — **UPDATED**; HQ W2 separated from governance W4.
- #128 E-042 — **UPDATED**; public/investor market foundations reference #362.
- #129 E-043 — **UPDATED**; worldwide network no longer prerequisite for multiplayer authority.
- #130 E-044 — **UPDATED**; server-authority-first dependency direction.
- #131 E-045 — **UPDATE**; robotics/automation later W7/W8.
- #132 E-046 — **UPDATE**; community/frontier/off-world remains late W8.

An Epic is not a command to revive its historical RBATCH.

---

## 9. Modern owner-driven issue disposition

### KEEP / UPDATE and remain open

- #295 — UPDATE; mobile platform tail, installed Android already primary owner surface.
- #309 — KEEP; player-facing version + Save & Exit debt.
- #317 — KEEP; cross-cutting owner quality gate.
- #324 — UPDATE/KEEP; viewport/fleet lineage and owner-facing acceptance obligations.
- #325 — KEEP; physical HQ/Marketplace interior owner acceptance.
- #326 — KEEP; pedestrians/traffic simulation quality.
- #327 — KEEP; city/art diversity.
- #328 — UPDATE; profile identity coordinated with server-authority #363.
- #329 — UPDATE; local/simulated marketplace first, shared settlement only after #363.
- #330 — UPDATE; session/presence/chat after #363/#328; not full shared economy authority.
- #332 — KEEP; courier/vehicle/management art quality.
- #333 — UPDATE; Settings integrates with phone/account boundaries without becoming a global debug panel.
- #334 — KEEP; friends/contacts after identity/presence.
- #335 — KEEP; avatar storage/privacy specialization.
- #336 — KEEP; high-footfall world semantics.
- #337 — KEEP; signage/readability.
- #338 — KEEP; analog joystick owner gate.
- #339 — KEEP; permanent Android-safe hit-target invariant.
- #342 — KEEP; free-look/camera owner gate.
- #343 — KEEP; primary W2 HQ Company Capability anchor.
- #344 — UPDATED; primary W6 world/multimodal expansion anchor.
- #348 — KEEP; strategic product/company-society umbrella.
- #349 — KEEP; W2 player smartphone foundation.
- #352 — KEEP; first Maintenance Wing construction slice.
- #357 — KEEP until this reconciliation record is merged and final audit passes.
- #359–#364 — KEEP; new strategic bridge owners.

### Completed foundation retained

#346 remains closed/completed and is not reopened. Productive employee/fleet assignment and employee-generated delivery value are foundational input for later company society.

---

## 10. Owner acceptance protection

Planning cleanup must never masquerade as owner acceptance.

In particular, do **not** close these merely because their planning relationships are reconciled:

- #317 — owner quality gate;
- #325 — HQ/Marketplace physical interior acceptance;
- #338 — analog joystick acceptance;
- #342 — free-look camera acceptance;
- any other issue whose body explicitly requires Android Project Owner validation.

The installed Android game remains the primary owner-facing acceptance surface. Railway/browser remains secondary preview/smoke infrastructure.

---

## 11. Token and real-DROPi boundary

This reconciliation creates no blockchain, wallet, smart contract, tokenomics, ticker, supply, exchange, KYC or real-money reward implementation.

Company Money remains sufficient for normal gameplay. Any future DROPi ecosystem token requires a separate canonical/economic/safety review and cannot bypass skill, infrastructure, permits or specialist requirements.

The real `caliofmarian-ai/dropi-mobile` repository remains authoritative for the real DROPi product. Tycoon inventions are not real DROPi product claims.

---

## 12. Exit criteria for #357

The reconciliation phase is ready to close when all of the following are true:

- [x] strategic canon merged through PR #358;
- [x] this reconciliation matrix exists;
- [x] missing children #359–#364 exist;
- [x] #130 multiplayer dependency direction corrected;
- [x] #344 established as the single modern multi-city/multimodal anchor;
- [x] #331 duplicate owner absorbed/closed;
- [x] #215 retained as single maintenance-cost executable owner;
- [x] all #221–#252 placeholders absorbed/closed;
- [x] future RBATCH shells #157–#186 removed as execution authorities;
- [x] completed RBATCH-010..014 historical lineage closed without erasing owner-quality debt;
- [x] key Epics #107/#121/#127/#128/#129/#130 reconciled;
- [x] online #328/#330 linked to #363 authority;
- [x] explicit Android owner gates preserved open;
- [ ] this planning record and final reconciliation report merged to `main` with green CI.

After the final checkbox is satisfied, #357 may close as completed and future work must be selected from the Strategic Wave model rather than the old linear Phase chain.

---

End of Document
