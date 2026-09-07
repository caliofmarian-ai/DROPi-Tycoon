# Company Governance — Canonical Domain Specialization

Status: Active design and non-visible domain foundation
Parent canon: `00_Project/BUSINESS_DESIGN.md`
Parent implementation issue: #362
Governance foundation issue: #388

---

## 1. Purpose

Company governance determines how current executive control can change without rewriting company history, duplicating ownership, or allowing a company to become permanently unusable.

This specialization is separate from historical Founder identity, employment, treasury-share settlement, dividends, multiplayer authority, persistence, and visible UI.

---

## 2. Founder and Executive Identity

`founderActorId` is permanent company history and governance must never rewrite it.

`executiveActorId` is current operational leadership and may change through legitimate governance or bounded continuity recovery.

The Founder may lose executive control without losing Founder identity. Founder identity does not grant a permanent veto or permanent executive immunity.

Prototype executive candidates must be active company members.

Changing executive control must not alter company ID, Founder identity, equity supply, pool supply, treasury units, or shareholder holdings.

---

## 3. Voting Equity

Prototype policy version: `prototype-governance-v1`.

Both structural equity pools may carry governance weight when units are actually held by Economic Actors:

- `InternalMember`;
- `ExternalMarket`.

Treasury-held units carry zero voting weight because treasury availability is company-held supply, not an actor ballot.

This preserves the structural 51% Internal / 49% External ceiling while allowing outside investors to participate in governance.

---

## 4. Proposal Voting Snapshot

Voting power is frozen when a proposal opens.

The proposal stores each eligible actor's aggregate voting units across policy-enabled pools. Later share transfers do not change that open proposal's voting weight.

This prevents retroactive vote manipulation and double use of transferred shares inside one proposal.

A later proposal uses a new snapshot from the then-current valid equity state.

---

## 5. Proposal Lifecycle

Prototype statuses are:

1. `Open`;
2. `Approved`;
3. `Rejected`;
4. `Expired`;
5. `Executed`.

The first implemented governed side effect is executive appointment.

Future decisions may reuse this framework for strategic investment, infrastructure, dividend-policy changes, expansion, high-value asset sales, mergers/acquisitions, and Founder Artifact decisions, but those side effects are not activated by #388.

---

## 6. Proposal Creation

Opening an executive-appointment proposal requires:

- valid company equity state;
- valid governance state;
- matching company identity;
- valid versioned policy;
- stable non-empty command, proposal, and action IDs;
- an eligible active-member executive candidate;
- positive actually-held voting equity in the company;
- a proposal creator with positive voting weight in the snapshot.

Treasury availability alone cannot create governance power.

---

## 7. Ballots

Each snapshotted voter may cast at most one ballot per proposal.

Choices are `For`, `Against`, and `Abstain`.

Ballot weight always comes from the frozen voting snapshot. A caller cannot provide a replacement weight.

Forged or inconsistent ballot weights invalidate governance state.

---

## 8. Quorum and Approval

Prototype baseline:

- quorum: 50% of snapshotted eligible voting units;
- approval: strictly more than 50% of participating voting units.

Abstentions count toward participation/quorum but are not `For` votes.

An exact tie does not approve.

A proposal explicitly resolved without quorum is rejected.

Thresholds belong to versioned governance policy, not historical company state.

---

## 9. Execution Safety

An approved executive appointment may execute once.

Execution re-checks current candidate eligibility. A candidate who leaves the company after voting but before execution cannot silently become executive.

Successful execution changes only current executive identity.

Exact replay of an already accepted governance command is a `DuplicateCommand` and causes no second mutation. Reusing the same command ID with different terms is a `CommandIdConflict`.

---

## 10. Anti-Soft-Lock Continuity

A company must not become permanently unusable because its current executive is no longer eligible.

If the current executive remains an active member, no recovery occurs.

If the executive is ineligible and active members exist:

1. rank active members by current `InternalMember` stake descending;
2. break equal-stake ties deterministically by actor ID;
3. assign the highest-ranked active member as temporary caretaker executive.

If no active member exists, historical Founder identity becomes bounded caretaker executive.

Founder caretaker fallback:

- does not reactivate membership;
- does not create or restore shares;
- does not undo member-exit forfeiture;
- does not grant permanent control;
- remains replaceable once eligible membership/governance exists.

This is a continuity mechanism, not a Founder veto.

---

## 11. Integrity and Failure Safety

Governance fails safe on corrupted equity, malformed governance state, duplicate proposal/action IDs, duplicate voters, forged ballot weights, unknown vote choices/statuses, unsafe arithmetic, mismatched company identity, invalid policy, invalid executive candidates, and duplicate execution.

Rejected operations must not partially mutate governance or equity state.

---

## 12. Multiplayer Migration Boundary

Real-player governance remains future server-authoritative state.

Before multiplayer activation, authority must enforce stable identity, optimistic concurrency, exactly-once commands, durable proposal/receipt persistence, anti-cheat, permission enforcement, and recovery from interrupted operations.

A client must never self-assign executive authority.

---

## 13. Non-Goals of #388

This slice does not activate visible governance UI, Save v2 persistence, multiplayer networking, real-player voting, strategic/infrastructure/M&A side effects, real securities, real money, blockchain, NFT, wallet, or DROPi token behavior.

---

## 14. Next Integration Stage

After #388, parent #362 still requires a separate persistence/runtime activation slice.

That later slice must integrate equity, Personal Money, treasury settlement, dividends, and governance into compatible persisted runtime state with migration tests before Android owner review is requested.
