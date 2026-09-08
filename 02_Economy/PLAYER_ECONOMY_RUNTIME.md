# Document Information

Document: PLAYER_ECONOMY_RUNTIME.md  
Project: DROPi Tycoon  
Version: 1.0.0  
Status: Phase-1 Implementation Contract — Issue #436 First Slice  
Author: Marian Caliof & OpenAI  
Language: English  
Last Updated: 2026-09-08

---

# Player Economy Runtime Contract

## Purpose

This document records the first domain implementation slice of issue #436 under the approved Phase-1 architecture.

Authority chain:

- `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`;
- `09_Development/Planning/PHASE1_IMPLEMENTATION_SEQUENCE.md`, Track C2-C6;
- `01_GameDesign/GDD.md`;
- `01_GameDesign/PROGRESSION.md`;
- `02_Economy/PERSONAL_FINANCE.md`;
- `02_Economy/ECONOMY.md`;
- World Identity B1 from #421 / PR #518;
- World Clock C1 from #420 / PR #533.

The implementation lives in `game-web/src/economy/playerEconomy.ts`. It is deliberately a domain-first contract. It does not activate shared multiplayer, replace Save v2, change the legacy company runtime, or add the complete employee-first UI.

---

# 1. Fresh-World Economic Actor

A fresh employee economy can only be created from:

- a B1 `FreshLocal` World Identity;
- a C1 World Clock whose `worldInstanceId` matches that identity.

The resulting economic aggregate is bound to the same:

- `worldInstanceId`;
- `heroActorId`.

The fresh hero begins:

- with zero Personal Money;
- on foot;
- with a smartphone available;
- with `DeliveryAppLiteracy` and `WalkingCourierFundamentals` as the basic first-slice capabilities;
- employed by the fictional incumbent `Northstar Parcel Logistics`;
- without ownership of that employer or its Company Money.

The employer name and all numeric values in the prototype policy are balancing/configuration data, not permanent canon.

---

# 2. Personal Money and Company Money

The first slice uses separate integer-minor-unit ledgers for:

- the person-owned Personal Money account;
- the fictional incumbent employer's Company Money account.

Every money mutation records:

- stable transaction ID;
- World Instance;
- owner kind and owner ID;
- signed integer amount;
- reason;
- counterparty when applicable;
- authoritative C1 clock minute ordinal.

A valid account cannot contain:

- negative balances;
- non-safe-integer balances or amounts;
- duplicated transaction IDs;
- ledger entries belonging to another owner;
- a stored balance that differs from its ledger-derived balance.

The incumbent's initial company cash is an explicit bounded prototype opening-capital faucet. It is not taken from the player's legacy starter company and is not Personal Money.

---

# 3. Employee Work and Wage Settlement

The first real work path is a basic walking delivery activity.

A work record is tied to:

- World Instance;
- hero;
- employer;
- C1 operating day;
- C1 shift;
- stable activity reference;
- productive minutes;
- Work Capacity consumed;
- authoritative clock position.

The same activity identity cannot be consumed twice.

Starter wages settle only for the immediately previous completed C1 shift. A shift must contain the configured minimum productive work. Merely being employed or being offline does not create salary.

The wage transaction uses one stable identity on both sides:

`Company Money debit == Personal Money credit`

Settlement fails if:

- there is no completed shift;
- required productive work was not recorded;
- the transaction was already settled;
- only one ledger side contains the transaction, indicating invalid/tampered state;
- the employer lacks enough Company Money;
- identity/world state is invalid.

Therefore the normal wage path conserves money and is exactly once.

---

# 4. Work Capacity

Work Capacity is a finite personal productive-capability state.

The first consume path is basic walking delivery work. The first recovery path is rest.

Rules:

- active work cannot reduce Work Capacity below zero;
- rest cannot raise it above the configured maximum;
- the same work activity cannot consume capacity twice;
- the same rest settlement ID cannot recover capacity twice;
- no real-money purchase or paid refill mechanic exists in this domain.

The exact capacity size and rates are replaceable balancing data.

---

# 5. Basic Living Cost and Insolvency

The first living obligation is one deterministic basic living-cost settlement per C1 operating-day boundary.

The spawn operating day is treated as an explicit onboarding grace day in this first slice. This does not convert or grant legacy Company Money.

For each later due operating day:

1. the obligation receives a stable World Instance/hero/day identity;
2. available Personal Money is debited up to the cost without going negative;
3. any unpaid amount becomes personal living arrears;
4. the obligation identity is recorded even when the person had zero money, so it cannot be charged twice.

