# Document Information

Document: ISSUE_CATALOG.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical
Author: AI Agent (Report 086)
Language: English
Last Updated: 2026-08-01

---

# Issue Catalog

## Purpose

This document enumerates all planned GitHub issues for DROPi Tycoon.

Issues are classified as either **executable** (concrete, actionable, ready to be created in GitHub) or **future placeholders** (identified but not yet fully specified for GitHub creation).

---

## Issue Count Summary

- Total executable issues: **31** (ISSUE-001 through ISSUE-031)
- Total future placeholders: **12** (PLACEHOLDER-001 through PLACEHOLDER-012)
- Total planned issues: **43**

---

## Executable Issues

Executable issues represent actionable GitHub issues for near-term implementation work spanning RBATCH-009 through Phase 2 foundations.

---

### RBATCH-009 — Economy Reward & Reputation Updates

#### ISSUE-001: Implement money reward on order completion

- ID: ISSUE-001
- Batch: RBATCH-009
- Epic: E-010
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-009`, `epic:economy-reputation`
- Description: When an order transitions to Completed, apply the canonical money reward to PlayerData.Money. Validate affordability checks remain coherent.
- Acceptance Criteria: PlayerData.Money increases by the configured reward value when PickedUp→Completed fires.

---

#### ISSUE-002: Implement reputation increase on delivery completion

- ID: ISSUE-002
- Batch: RBATCH-009
- Epic: E-010
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-009`, `epic:economy-reputation`
- Description: When an order transitions to Completed, increase PlayerData.Reputation by the canonical value.
- Acceptance Criteria: Reputation increases correctly and remains bounded by canonical maximum.

---

#### ISSUE-003: Implement money penalty on order failure

- ID: ISSUE-003
- Batch: RBATCH-009
- Epic: E-010
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-009`, `epic:economy-reputation`
- Description: When an order transitions to Failed, apply the canonical money penalty to PlayerData.Money, clamped to zero minimum.
- Acceptance Criteria: PlayerData.Money decreases correctly; negative money is prevented.

---

#### ISSUE-004: Implement reputation decrease on order failure

- ID: ISSUE-004
- Batch: RBATCH-009
- Epic: E-010
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-009`, `epic:economy-reputation`
- Description: When an order transitions to Failed, decrease PlayerData.Reputation by the canonical penalty value.
- Acceptance Criteria: Reputation decreases correctly and remains bounded by canonical minimum.

---

### RBATCH-010 — HUD + Notifications

#### ISSUE-005: Implement active-order HUD panel

- ID: ISSUE-005
- Batch: RBATCH-010
- Epic: E-011
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-010`, `epic:hud-notifications`
- Description: Create the active-order HUD panel that displays current order destination, status, and package state.
- Acceptance Criteria: HUD panel is visible when an order is active and hidden when no order is active.

---

#### ISSUE-006: Implement Accept Order button in HUD

- ID: ISSUE-006
- Batch: RBATCH-010
- Epic: E-011
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-010`, `epic:hud-notifications`
- Description: Create the fully styled Accept Order button in the HUD (deferred from RBATCH-007 minimal touch trigger). Connects to AcceptRequested flow.
- Acceptance Criteria: Button appears when an Available order is in range; pressing it transitions order to Accepted.

---

#### ISSUE-007: Implement delivery status notifications

- ID: ISSUE-007
- Batch: RBATCH-010
- Epic: E-011
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-010`, `epic:hud-notifications`
- Description: Display toast/banner notifications for order state transitions (Accepted, PickedUp, Completed, Failed).
- Acceptance Criteria: Notification appears briefly on each canonical state transition.

---

### RBATCH-011 — MainMenu Start/Continue Flow

#### ISSUE-008: Implement Start/Continue main menu flow

- ID: ISSUE-008
- Batch: RBATCH-011
- Epic: E-012
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-011`, `epic:mainmenu-gameflow`
- Description: MainMenu scene displays Start (new game) and Continue (load existing game) options. Continue is disabled when no save exists.
- Acceptance Criteria: Start and Continue buttons behave per canonical save policy; Continue is unavailable when no save data exists.

