# Document Information

Document: SAVE_SYSTEM.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Canonical — Local Save and Migration Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Save System

## Purpose

This document defines local in-game persistence for the current installed/offline runtime and the migration boundary toward future trusted World Instance persistence.

It owns local save schema/validation/restore decisions. It does **not** make a device-local save authoritative for a shared multiplayer economy.

Shared contested persistence is governed by `06_Technical/SHARED_AUTHORITY_CONTRACT.md` and `06_Technical/WORLD_INSTANCES.md`.

---

# 1. Persistence Philosophy

Persistence must:

- protect meaningful progress;
- preserve compatible historical state through explicit migration;
- validate/sanitize all loaded data;
- fail safely when state is missing/corrupt/incompatible;
- avoid duplicate economic settlement;
- distinguish durable progression from transient scene state;
- distinguish local legacy authority from future shared-world authority.

A documentation change never silently reinterprets old economic ownership.

---

# 2. Current Runtime Save v2

The current runtime remains based on local Save v2 and existing storage adapters.

Current durable company/progression state includes, where implemented:

- company identity/money/reputation/level or progression compatibility state;
- upgrades;
- employees/payroll;
- financial/review state;
- fleet ownership/selection;
- settings;
- tutorial/progression state;
- current `urban` extension for merchant onboarding and walking/Bicycle preference.

Existing IDs/storage keys are preserved unless a dedicated migration says otherwise.

The current starter-company and Company Money state remain valid **legacy runtime data**. They must not be silently relabelled as Personal Money or future human starting ownership.

---

# 3. Urban Additive Save Extension

The existing optional `urban` section stores only the approved urban-foundation state, including merchant onboarding and selected walking/Bicycle preference.

Older saves default safely. Malformed preferences are repaired; Bicycle selection requires compatible ownership/progression.

Decode, sanitization, serialization and restore must apply equivalent validation.

---

# 4. Durable vs Transient Current State

Current save scope intentionally does not persist every live scene entity.

Existing transient/reset-on-load examples include:

- active runtime order;
- current cargo associated only with that transient order;
- some world position/scene state according to the active runtime contract;
- regenerated runtime customers/simulation entities.

Within a live session, navigation to internal management/HQ screens should preserve the session state governed by the relevant runtime systems.

Future persistent World Instance cargo/orders/inventory cannot use this reset model once they become shared economic truth; that requires an explicit schema/authority migration.

---

# 5. Save Triggers

Local autosave should occur after meaningful durable state mutations supported by the current schema, such as:

- completed legacy delivery effects;
- purchases/upgrades;
- employee/onboarding/payroll changes;
- progression/reputation changes;
- merchant onboarding;
- transport preference/ownership changes where durable;
- explicit exit/save lifecycle events implemented by the mobile/runtime contract.

Future Personal Money, wages, consumption, World Instance time or cargo settlement must not be added to the old save merely by copying scene values. Their authority/migration must be designed first.

---

# 6. Load / Continue

When a compatible valid local save exists, Continue restores the validated durable local progression defined by the current schema.

The system must not silently overwrite a valid save.

When no valid save exists, the game may initialize a new local game according to the current runtime version/start contract.

When the future employee-first canonical lifecycle is implemented, the new-game initializer and old-save migration must be changed together in a dedicated PR.

---

# 7. Missing / Corrupted State

The game must not crash because local save data is missing or invalid.

Rules:

- missing save -> initialize safely;
- recoverable malformed fields -> sanitize/default according to schema;
- structurally unreadable/incompatible save -> inform the player before destructive replacement when recoverable progress may exist;
- preserve diagnostic/recovery evidence where technically feasible;
- never accept invalid economic values merely to avoid an error.

---

# 8. Schema Versioning and Migration

Every durable save format uses an explicit version.

A migration must define:

- source version/meaning;
- target version/meaning;
- field transformations/defaults;
- ownership interpretation;
- validation rules;
- rollback/failure behavior where relevant;
- tests using representative old saves.

