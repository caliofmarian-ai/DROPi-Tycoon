# Game Logic Research — Master Owner Decision Register (Phase 1)

Status: **RESEARCH ONLY — OWNER DECISIONS REQUIRED BEFORE CANON RECONCILIATION**  
Parent: #423

## Purpose

Separate architecture-defining owner decisions from ordinary balancing values. The recommendations below are research proposals, not canon.

---

# A. Identity and World Instances

## D-001 — Economic heroes per account per World Instance

### A — multiple economic alts
Greater role-play freedom but enables self-employment, fake labor, wash trading, internal-company bypass and collusion complexity.

### B — one economic hero/account/world — RECOMMENDED
The same person changes professions/employers/companies rather than creating economic alts.

**Recommendation:** B.

---

## D-002 — What transfers into a fresh World Instance

### A — skills/qualifications/assets partially carry
Reduces repetition but gives veteran economic power in a fresh economy.

### B — non-economic account history only — RECOMMENDED
Carry account identity, settings, cosmetics, achievements/history and optional tutorial skip. Rebuild money, qualifications with productive power, reputation, assets, jobs and ownership in each world.

**Recommendation:** B.

---

## D-003 — Prototype/local save economic import

### A — import current money/company/assets
Unsafe because current state was not created under multiplayer authority/anti-cheat/scarcity.

### B — legacy preservation without fresh-world economic injection — RECOMMENDED
Keep prototype progress in legacy/offline/test history while fresh shared worlds start authoritatively.

**Recommendation:** B.

---

# B. Human Life and Failure

## D-004 — Permanent player aging/death

### A — hero eventually dies/ages out
Strong generational simulation but damages years-long identity, company history and returning-player fairness.

### B — human hero persists; NPC demographics evolve — RECOMMENDED
Hero can retire/be inactive/return, but ordinary world years do not delete the human economic identity.

**Recommendation:** B.

---

## D-005 — Housing loss / homelessness

### A — housing cost exists but player can never actually lose housing
Safer but weakens insolvency and living-cost consequence.

### B — recoverable No Housing/Emergency Housing state — RECOMMENDED
Rent default can end a lease. Rest/storage/location quality worsen. Basic shelter/subsistence/employment recovery remains available; normal housing must be rebuilt economically.

**Recommendation:** B.

---

## D-006 — Offline economic severity

### A — full stasis while offline
Easy but breaks persistent-world consumption and lets inactivity avoid all cost.

### B — legitimate fixed obligations/consumption continue, active-use costs stop — RECOMMENDED
Rent/basic living/service obligations can continue; no driving fuel or manual wage without actual work. Default states bound losses and prevent infinite negative debt.

**Recommendation:** B.

Potential later feature: voluntary `inactive/vacation` preparation that terminates/suspends eligible contracts/services before a long absence, with corresponding loss of benefits/positions.

---

# C. Employment, Membership and Company Control

## D-007 — Internal company membership

### A — member of many companies simultaneously
Creates governance/collusion conflicts.

### B — one primary Internal/Member company at a time — RECOMMENDED
External shares/contracts remain possible. Historical founder identity remains in old firms.

**Recommendation:** B.

---

## D-008 — Multiple jobs

### A — exactly one employer only
Simple but too restrictive for part-time/specialist economy.

### B — compatible multiple employment/service relationships subject to time and conflicts — RECOMMENDED
One worker may have part-time/temporary/specialist contracts if schedules, permissions and conflict rules allow. Internal membership remains separate.

**Recommendation:** B.

---

## D-009 — One person controlling many companies

### A — unrestricted direct control/founding of many parallel companies
Encourages shell-company abuse and makes local competitor caps meaningless.

### B — one primary operating company relationship, with portfolio ownership and corporate subsidiaries/acquisitions — RECOMMENDED
A mature company can buy factories, subsidiaries and businesses; a person may own external shares in many firms. Corporate groups can emerge without one human trivially creating five fake competitors.

**Recommendation:** B.

This supports the owner's vision of a logistics company later acquiring farms/factories/industries.

---

# D. Travel and Geography

## D-010 — Strategic map teleportation

### A — selecting location teleports hero
Fast but makes global transport infrastructure decorative.

### B — infrastructure-backed travel — RECOMMENDED
Map selects/plans destination. Presence changes through walking/road/public transport/rail/air/sea using cost, schedules and time compression where appropriate.

**Recommendation:** B.

---

# E. Currency, Banking and Public Economy

## D-011 — Currency model

### A — permanent universal gameplay currency
Much simpler and easier to balance, but cannot express national currency strength or FX/trade strategy.

### B — national currencies as long-term architecture — RECOMMENDED WITH STAGED IMPLEMENTATION
Design economic ledgers with `CurrencyId` capability from the start. Early implementation may expose only the active local currency, while later international play activates exchange rates/multi-currency holdings.

Company Money and Personal Money describe **ownership domain**, not a globally unique currency type.

