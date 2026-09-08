# Document Information

Document: WORLD_INSTANCES.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical — Technical Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# World Instances and Epoch Lifecycle

## Purpose

A **World Instance** is one logical persistent global DROPi Tycoon economy/history. It is not required to equal one physical server, process, database, shard, country host, or machine.

This document specializes `04_World/WORLD.md`, `06_Technical/SHARED_AUTHORITY_CONTRACT.md`, and `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`.

---

# 1. World-Owned State

A World Instance owns independent evolving state including:

- world/map baseline versions;
- countries, regions and representative localities;
- external productive nodes;
- population, workforce and specialists;
- economy, balances/ledgers, inventories and contracts;
- one economic hero per participating account;
- companies/player participation;
- world-local reputation and productive capability;
- productive assets/property/shares;
- infrastructure and transport capacity;
- authoritative world time;
- events, migration and trade flows;
- durable historical changes.

Two worlds may start from the same baseline and develop into very different histories.

---

# 2. Account vs World Economic Hero

An account is not itself the world economic actor.

For each World Instance in which the account participates, there is one world-local economic hero/person.

That person may change employer, profession, company membership/control, assets, investments, location, reputation and economic condition.

Economic alt characters inside the same account/world are not the normal progression model.

The human hero identity persists through normal World Instance years and ordinary bankruptcy/failure. World time does not permanently delete that identity.

---

# 3. Versioned Baseline Seed

A new world starts from a versioned baseline rather than copying a mature live world.

The baseline may include geography, representative localities, broad production/economy profiles, transport infrastructure, demographic summaries, configured technology/progression state, and bounded NPC counterparties needed for world viability.

Updating a future baseline must not silently rewrite an older world's historical state.

---

# 4. New and Legacy Worlds

Live operations may periodically open new World Instances. Cadence is a balancing/live-operations decision and is not fixed here.

Opening a new world does **not** reset, delete or automatically close previous worlds.

Older worlds may remain playable as mature economies with established companies, infrastructure, industrial ownership, transformed localities, historical events and trade networks.

Any future archival/retention policy must be explicit; no silent world deletion is permitted.

---

# 5. Economic Isolation

Economic power is world-local by default.

A fresh world does **not** import mature-world:

- Personal Money or Company Money;
- inventory/cargo;
- productive qualifications/capability;
- reputation/market power;
- vehicles/equipment/property;
- companies/shares/contracts;
- infrastructure control;
- farms/factories/industrial assets;
- other productive economic power.

This protects fresh-world competition and progression.

---

# 6. Portable Non-Economic Account State

The account may carry explicitly non-economic state across worlds, such as:

- settings/accessibility preferences;
- cosmetics without economic power;
- achievements/history;
- tutorial familiarity;
- other later-approved non-economic identity data.

A portable item must not become a hidden economic advantage merely because it is labelled cosmetic or historical.

---

# 7. Prototype / Local Save Boundary

Legacy prototype/local saves are not authoritative economic power for a fresh multiplayer World Instance.

They may be preserved through legacy/offline play, migration history, historical achievements, or separately approved conversion rules that preserve fresh-world fairness.

No silent import of old money, companies or assets into a fresh shared economy is permitted.

---

# 8. Logical World vs Physical Infrastructure

At scale, one logical World Instance may span multiple application services, simulation workers, database partitions, queues/event streams, caches and session services.

Early development may host several small logical worlds on shared physical infrastructure.

Never hardcode `one world = one machine` or `one country = one server`.

---

# 9. Multi-Resolution Simulation

A world partitions simulation by scope:

- active detailed scene — frame/high frequency;
- important nearby actors/routes/hubs — operational frequency;
- production/inventory/local markets — economic ticks;
- city/regional population — cohorts/stocks/flows;
- country/global trade — strategic ticks;
- demographics/urban growth/state evolution — slow cycles;
- inactive areas — summarized deterministic catch-up.

Large populations may be aggregated while conserving equivalent economic truth.

This protects Android clients and future server scalability.

---

# 10. World Time and Offline Settlement

Each World Instance owns authoritative game time.

Offline catch-up may settle legitimate fixed obligations/basic consumption, valid production/inventory changes, scheduled company obligations, market cycles, migration and structural changes.

It must not invent activity:

- no starter wage without real work;
- no active driving fuel without driving;
- no production without inputs/capability;
- no infinite NPC trading.

Catch-up/settlement must be deterministic and idempotent once shared authority is active.

---

# 11. Bounded NPC Continuity

NPC/simulated workers, employers, consumers, merchants, suppliers and counterparties may keep essential loops viable at low human population.

They obey inventories, money/costs, production/consumption, qualifications/capacity, market rules, infrastructure and authoritative settlement.

They cannot provide infinite free supply, demand, wages or money.

---

# 12. Multiplayer Authority

When shared multiplayer state becomes live, trusted/server authority must own contested truth including:

- person/world membership;
- Personal Money/Company Money settlement;
- inventory/cargo custody;
- wages/contracts/orders;
- company/productive-asset/share ownership;
- infrastructure ownership/access;
- production/consumption settlement;
- world time/offline catch-up;
- market/event settlement.

Client rendering is never authoritative for shared economic truth.

---

# 13. Currency Scope

World Instances must support a staged future national-currency model.

`Personal Money` and `Company Money` describe ownership domains; future denominations/currency ledgers belong to the World Instance economy.

A common gameplay denomination may be used before multi-currency settlement exists.

Currency/economic state is world-local and is not transferred into a fresh world.

---

# 14. Durable World History

Major changes should produce durable history where feasible, including settlement founding, industrial opening/closure/acquisition, infrastructure completion, exceptional migration, state transition, major trade-route change, community projects and exceptional economic events.

Historical identifiers remain stable even if displayed names, borders or statuses later change.

---

# 15. World Variety and Assets

New worlds should primarily differ through versioned data, economy seeds, geography, actor decisions, events and modular approved visual families rather than requiring wholesale new client art.

New source art is created when a concrete runtime requirement proves the approved library insufficient.

---

# 16. Travel Boundary

World participation is not physical presence everywhere.

Within a world, strategic maps do not grant free economic teleportation. Presence changes through valid transport/infrastructure with time/cost consequences according to Game/World/Logistics canon.

---

# Canonical Rule

**DROPi Tycoon may operate many persistent global economies in parallel. Each account has one economic hero per World Instance; fresh worlds start from versioned baseline state, isolate economic power from mature worlds, preserve only explicitly non-economic portable account state, evolve under multi-resolution authoritative simulation, and do not delete older world histories.**

---

End of Document