---

#### ISSUE-009: Implement new-game overwrite guard

- ID: ISSUE-009
- Batch: RBATCH-011
- Epic: E-012
- Milestone: M-005
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-011`, `epic:mainmenu-gameflow`
- Description: When the player chooses Start with existing save data, display a confirmation guard dialog before overwriting.
- Acceptance Criteria: Guard dialog appears and prevents overwrite unless player explicitly confirms.

---

### RBATCH-012 — CompanyManagement + Upgrade Purchase Flow

#### ISSUE-010: Implement upgrade purchase flow

- ID: ISSUE-010
- Batch: RBATCH-012
- Epic: E-013
- Milestone: M-006
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-012`, `epic:company-management`
- Description: Player can browse and purchase available upgrades in the CompanyManagement scene with affordability enforcement.
- Acceptance Criteria: Upgrade purchase deducts money; player cannot purchase upgrades they cannot afford.

---

#### ISSUE-011: Implement CompanyManagement scene navigation

- ID: ISSUE-011
- Batch: RBATCH-012
- Epic: E-013
- Milestone: M-006
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-012`, `epic:company-management`
- Description: Navigation between GameWorld and CompanyManagement scene is accessible from HUD and returns to GameWorld correctly.
- Acceptance Criteria: Player can enter and exit CompanyManagement scene without losing game state.

---

### RBATCH-013 — Bicycle Ownership + Speed Effect

#### ISSUE-012: Implement bicycle ownership flag

- ID: ISSUE-012
- Batch: RBATCH-013
- Epic: E-014
- Milestone: M-006
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-013`, `epic:bicycle-ownership`
- Description: Purchase of bicycle sets the canonical PlayerData.HasBicycle flag. Flag persists correctly in game state.
- Acceptance Criteria: HasBicycle is false initially; becomes true after bicycle purchase; does not reset on scene transitions.

---

#### ISSUE-013: Implement bicycle speed effect on player movement

- ID: ISSUE-013
- Batch: RBATCH-013
- Epic: E-014
- Milestone: M-006
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-013`, `epic:bicycle-ownership`
- Description: When HasBicycle is true, apply the canonical speed multiplier to player movement speed.
- Acceptance Criteria: Movement speed is visibly faster with bicycle; walking speed unchanged without bicycle.

---

### RBATCH-014 — Save/Load Implementation

#### ISSUE-014: Implement save-game serialization

- ID: ISSUE-014
- Batch: RBATCH-014
- Epic: E-015
- Milestone: M-007
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-014`, `epic:save-load`
- Blocked By: ODR-001, ODR-003
- Description: Serialize all canonical save-game fields to local device storage per the save policy.
- Acceptance Criteria: All required fields are persisted; non-persisted fields are excluded per canonical specification.

---

#### ISSUE-015: Implement save-game deserialization and load

- ID: ISSUE-015
- Batch: RBATCH-014
- Epic: E-015
- Milestone: M-007
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-014`, `epic:save-load`
- Blocked By: ODR-001, ODR-003
- Description: Deserialize and validate save data from local device storage on game load. Handle missing or corrupt save gracefully.
- Acceptance Criteria: Valid save data loads correctly; corrupt or missing data falls back to new-game state.

---

#### ISSUE-016: Implement autosave triggers

- ID: ISSUE-016
- Batch: RBATCH-014
- Epic: E-015
- Milestone: M-007
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-014`, `epic:save-load`
- Blocked By: ODR-001, ODR-003
- Description: Autosave fires at canonical trigger points (order completion, scene exit, company management changes).
- Acceptance Criteria: Autosave triggers at all required canonical events; no data loss between saves.

---

#### ISSUE-017: Implement save-slot validation