Current first-slice recovery states are:

- `Stable`;
- `Insolvent`;
- `Recovering`.

Housing state is:

- `Housed`;
- `EmergencyHousing` after the configured arrears threshold.

These are recoverable economic states. They do not delete or rewrite:

- `worldInstanceId`;
- `heroActorId`;
- employment identity;
- basic earned capability;
- work history.

A person who later earns a wage can settle arrears from Personal Money. Full arrears repayment moves the person to `Recovering`, preserving the productive path back into the economy.

This first slice does not implement debt/credit. Negative Personal Money is therefore forbidden.

---

# 6. World Clock and Offline Boundary

Economic settlement consumes C1 authoritative clock state. It does not use `Date.now()` as direct economic authority.

The living-cost catch-up path:

- requires matching World Instance clocks;
- rejects reversed clock intervals;
- settles only crossed C1 operating days;
- is bounded by C1 `maxAdvanceMinutes` policy;
- is idempotent by stable obligation IDs.

Offline passage through this living-cost path does **not**:

- manufacture starter wages;
- create work records;
- consume active Work Capacity;
- create active-use vehicle/fuel costs.

Later C6 work may add more legitimate offline obligations using the same authoritative/idempotent pattern.

---

# 7. Legacy Compatibility Boundary

Legacy Save v2 and the legacy `CompanyState.money` wallet remain unchanged by this slice.

`createLegacyCompatibilityPlayerEconomy(...)` explicitly records the legacy Company Money amount as legacy-owned input while creating:

- zero Personal Money;
- no new incumbent-employer treasury;
- no employee-first employment relationship;
- `convertedToPersonalMoney: false`.

Therefore this slice never silently reinterprets old Company Money as Personal Money.

The helper exists so a later governed migration/integration owner can distinguish old prototype economic state from a fresh employee world without destroying historical saves.

This PR intentionally does not add Player Economy to Save v2 or `GameSessionState`. Durable ownership/persistence belongs to World Instance B2 and its server/PostgreSQL owner.

---

# 8. Integration Boundary

This domain is ready to be consumed later by:

- the B2 durable World Instance persistence layer;
- a governed fresh-world/new-game boundary;
- the employee work/phone UX;
- causal order/cargo settlement under #419;
- future trusted server settlement when multiplayer economic writes are activated.

Those integrations must preserve the transaction IDs, ownership separation and C1 time semantics defined here.

The client-domain implementation is not security authority for future contested multiplayer transactions. Shared settlement must move to the trusted authority stack before real players can contest balances or transactions.

---

# 9. Deliberate Non-Goals of This Slice

This first #436 PR does not:

- change `game-web/server/**` or PostgreSQL persistence;
- change Save v2 or migrate existing local saves;
- replace the existing visible Company Money HUD;
- redirect the legacy per-delivery Company Money reward;
- activate real multiplayer;
- implement the complete first-hour employee UX;
- modify Brăila rendering or semantic zoom;
- modify Country Catalog/locality generation;
- modify GitHub Actions, Docker, Railway or deployment configuration.

The complete employee-first Android checkpoint remains a later owner-reviewed integration milestone, as required by issue #436 and the Phase-1 implementation sequence.

---

# 10. Deterministic Acceptance Coverage

`game-web/tests/player-economy-employee-first.test.ts` covers:

- fresh hero/person vs employer ownership separation;
- zero starting Personal Money and employee-first state;
- B1/C1 world binding;
- wage money conservation;
- exactly-once wage prevention;
- completed-shift boundary behavior;
- required productive work;
- Work Capacity lower/upper bounds;
- duplicate work/rest prevention;
- deterministic living-cost boundary settlement;
- no negative money under inability to pay;
- insolvency/emergency-housing state;
- productive wage-to-arrears recovery;
- offline living obligations without offline wage or active-capacity consumption;
- legacy Company Money preserved without Personal Money conversion;
- cross-world economic activity rejection.

---

# Canonical Implementation Rule

**The first Player Economy runtime treats the hero as a person before a company owner: Personal Money belongs to the world-local hero, employer Company Money belongs to the fictional employer, wages move conserved value exactly once for real completed work, Work Capacity is finite and recoverable through play, living costs can create recoverable insolvency without deleting identity/capability, and legacy Company Money is never silently converted into personal wealth.**

---

End of Document
