# DROPi Tycoon — Recovery Opening Narrative IDs v2

Status: **CANONICAL NARRATIVE ID / MIGRATION CONTRACT**
Date: 2026-09-16
Parent amendment: `01_GameDesign/STORY_BIBLE_RECOVERY_V2.md`
Primary issue: #759

## Purpose

This contract introduces stable IDs for the recovery-first opening without reusing the old employee-first first-hour IDs for new meanings.

The legacy first-hour IDs from `NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md` remain reserved historical identities. Runtime may migrate old saves explicitly, but it must not silently reinterpret an old ID as a new beat.

## Portable arc IDs

- `arc:recovery:origin` — recovery-first opening spine, locality portable.
- `arc:recovery:founder-seed` — founder aspiration through starter venture.
- `arc:recovery:social-company` — transition from small venture to human organization.

## Core portable beat IDs

| Beat ID | Function |
| --- | --- |
| `beat:recovery:origin:rise` | rough-sleeping cinematic and decision to get up |
| `beat:recovery:origin:search-work` | walk the locality and seek legitimate work |
| `beat:recovery:origin:merchant-test` | opening merchant offers one test delivery |
| `beat:recovery:origin:first-return` | return to merchant, food/help and remembered outcome |
| `beat:recovery:origin:merchant-trial-chain` | bounded repeat work and relationship proof |
| `beat:recovery:origin:supplier-introduction` | merchant recommendation opens supplier/farm door |
| `beat:recovery:origin:temporary-network-work` | temporary tasks through partner businesses |
| `beat:recovery:origin:first-roof` | first modest rented room from real economic stability |
| `beat:recovery:founder-seed:idea` | first explicit delivery-company aspiration |
| `beat:recovery:founder-seed:administrative-path` | find local business/registration specialist |
| `beat:recovery:founder-seed:starter-venture` | legitimate smallest independent venture begins |
| `beat:recovery:social-company:capacity-wall` | starter venture reaches deliberate NPC/social scale limit |
| `beat:recovery:social-company:find-humans` | discover compatible real-player organizations/partners |
| `beat:recovery:social-company:human-company` | create or join human company and unlock larger tier |

## Mission-facing authored refs

Portable authored refs use the same semantic suffixes:

- `story:recovery:origin:rise`
- `story:recovery:origin:search-work`
- `story:recovery:origin:merchant-test`
- `story:recovery:origin:first-return`
- `story:recovery:origin:merchant-trial-chain`
- `story:recovery:origin:supplier-introduction`
- `story:recovery:origin:temporary-network-work`
- `story:recovery:origin:first-roof`
- `story:recovery:founder-seed:idea`
- `story:recovery:founder-seed:administrative-path`
- `story:recovery:founder-seed:starter-venture`
- `story:recovery:social-company:capacity-wall`
- `story:recovery:social-company:find-humans`
- `story:recovery:social-company:human-company`

Runtime mission IDs remain owned by the mission engine. These authored refs are stable story identities, not mission-instance IDs.

## Portable role IDs

- `role:opening-merchant`
- `role:local-producer-supplier`
- `role:household-customer`
- `role:business-administration-specialist`
- `role:trainer`
- `role:peer-rival`
- `role:incumbent-employer-dispatcher`
- `role:human-cofounder-member`

A locality binds these roles to actual character IDs. Role IDs are not character IDs.

## Brăila character binding

- `role:opening-merchant` -> `maria-ionescu`
- `role:business-administration-specialist` -> candidate binding `mihai-enache` after implementation reconciliation

Existing characters remain valid:

`ana-stoica`, `radu-marin`, `mirela-stan`, `petru-neagu`, `daria-iancu`, `elena-dobre`, `victor-lupu`, `irina-pavel`, `mihai-enache`.

`mirela-stan` is not renamed to Maria and `maria-ionescu` does not inherit Mirela's old story facts automatically.