- ID: ISSUE-017
- Batch: RBATCH-014
- Epic: E-015
- Milestone: M-007
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-014`, `epic:save-load`
- Blocked By: ODR-001, ODR-003
- Description: Validate save slot integrity on load; report version mismatches or schema violations.
- Acceptance Criteria: Validation passes on fresh save; validation fails gracefully on corrupt or version-incompatible data.

---

### RBATCH-015 — Mobile Optimization

#### ISSUE-018: Implement mobile viewport scaling

- ID: ISSUE-018
- Batch: RBATCH-015
- Epic: E-016
- Milestone: M-008
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-015`, `epic:mobile-optimization`
- Description: Configure viewport scaling for Android target devices ensuring HUD and game world render correctly at common mobile resolutions.
- Acceptance Criteria: Game renders correctly on 720p and 1080p Android portrait and landscape.

---

#### ISSUE-019: Optimize touch interaction targets

- ID: ISSUE-019
- Batch: RBATCH-015
- Epic: E-016
- Milestone: M-008
- Type: implementation
- Labels: `type:implementation`, `phase:1`, `batch:rbatch-015`, `epic:mobile-optimization`
- Description: Verify all interactive touch targets meet minimum size requirements for reliable mobile tapping.
- Acceptance Criteria: All HUD buttons and world touch targets meet canonical minimum touch target size (REQ-024).

---

### RBATCH-016 — Full-Loop Integration Verification

#### ISSUE-020: Execute full-loop integration test suite

- ID: ISSUE-020
- Batch: RBATCH-016
- Epic: E-017
- Milestone: M-008
- Type: verification
- Labels: `type:verification`, `phase:1`, `batch:rbatch-016`, `epic:integration-verification`
- Description: Execute integration tests covering the complete prototype gameplay loop from startup through order completion and failure.
- Acceptance Criteria: All P0/P1 loop behaviors verified; no regression failures.

---

#### ISSUE-021: Document integration test results

- ID: ISSUE-021
- Batch: RBATCH-016
- Epic: E-017
- Milestone: M-008
- Type: documentation
- Labels: `type:documentation`, `phase:1`, `batch:rbatch-016`, `epic:integration-verification`
- Description: Create integration test evidence document with pass/fail results for all scenarios.
- Acceptance Criteria: Evidence document exists; all pass/fail results are recorded accurately.

---

### RBATCH-017 — Release-Checklist Verification Package

#### ISSUE-022: Assemble prototype release checklist evidence

- ID: ISSUE-022
- Batch: RBATCH-017
- Epic: E-017
- Milestone: M-008
- Type: verification
- Labels: `type:verification`, `phase:1`, `batch:rbatch-017`, `epic:integration-verification`
- Description: Assemble complete evidence package for all prototype release checklist sections for owner review.
- Acceptance Criteria: Checklist evidence is complete for all sections; no self-approval claims made.

---

#### ISSUE-023: Prepare owner review package

- ID: ISSUE-023
- Batch: RBATCH-017
- Epic: E-017
- Milestone: M-008
- Type: documentation
- Labels: `type:documentation`, `phase:1`, `batch:rbatch-017`, `epic:integration-verification`
- Description: Prepare and deliver the owner review package with all required artifacts and instructions.
- Acceptance Criteria: Package is accessible to the Project Owner; all artifacts are included; owner is instructed to review before approving.

---

### Phase 2 Foundation Issues

#### ISSUE-024: Design employee data model

- ID: ISSUE-024
- Batch: RBATCH-018
- Epic: E-018
- Milestone: M-009
- Type: design
- Labels: `type:design`, `phase:2`, `batch:rbatch-018`, `epic:employee-management`
- Description: Define the canonical employee data structure including attributes, salary fields, and hire/fire lifecycle.
- Acceptance Criteria: Employee data model documented and approved before implementation.

---

#### ISSUE-025: Implement daily expense calculation

