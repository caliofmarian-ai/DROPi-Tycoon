# DROPi Tycoon — Issue Reconciliation Matrix

Date: 2026-09-07
Status: Active planning reconciliation
Parent issue: #357
Parent product umbrella: #348
Canonical baseline: PR #358 / merge `c6fbec32e360aad5d2420d14c61c1afbe1399062`

---

## 1. Purpose

This document reconciles the live GitHub backlog with the current canonical product architecture after the 2026-09-07 Universe / Business / Logistics / Progression / Roadmap reconciliation.

The project must no longer treat the old Phase 0–9 ordering, Epic -> RBATCH -> Placeholder duplication, or creation date as execution authority.

The live authority order is:

`VISION -> UNIVERSE_DESIGN -> BUSINESS_DESIGN -> LOGISTICS_DESIGN -> GDD / PROGRESSION -> domain canon -> ROADMAP -> active issue reconciliation -> executable issue -> implementation`.

No gameplay feature implementation is authorized while #357 remains in active reconciliation, except an explicit Project Owner override.

---

## 2. Classification vocabulary

- **KEEP** — scope remains valid and the issue remains an active or future owner.
- **UPDATE** — scope remains useful, but title/body/dependencies/staging must be reconciled with current canon.
- **MERGE-ABSORB** — useful scope is absorbed by another owner; this issue must not remain a competing execution path.
- **CLOSE-HISTORICAL** — completed or superseded planning/implementation lineage is retained for evidence but closed as active work.
- **NEW-CHILD-NEEDED** — canonical scope exists but no adequate executable issue currently owns it.

These classifications are planning decisions, not claims that unverified owner-facing behavior has passed Android acceptance.

---

## 3. Execution model after reconciliation

### Epic

An Epic is a long-lived thematic container. It may remain open across several Strategic Waves. An Epic does not authorize implementation by itself.

### Legacy RBATCH

Existing `RBATCH-*` IDs remain historical lineage and traceability. Completed batches retain merge/CI evidence. Unimplemented future RBATCH shells do not automatically become executable because a preceding old Phase number completes.

### Planning Placeholder

A Placeholder is not an implementation commitment. Once its scope has a canonical owner and an Epic/executable issue path, keeping a duplicate open placeholder adds ambiguity. Such placeholders are closed as absorbed historical planning records.

### Executable issue

One coherent current issue owns each active implementation slice. It must name its canonical dependencies, current Strategic Wave, acceptance requirements and Android owner gate where visible.

---

## 4. Canonical Strategic Waves

| Wave | Purpose | Primary live anchors |
|---|---|---|
| W0 | Canon and backlog reconciliation | #357, #348 |
| W1 | Installed-mobile embodied gameplay quality and acceptance | #317, #309, #324, #325, #338, #339, #342 |
| W2 | Personal capability, smartphone and physical company progression | #343, #349, #352 + NEW education/specialization owner |
| W3 | Local company society: formation, authorization, competition, local market | NEW company-formation owner, NEW competition owner, #329 |
| W4 | Company valuation, ownership, shares, dividends and governance | NEW equity/governance owner; legacy finance/governance epics become thematic inputs |
| W5 | Server-authoritative identity and shared economic society | NEW server-authority owner, updated #328, #330, #334, #335, NEW real-player company-role owner |
| W6 | Regional / multi-city / international multimodal expansion | updated #344 plus activated portions of E-038..E-043 |
| W7 | Advanced logistics technology, energy, drones, AI and automation | E-026..E-037 when prerequisites exist |
| W8 | Mature community, infrastructure-scale and frontier/off-world systems | E-045, E-046 and dedicated future children |
| W9 | Optional ecosystem-token review only | no implementation issue authorized by this reconciliation |

Strategic Waves are dependency/order guidance, not promises that every system inside one wave ships in a single release.

---

## 5. Completed early lineage still open in GitHub

