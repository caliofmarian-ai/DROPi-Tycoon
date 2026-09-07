# DURABLE AUTHORITY AND AUTHENTICATION

## Document Information

Project: DROPi Tycoon
Status: Canonical Technical Specialization
Authority level: Level 7 — Technical Design
Parent authorities: `00_Project/VISION.md`, `00_Project/BUSINESS_DESIGN.md`, `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`, `02_Economy/ECONOMY.md`, `06_Technical/ARCHITECTURE.md`, `06_Technical/SHARED_AUTHORITY_CONTRACT.md`
Coordinates: Issue #363, child #398
Date: 2026-09-07

---

## 1. Purpose

This document defines the mandatory architecture boundary for any future durable, server-authoritative DROPi Tycoon state.

It exists because the project now has a real HTTP command/revision/replay prototype, but that prototype is intentionally process-memory/session-only. Before player identity, company membership, money, ownership, marketplace settlement, permissions or shared-world state can become authoritative online state, the project needs two durable foundations:

1. authenticated account identity; and
2. transactional persistent storage.

This document defines those foundations without selecting or provisioning a commercial provider.

---

## 2. Current State

As of 2026-09-07:

- the canonical Railway service hosts the web runtime and the bounded `/api/authority/*` prototype;
- that authority registry is session-only and resets on process restart/deploy;
- the service has no configured database variable and no approved durable persistence provider;
- production authentication is not configured;
- current single-player Save v2 remains the installed-game persistence authority for local gameplay;
- Company Money, Personal Money and company equity remain governed by their current local domain systems and have **not** migrated to server authority.

Therefore the current server MUST NOT be described as a durable account, wallet, ownership or multiplayer economy backend.

---

## 3. Canonical Terminology

### 3.1 Account Identity

`Account Identity` is the private authenticated server identity of a human player account.

It owns an immutable opaque internal account ID and security-sensitive account lifecycle metadata.

It is not the same thing as a public profile, courier avatar, company membership, Founder identity or device installation.

### 3.2 Public Player Profile

`Public Player Profile` is a player-visible projection associated with an authenticated account.

Examples may include:

- display name;
- avatar reference;
- public progression summary;
- permitted social/profile fields.

Public profile fields are mutable presentation data. They are never credentials.

### 3.3 Company Money

`Company Money` is company-owned operating capital.

It remains economically distinct from the person who controls or works for the company.

### 3.4 Personal Money

`Personal Money` is actor-owned in-game money used for personal income, expenses and investment transactions.

It is not Company Money and must never be silently merged with Company Money.

### 3.5 Company Equity

Company equity is the authoritative 10,000-unit ownership structure governed by the current equity canon, including InternalMember and ExternalMarket pools.

### 3.6 Ecosystem Token Boundary

Any future DROPi ecosystem cryptocurrency/token is a separate project and separate governed integration domain.

This durable-authority architecture does not create, deploy, price, custody or activate a cryptocurrency, blockchain wallet, token exchange, KYC flow or real-money reward system.

### 3.7 Legacy `DROPiCoins` Language

Historical preparation files that refer to `DROPiCoins` as an already-approved premium wallet/currency do **not** define current authority.

No current server-authority work may infer a premium wallet or real-money monetization system from those historical statements.

---

## 4. Identity Separation

The durable backend must keep these identities separate:

```text
Authenticated Account
    |
    +--> Public Player Profile
    |
    +--> Economic Actor identity/identities
              |
              +--> Company membership
              +--> Personal Money account
              +--> Equity holdings
              +--> future permissions/roles
```

A device ID, save slot, public display name, email address, platform-provider ID or company role must never become the canonical internal account primary key.

Internal IDs must be opaque and immutable.

---

## 5. Authentication Boundary

A production authentication implementation must provide all of the following before shared economic authority is activated:

- authenticated account creation or account-linking path;
- unique immutable internal account identity;
- verified binding from external login identity to internal account identity where an external provider is used;
- secure session lifecycle;
- server-side authorization decisions based on authenticated identity, not client-supplied actor IDs;
- revocation/logout behavior;
- account recovery rules appropriate to the chosen provider;
- rate limiting / abuse controls appropriate to public endpoints;
- auditable security-sensitive changes.

### 5.1 Client-supplied actor IDs are not authentication

The #394 prototype accepts opaque actor IDs only to demonstrate consistency semantics.

A production server MUST derive the acting account/actor from authenticated server context. It must not trust a request simply because the payload says `actorId = X`.

### 5.2 Secret handling