- ID: ISSUE-025
- Batch: RBATCH-019
- Epic: E-019
- Milestone: M-009
- Type: implementation
- Labels: `type:implementation`, `phase:2`, `batch:rbatch-019`, `epic:financial-reporting`
- Description: Implement daily expense deduction event applying all configured operational costs at day-end.
- Acceptance Criteria: Daily expenses deduct correctly; negative balance is handled per canonical policy.

---

#### ISSUE-026: Implement salary deduction system

- ID: ISSUE-026
- Batch: RBATCH-018
- Epic: E-018
- Milestone: M-009
- Type: implementation
- Labels: `type:implementation`, `phase:2`, `batch:rbatch-018`, `epic:employee-management`
- Description: Deduct employee salaries from company funds on each salary cycle event.
- Acceptance Criteria: Salary deducts per employee per cycle; insufficient funds handled per canonical policy.

---

#### ISSUE-027: Implement financial report display

- ID: ISSUE-027
- Batch: RBATCH-019
- Epic: E-019
- Milestone: M-009
- Type: implementation
- Labels: `type:implementation`, `phase:2`, `batch:rbatch-019`, `epic:financial-reporting`
- Description: Display a financial summary panel showing income, expenses, and net balance for the current period.
- Acceptance Criteria: Financial report panel is accessible from CompanyManagement scene and shows accurate data.

---

#### ISSUE-028: Implement vehicle catalog and purchase UI

- ID: ISSUE-028
- Batch: RBATCH-022
- Epic: E-021
- Milestone: M-010
- Type: implementation
- Labels: `type:implementation`, `phase:2`, `batch:rbatch-022`, `epic:vehicle-fleet`
- Description: Vehicle catalog browsable in CompanyManagement with purchase option and affordability check.
- Acceptance Criteria: Player can view and purchase vehicles; ownership is tracked per vehicle.

---

#### ISSUE-029: Implement vehicle maintenance cost tracking

- ID: ISSUE-029
- Batch: RBATCH-023
- Epic: E-021
- Milestone: M-010
- Type: implementation
- Labels: `type:implementation`, `phase:2`, `batch:rbatch-023`, `epic:vehicle-fleet`
- Description: Track maintenance costs per vehicle type and deduct from daily expenses.
- Acceptance Criteria: Maintenance costs appear in financial report; deduction is accurate per vehicle owned.

---

#### ISSUE-030: Implement customer review system

- ID: ISSUE-030
- Batch: RBATCH-020
- Epic: E-020
- Milestone: M-009
- Type: implementation
- Labels: `type:implementation`, `phase:2`, `batch:rbatch-020`, `epic:customer-reputation`
- Description: Generate customer review events after each completed or failed order, influencing reputation score.
- Acceptance Criteria: Reviews are generated after each order outcome; reputation score updates accordingly.

---

#### ISSUE-031: Implement reputation display in HUD

- ID: ISSUE-031
- Batch: RBATCH-021
- Epic: E-020
- Milestone: M-009
- Type: implementation
- Labels: `type:implementation`, `phase:2`, `batch:rbatch-021`, `epic:customer-reputation`
- Description: Display the current reputation score in the HUD or CompanyManagement scene.
- Acceptance Criteria: Reputation score is visible to the player and updates in real time with each order outcome.

---

## Future Placeholders

Future placeholders identify planned work that is not yet specified in sufficient detail for direct GitHub issue creation.

---

### PLACEHOLDER-001: Warehouse Construction System

- ID: PLACEHOLDER-001
- Batch: RBATCH-025
- Epic: E-022
- Milestone: M-011
- Phase: 3
- Status: Future — Not Ready for GitHub Creation
- Summary: Full warehouse construction, inventory management, and dispatch routing from warehouse locations.

---

### PLACEHOLDER-002: Multi-District Map

