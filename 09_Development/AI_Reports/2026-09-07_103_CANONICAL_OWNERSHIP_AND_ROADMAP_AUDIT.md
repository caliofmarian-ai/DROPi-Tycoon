# Document Information

Document: 2026-09-07_103_CANONICAL_OWNERSHIP_AND_ROADMAP_AUDIT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: AI Task Report / Canonical Preparation Audit
Author: Marian Caliof & OpenAI
Language: English
Date: 2026-09-07
Related Issue: #357

---

# Canonical Ownership and Roadmap Audit

## Purpose

This report satisfies the mandatory architecture and ownership audit required by `00_Project/VISION.md` before materializing the approved Universe Design domain and before reorganizing strategic canonical ownership.

It records the repository state examined after merge commit `a958199e23c3ca7e010ad4f3655aed0aed176a4b` and identifies ownership gaps, overlaps, contradictions, preservation rules, and the minimum canonical change set required before backlog reconciliation.

This report is historical evidence. It does not itself override live canonical documents.

---

# 1. Authoritative Sources Inspected

Primary strategic/canonical sources:

- `00_Project/VISION.md`
- `00_Project/ROADMAP.md`
- `00_Project/DOCUMENT_INDEX.md`
- `01_GameDesign/GDD.md`
- `01_GameDesign/PROGRESSION.md`
- `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`
- `01_GameDesign/HQ_PROGRESSION.md`
- `02_Economy/ECONOMY.md`
- `03_Logistics/LOGISTICS.md`
- `04_World/WORLD.md`
- `06_Technical/ARCHITECTURE.md`
- `07_UI/PLAYER_SMARTPHONE.md`
- `09_Development/Owner_Directives/2026-09-05_MASTER_OWNER_DIRECTIVE_002_Product_Identity_and_Visible_Operations.md`

Planning/backlog sources:

- current open GitHub issues and epics;
- `09_Development/Planning/*` planning architecture;
- umbrella issue #348 and active/future child issues including #343, #344, #349 and #352.

---

# 2. Confirmed Strategic Direction

The current owner-approved direction is coherent across the latest sources:

- installed Android is the primary owner/player quality surface;
- Phaser remains the authoritative gameplay runtime;
- the game is an embodied Urban RPG + Business Tycoon + Local Marketplace + Multimodal Logistics + Infrastructure Builder + future Drone Network simulation;
- the player is a visible person in a living world, not an abstract dashboard operator;
- portable information belongs primarily to the in-world smartphone;
- physical company work remains tied to actual facilities where appropriate;
- NPC/simulated workers remain valid even after multiplayer is introduced;
- player education/specialization, company capability and physical infrastructure must gate one another;
- companies eventually compete for customers and may support investment/governance;
- world scale grows from local city play toward regional, international and very-late-game off-world logistics;
- Company Money remains sufficient for normal gameplay;
- no token/blockchain/wallet/real-money system is authorized by current Tycoon canon.

Existing playable work is a foundation of this direction and must be reconciled, not discarded.

---

# 3. Ownership Gap — Universe Design

`VISION.md` explicitly approved Universe Design as the layer immediately below Project Vision but left it without a canonical owner pending this audit.

Existing `04_World/WORLD.md` contains useful world-system detail, but it is currently treated as a lower-level World domain document and does not own the complete persistent society/world model now required by #348.

Universe-level concepts currently dispersed across Vision, GDD, Company Society, World and issues include:

- persistent world hierarchy;
- citizens/players and organizations coexisting in shared logical worlds;
- countries/world shards as player-facing constructs rather than one-server mandates;
- public/civic institutions;
- infrastructure ownership and public-access safeguards;
- low-population NPC continuity;
- local-to-planetary scale;
- region-scoped active simulation.

Decision from this audit:

**Create `00_Project/UNIVERSE_DESIGN.md` as the canonical Universe Design owner.**

`04_World/WORLD.md`, `MAP.md`, `BUILDINGS.md`, `NPC.md` and `WEATHER.md` remain lower-level specializations and must defer to it.

---

# 4. Ownership Gap — Business Design

The design hierarchy in Vision includes Business Design, but no single canonical owner currently exists at that level.

Business rules are dispersed across:

- `02_Economy/ECONOMY.md`;
- `02_Economy/EMPLOYEES.md`;
- `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`;
- HQ progression;
- future market/investor/governance issues.

The missing bridge must govern the company as an organization rather than duplicate detailed economy formulas.

Decision from this audit:

**Create `00_Project/BUSINESS_DESIGN.md` as the canonical Business Design owner.**

It will own organizational lifecycle, company formation, workforce composition, competition, ownership/governance principles, products, founder legacy and business/infrastructure relationships. Economy-specific calculations remain owned by `02_Economy/`.

---

# 5. Ownership Gap — Logistics Design

`03_Logistics/LOGISTICS.md` already owns core logistics mechanics, but the hierarchy declared in Vision places Logistics Design above Game Design. The current document is written primarily as a gameplay-system specification and does not yet provide the strategic multimodal/custody/infrastructure bridge required by the expanded vision.

Decision from this audit:

**Create `00_Project/LOGISTICS_DESIGN.md` as the strategic Logistics Design owner.**

It will define the multimodal logistics model, custody/transfer principles, hub/infrastructure hierarchy, qualification/infrastructure gating and local-to-global flow. `03_Logistics/*` remains the detailed gameplay/domain specialization.