Existing v1 -> v2 migration remains valid historical implementation behavior.

Future major migrations may include:

- starter-company legacy state -> employee-first person/company separation;
- Personal Money introduction;
- person identity / World Instance linkage;
- authoritative time/offline settlement checkpointing;
- inventory/cargo/order persistence;
- cloud/shared authority adoption.

No field may be silently reinterpreted from company-owned value to person-owned value.

---

# 9. Canonical Employee-First Migration Principle

The approved target starting state is a poor pedestrian employee, while old saves may represent the player through an early starter company.

A future migration must explicitly decide how an existing save is presented/preserved, for example through a legacy local world/history or a governed compatibility conversion.

What is forbidden:

- deleting old progress without an explicit rule;
- pretending old Company Money was always Personal Money;
- importing legacy economic power into a fresh shared World Instance;
- duplicating assets/money across both legacy and new authoritative state.

---

# 10. Local Save vs World Instance Authority

A future shared World Instance owns authoritative economic state independently from the device save.

World-local shared state may include:

- person/economic-actor identity;
- Personal Money/Company Money ledgers;
- company membership/ownership;
- inventory/cargo/contracts/orders;
- assets/shares/property;
- production/infrastructure state;
- authoritative world time/offline settlement;
- reputation/history with economic effect.

The client may cache/project such state for usability, but a cache is not authority.

---

# 11. Fresh-World Isolation

A local/prototype save cannot be submitted as proof of money, qualifications, company ownership, shares, property, inventory or infrastructure in a fresh multiplayer World Instance.

Only explicitly approved non-economic account history may cross worlds by default.

Migration/import APIs must enforce this boundary.

---

# 12. Offline Settlement Checkpoints

When authoritative world time/economy is implemented, persistence must support idempotent catch-up.

The saved/server checkpoint must make it possible to determine which economic interval/obligation has already been settled so reconnect/reload does not duplicate:

- living costs;
- consumption;
- wages;
- payroll;
- production;
- contract payments;
- other periodic economic effects.

Elapsed wall-clock time from the client alone is not authoritative in a shared world.

---

# 13. Mobile Lifecycle

The installed Android application can be interrupted by OS lifecycle, incoming calls, low battery, process termination or network loss.

Persistence design must:

- keep writes recoverable;
- avoid assuming one write is perfectly atomic;
- use versioned/sanitized data;
- autosave meaningful current local progress;
- reconcile pending authoritative commands by receipt/idempotency when shared systems arrive.

Platform-local storage remains behind a replaceable adapter.

---

# 14. Save Slot Policy

The current prototype/local implementation may continue using its existing single local profile/slot policy.

This is an implementation-era constraint, not a permanent rule that one account can never participate in multiple World Instances.

Future account/world selection requires dedicated UX/technical design and must not be simulated by unsafe multiple copies of local economic saves.

---

# 15. Testing Requirements

Persistence work should test, as applicable:

- round-trip encode/decode;
- old-version migration;
- malformed/corrupted data;
- interrupted/partial write behavior;
- no silent overwrite;
- stable IDs/ownership semantics;
- legacy company-money preservation without personal-money reinterpretation;
- duplicate settlement prevention;
- world isolation/import rejection;
- Android close/relaunch/Continue behavior;
- compatibility with current runtime state not yet migrated.

---

# 16. Explicit Current Non-Goals

This document does not itself implement:

- cloud save;
- production multiplayer persistence;
- account login;
- cross-device synchronization;
- Personal Money runtime;
- world-time runtime;
- universal inventory/cargo persistence;
- backend vendor/database selection.

Those require implementation slices under the approved architecture.

---

# Canonical Rule

**The current local Save preserves validated legacy/offline progression; it must never silently redefine ownership or become proof of economic power in a fresh shared World Instance. Every schema/authority migration must explicitly preserve, transform or isolate old state, and shared economic truth ultimately belongs to trusted World Instance authority rather than the device.**

---

End of Document
