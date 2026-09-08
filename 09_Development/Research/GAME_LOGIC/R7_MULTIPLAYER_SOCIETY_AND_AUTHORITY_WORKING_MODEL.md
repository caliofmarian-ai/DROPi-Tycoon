# R7 — Multiplayer Society, Competition and Authority Working Model

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #431

## Purpose

Define how human players coexist, work, compete, cooperate, own assets and influence one persistent economy without requiring everyone to be online simultaneously or allowing one player/company to permanently destroy normal progression for others.

---

# 1. Multiplayer is the world, not a separate mode

The intended mature design is one shared persistent society per World Instance.

Human players and NPC simulation participate in the same:

- labor markets;
- companies;
- product markets;
- contracts;
- logistics networks;
- infrastructure;
- investment/governance;
- city/country economy.

There is no separate "single-player economy" running beside a "multiplayer economy" once a state family has migrated to shared authority.

---

# 2. Stable human identity

A human account needs a stable global identity.

Within each World Instance, the account has a persistent economic hero/actor according to the final R1 decision.

Identity families remain separate from:

- employment;
- company membership;
- profession;
- shares;
- executive authority;
- location;
- property.

Losing a job/company/asset does not delete the person.

---

# 3. Authority principle

For contested shared state:

```text
client intent
-> server/trusted authority validation
-> permission/capacity/balance/inventory checks
-> exactly-once settlement
-> authoritative event/revision
-> client presentation
```

The client must never be trusted to declare:

- money balance;
- inventory;
- ownership;
- cargo custody;
- company role;
- qualification/authorization;
- market settlement;
- completed shared contract;
- world time.

---

# 4. Human + NPC mixed society

NPCs are required because one World Instance may have:

- very few humans at launch;
- humans concentrated in only a few countries;
- time-zone gaps;
- inactive players;
- specialist shortages.

NPCs can fill baseline roles such as:

- consumers;
- workers;
- employers/companies;
- merchants;
- producers;
- market counterparties;
- public/essential services.

Human players create additional strategy, entrepreneurship, negotiation, social organization and unusual decisions.

NPCs must not have free resources or separate magic economics merely to keep the world alive.

---

# 5. Human interaction categories

Humans can interact through governed systems including:

## Work
- apply for jobs;
- hire/fire;
- shifts/tasks;
- apprenticeships;
- specialist contracts;
- management appointments.

## Trade
- buy/sell goods;
- procurement;
- recurring supply contracts;
- logistics contracts;
- asset transactions.

## Company society
- membership;
- roles/permissions;
- governance;
- shares;
- dividends;
- executive appointment;
- investment.

## Infrastructure
- construction projects;
- concessions;
- capacity booking;
- shared access;
- operating contracts.

## Social
- messaging/chat;
- company communication;
- local/world channels;
- reputation/endorsement systems only when abuse controls exist.

---

# 6. Asynchronous-first economy

Ordinary economic interaction should not require simultaneous online presence.

Use mechanisms such as:

- persistent job listings;
- marketplace orders;
- posted contracts;
- tenders/auctions with windows;
- company permissions/delegation;
- scheduled production;
- notifications;
- offline catch-up summaries.

Synchronous play can improve teamwork and social experience, but should not be a mandatory precondition for basic progression.

---

# 7. Company membership vs employment

A player can work for a company without necessarily becoming an internal governance member.

Possible relationships:

- employee only;
- employee + internal member;
- executive/manager;
- founder history;
- external contractor;
- external shareholder/investor.

The final one-primary-internal-company rule remains an R1 owner decision.

---

# 8. Company competition

Competition should emerge from:

- price;
- speed;
- reliability;
- specialist capability;
- customer service;
- geographic coverage;
- technology;
- infrastructure;
- labor recruitment;
- contract bids;
- capital allocation.

Companies can lose customers and contracts when performance/cost deteriorates.

Avoid arbitrary "steal 10% competitor score" mechanics disconnected from business state.

---

# 9. Local market concentration

Owner direction gives a target of roughly:

- up to 5 meaningful last-mile delivery competitors in one urban locality;
- normally 1–2 in rural areas.

This should be implemented through economic/authorization capacity, not simply hide the `Create Company` button after a counter reaches five.

Possible capacity drivers:

- population;
- delivery demand;
- market profitability;
- infrastructure/depot availability;
- existing service coverage;
- specialization.

New players must have alternative entry routes when a market is saturated.

---

# 10. Anti-monopoly design

A dominant company is allowed to become powerful through legitimate success.

It must not be able to permanently make the World Instance unplayable.

Safeguards may include:

- essential-infrastructure access obligations;
- alternative public/NPC routes;
- competition entry through specialization/new localities;
- infrastructure capacity auctions/concessions;
- anti-collusion rules;
- bankruptcy/market turnover;
- high operating cost of excessive expansion;
- country/world policy abstraction if R6 authorizes it.

Do not use invisible rubber-banding that simply punishes the leader for being successful.

---

# 11. Market integrity and collusion

Risks include:

- self-trading;
- alt accounts;
- price manipulation;
- wash contracts;
- fake delivery loops;
- insider governance abuse;
- coordinated monopoly behavior;
- asset transfers to evade obligations.

Countermeasures may include:

- one primary economic hero/account/world if approved;
- transaction history;
- related-party detection;
- market surveillance analytics;
- minimum settlement rules;
- anti-wash logic;
- governance disclosure/permission controls;
- moderation/admin investigation tools.

Exact anti-collusion policy requires balancing/legal-style gameplay abstraction later.

---

# 12. Anti-griefing

A player/company may create real economic pressure but ordinary play must not permit:

- deleting another account/identity;
- permanently trapping someone geographically;
- permanently blocking all starter employment;
- stealing assets without an authorized transaction/game rule;
- destroying essential world infrastructure with no recovery;
- harassment through communication systems.

Negative consequences should be bounded, contestable and recoverable.

---

# 13. Player inactivity

When a player is inactive:

- world time continues;
- personal living/financial consequences settle under R8;
- manual labor stops unless explicit asynchronous output rules apply;
- the employer/company can replace/delegate their operational role;
- governance can transition after defined rules/grace periods;
- personal/company assets remain authoritative and subject to legitimate obligations;
- identity/history remains.

Inactivity must not freeze a company/city/world.

---

# 14. Company founder inactivity

Founder history remains permanent.

Active company control may transfer through:

- delegated authority;
- executive succession;
- governance vote;
- professional/NPC management at cost;
- restructuring when no active management remains.

The exact timing/rights belong to R2/R8.

---

# 15. New-player entry into mature worlds

A mature world must remain enterable.

The lowest economic rung can include:

- basic phone/access;
- walking;
- basic subsistence/recovery route;
- low-entry employment from real/NPC employers;
- training;
- migration toward labor-short regions.

This is not free prosperity. The newcomer can be genuinely poor and face high living costs, but cannot be permanently excluded from productive participation.

---

# 16. Human employment in player-owned companies

A human-owned company can employ real humans.

Employment must use authoritative agreements and settlement.

The employer cannot simply click `pay employee` and duplicate money.

Wage flow:

```text
company has available Company Money
-> wage obligation validated
-> Company Money debit
-> Personal Money credit
-> ledger/event receipt
```

Work output and wage eligibility must be auditable enough to prevent exploit loops.

---

# 17. Human-to-human logistics contracts

Example:

```text
Player Company A buys 20t fertilizer
-> cargo exists at Factory B
-> Company A needs transport
-> logistics contract posted
-> Player Company C accepts
-> cargo reserved/custody transferred
-> Company C transports
-> destination receives inventory
-> contract payment settles
```

The server tracks custody, quantity and settlement.

---

# 18. Shared infrastructure

Infrastructure may be:

- public/simulation-owned;
- privately owned;
- concession-operated;
- shared capacity.

Players/companies may book/use/pay for:

- rail slots;
- port capacity;
- warehouse space;
- airport cargo capacity;
- charging/fuel;
- logistics hubs.

One owner cannot falsify capacity or deny access outside governed rules.

---

# 19. Governance

Mature companies may let humans influence:

- executive appointment;
- major investments;
- dividend policy;
- acquisitions;
- infrastructure;
- expansion;
- high-value asset sales.

Governance must have:

- eligible voters;
- voting weight rules;
- proposal windows;
- quorum/timeout/deadlock handling;
- audit history;
- authority enforcement.

A vote is not a client-side UI preference.

---

# 20. Communication and moderation

If chat/messages exist, the game needs:

- block/mute/report;
- moderation;
- rate limiting/spam controls;
- company channel permissions;
- local/world channel governance;
- privacy boundaries;
- sanctions that do not silently corrupt economic ownership.

Communication moderation and economic punishment should remain separable unless explicit rules connect them.

---

# 21. Reputation

Reputation may exist in multiple domains:

- service performance;
- employment history;
- company/customer rating;
- contract reliability;
- social reputation.

Do not collapse all of these into one manipulable star score.

Economic reputation should be grounded in authoritative outcomes where possible.

---

# 22. Presence and map visibility

The global map can show summarized shared-world activity without rendering every player.

Examples:

- country/region trade flow;
- congestion;
- market activity;
- company presence;
- infrastructure usage;
- aggregate migration.

Exact player location/privacy should follow game design/privacy rules rather than exposing everyone globally by default.

---

# 23. Scale to millions of accounts

One World Instance is a logical world, not one process.

At high population it can be partitioned by:

- geography;
- state family;
- market service;
- simulation worker;
- event stream;
- database partition;
- session/presence service.

The gameplay model should use stable IDs and authoritative events so topology can change without redefining ownership.

---

# 24. New World Instances

Players may join new worlds for a fresh economic competition.

World-local money/assets/capability do not automatically transfer under the current recommended research direction.

Account identity/history can remain visible globally without importing economic power.

This reduces veteran domination of fresh economies.

---

# 25. Multiplayer endgame

Late-game interaction can include:

- international supply-chain competition;
- industrial ownership;
- infrastructure concessions;
- investment/governance;
- mergers/acquisitions;
- national development projects;
- crisis recovery;
- high-value specialist careers;
- world-history prestige.

The endgame is not a final boss; it is participation in a mature evolving economy.

---

# 26. Major unresolved R7 decisions

1. Final one-hero/account/world rule.
2. Maximum concurrent employment/company memberships.
3. Human/NPC market share and fallback rules.
4. PvP-style competitive disruption depth.
5. Anti-collusion thresholds and enforcement.
6. Reputation model(s).
7. Chat/social scope and moderation tooling.
8. Cross-country player relocation restrictions/costs.
9. Company/world leaderboards and whether they create unhealthy incentives.
10. Privacy of player/company positions/assets.
11. Whether worlds support invitations/friends starting in same region without economic advantage.
12. Account sanctions vs world-local economic asset handling.

---

## Research rule

**Multiplayer extends one authoritative living economy. Humans can work, trade, invest, govern, compete and cooperate asynchronously with NPC continuity underneath; economic success may create real advantage, but no player or company can grant itself money/ownership or permanently remove everyone else's legitimate path to participate and recover.**