| Issue | Classification | Reconciliation |
|---|---|---|
| #97 E-011 HUD & Notifications | UPDATE | Merged implementation lineage. Remove obsolete Railway-only closure wording; no new feature implementation is implied. |
| #98 E-012 MainMenu & Game Flow | UPDATE | Merged lineage; future menu evolution is governed by mobile-first / phone / physical-world canon. |
| #99 E-013 Company Management Scene | UPDATE | Merged lineage; abstract global Company UI is deprecated and physical HQ + phone boundaries now govern. |
| #100 E-014 Bicycle Ownership System | UPDATE | Merged lineage; bicycle remains the first vehicle branch under Personal Capability + fleet ownership. |
| #101 E-015 Save & Load System | UPDATE | Merged lineage; Save remains canonical technical owner, with additive migrations for new progression. |
| #142 RBATCH-010 | CLOSE-HISTORICAL | Implementation merged; retain PR/CI evidence, remove from active backlog. |
| #143 RBATCH-011 | CLOSE-HISTORICAL | Implementation merged; retain PR/CI evidence, remove from active backlog. |
| #144 RBATCH-012 | CLOSE-HISTORICAL | Implementation merged; later UI changes are owned by physical HQ/phone issues. |
| #145 RBATCH-013 | CLOSE-HISTORICAL | Implementation merged; transport progression continues through current fleet/personal-capability owners. |
| #146 RBATCH-014 | CLOSE-HISTORICAL | Implementation merged; Save evolution proceeds through `SAVE_SYSTEM.md` and active feature migrations. |

Closing a historical batch is not a claim that every later owner-quality concern for the same screen/system is accepted.

---

## 6. Legacy future Epic reconciliation

| Issue | Classification | Strategic interpretation |
|---|---|---|
| #107 E-021 Vehicle Fleet Management | UPDATE | Fleet remains foundational; stale RBATCH activation language must defer to current embodied fleet/HQ/economy issues. |
| #108 E-022 Warehouse Infrastructure | UPDATE | Valid W6/W7 infrastructure theme; physical construction, trained staff and demand prerequisites apply. |
| #109 E-023 Multi-District Map Expansion | UPDATE | Valid world theme; world-access progression and active-region loading apply. |
| #110 E-024 Fleet Management System | UPDATE | Valid theme; avoid abstract dashboard-only implementation; physical HQ + smartphone monitoring boundaries apply. |
| #111 E-025 Route Optimization & Vehicle Upgrades | UPDATE | Valid W6/W7 logistics theme; requires skills/infrastructure and centralized rules. |
| #112 E-026 Drone Research & Technology Tree | UPDATE | Valid W7 theme; drone operation requires trained people + infrastructure, not money alone. |
| #113 E-027 Drone Manufacturing Partners | UPDATE | Valid W7 theme; fictional/simulated business relationships only unless separately aligned to real DROPi. |
| #114 E-028 DronePort Infrastructure System | UPDATE | Valid W7 infrastructure theme under multimodal Logistics Design. |
| #115 E-029 Battery Swapping Network | UPDATE | Valid specialized drone infrastructure theme. |
| #116 E-030 Autonomous Delivery System | UPDATE | Valid W7 theme; automation complements rather than removes embodied logistics gameplay. |
| #117 E-031 Flight Restrictions & Weather | UPDATE | Valid world/logistics constraint theme. |
| #118 E-032 Dynamic Market System | UPDATE | Valid W3/W4+ economy theme; local company competition can begin before full global market simulation. |
| #119 E-033 Fuel & Electricity Economy | UPDATE | Valid operating-cost specialization; no requirement to wait for every drone system first. |
| #120 E-034 Business Loans & Investors | UPDATE | Split conceptual order: basic finance may precede mature equity; investor governance must defer to W4 canon. |
| #121 E-035 Competition & Market Rivals | UPDATE | Move local simulated competition to W3, before international/global expansion. |
| #122 E-036 Smart Routing & Predictive Demand | UPDATE | Valid W7 optimization theme; not prerequisite for identity/multiplayer foundations. |
| #123 E-037 AI Dispatch & Autonomous Fleet | UPDATE | Valid W7 automation theme; must not own earlier server-authoritative society work. |
| #124 E-038 International Operations Foundation | UPDATE | W6 thematic owner; depends on local society/world-access foundations, not on completing every AI feature. |
| #125 E-039 Cross-Border Compliance & Customs | UPDATE | W6 specialization after multi-city/country access exists. |
| #126 E-040 International Intermodal Gateways | UPDATE | W6 multimodal specialization; coordinate with #344. |
| #127 E-041 Corporate Governance & Headquarters | UPDATE | Split: HQ physical progression is already W2 via #343; mature governance is W4. |
| #128 E-042 Public Markets & Investor Governance | UPDATE | W4 thematic input; valuation/share/dividend governance needs a new dedicated modern executable owner. |
| #129 E-043 Franchise & Worldwide Network Orchestration | UPDATE | W6/W8 future scale theme; no longer a prerequisite for multiplayer architecture. |
| #130 E-044 Shared-World Multiplayer Foundation | UPDATE | Critical dependency inversion: server-authoritative identity/shared-state preparation moves to W5 and must not depend on worldwide network completion. |
| #131 E-045 Robotics & Autonomous Operations Growth | UPDATE | W7/W8 future automation theme, not inherently a multiplayer milestone. |
| #132 E-046 Community & Frontier Expansion Governance | UPDATE | W8 late community/frontier theme; off-world content remains very late. |