## Hero presentation IDs

Hero presentation choice values:

- `hero-sex:male`
- `hero-sex:female`

These values may control body/voice/localized grammar only. They cannot change reward tables, capability eligibility, mission topology, company access or multiplayer access.

## Canonical line IDs

The following IDs own meaning; localized copy may vary while preserving speaker intent.

- `line:hero:recovery-rise`
  - meaning: get up, continue, become a parent the children can be proud of, find work first.
- `line:hero:merchant-notice`
  - meaning: the shop has customers; ask here, then supplier/farm if needed.
- `line:maria:first-test-offer`
  - meaning: no job now; prove reliability with one legitimate delivery.
- `line:maria:first-return-food`
  - meaning: delivery confirmed; take bounded food/help because it was earned and needed.
- `line:maria:trial-chain-offer`
  - meaning: complete bounded work and Maria will recommend the hero to a supplier.
- `line:supplier:no-vacancy-yet`
  - meaning: no suitable permanent vacancy now; future role requires capability.
- `line:hero:founder-thought`
  - meaning: maybe create a delivery company one day; not yet, first roof/capital/knowledge.
- `line:admin:small-idea-serious`
  - meaning: treat the ambition seriously and explain legal/realistic requirements.
- `line:hero:social-scale-realization`
  - meaning: larger growth cannot be done alone; the hero needs people they can trust.

## Persistent fact IDs

- `fact:recovery:prologue-seen`
- `fact:recovery:work-search-started`
- `fact:met:maria-ionescu`
- `fact:maria:first-test:offered`
- `fact:maria:first-test:completed`
- `fact:maria:first-return:completed`
- `fact:maria:trial-chain:completed`
- `fact:recovery:supplier-introduction:earned`
- `fact:recovery:first-roof:secured`
- `fact:recovery:founder-thought:formed`
- `fact:recovery:starter-venture:formed`
- `fact:recovery:social-capacity-wall:reached`
- `fact:recovery:human-company:joined-or-formed`

These facts are narrative/history observations only. They do not replace authoritative money, cargo, housing, qualification, company or multiplayer state.

## Brăila first executable slice

The first executable recovery slice is:

`choose Male/Female -> rise cinematic -> search for work -> enter Maria shop -> dialogue -> visible parcel pickup -> legitimate delivery -> visible return -> bounded food/help consequence -> Maria trial offer -> save/reload continuity`

No next beat may be claimed complete if its owning system has not produced the required state.

## Legacy first-hour ID migration

The following employee-first IDs remain **LEGACY_RESERVED** and are not reused:

- `arc:braila:first-day`
- `beat:braila:first-day:a-place-to-start`
- `beat:braila:first-day:the-first-standard`
- `beat:braila:first-day:one-small-thing`
- `beat:braila:first-day:a-person-not-an-address`
- `beat:braila:first-day:capacity-has-a-cost`
- `beat:braila:first-day:first-consequence`
- `beat:braila:first-day:first-pay-means-something`
- `beat:braila:first-day:tomorrow-has-more-than-one-direction`
- all matching `story:braila:first-day:*` authored refs.

Old saves that contain those facts remain readable as history. A migration may either:

1. continue the legacy opening for that already-started World Instance; or
2. explicitly start the new recovery arc as a new campaign version with a recorded migration event.

It must never map old completion directly to new completion merely because both occupy the first-hour slot.

## Exactly-once boundary

Narrative IDs never mint progression by themselves.

For legitimate work, the existing root delivery/work settlement identity remains the idempotency authority for money/XP/loyalty/eligible specialist fragments. Self-study/exposure must also bind to the same legitimate work evidence and must not double-mint on replay/reload.

## Canonical rule

**New recovery-first beats receive new stable IDs. Legacy employee-first IDs remain reserved history. Locality-specific people bind portable roles without becoming global hardcoding, and presentation differences between Male and Female never change gameplay authority.**
