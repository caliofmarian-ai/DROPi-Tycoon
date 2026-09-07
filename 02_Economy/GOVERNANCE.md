# Company Governance — Canonical Domain Specialization

Status: Active design and non-visible domain foundation  
Parent canon: `00_Project/BUSINESS_DESIGN.md`  
Parent implementation issue: #362  
Governance foundation issue: #388

---

## 1. Purpose

Company governance determines how current executive control can change without rewriting company history, duplicating ownership, or allowing a company to become permanently unusable.

This specialization is deliberately separate from:

- historical Founder identity;
- employment and operational job titles;
- treasury-share purchase settlement;
- dividend settlement;
- future real-player multiplayer authority;
- visible UI.

The domain is designed first as deterministic local simulation so later server authority can preserve the same economic and governance semantics.

---

## 2. Founder Is Historical Identity

`founderActorId` is permanent company history.

Governance must never rewrite it.

The Founder may:

- remain executive;
- be replaced as executive through legitimate governance;
- later regain executive control if eligible and legitimately appointed;
- temporarily act as bounded continuity caretaker only when no active member is available.

Founder identity does not imply permanent executive permission.

---

## 3. Executive Control Is Mutable

`executiveActorId` represents current operational leadership.

An elected executive candidate must satisfy the current governed eligibility policy.

Prototype baseline:

- executive candidate must be an active company member;
- changing executive control does not transfer shares;
- changing executive control does not alter Founder identity;
- changing executive control does not alter company equity supply.

---

## 4. Voting Equity Baseline

Prototype governance policy version: `prototype-governance-v1`.

Both structural equity pools may carry governance weight when units are actually held by Economic Actors:

- `InternalMember`;
- `ExternalMarket`.

This preserves the structural 51% / 49% ownership ceiling while allowing outside investors to participate in governance without making the external pool independently capable of exceeding the protected internal structural share.

Treasury-held units carry zero voting weight.

Treasury is company-held availability, not an actor ballot.

---

## 5. Voting Snapshot

Voting power is frozen when a proposal opens.

The snapshot records, per Economic Actor:

- actor identity;
- aggregate voting units across policy-enabled pools.

Later share transfers do not change an already-open proposal's voting weights.

This prevents:

- retroactive vote manipulation;
- double use of transferred shares within one proposal;
- ambiguity when ownership changes during a governance cycle.

A later proposal takes a new snapshot from then-current valid equity state.

---

## 6. Proposal Lifecycle

Prototype proposal statuses are:

1. `Open`;
2. `Approved`;
3. `Rejected`;
4. `Expired`;
5. `Executed`.

The first implemented governed side effect is executive appointment.

Future governance actions may reuse the proposal/vote/resolution framework for separately designed decisions such as:

- strategic investment;
- infrastructure projects;
- dividend-policy changes;
- expansion;
- high-value asset sales;
- mergers/acquisitions;
- Founder Artifact decisions.

Those future side effects are not activated by #388.

---

## 7. Proposal Creation Eligibility

Prototype baseline requires:

- valid company equity state;
- valid governance state;
- matching company identity;
- valid versioned governance policy;
- stable non-empty proposal, action and command IDs;
- an eligible active-member executive candidate;
- at least one actually held voting unit in the company;
- proposal creator must have positive voting weight in the proposal snapshot.

Treasury availability alone cannot create governance power.

---

## 8. Ballots

Each snapshotted voter may cast at most one ballot per proposal.

Choices are:

- `For`;
- `Against`;
- `Abstain`.

Ballot weight is copied from the immutable proposal snapshot.

A client or caller cannot provide a different voting weight.

Forged or inconsistent governance state fails integrity validation.

---

## 9. Quorum and Approval

Prototype policy baseline:

- quorum: 50% of snapshotted eligible voting units;
- approval: strictly more than 50% of participating voting units.

Abstention participates in turnout and therefore quorum, but it is not a `For` vote.

An exact tie does not approve.

A proposal explicitly resolved without quorum is rejected.

Thresholds are policy configuration, not historical company state, and may be versioned later without rewriting company history.

---

## 10. Execution

An approved executive-appointment proposal may execute once.

Execution must re-check current candidate eligibility.

Therefore a candidate who was eligible when voting began but left the company before execution cannot silently become executive.

Successful execution changes only current executive identity within the equity/company-ownership domain.

It must preserve:

- Founder identity;
- company ID;
- total equity supply;
- pool supplies;
- actor holdings;
- treasury balances.

---

## 11. Exactly-Once Governance Commands

Accepted governance commands use stable IDs and receipts.

The domain distinguishes:

- exact replay of the same command and terms: `DuplicateCommand`, no second mutation;
- reuse of the same command ID with different terms: `CommandIdConflict`;
- reuse of proposal/action identity for another proposal: rejected.

This local deterministic behavior is intentionally compatible with later authoritative command processing.

---

## 12. Anti-Soft-Lock Executive Continuity

A company must not become permanently unusable because its current executive is no longer an eligible active member.

Continuity recovery is deterministic.

If the current executive remains an active member:

- no recovery occurs.

If the current executive is ineligible and active members exist:

1. rank active members by current `InternalMember` stake descending;
2. break equal-stake ties deterministically by actor ID;
3. assign the highest-ranked active member as temporary caretaker executive.

If no active member exists:

- historical Founder identity becomes bounded caretaker executive.

The Founder caretaker fallback:

- does not reactivate membership;
- does not create shares;
- does not restore forfeited Internal shares;
- does not grant permanent executive immunity;
- is replaceable once eligible membership/governance exists.

This is a continuity mechanism, not a Founder veto.

---

## 13. Integrity and Failure Safety

Governance must fail safe on:

- corrupted equity;
- malformed governance state;
- duplicate proposal/action IDs;
- duplicate voters;
- forged ballot weights;
- unknown vote choices/statuses;
- unsafe integer arithmetic;
- mismatched company identity;
- invalid policy;
- invalid executive candidate;
- duplicate execution.

Rejected operations do not partially change governance or equity state.

---

## 14. Multiplayer Migration Boundary

Real-player governance remains future server-authoritative state.

The current domain establishes semantics only.

Before multiplayer activation, authority must enforce:

- stable actor/company identity;
- optimistic concurrency;
- exactly-once commands;
- durable proposal/receipt persistence;
- anti-cheat and permission enforcement;
- recovery from interrupted operations.

A client must never self-assign executive authority.

---

## 15. Deliberate Non-Goals of This Slice

#388 does not activate:

- visible governance UI;
- Save v2 persistence;
- multiplayer networking;
- real-player authoritative voting;
- strategic-investment side effects;
- infrastructure decision side effects;
- M&A;
- real securities or real-money investment;
- blockchain, NFT, wallet, or DROPi token behavior.

Company Money and Personal Money remain fictional game-economic ledgers governed by their existing canonical specializations.

---

## 16. Next Integration Stage

After this governance foundation is merged, #362 still requires a separate persistence/runtime activation slice before visible rollout.

That later slice must integrate equity, Personal Money, treasury settlement, dividends and governance into compatible persisted runtime state with migration tests before Android owner review is requested.