---

## 7. Legacy future RBATCH reconciliation

### Active-near fleet lineage

| Issue | Classification | Reconciliation |
|---|---|---|
| #155 RBATCH-023 Vehicle Maintenance Costs | MERGE-ABSORB | Absorb executable maintenance-cost scope into updated #215 and physical Maintenance/HQ progression dependencies. |
| #156 RBATCH-024 Phase 2 Integration Verification | CLOSE-HISTORICAL | Old phase-wide verification shell is superseded by per-PR CI + Android owner acceptance + current cross-system verification. |

### Future RBATCH shells

The following unimplemented legacy batch shells are classified **CLOSE-HISTORICAL** as execution authorities. Their thematic scope remains available through the parent Epics and will receive a modern executable issue only when its current canonical prerequisites are ready:

- #157 RBATCH-025 Warehouse Implementation
- #158 RBATCH-026 Multi-District Map Expansion
- #159 RBATCH-027 Delivery Zone Management
- #160 RBATCH-028 Fleet Management Dashboard
- #161 RBATCH-029 Route Optimization Engine
- #162 RBATCH-030 Vehicle Upgrade System
- #163 RBATCH-031 Phase 3 Integration Verification
- #164 RBATCH-032 Drone Research System
- #165 RBATCH-033 Drone Manufacturing Partners
- #166 RBATCH-034 DronePort Construction
- #167 RBATCH-035 Battery Swapping Network
- #168 RBATCH-036 Autonomous Delivery Execution
- #169 RBATCH-037 Flight Restrictions & Weather
- #170 RBATCH-038 Phase 4 Integration Verification
- #171 RBATCH-039 Dynamic Market System
- #172 RBATCH-040 Business Loans & Investor System
- #173 RBATCH-041 Competition & Advanced Economy Integration
- #174 RBATCH-042 Smart Routing & AI Dispatch Foundation
- #175 RBATCH-043 Multi-City Operations Foundation
- #176 RBATCH-044 Country Entry & Regulatory Permissions
- #177 RBATCH-045 Customs & Cross-Border Handling
- #178 RBATCH-046 International Air/Sea Gateway Network
- #179 RBATCH-047 Corporate Headquarters & Governance
- #180 RBATCH-048 Public Company & Stock Market Systems
- #181 RBATCH-049 Franchise Network Expansion
- #182 RBATCH-050 Worldwide Network Coordination
- #183 RBATCH-051 Shared-World Company Presence
- #184 RBATCH-052 Cooperative & Competitive Company Interaction
- #185 RBATCH-053 Robotics & Autonomous Warehouse Planning
- #186 RBATCH-054 Community, Smart-City & Frontier Expansion Governance

This does not delete their design intent. It removes stale Phase-sequence execution authority.

---

## 8. Old executable issues still open

| Issue | Classification | Reconciliation |
|---|---|---|
| #215 ISSUE-029 Vehicle maintenance cost tracking | UPDATE | Keep one executable maintenance-cost owner; align with Company Capability, assigned-vehicle costs, financial reporting and physical Maintenance Wing progression. |
| #219 ISSUE-033 Phase 2 integration verification suite | MERGE-ABSORB | Absorb into modern cross-system CI/owner-verification process; old Phase-2 boundary is no longer the strategic execution boundary. |
| #220 ISSUE-034 Document Phase 2 integration evidence | MERGE-ABSORB | Evidence is produced per implementation/PR/report; standalone future documentation task is redundant. |

---

