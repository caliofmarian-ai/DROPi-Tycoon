# MASTER OWNER DIRECTIVE 005 — Phase-1 Game Architecture Approval

Date: 2026-09-08
Project: DROPi Tycoon
Status: **OWNER-APPROVED DIRECTIVE**
Owner approval source: Issue #434 and direct owner approval in project conversation
Research source: PR #425, merged to `main` as explicitly non-canonical research

---

## Purpose

This directive records the owner's approval of the complete Phase-1 game architecture package and authorizes canonical reconciliation of the researched model.

It does **not** authorize arbitrary balancing constants, unrelated runtime rewrites, or silent save migration.

The research archive remains valuable evidence, but canon is changed only through explicit reconciliation commits/PRs.

---

# 1. Person and World Instances

1. One economic hero exists per account per World Instance.
2. A fresh World Instance transfers only non-economic account history by default: settings, cosmetics, achievements/history and tutorial familiarity may follow the account.
3. Money, productive qualifications, assets, shares, reputation, company power and other economic capability are World-Instance-local and are rebuilt in a fresh world unless a later owner-approved exception is created.
4. Prototype/local saves do not inject economic power into a fresh multiplayer World Instance. They may be preserved through legacy/offline/migration history.
5. Human hero identity persists through normal World Instance time. NPC demographics may age/change, but normal world years do not permanently delete the human player's economic identity.

---

# 2. Employment, Membership and Corporate Control

6. A person has one primary Internal/Member company relationship at a time.
7. Compatible multiple jobs/contracts may coexist when schedules, permissions and conflict rules allow them.
8. External investment remains separate from operational membership.
9. Unlimited shell-company control is not permitted as a way to manufacture fake competition. Broader control grows through legitimate shares, acquisitions and subsidiaries.

---

# 3. Geography and Travel

10. Strategic maps do not provide free economic teleportation.
11. Presence changes through unlocked walking, road, public transport, rail, air and sea infrastructure with appropriate cost/time.
12. Time compression may be used when needed for usability, but economic/logistics consequences remain preserved.

---

# 4. Failure and Offline Life

13. Housing can genuinely be lost, producing recoverable No Housing / Emergency Housing states.
14. Offline world time may continue legitimate fixed obligations and basic living consumption.
15. Active-use costs such as driving fuel stop when the asset is not being used.
16. Starter wages require actual work; absence does not manufacture salary.
17. Bankruptcy is severe but recoverable. Identity, history and valid earned capability survive; the player can return to the lowest legitimate productive rung and rebuild.

---

# 5. Currency, Banking and Public Economy

18. The architecture must support national currencies as a staged long-term target.
19. `Personal Money` and `Company Money` are ownership/accounting domains, not one permanently universal currency type.
20. Full foreign-exchange mechanics may arrive later after the core economy is stable.
21. Banking, debt and credit may be added later only with explicit collateral/interest/default rules.
22. Simplified taxation/public budgets may be added later where they close public infrastructure/service money loops; DROPi Tycoon is not a tax-form simulator.

---

# 6. Infrastructure and Productive Ownership

23. Essential infrastructure may use public, private, concession or mixed ownership models with fair-access safeguards.
24. No private operator may permanently softlock a city/country by denying essential transport corridors or utilities without governed counterplay/access rules.
25. Eligible farms, factories and industrial assets may be acquired/privatized through governed sale, auction or concession when capital, specialists, authorization, infrastructure and operating capability exist.

---

# 7. Persistent Multiplayer Continuity

26. A bounded NPC baseline/fallback remains part of the world model so essential loops remain playable at low human population.
27. NPC workers, employers, consumers and counterparties obey real costs/inventories and cannot provide infinite free resources.
28. Macro conflict/state evolution may exist as fictional economic/logistics/world-state simulation with stable historical IDs, not tactical combat.
29. The world uses multi-resolution simulation: real players and nearby important NPCs may be individual; city/country/global populations use cohorts/stocks/flows while conserving economic truth.
30. The starting incumbent logistics employer is fictional by default unless a separate real-brand permission/licensing review explicitly authorizes otherwise.

---

# 8. Owner Directions Already Fixed

The following owner directions are reaffirmed and are not reopened by this directive:

- the game is global, with all countries strategically represented;
- world simulation uses representative cities/rural nodes plus external economic facilities rather than requiring every real settlement as a detailed scene;
- the hero starts poor, on foot, as an employee of a large incumbent delivery employer;
- early work includes flyers, letters and other light cargo;
- early compensation is primarily day/shift wage rather than arbitrary per-drop money;
- the hero consumes food, water, living costs and finite Work Capacity;
- vehicles/equipment consume fuel/charge/maintenance according to use and state;
- capability is earned through money plus learning, qualification, authorization, people, equipment and infrastructure;
- deliveries arise from real demand, inventory, procurement, contracts and custody rather than infinite random mission rewards;
- people, companies, cities and productive facilities consume resources and create waste/economic consequences;
- localities/countries can grow, decline and recover through supply, jobs, migration, investment and infrastructure;
- roughly five meaningful last-mile competitors is an urban design target, with normally one to two in rural localities, subject to economic capacity rather than a naive hard counter;
- industrial relationships may mature from occasional work to contracts, investment and acquisition;
- old World Instances remain when new World Instances launch;
- R9 playability rule: **Your work leaves a mark.** Meaningful actions should create visible personal, company or world consequences and the game should motivate return through authorship/attachment, not dark-pattern retention.

---

# 9. Balancing Boundary

This directive does not freeze numeric balancing values such as:

- wages;
- food/water quantities;
- Work Capacity rates;
- fuel/energy prices;
- rent;
- taxes;
- day length;
- training duration;
- market coefficients;
- competitor-count thresholds.

These remain centralized, configurable and playtestable unless separately promoted to canon.

---

# 10. Reconciliation Authority

This directive authorizes a dedicated canon-reconciliation PR to:

1. promote the approved Phase-1 architecture into a canonical decision baseline;
2. update conflicting or incomplete canonical documents;
3. explicitly mark prototype/runtime behavior as legacy compatibility where implementation has not yet migrated;
4. preserve robust existing foundations instead of rewriting them for novelty;
5. derive implementation epics in causal order;
6. apply the R9 Playability Integration Gate to player-facing implementation slices.

Runtime behavior is changed only by later implementation PRs with tests, migration rules and owner-facing verification where appropriate.

---

## Owner Rule

**The approved Phase-1 architecture is now the decision source for canon reconciliation. Research options that conflict with this directive are closed unless the owner explicitly reopens them.**