---

# 6. Progression Gap

`01_GameDesign/PROGRESSION.md` currently models nine company-scale stages well enough for the earlier tycoon concept, but it does not govern the newer personal progression system.

Missing canonical progression concepts include:

- player identity before/alongside company ownership;
- education, qualifications and professions;
- alternative roles such as employee, specialist, founder, executive and investor;
- two-way player/company capability gating;
- physical department/facility prerequisites;
- local civic/company-formation prerequisites;
- multiplayer-compatible role continuity.

Decision from this audit:

**Revise `01_GameDesign/PROGRESSION.md` into a dual progression model: Personal Progression + Company Progression + World Access.**

Current single-player compatibility must be explicit: the prototype currently collapses the starter operation into the existing company state, while later identity/company separation requires an explicit migration rather than pretending it already exists.

---

# 7. Roadmap Contradictions

`00_Project/ROADMAP.md` contains two material contradictions with newer canon:

1. It still begins with the statement that DROPi Tycoon is web-first, while current Vision and Architecture explicitly define installed mobile/Android as primary.
2. It places Multiplayer only in Phase 9 after global corporation systems. The newer company-society direction requires identity and server-authoritative architecture to be prepared before mature shared company ownership, chat, market transactions and contested world assets.

The old phase sequence also omits explicit early stages for:

- player smartphone foundation;
- education/specialization;
- company formation/authorization;
- local competition/customer market;
- equity/governance simulation before shared online authority.

Decision from this audit:

**Revise `00_Project/ROADMAP.md` to a strategic-wave model aligned to the current product.**

Historical milestone/epic/batch IDs remain traceability assets until backlog reconciliation remaps them.

---

# 8. GDD/Vision Reconciliation Need

`VISION.md` and `GDD.md` remain fundamentally compatible with the expanded direction, but both require concise updates so the new bridge documents are authoritative rather than hidden only in a specialization issue/document.

Required changes:

- Vision recognizes the now-materialized Universe/Business/Logistics owners;
- GDD recognizes the player as a citizen/person who may grow through multiple organizational roles;
- GDD makes world-embodied interaction and visible company consequences explicit;
- the smartphone/HQ physical boundary is referenced at the high gameplay layer.

No rewrite of the core design values is required.

---

# 9. Existing Canon to Preserve

The following must not be duplicated or invalidated:

- `COMPANY_SOCIETY_AND_MULTIPLAYER.md` — detailed gameplay specialization for society, education, competition, shares/governance, founder legacy and multiplayer staging;
- `HQ_PROGRESSION.md` — detailed physical HQ department progression;
- `PLAYER_SMARTPHONE.md` — portable interface authority;
- `ECONOMY.md` and other `02_Economy/*` — economic calculations and resource rules;
- `03_Logistics/*` — detailed logistics gameplay entities/systems;
- `04_World/*` — world implementation/simulation specializations;
- `06_Technical/*` — runtime/platform/server authority boundaries;
- existing completed gameplay implementation and Save compatibility.

The new bridge documents must point downward to these owners rather than restating every detailed rule.

---

# 10. Backlog Audit — High-Level Finding

The open GitHub backlog contains three overlapping generations:

1. historical milestone/epic/batch planning from the original Phase 0–9 roadmap;
2. mobile/product-quality and embodied-world correction issues (#295 onward);
3. expanded society/economy/world direction centered on #348.

The backlog therefore must not be executed simply by issue number or old phase order.

Required post-canon reconciliation categories:

- **KEEP** — still correct and correctly scoped;
- **UPDATE** — correct concept, wrong order/dependency/scope wording;
- **MERGE/ABSORB** — duplicates a newer authoritative issue;
- **CLOSE-HISTORICAL** — implementation/verification already superseded or completed with sufficient evidence;
- **NEW CHILD REQUIRED** — canonical requirement has no executable issue.

Known missing executable planning areas already identified:

- player education/specialization foundation;
- company formation/civic authorization/territorial capacity;
- local competitor company/customer acquisition simulation;
- company valuation/equity/dividend/governance simulation;
- server-authoritative multiplayer migration architecture;
- later founder artifact/economic museum implementation planning.

Final classification must be persisted as a backlog reconciliation matrix after the canonical documents merge.

---

# 11. Approved Minimal Canonical Change Set

This audit authorizes the following documentation work under owner instruction and issue #357:

Create:

- `00_Project/UNIVERSE_DESIGN.md`
- `00_Project/BUSINESS_DESIGN.md`
- `00_Project/LOGISTICS_DESIGN.md`

Revise:

- `00_Project/VISION.md`
- `00_Project/ROADMAP.md`
- `00_Project/DOCUMENT_INDEX.md`
- `01_GameDesign/GDD.md`
- `01_GameDesign/PROGRESSION.md`

Preserve as specializations:

- all existing numbered domain documents unless a direct contradiction is found during editing.

---

# 12. Conclusion

The expanded owner vision does not require a new game or a repository reset.

The existing runtime and canonical system documents already form the lower layers of the intended product. The missing work is to install the strategic bridge layers above them, correct roadmap/progression authority, and then remap the GitHub backlog to the resulting canonical model.

This audit completes the prerequisite required by `VISION.md` for materializing Universe Design documentation.

---

End of Report