## 9. Planning placeholders #221–#252

Every currently open planning placeholder below is classified **MERGE-ABSORB -> CLOSE-HISTORICAL**. Each is already represented by a parent Epic/RBATCH and/or current canon; it must not remain a competing future task.

| Issue | Absorbed owner |
|---|---|
| #221 Warehouse Construction | E-022 + future modern warehouse child |
| #222 Multi-District Map | E-023 + Universe Design |
| #223 Delivery Zone Management | E-023 + Logistics Design |
| #224 Fleet Management Dashboard | E-024 + physical HQ/phone boundary |
| #225 Route Optimization Engine | E-025 |
| #226 Vehicle Upgrade System | E-025 + Personal Capability prerequisites |
| #227 Phase 3 Integration Verification | modern CI/owner verification |
| #228 Drone Research Tree | E-026 |
| #229 Drone Manufacturing Partners | E-027 |
| #230 DronePort Infrastructure | E-028 |
| #231 Battery Swapping Network | E-029 |
| #232 Autonomous Drone Delivery | E-030 |
| #233 Flight Restrictions & Weather | E-031 |
| #234 Phase 4 Integration Verification | modern CI/owner verification |
| #235 Dynamic Market System | E-032 |
| #236 Business Loans & Investors | E-034 |
| #237 Competitor AI Companies | E-035 + NEW local competition owner |
| #238 Smart Routing & AI Dispatch | E-036/E-037 |
| #239 Multi-City Operations Foundation | E-038 + #344 |
| #240 Country Entry & Regulatory Permissions | E-038 + world-access progression |
| #241 Customs & Cross-Border Handling | E-039 |
| #242 International Gateway Network | E-040 + #344 |
| #243 Corporate Headquarters Governance | E-041 + #343 + NEW governance owner |
| #244 Public Company & Stock Market Systems | E-042 + NEW equity/governance owner |
| #245 Franchise Network Expansion | E-043 |
| #246 Worldwide Network Coordination | E-043 |
| #247 Shared-World Company Presence | E-044 + NEW server-authority / multiplayer-role owners |
| #248 Cooperative & Competitive Company Interaction | E-044 + NEW multiplayer-role owner |
| #249 Robotics & Autonomous Warehouse Systems | E-045 |
| #250 Community, Smart-City & Frontier Expansion | E-046 |
| #251 Fuel & Electricity Economy Coverage | E-033 |
| #252 AI Dispatch & Autonomous Fleet Coverage | E-037 |

---

## 10. Modern owner-driven issues

| Issue | Classification | Wave / action |
|---|---|---|
| #295 Android application foundation | UPDATE | Keep as platform-tail owner; installed Android is already the primary surface and this no longer blocks ordinary gameplay work. |
| #309 Version + Save & Exit | KEEP | W1 mobile product debt; preserve current Save boundary. |
| #317 Owner quality gate | KEEP | W1 cross-cutting visual/experience gate; owner Android acceptance controls closure. |
| #324 Viewport + selectable fleet | UPDATE | W1 acceptance/lineage; reconcile completed portions without silently closing owner-review obligations. |
| #325 Physical HQ + Marketplace interiors | KEEP | W1 current owner acceptance. Never close without explicit Android confirmation. |
| #326 Pedestrians / traffic crossings | KEEP | Later W1/W6 world-simulation quality slice. |
| #327 City visual diversity | KEEP | Quality/world owner under #317. |
| #328 Player account/profile identity | UPDATE | Move into W5 architecture; identity must be server-authoritative where shared, while offline play remains valid. |
| #329 Marketplace item trading / fleet resale | UPDATE | W3 local/simulated model first; server-authoritative settlement only after W5 authority exists. |
| #330 Online session/presence/chat | UPDATE | W5 after stable identity/server authority; does not itself own full shared-world state. |
| #331 Multi-city travel architecture | MERGE-ABSORB | Absorb into updated #344 + Universe Design active-region/world-access architecture; avoid parallel multi-city owners. |
| #332 Courier/vehicle/management art | KEEP | W1 quality slice under #317. |
| #333 Settings/profile entry points | UPDATE | Keep gameplay settings; profile/account entry integrates with phone/identity architecture rather than becoming a global debug dashboard. |
| #334 Friends/contacts | KEEP | W5 social child after identity/presence. |
| #335 Avatar storage/privacy | KEEP | W5 account specialization under updated #328. |
| #336 High-footfall district semantics | KEEP | World-simulation specialization under #326. |
| #337 Signage/readability | KEEP | World/polish specialization under #327. |
| #338 Analog joystick | KEEP | W1 direct-control owner; Android acceptance required. |
| #339 Android hit-target invariant | KEEP | Permanent technical/control invariant; may later be mirrored into technical canon. |
| #342 Free-look camera | KEEP | W1 navigation/camera owner; Android acceptance required. |
| #343 Progressive HQ departments | KEEP | W2 primary Company Capability anchor. |
| #344 Inter-city multimodal hubs | UPDATE | W6 primary active world/logistics expansion anchor; absorb #331 and coordinate E-038..E-040. |
| #348 Phone + company society umbrella | KEEP | Strategic umbrella; update with merged canon and actual child graph. |
| #349 Player smartphone foundation | KEEP | W2 portable interface anchor; cannot bypass physical HQ actions. |
| #352 Maintenance Wing first build slice | KEEP | W2 child of #343; align with education/specialist prerequisites and #215 costs. |
| #357 Canon/backlog reconciliation | KEEP | W0 current blocker until this matrix and GitHub issue alignment are merged. |