- ID: PLACEHOLDER-002
- Batch: RBATCH-026
- Epic: E-023
- Milestone: M-011
- Phase: 3
- Status: Future — Not Ready for GitHub Creation
- Summary: Expanded world map with multiple city districts, boundaries, and per-district logistics.

---

### PLACEHOLDER-003: Fleet Management Dashboard

- ID: PLACEHOLDER-003
- Batch: RBATCH-028
- Epic: E-024
- Milestone: M-012
- Phase: 3
- Status: Future — Not Ready for GitHub Creation
- Summary: Fleet dashboard with vehicle assignment, utilization tracking, and route visualization.

---

### PLACEHOLDER-004: Route Optimization Engine

- ID: PLACEHOLDER-004
- Batch: RBATCH-029
- Epic: E-025
- Milestone: M-012
- Phase: 3
- Status: Future — Not Ready for GitHub Creation
- Summary: Automated route optimization algorithm integrated into dispatch system.

---

### PLACEHOLDER-005: Drone Research Tree

- ID: PLACEHOLDER-005
- Batch: RBATCH-032
- Epic: E-026
- Milestone: M-013
- Phase: 4
- Status: Future — Not Ready for GitHub Creation
- Summary: Drone technology research progression with unlock tree and research cost modeling.

---

### PLACEHOLDER-006: DronePort Infrastructure

- ID: PLACEHOLDER-006
- Batch: RBATCH-034
- Epic: E-028
- Milestone: M-014
- Phase: 4
- Status: Future — Not Ready for GitHub Creation
- Summary: DronePort construction, placement, and operational management system.

---

### PLACEHOLDER-007: Autonomous Drone Delivery

- ID: PLACEHOLDER-007
- Batch: RBATCH-036
- Epic: E-030
- Milestone: M-015
- Phase: 4
- Status: Future — Not Ready for GitHub Creation
- Summary: Fully autonomous drone dispatch and delivery execution without manual player intervention.

---

### PLACEHOLDER-008: Dynamic Market System

- ID: PLACEHOLDER-008
- Batch: RBATCH-039
- Epic: E-032
- Milestone: M-016
- Phase: 5
- Status: Future — Not Ready for GitHub Creation
- Summary: Dynamic market with inflation, demand-driven pricing, fuel costs, and electricity pricing.

---

### PLACEHOLDER-009: Business Loans & Investors

- ID: PLACEHOLDER-009
- Batch: RBATCH-040
- Epic: E-034
- Milestone: M-017
- Phase: 5
- Status: Future — Not Ready for GitHub Creation
- Summary: Business loan mechanics with repayment schedules and investor relationship system.

---

### PLACEHOLDER-010: Competitor AI Companies

- ID: PLACEHOLDER-010
- Batch: RBATCH-041
- Epic: E-035
- Milestone: M-017
- Phase: 5
- Status: Future — Not Ready for GitHub Creation
- Summary: AI-controlled competitor companies that operate in the same logistics market.

---

### PLACEHOLDER-011: Smart Routing & AI Dispatch

- ID: PLACEHOLDER-011
- Batch: RBATCH-042
- Epic: E-036
- Milestone: M-018
- Phase: 6
- Status: Future — Not Ready for GitHub Creation
- Summary: AI-driven smart routing, predictive demand modeling, and autonomous dispatch center.

---

### PLACEHOLDER-012: International Multi-City Expansion

- ID: PLACEHOLDER-012
- Batch: (defined in future planning iteration)
- Epic: (defined in future planning iteration)
- Milestone: M-019
- Phase: 7
- Status: Future — Not Ready for GitHub Creation
- Summary: Multi-city, multi-country logistics operations with customs, airports, and international regulations.

---

## Issue ID Uniqueness Verification

- ISSUE-001 through ISSUE-031: 31 unique IDs confirmed. No duplicates.
- PLACEHOLDER-001 through PLACEHOLDER-012: 12 unique IDs confirmed. No duplicates.

---

End of Document
