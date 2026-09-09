# Document Information

Document: ORDERS.md
Project: DROPi Tycoon
Version: 2.2.0
Status: Canonical — Order and Work-Request Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Order System

## Purpose

This document defines how economic requirements become actionable orders/work requests and how those orders connect demand, cargo, custody, labor, logistics, settlement and final use.

Orders do not create demand or money by themselves. They represent a governed commitment derived from real modeled state under `02_Economy/ECONOMY.md`, `02_Economy/MARKET.md`, and `00_Project/LOGISTICS_DESIGN.md`.

---

# 1. Order Philosophy

Orders are real economic/logistics opportunities.

Before accepting an order, an eligible actor may need to evaluate:

- Who needs/pays for this work?
- What goods/service/capacity are required?
- Is inventory available?
- Is the cargo compatible with my capability/equipment/vehicle?
- Does an executable route exist for my transport mode?
- Do I have enough Work Capacity, time and operating capacity?
- What are the costs and expected settlement?
- Can I complete it reliably/on time?
- What happens to the recipient/world if it succeeds or fails?

An order is not just a waypoint task.

---

# 2. Economic Origin

A valid order should normally derive from one or more real causes:

- household/customer purchase/consumption;
- shop/business replenishment;
- industrial/production input requirement;
- farm requirement/output movement;
- warehouse rebalancing;
- construction/infrastructure project;
- maintenance/fuel/energy need;
- medical/service requirement;
- waste/recycling/reverse logistics;
- recurring commercial contract;
- public/community/emergency requirement where governed;
- committed player-marketplace trade that requires physical fulfillment;
- a committed trade whose buyer/seller lacks the transport capability required to move the goods.

The originating state identifies a legitimate buyer/payer/source or another explicitly governed settlement source.

---

# 3. Full-Game Order Lifecycle

A mature order lifecycle may include:

**Requirement Detected**

-> **Procurement/Request Created**

-> **Order Offered / Contract Assigned / Bid**

-> **Accepted / Committed**

-> **Inventory Reserved / Cargo Defined**

-> **Route / Transport Feasibility Determined**

-> **Resources / Worker / Vehicle / Carrier Leg Assigned**

-> **Pickup / Custody Transfer**

-> **In Transit / Multi-Leg Transfer / Storage**

-> **Final Delivery / Service Completion**

-> **Recipient Acceptance / Use**

-> **Settlement**

-> **Feedback / Reputation / Progression / Inventory / World Consequence**

Failure/cancellation/default may branch at valid stages.

Exact technical states are implemented incrementally.

---

# 4. Prototype v0.1 State Machine — Legacy Execution Contract

The current runtime state values remain an authoritative implementation contract until migrated:

| State | Technical Value | Current Runtime Meaning |
|---|---|---|
| Created | `Created` | Simplified runtime order created, not yet visible. |
| Available | `Available` | Visible/ready for acceptance. |
| Accepted | `Accepted` | Accepted; traveling to pickup. |
| PickedUp | `PickedUp` | Package collected; in transit. |
| Completed | `Completed` | Delivery completed; current legacy completion effects execute. |
| Failed | `Failed` | Delivery failed; current legacy failure effects execute. |

Allowed current transitions remain:

- `Created -> Available`
- `Available -> Accepted`
- `Accepted -> PickedUp`
- `PickedUp -> Completed`
- `PickedUp -> Failed`

`Completed` and `Failed` remain terminal in the current Prototype state machine.

The previous semantic wording `Reward applied` is superseded as target canon. Current code may still apply a direct reward field as legacy/prototype behavior, but the future settlement model must resolve payment from a legitimate counterparty/contract/economic source.

Do not rename current stored states merely to make documentation look modern; runtime state migration requires a dedicated implementation PR.

---

# 5. Order / Contract Types

## Personal / Household Orders

Typical characteristics:

- smaller quantities;
- local destinations;
- consumer goods/food/services;
- short delivery windows where relevant.

## Business Replenishment Orders

Created because a business needs inventory/input.

May involve shops, restaurants, pharmacies, offices or service facilities.

## Industrial / Production Orders

Move raw materials, parts, energy-related goods, finished output or maintenance inputs between productive nodes.

## Contract Orders

Created under recurring or one-off agreements between real economic actors.

May define volumes, schedules, service levels, price, penalties and qualification/infrastructure requirements.

## Marketplace Fulfillment Orders

Created after a governed marketplace listing is matched/committed and a physical inventory item must move from seller/source custody to buyer/recipient custody.

Marketplace fulfillment may transport ordinary goods, resources, produced items, collectibles or tradable Specialist Card Fragments.

