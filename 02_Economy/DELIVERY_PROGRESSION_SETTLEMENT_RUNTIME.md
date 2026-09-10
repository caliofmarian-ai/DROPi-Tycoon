# Delivery Progression Settlement Runtime

Status: DT-03 runtime authority slice for #653, coordinating #436

## Purpose

This contract adds the smallest missing DT-03 runtime authority needed by the canonical delivery progression stack:

`legitimate delivery settlement -> money consequence + player XP + eligible entity loyalty + eligible Specialist Card Fragments`

It deliberately extends existing authorities instead of creating another economy, capability, mission, inventory/logistics or persistence engine.

## Existing authorities consumed

### Player Economy / money / Work Capacity

`game-web/src/economy/playerEconomy.ts` remains authoritative for:

- Personal Money;
- employer Company Money used by the employee-first lifecycle;
- Work Capacity;
- productive-work records;
- completed-shift wage settlement;
- living costs and arrears.

`game-web/src/economy/playerEconomyRuntimeAdapter.ts` remains the only DT-03 bridge that accepts an already-settled real urban delivery and converts it into productive employee work.

The #653 receipt calls that adapter. It does **not** create a per-parcel Personal Money reward.

For the employee-first lifecycle, the delivery money consequence is:

`real delivery -> productive work -> completed shift eligibility -> existing exactly-once employer-funded wage`

The existing wage transaction identity and conservation rules remain unchanged.

### Existing personal progression

`PersonalProgressionState.experiencePoints` is reused as player XP.

This slice does not create a second XP balance and does not modify:

- `progressionPoints`;
- learned capability IDs;
- qualification/training evidence;
- capability availability or acquisition.

Those capability semantics remain outside DT-03 ownership.

### Delivery / logistics

The receipt requires the existing real settled delivery transition. It never creates an order, parcel, route, pickup, cargo state, delivery completion or custody transition.

For producer or marketplace logistics, the owning logistics/inventory authority must provide the legitimate delivery and physical custody evidence. DT-03 only settles eligible economic/progression consequences after that evidence exists.

## New DT-03 state

`DeliveryProgressionSettlementState` owns only the #653 consequences that had no runtime authority on current `main`:

- entity-specific loyalty balances;
- Specialist Card Fragment inventory objects minted by eligible delivery progression;
- stable delivery settlement receipts.

The state is bound to one `worldInstanceId + heroActorId`.

A receipt is stable per real order:

`delivery-settlement:<worldInstanceId>:<heroActorId>:<orderId>`

The receipt records:

- source order;
- governed reward policy ID;
- served entity;
- source kind;
- optional marketplace transaction ID;
- the existing productive-work consequence used toward the shift wage;
- XP awarded;
- optional entity loyalty award;
- stable IDs of any newly minted eligible fragments.

Retrying the same order cannot append a second receipt.

## Player XP and Level boundary

This slice awards governed XP to the existing `PersonalProgressionState.experiencePoints` field.

It does not define a permanent Level curve. Exact XP amounts and future Level thresholds remain governed balancing data.

Player XP/Level never grants or substitutes for:

- qualification;
- training;
- employment;
- specialist engagement;
- Work Capacity;
- money;
- vehicle/equipment;
- facility/infrastructure;
- company capability;
- authorization;
- geographic access.

## Entity loyalty boundary

Loyalty is keyed by the actual `servedEntityId` supplied by the owning economic/entity authority.

A loyalty grant is rejected if its entity does not exactly match the served entity.

No route name, district label, rural visual theme or arbitrary map position is accepted as entity identity.

This slice only adds successful-service loyalty. Failure/reliability reductions and richer relationship policy require separately governed source evidence and balancing policy.

## Specialist Card Fragment boundary

A fragment grant must carry:

- a specialist family ID supplied by governed data;
- the exact source economic entity ID;
- a governed economic/professional affinity reference;
- a governed quantity.

The source economic entity must exactly match the served entity.

The runtime does not contain a hardcoded farm/industry/geography-to-specialist table. The owning source/economic authority must provide legitimate affinity evidence. DT-03 must not infer specialist affinity from visuals, locality names or route labels.

Each newly minted fragment receives a stable ID derived from the delivery settlement receipt. This supports exactly-once minting without pretending that a fragment is a qualification or a worker.

A completed fragment set / recruitable-specialist access is intentionally not implemented here. DT-06 remains owner of specialist qualification/capability semantics, and legitimate hiring/engagement remains a separate workforce/company authority boundary.

## Marketplace and physical custody

This receipt does not implement marketplace matching or physical ownership transfer.

Canonical physical flow remains external:

`listing -> match/commitment -> reservation -> pickup -> custody -> transport -> delivery/acceptance -> settlement`