**Recommendation:** B, staged.

---

## D-012 — Banks / debt / credit

### A — no loans ever
Simple but removes major realistic financing and bankruptcy mechanism.

### B — add governed banking/credit only after core economy is stable — RECOMMENDED
Starter player has no easy debt shortcut. Later personal/company credit can require collateral, credit history, interest, repayment and default rules.

**Recommendation:** B, late/staged.

---

## D-013 — Taxes and public budgets

### A — omit taxation/public budget entirely
Simpler but makes public infrastructure/services/monetary sinks harder to explain.

### B — simplified economic tax/public-budget layer — RECOMMENDED
Use understandable aggregated taxes/fees rather than tax-form micromanagement. Funds can support infrastructure, utilities, education/basic services and stabilization where appropriate.

**Recommendation:** B, simplified and later.

---

# F. Infrastructure and Industry Ownership

## D-014 — Critical infrastructure ownership

### A — any company can own and deny access to roads/ports/power/etc.
Strong capitalism simulation but creates world-scale griefing/monopoly softlocks.

### B — mixed ownership + governed access/concessions — RECOMMENDED
Private companies can build/own/operate many assets, but essential corridors/utilities use access obligations, concession rules or public fallback capacity.

**Recommendation:** B.

---

## D-015 — Privatization/acquisition of productive industry

### A — major industries remain NPC/public forever
Simpler but blocks owner's intended late-game industrial expansion.

### B — eligible productive assets can be acquired through governed sale/auction/privatization — RECOMMENDED
Requires capital, specialists, authorization, infrastructure, working capital and ongoing obligations.

**Recommendation:** B.

---

# G. NPC Economy and Newcomer Floor

## D-016 — Essential NPC fallback

### A — fully player-dependent economy
Emergent but can die when human population is low/offline.

### B — bounded NPC baseline/fallback — RECOMMENDED
NPC consumers/workers/employers/market counterparties keep essential loops alive but obey costs/inventories and provide worse/thinner market depth than healthy human competition where appropriate.

**Recommendation:** B.

---

## D-017 — Bankruptcy recovery

### A — hard game-over/delete hero
High stakes but incompatible with long-lived identity/social world.

### B — severe economic reset to lowest legitimate productive rung — OWNER DIRECTION / RECOMMENDED
Identity/history/valid qualifications persist; eligible assets/privileges may be lost; player can return to pedestrian basic employment and rebuild.

**Recommendation:** B.

---

# H. Brand and Real-World Inspiration

## D-018 — Starting employer branding

Owner named **Amazon** as the concrete desired/reference employer.

### A — ship using real Amazon brand without dedicated permission/licensing review
Not recommended.

### B — fictional large incumbent logistics employer inspired by the real-world role — RECOMMENDED DEFAULT
Preserves gameplay without dependency on a third-party brand license.

### C — real Amazon brand only after explicit permission/license and legal/product review
Possible only if separately secured.

**Recommendation:** B by default; C if permission is later obtained.

---

# I. Political / Geopolitical Evolution

## D-019 — War and country-state transitions

### A — no geopolitical conflict/state changes
Simpler but removes owner-requested macro evolution.

### B — fictional macroeconomic/logistics conflict with stable historical IDs — RECOMMENDED
No tactical combat requirement. Effects can include route/infrastructure disruption, shortages, migration and fictional state merge/split/inactive transitions.

**Recommendation:** B.

---

# J. Simulation granularity

## D-020 — Person/city simulation granularity

### A — simulate every global NPC individually at all times
Extremely expensive and unnecessary.

### B — multi-resolution simulation — RECOMMENDED
Real players and nearby visible NPCs can be individual; larger population uses cohorts/stocks/flows. Economic conservation remains consistent across zoom levels.

**Recommendation:** B.

---

# Decisions that are NOT owner-canon questions yet

The following should remain configurable balancing/research values unless later required as architectural constants:

- minutes per game day;
- exact food/water amount;
- Work Capacity points;
- wage values;
- rent/fuel/energy prices;
- course prices;
- exact competitor count formula around the owner target;
- bankruptcy grace duration;
- production recipe quantities;
- tax rates;
- exchange-rate formula coefficients;
- season length.

These should be simulated/tested rather than frozen by conversation.

---

# Recommended architecture package

Phase-1 research currently recommends:

**B for D-001 through D-020**, with staged implementation explicitly noted for national currencies, banking and public budgets.

This package creates one coherent design:

- one flexible persistent person per world;
- real consumption/failure;
- one meaningful internal company identity;
- corporate expansion via real assets/subsidiaries rather than shell alts;
- physical global transport;
- national economic depth without forcing full FX on day one;
- recoverable poverty/bankruptcy;
- NPC continuity;
- private enterprise with anti-softlock essential infrastructure;
- fictional geopolitical evolution;
- scalable multi-resolution simulation.

No item becomes canon until owner approval and the later reconciliation PR.