The marketplace match itself does not complete inventory transfer. Physical ownership/custody settles only after the valid fulfillment lifecycle defined here and in `02_Economy/MARKET.md`.

The fulfillment plan may use the seller, buyer, either party's company, an independent courier, a third-party logistics company, or several carriers/modes across multiple legs.

If the trading parties cannot provide a feasible route themselves, the missing movement may become a separate logistics order/service request offered to eligible providers.

## Public / Community / Recovery Orders

May support governed infrastructure, emergency, waste, public-service or reconstruction needs where those systems exist.

## Reverse-Logistics Orders

Returns, reusable packaging, waste/recycling, damaged goods and other backward flows.

---

# 6. Required Order Data

A mature order should reference enough authoritative data to explain its cause/execution, such as:

- stable order ID;
- World Instance ID/context;
- originating requirement/contract/request;
- buyer/payer/requester;
- supplier/source when applicable;
- cargo/product/service definition;
- quantity;
- origin/pickup;
- destination/recipient;
- custody state;
- eligibility/handling requirements;
- route/transport feasibility state when relevant;
- time window/priority;
- agreed price/payment/settlement terms;
- failure/cancellation terms;
- assigned actor/company/vehicle/legs;
- carrier/provider IDs for multi-company fulfillment;
- transfer/hub points when relevant;
- current state/revision;
- marketplace listing/transaction ID when the order fulfills a market trade;
- progression-settlement receipt/key when the order is eligible to award player consequences.

Fields may be introduced incrementally, but separate systems must not create parallel conflicting truth.

---

# 7. Cargo Requirements

Orders may differ by:

- package count;
- mass/volume;
- food/time sensitivity;
- medical priority;
- fragile handling;
- high-value/security;
- cold-chain;
- pallet/industrial handling;
- hazardous/special handling where later governed;
- reverse logistics/waste;
- collectible/document handling for eligible Specialist Card Fragment cargo.

Higher priority may change price/service terms, but urgency does not magically create additional economic value without a willing/authorized payer.

---

# 8. Availability, Feasibility and Eligibility

An order may be:

- publicly offered;
- offered to selected capable providers;
- assigned by an employment/dispatch relationship;
- generated from a recurring contract;
- exposed through bidding/tendering when implemented.

Visibility does not imply eligibility, and eligibility does not imply that every route is physically executable.

Eligibility/feasibility may depend on:

- profession/qualification;
- employment/company relationship;
- cargo capability;
- vehicle/equipment;
- vehicle/mode range or endurance;
- infrastructure/access;
- connected usable route for the selected transport mode;
- geographic presence;
- available capacity/Work Capacity;
- company authorization/reputation;
- contract-specific rules.

A road vehicle cannot accept a leg that requires crossing an absent/unusable road connection. A drone may be eligible for some such movements only under the full governed drone capability contract. Multi-leg routing may combine providers/modes when transfer points and custody are valid.

---

# 9. Assignment, Carrier Sourcing and Employment Boundary

The early human player is an employee of a fictional incumbent logistics company.

The work app/dispatch system may therefore assign or offer eligible work within that employment relationship.

Completing such work contributes to employer service/revenue and the player's work record. The player's compensation is primarily wage/shift settlement through `Personal Money`, not automatic ownership of the order's company revenue.

Later independent/company-owner roles may receive different settlement relationships.

## Third-party carrier sourcing

A buyer/seller/company that owns the economic transaction does not need to own every vehicle/mode required to move its cargo.

When its own capability is insufficient, it may contract another eligible provider.

Example:

Two players in different companies commit a marketplace trade. Their available road fleets cannot form a valid path between the cargo source and recipient. If a governed drone route is feasible but neither company controls valid drone capability, a drone-delivery service request may be offered to another player/company. The third party becomes responsible only for its contracted leg(s), not for the underlying ownership of the goods.

A multi-leg fulfillment may therefore contain different companies/operators. Each leg must have explicit assignment, custody handoff and settlement.

---

# 10. Settlement

Successful completion can trigger multiple causally distinct effects:

- inventory/custody transfer completes;
- recipient/production/project state changes;
- payer pays the service/provider according to contract;
- third-party carrier fees settle for the actual completed logistics legs where applicable;
- company books revenue/costs;
- worker wage eligibility/work record updates where applicable;
- reputation/service history updates;
- eligible player XP/Level progression updates;
- eligible entity-specific loyalty updates;
- eligible Specialist Card Fragment awards tied to the actual governed economic entity/activity;
- marketplace ownership transfer completes only when the full physical fulfillment chain reaches its required acceptance boundary;
- waste/new demand may be generated later through use/consumption.

