# Personal Capability Runtime

Status: Phase-1 implementation contract for #437 / #359.  
Last updated: 2026-09-08.

## Purpose

The capability domain answers: **what can this human currently do, and why?**

Implementation lives in `game-web/src/capabilities/**` and `game-web/src/progression/**`. It extends the existing #359/#371 learned-capability foundation without changing Save v2, Player Economy, server persistence, UI, map data, CI, Railway, or multiplayer authority.

## Requirement model

Work and capability acquisition can combine reusable requirements for prerequisite capability, theory, practical training, supervised experience, fictional qualification, equipment, vehicle class, cargo handling, facility/infrastructure, employment, employer permission, company capability, world access, Personal Money, Work Capacity, and current-shift availability.

No new capability in this slice is granted from an arbitrary level number or from money alone. Exact Work Capacity values are balancing policy data.

Training and qualification concepts are fictional Tycoon gameplay abstractions, not claims about real-world licences.

## Starter and bicycle examples

`walking-light-document-delivery` requires the canonical starter learned state plus active employment, employer authorization, smartphone, light-document cargo capability, sufficient Work Capacity, and current-shift availability.

`BicycleOperation` requires separate bicycle theory and practical-training evidence. `bicycle-light-parcel-delivery` then requires that earned capability plus a compatible bicycle, Bicycle vehicle class, light-parcel cargo capability, employer authorization, Work Capacity, and shift availability.

## Player-readable failure reasons

Evaluation returns stable blocker codes with player-facing messages for training, qualification, equipment, vehicle, cargo capability, facility, employment, employer permission, company capability, world access, Work Capacity, Personal Money, and current-shift availability. Unknown capability/activity IDs fail closed with generic safe explanations rather than exposing raw internal IDs.

## Agent 3 integration boundary

Agent 3 owns Personal Money, employment state, wage settlement, living costs, and Work Capacity mutation in `game-web/src/economy/playerEconomy.ts`.

Agent 6 does not import or duplicate that aggregate. The new domain reads only a narrow `CapabilityEconomyPort`:

- `isEmployee()`;
- `hasWorkCapacity(requiredUnits)`;
- `hasPersonalFunds(requiredMinor)`.

A later integration can adapt Agent 3 state to this interface. Consuming Work Capacity or settling money remains economy authority.

## Legacy compatibility

`capabilityEvidenceFromPersonalProgression(...)` preserves all learned capability IDs already stored by #371. Existing `progressionPoints` may remain in legacy-compatible state, but the new evaluator does not use them as a qualification shortcut. This PR does not reset old saves or persist new theory/practical evidence without a separately governed migration.

## Career freedom

`PersonalCareerState` keeps active profession and deterministic profession history. Changing profession does not grant or revoke capability, change employer, create company ownership, force CEO progression, or erase earned history. Employment and profession remain separate concepts.

## Validation

Configuration validation rejects duplicate IDs, unknown capability references, missing player labels, invalid numeric requirements, and circular capability prerequisites. Evaluation is deterministic for identical evidence and runtime context.

## Canonical rule

A profession label never makes a person qualified by itself. Work eligibility is the intersection of earned personal evidence and current equipment, vehicle, cargo, facility, employer/company, world, time, and Work Capacity facts.
