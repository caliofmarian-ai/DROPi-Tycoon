# DROPi Tycoon — Early Company Social Scaling Contract

Status: **CANONICAL GAMEPLAY SPECIALIZATION**
Date: 2026-09-16
Coordinates: #759 #634 #643
Parent authorities: `00_Project/BUSINESS_DESIGN.md`, `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`, `01_GameDesign/STORY_BIBLE_RECOVERY_V2.md`

## Purpose

This contract turns the owner's social-company direction into a deterministic gameplay rule:

- the hero may begin independent activity alone;
- the hero may recruit a small bounded NPC team;
- NPCs cannot substitute for real human partners at large-company scale;
- a player must cooperate with at least one other real player to enter the first human-company tier, either by founding/associating or by joining an existing organization;
- solo players are not softlocked out of ordinary play, but they do not receive the same large-company social tier through unlimited NPC substitution.

This is a **gameplay/social progression rule**, not a statement of real-world company law.

## 1. Organization tiers

### Tier 0 — Person / worker

The player acts only as a person:

- temporary work;
- employment/contracts;
- Personal Money;
- learning/qualification;
- no independent company treasury.

### Tier 1 — Starter micro-venture

The player forms the smallest legitimate local business form available through the governed jurisdiction binding.

Canonical gameplay cap:

`MAX_ACTIVE_NPC_SPECIALISTS_SOLO_VENTURE = 3`

Meaning:

- at most three NPC specialists/workers may contribute active company capability at one time while the venture remains in the solo starter tier;
- inactive discovered profiles do not consume the active cap;
- contractors/employees still require real wages/costs/availability and do not become owned cards;
- the cap cannot be bypassed by creating shell ventures under the same economic person;
- the cap is independent of any real legal employee count.

The number `3` is a product/gameplay balance decision. DT-13 may later bind stricter jurisdiction-specific legal limits if researched, but legal research does not silently increase this social cap.

### Tier 2 — Human company

First scalable company tier.

Required human membership:

`MIN_REAL_HUMAN_MEMBERS_FOR_HUMAN_COMPANY = 2`

The founder plus at least one additional real player qualifies, provided company/economy/legal prerequisites are otherwise satisfied.

Valid paths:

- founder invites another real player and both legitimately join the company; or
- player joins an existing human company.

NPC workers may then expand under company capability, cash-flow, facilities, management and locality constraints, but they cannot replace the second human member required for this tier.

### Tier 3 — Large organization / group

Large-company or group-scale capabilities may require stronger human governance, role separation and/or membership thresholds defined by later balancing/runtime contracts.

Do not hardcode a final maximum organization size here.

## 2. Why the solo NPC cap exists

The cap serves several product goals:

- prevents one player from simulating an unlimited human organization with NPCs;
- makes specialist choices meaningful;
- creates natural demand for cooperation;
- gives multiplayer membership an economic reason to exist;
- preserves a viable solo-small-business identity;
- reduces runaway NPC population/performance cost;
- supports a world where companies are social institutions rather than menu objects.

The cap must not be presented as punishment. The story should make the limitation visible through workload, scheduling and opportunity pressure.

## 3. The narrative pressure beat

When the starter venture approaches the active NPC cap and real work demand exceeds what the small team can reliably serve, the story may activate:

`beat:recovery:social-company:capacity-wall`.

The player sees concrete symptoms:

- jobs that cannot all be accepted;
- unavailable specialist coverage;
- route/work-capacity conflicts;
- customer opportunities lost because the team is too small;
- the hero doing too many roles personally.

The game must not fabricate demand solely to force multiplayer. The beat waits for legitimate work/capacity evidence.

Canonical hero realization meaning:

> I can keep this small, or I can build with other people. If I want something bigger, I need people I can actually trust — not just more names on a list.

## 4. Human partner discovery

The social gate must provide actual ways to find people:

- local company board;
- cofounder/member requests;
- profession/specialist compatibility filters;
- mutual availability/current-locality filters where relevant;
- company purpose/role needs;
- invitations from existing human companies;
- later reputation/history filters.

Do not require the player to leave the game and search external social media just to progress.

## 5. Join versus found

Large-company progression is not restricted to founders.

Two equal legitimate routes exist:

### Found/associate

The player upgrades/forms an organization with at least one additional real player and accepts shared governance/responsibility.

### Join

The player joins an existing real-player organization and can progress through employment, membership, specialization, management, ownership or other governed roles.

Both routes unlock social-company opportunities according to the same capability/economy rules.

## 6. Solo continuity

A player may choose never to pass the human-company gate.

That player can continue as:

- independent worker;
- highly skilled specialist;
- small business owner;
- contractor;
- small local operator with up to the starter active NPC cap;
- investor where later supported.

The solo path remains meaningful, but it does not unlock the same organization-scale workforce, governance, strategic infrastructure and large-contract surfaces reserved for human companies.

## 7. NPC specialist boundary

Specialist Card Fragments may unlock/discover candidates. They never become direct company capability until a real specialist is legitimately recruited/contracted.

Active NPC specialists:

- have stable identity;
- have profession/qualification;
- have wage/contract cost;
- have locality/availability;
- can leave/relocate where governed;
- consume one active starter slot when contributing to a solo starter venture;
- never count as a real human member for the Tier 2 gate.

## 8. Anti-abuse rules

The social cap must not be bypassed through:

- multiple shell companies controlled by the same person;
- fake guest accounts/bots counted as human members;
- transient join/leave solely to unlock a permanent tier;
- duplicating specialist capability across multiple simultaneous employers;
- replaying formation/membership events.

Trusted multiplayer/account authority must own human membership evidence before contested shared-economy rollout.

## 9. Legal-form separation

Romanian, Irish, Philippine or other real-world business forms are jurisdiction bindings.

Do not encode:

- `PFA = 3 employees`;
- `sole trader = N employees`;
- `SRL required at X workers`;

as universal facts without research.

The gameplay cap of three active NPC specialists exists regardless of those legal details and is labeled as a social/progression limit.

## 10. Acceptance

- solo venture can operate with 0–3 active NPC specialists;
- fourth active NPC specialist is rejected/deferred while still Tier 1;
- discovered but inactive specialists remain discoverable;
- at least two authenticated humans are required for Tier 2 human-company status;
- NPCs cannot satisfy that gate;
- joining an existing human company satisfies the social route without requiring founding;
- solo path remains playable after refusing multiplayer;
- no shell-company bypass;
- membership/formation transitions are exactly-once/replay-safe;
- UI explains the distinction between legal limits and gameplay/social scale.

## Canonical rule

**The hero may start alone and employ a few NPC specialists, but DROPi Tycoon reserves large-company scale for organizations that contain real human cooperation. NPCs keep the world viable; they do not replace the social meaning of building a company with other players.**