Completed #346 remains closed and is treated as foundation: productive employee/fleet assignment and employee-generated delivery revenue are not reopened by this reconciliation.

---

## 11. Canonical gaps requiring new modern children

The following are **NEW-CHILD-NEEDED**:

1. Personal profession / education / certification foundation.
2. Company formation + simulated municipal authorization + finite local operating capacity.
3. Multiple local competing companies + customer allocation / service-quality competition, single-player simulation first.
4. Company valuation + internal/external share pools + dividends + governance + member-exit reconciliation.
5. Server-authoritative identity/economy/shared-state migration architecture before real shared economic ownership.
6. Real-player company membership / employment / operational roles, with NPC fallback.

These six issues establish the missing bridge from the current playable company prototype to the living company society defined by current canon.

Late systems such as goods production/regional dependency, infrastructure concessions/public-access safeguards, Founder Legacy/Company Heart/Economic Museum and frontier/off-world systems remain canonical future scope but do not need executable micro-issues during W0.

---

## 12. Dependency corrections that are binding after this reconciliation

1. **Multiplayer foundation no longer waits for worldwide network completion.** Server-authoritative identity/economic state is prepared before shared markets, shares or real-player company ownership.
2. **Local competition no longer waits for full drone/global-economy phases.** It begins in a bounded single-player simulation once local company formation is valid.
3. **Corporate governance is not only a late global-HQ feature.** Basic ownership/valuation/governance is introduced before mature multiplayer company society; global/public-market scale comes later.
4. **World expansion does not require every AI/automation feature first.** Multi-city/multimodal expansion follows local society foundations and active-region architecture.
5. **Advanced capability requires people + infrastructure + prerequisites.** Money alone cannot unlock drone/air/sea/rail/advanced operations.
6. **Portable UI does not erase physical gameplay.** The phone monitors and communicates; HQ/facilities remain authoritative for physical operations unless a later explicit unlock changes that rule.
7. **Country/world presentation is not one physical server by definition.** Sharding/topology remains technical implementation detail.

---

## 13. Closure and preservation rules

- Close legacy placeholders/batch shells with `not_planned` when they are superseded as execution paths; explain that scope is absorbed, not rejected.
- Use `completed` only when actual implementation/acceptance evidence supports completion.
- Never close #317, #325, #338, #342 or another explicit owner Android acceptance gate merely because planning has been reconciled.
- Do not reopen completed #346 or other merged implementation children just to renumber/restructure planning.
- Preserve issue numbers, comments, PR links and CI evidence as permanent history.

---

## 14. Exit criteria for #357

#357 can close only when:

1. this matrix is merged;
2. the six missing strategic children exist;
3. #348 and key legacy dependency owners are updated;
4. duplicate planning placeholders are closed/absorbed;
5. stale future RBATCH shells no longer compete as execution authorities;
6. current owner-acceptance issues remain correctly open where validation is still required;
7. the next executable issue is selected from the reconciled Strategic Wave order rather than the old Phase chain.

---

End of Document