Credentials, client secrets, signing secrets, database credentials, private keys, token-signing material and provider secrets:

- must never enter the Phaser/Vite client bundle;
- must never use public `VITE_*` variables;
- must never be committed to Git;
- must be stored only in an approved encrypted secret surface appropriate to the deployed architecture.

### 5.3 Token/session data

If bearer/session tokens are used, their exact storage and rotation model must be defined by the selected authentication implementation before production activation.

This document does not prescribe JWT, opaque sessions, cookies or a specific identity vendor.

---

## 6. Durable Persistence Boundary

A durable authority repository must survive:

- process restart;
- Railway deployment replacement;
- normal container rescheduling;
- application restart;
- expected service recovery scenarios.

Local process memory and an unmounted ephemeral filesystem do not satisfy this requirement.

### 6.1 Required persistence capabilities

The selected durable store must support, directly or through a reliable repository layer:

- unique constraints for immutable IDs and command IDs;
- atomic multi-record transactions where economic invariants require them;
- optimistic revision checks;
- durable command receipts;
- durable event/audit records;
- indexed lookup by aggregate/account/company IDs;
- deterministic idempotency across process restarts;
- backup/restore capability;
- migration/versioning strategy;
- secure credentials and encrypted transport;
- operational observability sufficient to diagnose failed writes and recovery.

A relational database such as PostgreSQL is a valid candidate because it can satisfy these needs, but **PostgreSQL is not approved merely by appearing in an older preparation note**. Provider and deployment topology require a later governed decision.

---

## 7. Canonical Durable Command Transaction

A durable command must conceptually execute as one authoritative transaction:

```text
authenticate request
    -> resolve authenticated account/actor
    -> validate command envelope
    -> check existing commandId
        -> exact replay: return durable original receipt
        -> conflicting reuse: reject
    -> lock/check aggregate revision
    -> authorize requested operation
    -> validate domain invariants
    -> persist state mutation
    -> persist event/audit record
    -> persist receipt/idempotency record
    -> commit atomically
    -> return authoritative receipt/projection
```

If the transaction fails before commit, no partial economic truth may escape.

The client must not be able to make a failed or timed-out request apply twice by retrying it.

---

## 8. Revision and Replay Across Restarts

The current session prototype proves revision and replay semantics only while one process is alive.

Durable authority must preserve after restart/deploy:

- aggregate revision;
- accepted command IDs;
- rejected first-seen command IDs where deterministic replay is required;
- authoritative receipt;
- event/audit linkage;
- enough command fingerprint information to distinguish exact replay from command-ID reuse with different intent.

A restart must not reset revision to zero for a durable aggregate.

---

## 9. Economic Authority Separation

### 9.1 Company Money

When Company Money eventually migrates server-side:

- the company is the economic owner;
- writes occur only through governed company transactions;
- Personal Money must not be used as a hidden alias;
- client display values are projections, never editable truth.

### 9.2 Personal Money

When Personal Money migrates:

- it belongs to the economic actor/account relationship defined by canon;
- credits/debits require durable ledger/audit evidence;
- equity purchases and dividends must preserve exact counterparty accounting.

### 9.3 Equity

When company equity migrates:

- 10,000 total units and pool invariants remain authoritative;
- treasury and actor holdings must reconcile atomically;
- InternalMember eligibility remains membership-governed;
- member exit forfeiture remains governed by current business canon;
- External holdings remain investment assets and are not confiscated by membership exit.

### 9.4 Atomic cross-domain settlement

A transaction such as treasury share purchase must eventually atomically coordinate:

```text
Personal Money debit
+ Company Money credit
+ treasury equity decrement
+ buyer equity increment
+ durable receipt/audit evidence
```

No future backend may split that transaction into independently successful writes that can leave money and ownership inconsistent.

---

## 10. Durable Audit Requirements

Security-sensitive and economic state changes must produce durable audit evidence sufficient to reconstruct what authoritative operation occurred.

At minimum, future audit events should identify:

- immutable operation/event ID;
- command/idempotency ID where applicable;
- authenticated account/system actor;
- affected aggregate/company/account;
- operation type;
- resulting revision or transaction sequence;
- server timestamp;
- outcome/status;
- references needed for reconciliation.

Audit logs are not a substitute for the domain ledger; both may be required.

Sensitive credential material must never be copied into audit payloads.

---

## 11. Backup, Recovery and Migration

Before durable shared economic authority is activated, the selected persistence implementation must define:

- automated backups or equivalent recoverable snapshots;
- restore procedure;
- schema migration procedure;
- rollback/forward-fix policy;
- compatibility behavior during deploys;
- how idempotency/receipt records survive restoration;
- how economic invariants are checked after recovery.

A deployment is not considered safe merely because the application container starts successfully.

---

## 12. State-Family Migration Order

Migration must remain incremental. Do not move all multiplayer state at once.

Recommended governed order:

1. **Authenticated Account Identity** — durable private account + safe public profile projection.
2. **Company Identity and Membership** — real-player company membership with server authorization.
3. **Permissions / Roles** — authorization layer for company actions.
4. **Shared Company Money** — server-owned company operating capital with durable transaction evidence.
5. **Personal Money** — durable actor-owned personal finance ledger.
6. **Company Ownership Shares** — durable treasury/holdings and member-exit reconciliation.
7. **Dividends / Governance settlement** — durable voting/distribution receipts where multiplayer participation exists.
8. **Shared Marketplace Settlement** — listings/reservations/settlement only after identity + money + ownership are trustworthy.
9. **World/Shard Presence** — online presence/region state with separate real-time architecture as required.
10. **Broader Shared Economic Transactions** — only after prior domains prove recovery and anti-duplication behavior.

Each migration requires its own issue, tests, CI evidence, deployment evidence and compatibility plan.

---

## 13. Offline and Installed-Game Compatibility

DROPi Tycoon remains mobile-first.

The installed game must not become unnecessarily dependent on a public browser page merely because online authority is introduced.

During staged migration:

- local presentation, camera, controls, audio and HUD remain local;
- existing single-player/local saves must be deliberately migrated, imported, reconciled or retained according to the state family being moved;
- network loss must fail safely rather than inventing accepted shared transactions;
- online-only mutations must never be silently applied locally and later treated as authoritative without reconciliation.

The exact offline policy for each migrated shared state family must be defined before that family is activated.

---

## 14. Railway Topology and Change Control

The canonical existing project/environment/service remain protected baselines.

This document does not authorize creating a database, service, volume, variable or new project.

Any future persistence/authentication provisioning must:

- be proposed in a dedicated child issue;
- identify exact new infrastructure and cost/operational implications;
- preserve the canonical production service unless an explicitly approved migration says otherwise;
- keep secrets out of repository/client code;
- include rollback/recovery steps;
- include Railway verification after deployment.

---

## 15. Provider Selection Criteria

A later provider decision must evaluate at least:

- durability and transactional guarantees;
- compatibility with the Node/TypeScript server architecture;
- unique constraints and transaction support;
- backup/restore capability;
- migration tooling;
- Railway connectivity/topology;
- secret handling;
- authentication integration options;
- regional availability/latency;
- operational complexity for an owner-maintainable project;
- free/paid limits and predictable cost;
- vendor lock-in and exportability.

No provider should be selected only because it is fashionable or because an old preparation document named it.

---

## 16. Reconciliation of Historical Preparation Documents

`09_Development/Engine_Migration/FUTURE_SERVER_AUTHORITATIVE_ARCHITECTURE_PREPARATION.md` is a historical non-canonical preparation note.

Its useful principles — server-authoritative identity, durable ledger concepts, ownership records, receipt verification, auditability and secret isolation — remain informative where they do not conflict with newer canon.

The following assumptions are **not current authority**:

- a generic `Money wallet` as the canonical economy model;
- `DROPiCoins` as an automatically approved premium wallet/currency implementation;
- PostgreSQL as an already approved provider;
- marketplace/payment/Google Play implementation as an activated scope.

`09_Development/Engine_Migration/ENVIRONMENT_VARIABLES.md` remains useful for variables actually consumed by the current runtime, but old narrative currency statements inside it do not own economy terminology.

For server-authority work, this document and its higher-level parent authorities govern.

---

## 17. Explicit Non-Goals

This document does not implement or authorize:

- a database provider;
- an authentication vendor;
- production registration/login UI;
- real-money payments;
- Google Play Billing;
- premium currency;
- cryptocurrency/blockchain/token custody;
- KYC;
- marketplace activation;
- server-authoritative Company Money or Personal Money yet;
- server-authoritative shares yet;
- chat/presence/world synchronization.

---

## 18. Completion Gate

This architecture step is complete when:

- the durable authority/authentication boundary is canonical and discoverable;
- stale preparation assumptions are explicitly marked as non-authoritative;
- no provider is falsely described as already selected;
- future shared-state migration order is explicit;
- #363 remains open for implementation children.

The next implementation step must be a separate governed provider/provisioning decision, not an implicit extension of this document.
