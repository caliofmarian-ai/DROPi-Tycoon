# Document Information

Document: WORLD_CLOCK_RUNTIME.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Technical Canon — Phase-1 C1 Runtime Boundary
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Authoritative World Clock Runtime

## 1. Purpose

This document specializes the Phase-1 time architecture owned by issue #420 and `09_Development/Planning/PHASE1_IMPLEMENTATION_SEQUENCE.md` Track C.

The authoritative clock exists so work, wages, production, demand, living costs, offline settlement and long-cycle world evolution can consume the same logical time instead of inventing independent frame counters or wall-clock rules.

## 2. Authority rule

**Economic/world time is logical game state. Render frames and device wall time are not economic authority.**

A render loop may request advancement later. A trusted server may calculate elapsed real time later. Neither is permitted to mutate wages, inventory, debt, production or population directly without first advancing the authoritative logical clock through its governed boundary.

## 3. C1 state

The existing `WorldClockState` remains the calendar projection:

- `worldInstanceId`;
- `year`;
- `season`;
- `dayOfSeason`;
- `hour`;
- `minute`.

C1 adds deterministic arithmetic and boundary queries around that state. It does not add a second clock representation.

## 4. Calendar and tuning policy

`phase1-world-clock-v1` currently supplies replaceable prototype tuning:

- 28 days per season;
- 7-day market cycle;
- operating-day boundary at 00:00;
- work-shift boundaries at 06:00, 14:00 and 22:00;
- one advancement request capped at 14 game days.

These values are balancing/configuration, not historical world truth. Changing them later requires a versioned policy/migration decision once persistent worlds exist.

The stable contract is:

- deterministic minute progression;
- explicit hour/day/shift/market/season/year boundary reporting;
- no dependence on render frame rate;
- no unbounded minute-by-minute replay for long elapsed periods.

## 5. Slow-tick consumers

Clock advancement returns boundary counts so downstream systems can settle at their own cadence:

- hour ticks — local activity/demand presentation where appropriate;
- work-shift transitions — employee lifecycle and wage eligibility;
- operating-day boundaries — daily obligations/operations;
- market-cycle boundaries — slower demand/price/employment updates;
- season boundaries — dividends/seasonal systems where activated;
- year boundaries — structural/population/infrastructure evolution.

A consumer must process its bounded aggregate boundary count. It must not infer economic passage from FPS or create rewards simply because frames were skipped.

## 6. Day/night projection

`worldDayPart()` preserves the existing `timeOfDay()` semantics:

- Night: before 06:00 or from 22:00;
- Morning: 06:00–10:59;
- Day: 11:00–17:59;
- Evening: 18:00–21:59.

C1 does not yet activate visual lighting or demand/traffic effects. Parent #420 remains open until a later bounded slice connects authoritative day/night state to at least one real system.

## 7. Persistence and migration plan

### C1 — current slice

No persistent time activation.

- Save v2 remains unchanged.
- Current legacy Company Money, orders, operating-day UI and local prototype state remain unchanged.
- A reload does not pretend that a shared persistent World Instance clock has elapsed.

### B2 — World Instance persistence prerequisite

Before durable/offline time is activated, #421 B2 must define the trusted owner of:

- `worldInstanceId`;
- authoritative clock checkpoint;
- policy/version identifier;
- last settled slow-tick boundaries;
- durable command/idempotency receipts where shared settlement applies.

For future multiplayer/shared worlds, durable server state owns this truth. A client Save cannot override shared world time.

### C6 — offline catch-up

Only after B2:

1. determine elapsed time from a governed trusted checkpoint;
2. translate elapsed time into a requested logical-minute advance;
3. apply policy caps;
4. advance the authoritative clock;
5. settle only legitimate persistent obligations/state changes from returned boundary summaries;
6. persist exactly-once settlement receipts/checkpoints;
7. report any truncated/unsettled span explicitly rather than creating infinite reward/debt.

Active-use costs remain causal. A parked vehicle does not consume driving fuel merely because time passed.

For offline single-player, a device wall clock may propose elapsed time. It still passes through the same bounded clock API and cannot directly create economic state.

## 8. World Instance isolation

Every authoritative clock is scoped to one `worldInstanceId`.

A mature world's time/history is not imported into a fresh World Instance. The account is not itself the clock owner. Different World Instances may be at different years/seasons/times and may later run at different simulation resolutions when inactive.

## 9. Safety and compatibility

C1 intentionally does not:

- change Save v2;
- run automatically from Phaser `update()`;
- settle wages, living costs, inventory or production;
- create offline rewards or debt;
- modify Global Map/Country Catalog data;
- modify World Identity owned by #421/B1;
- activate multiplayer authority;
- add blockchain/token/payment behavior.

## 10. Next dependencies

After C1 is accepted:

- #421 B2 may persist world-local time;
- #436 may consume operating-day/shift boundaries for the human economic lifecycle;
- #419 may consume slow ticks for causal inventory/production/demand;
- a later #420 child may connect day/night to one real local system;
- C6 may activate bounded offline catch-up only after persistence ownership is explicit.

---

End of Document
