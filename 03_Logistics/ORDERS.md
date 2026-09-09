# Document Information

Document: ORDERS.md
Project: DROPi Tycoon
Version: 2.1.0
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
- committed player-marketplace trade that requires physical fulfillment.

The originating state identifies a legitimate buyer/payer/source or another explicitly governed settlement source.

---

# 3. Full-Game Order Lifecycle

A mature order lifecycle may include:

**Requirement Detected**

-> **Procurement/Request Created**

-> **Order Offered / Contract Assigned / Bid**

-> **Accepted / Committed**

-> **Inventory Reserved / Cargo Defined**

-> **Resources / Worker / Vehicle Assigned**

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
- time window/priority;
- agreed price/payment/settlement terms;
- failure/cancellation terms;
- assigned actor/company/vehicle/legs;
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

# 8. Availability and Eligibility

An order may be:

- publicly offered;
- offered to selected capable providers;
- assigned by an employment/dispatch relationship;
- generated from a recurring contract;
- exposed through bidding/tendering when implemented.

Visibility does not imply eligibility.

Eligibility may depend on:

- profession/qualification;
- employment/company relationship;
- cargo capability;
- vehicle/equipment;
- infrastructure/access;
- geographic presence;
- available capacity/Work Capacity;
- company authorization/reputation;
- contract-specific rules.

---

# 9. Assignment and Employment Boundary

The early human player is an employee of a fictional incumbent logistics company.

The work app/dispatch system may therefore assign or offer eligible work within that employment relationship.

Completing such work contributes to employer service/revenue and the player's work record. The player's compensation is primarily wage/shift settlement through `Personal Money`, not automatic ownership of the order's company revenue.

Later independent/company-owner roles may receive different settlement relationships.

---

# 10. Settlement

Successful completion can trigger multiple causally distinct effects:

- inventory/custody transfer completes;
- recipient/production/project state changes;
- payer pays the service/provider according to contract;
- company books revenue/costs;
- worker wage eligibility/work record updates where applicable;
- reputation/service history updates;
- eligible player XP/Level progression updates;
- eligible entity-specific loyalty updates;
- eligible Specialist Card Fragment awards tied to the actual governed economic entity/activity;
- marketplace ownership transfer completes when this order is the physical fulfillment leg of a marketplace transaction;
- waste/new demand may be generated later through use/consumption.

These effects should be idempotent/exactly-once under shared authority.

An order completion must not independently credit both company and worker with duplicated magical money.

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
- invalid custody/authorization;
- cancellation;
- counterparty/company failure.

Consequences may include inventory/custody recovery, partial/zero payment, penalty, reputation/trust effects, entity-loyalty loss where causally justified, re-offering/rerouting and continuing shortage/project delay.

Failure should be explainable and recoverable where possible.

---

# 12. Order Generation vs Opportunity Surfacing

The system may computationally generate/orderize requirements for usability, but the underlying requirement must exist first.

For example:

`shop stock below target -> procurement requirement -> order object generated -> eligible logistics providers see opportunity`.

Or:

`marketplace listing matched -> physical inventory reserved -> fulfillment order generated -> custody/delivery -> buyer inventory settlement`.

Not canonical:

`random timer -> unrelated order/reward appears -> completion creates money`.

---

# 13. World Instance and Authority

Orders, contracts, inventory/custody and settlement are World-Instance-local economic state.

When shared multiplayer activates, trusted/server authority must own contested order creation, acceptance, assignment, custody transitions, cancellation, progression consequences and settlement.

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
- physically fulfilled player-marketplace transactions.

Migration must preserve current technical states or explicitly migrate them with save/testing evidence.

---

# 15. Balance and Playability

Orders should create meaningful route/cargo/customer/location choices and avoid repetitive identical waypoint touching.

Exact price, priority, deadlines, volumes, XP, loyalty deltas, fragment quantities and availability coefficients remain balancing data.

---

# Canonical Rule

**An order is an actionable commitment produced by a real modeled economic requirement or committed marketplace transaction. It connects counterparties, goods/service, inventory/custody, capability, transport/work, time and settlement; it may surface a business or progression opportunity, but it cannot create unexplained demand, money, XP, loyalty, fragments or teleported inventory by itself.**

---

End of Document