A physical item is not added to the buyer merely because a listing matched.

### Existing-fragment transport

When marketplace evidence identifies the transported item as `SpecialistFragment`, the receipt rejects any attempt to mint a new Specialist Card Fragment from that delivery.

A legitimate third-party logistics worker may still receive governed XP and eligible relationship progress for the real transport service, but the transported fragment remains the same existing inventory object under the external custody/ownership authority.

Therefore:

`transport existing fragment != mint new fragment`

### Self-dealing / wash-trade protection

Marketplace progression fails closed when:

- buyer and seller are the same actor; or
- the worker receiving progression is the buyer; or
- the worker receiving progression is the seller.

This rule prevents a player from manufacturing XP/loyalty/fragment rewards by moving inventory through their own trade loop.

It does not cancel or adjudicate the physical marketplace transaction itself; it only refuses this DT-03 progression mint. Marketplace/custody authorities retain ownership of transaction validity and fulfillment.

## Exactly-once and partial-commit behavior

The settlement validates evidence and grant data before recording productive work.

Then it reuses the existing real-delivery productive-work adapter and constructs the XP/loyalty/fragment receipt as one logical DT-03 settlement result.

Two replay guards coexist intentionally:

1. the new stable delivery settlement receipt blocks the same #653 consequence twice;
2. the existing productive-work adapter independently blocks the same real order from becoming productive work twice across clock/shift changes.

If a future persistence implementation commits only one half of this logical settlement, retry fails closed instead of inventing the missing half. The persistence layer must therefore provide atomic composition or an equivalent durable transactional workflow.

## Persistence / migration handoff

This PR does **not** modify:

- `GameSessionState`;
- Save v2;
- `saveSystem.ts`;
- PostgreSQL;
- migrations;
- server APIs.

The new receipt state is deliberately not mounted into ordinary gameplay persistence in this slice.

Before live activation across save/reload, DT-02 must consume an explicit handoff that preserves atomically, for the same logical delivery settlement:

- the existing Player Economy productive-work receipt;
- updated `PersonalProgressionState.experiencePoints`;
- entity loyalty;
- Specialist Card Fragment inventory;
- the stable delivery settlement receipt.

A continuous local-save + PostgreSQL dual writer remains forbidden by the existing World Instance persistence single-writer contract.

Future contested/shared marketplace settlement must become authenticated server-owned before client-controlled participants can authoritatively mint or transfer shared economic/progression state.

## Security / trust boundary

This module is local domain logic, not proof of multiplayer trust.

Caller-supplied evidence is an authority port, not permission to trust arbitrary client JSON in a shared world. DT-17 must establish authenticated actor authorization before these commands are exposed as contested server mutations.

## Android / UI boundary

No UI, Phaser scene, smartphone, notification, portrait or Android-shell behavior is changed.

The receipt provides data that DT-21 can later present truthfully, including XP, loyalty and fragment consequences, after the state is mounted authoritatively.

No Android verification is claimed by this domain-only slice.

## Acceptance covered by the focused tests

The tests prove:

- one legitimate real delivery can produce the governed progression receipt;
- the delivery consumes Work Capacity through existing Player Economy work authority;
- it does not mint direct per-parcel Personal Money;
- XP reuses existing personal progression without changing progression points or learned capability IDs;
- loyalty remains entity-specific;
- eligible fragment IDs are stable and trace to their mint receipt;
- retry after clock movement cannot duplicate work, XP, loyalty or fragments;
- mismatched entity affinity fails before mutation;
- transporting an existing Specialist Fragment cannot remint another fragment;
- legitimate third-party fragment transport can earn governed XP/loyalty without fragment minting;
- self-dealing/wash-trade progression is blocked;
- cross-world settlement-state mismatch and unsafe XP overflow fail closed.

## Known limitations

This is the first executable #653 settlement foundation, not complete #653 acceptance.

Still required in later orchestrated slices:

- durable DT-02 persistence integration and save/reload proof;
- authoritative entity/economic-affinity adapter from the owning world/production authority;
- visible player Level derivation/presentation;
- failure/reliability loyalty consequences;
- completed-card threshold and recruitable-specialist access handoff without capability bypass;
- marketplace listing/match economic commitment and price/fee settlement;
- physical fragment transfer through the existing custody/logistics authority;
- authenticated server authority for contested real-player trades.

# Canonical runtime rule

**A legitimate completed delivery may create one replay-safe progression receipt. The receipt reuses existing productive-work/wage and PersonalProgression XP authorities, attaches loyalty only to the actual governed entity, mints specialist fragments only from governed affinity, never remints a transported existing fragment, and never turns self-trade into a reward farm. Physical marketplace ownership changes remain downstream of real custody and delivery, not the receipt.**