These effects should be idempotent/exactly-once under shared authority.

An order completion must not independently credit both company and worker with duplicated magical money.

Completing one carrier leg must not falsely mark the entire multi-leg marketplace transaction as delivered unless the contract says that leg is the final required acceptance boundary.

## Progression consequence receipt

When a legitimate completed delivery is eligible for personal progression consequences, the authoritative settlement should emit one replay-safe progression receipt keyed to the completed work/order settlement.

That receipt may include governed consequences such as:

- XP awarded to the actual worker/player;
- resulting player Level transition, if a threshold was crossed;
- loyalty delta for the actual persistent recipient/source/business entity;
- Specialist Card Fragment family/quantity when that entity has a valid specialist affinity.

Exact values and thresholds are balancing data.

The settlement authority must guarantee that retry, reload, duplicate callbacks or replay cannot mint the same XP, loyalty or fragments twice.

## Specialist-affinity boundary

A rural/farm destination does not automatically mean every agriculture fragment is valid.

Fragment eligibility must come from governed economic identity/capability. Examples may include animal husbandry, horticulture/vegetable production, cattle husbandry or pig husbandry only when the relevant simulated node actually supports that activity.

Transporting or reselling an already-existing fragment is ordinary cargo movement. It must not remint that fragment family merely because a new delivery occurred.

Self-delivery, self-dealing or circular marketplace trades must not become an infinite progression loop.

---

# 11. Failure, Cancellation and Default

Orders may fail because of:

- deadline/service failure;
- cargo damage/loss;
- vehicle/equipment failure;
- insufficient capacity/resources;
- infrastructure/weather disruption;
- no executable route/provider chain within contract constraints;
- invalid custody/authorization;
- cancellation;
- counterparty/company/carrier failure.

Consequences may include inventory/custody recovery, partial/zero payment, penalty, reputation/trust effects, entity-loyalty loss where causally justified, re-offering/rerouting/re-tendering and continuing shortage/project delay.

Failure should be explainable and recoverable where possible.

A missing carrier may create a replacement-provider opportunity rather than teleporting or silently completing the cargo movement.

---

# 12. Order Generation vs Opportunity Surfacing

The system may computationally generate/orderize requirements for usability, but the underlying requirement must exist first.

For example:

`shop stock below target -> procurement requirement -> order object generated -> eligible logistics providers see opportunity`.

Or:

`marketplace listing matched -> physical inventory reserved -> delivery-chain feasibility checked -> missing carrier capacity surfaced if needed -> fulfillment leg(s) generated -> custody/delivery -> buyer inventory settlement`.

Not canonical:

`random timer -> unrelated order/reward appears -> completion creates money`.

Also not canonical:

`marketplace match -> buyer inventory instantly receives distant physical item without a valid carrier chain`.

---

# 13. World Instance and Authority

Orders, contracts, inventory/custody and settlement are World-Instance-local economic state.

When shared multiplayer activates, trusted/server authority must own contested order creation, acceptance, assignment, carrier sourcing, custody transitions, cancellation, progression consequences and settlement.

Client UI sends intent; it does not declare successful economic settlement.

---

# 14. Current Runtime Migration Boundary

Current Prototype orders still contain simplified reward and generation logic.

That implementation remains functional until a staged migration connects:

- real demand/inventory;
- payer/counterparty;
- Personal Money/company revenue distinctions;
- cargo requirements/custody;
- authoritative settlement;
- XP/Level, entity loyalty and Specialist Card Fragment progression receipts;
- physically fulfilled player-marketplace transactions;
- route/capability feasibility and third-party/multi-leg carrier sourcing.

Migration must preserve current technical states or explicitly migrate them with save/testing evidence.

---

# 15. Balance and Playability

Orders should create meaningful route/cargo/customer/location choices and avoid repetitive identical waypoint touching.

The player should be able to understand why an order cannot be served by a given vehicle/company and whether another provider/mode could make it possible.

Exact price, priority, deadlines, volumes, XP, loyalty deltas, fragment quantities, transport ranges and availability coefficients remain balancing data.

---

# Canonical Rule

**An order is an actionable commitment produced by a real modeled economic requirement or committed marketplace transaction. It connects counterparties, goods/service, inventory/custody, capability, executable route legs, transport/work, time and settlement. When the primary parties lack the required movement capability, another legitimate carrier or multi-leg chain may fulfill it; if no valid chain exists, physical completion and ownership transfer cannot be fabricated. An order cannot create unexplained demand, money, XP, loyalty, fragments or teleported inventory by itself.**

---

End of Document