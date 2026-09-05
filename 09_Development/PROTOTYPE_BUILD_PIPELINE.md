# Document Information

Document: PROTOTYPE_BUILD_PIPELINE.md
Project: DROPi Tycoon
Version: 1.1.0
Status: AI Development Pipeline
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

---

# Prototype Build Pipeline

## Purpose

This document defines the complete process used to transform DROPi Tycoon design documents into a playable prototype.

The goal is to create a repeatable development pipeline with AI assistance.

---

# Pipeline Overview

The complete workflow:

```
Design Documents

↓

Architecture Review

↓

Implementation Planning

↓

Project Generation

↓

System Integration

↓

Testing

↓

Prototype Release
```

---

# Phase 1 — Documentation Analysis

## Input

Project documentation:

- Vision
- Gameplay systems
- Economy
- World design
- UI design
- Technical structure

---

## AI Responsibility

The AI analyzes:

- Required systems
- Dependencies
- Development order
- Possible conflicts

---

# Phase 2 — Implementation Planning

## Output

A technical implementation plan.

Contains:

- Scenes required
- Objects required
- Events required
- Variables required

---

# Phase 3 — Project Generation

## Goal

Create the implementation structure required by the currently approved runtime architecture.

Generated components may include:

```
Scenes

Objects

Events / systems

Variables / state

Assets folders
```

---

# Phase 4 — System Integration

Systems are added in priority order:

## First

Player movement

↓

## Second

World interaction

↓

## Third

Order system

↓

## Fourth

Delivery system

↓

## Fifth

Economy

↓

## Sixth

Progression

---

# Phase 5 — Testing Pipeline

Testing happens after each major system.

Example:

Movement Added

↓

Test

↓

Order System Added

↓

Test

↓

Delivery Added

↓

Test

---

# Phase 6 — Quality Review

The prototype is reviewed for:

## Gameplay

- Is the loop functional?
- Is it understandable?

## Technical

- Are systems connected correctly?
- Are there errors?

## Mobile

- Does it work comfortably on phones?

---

# AI Agent Responsibilities

## Architecture Agent

Checks:

- Project consistency
- Document alignment

---

## Developer Agent

Creates:

- Runtime structures
- Systems
- Events
- Logic

---

## QA Agent

Checks:

- Bugs
- Gameplay issues
- Missing features

---

## Documentation Agent

Maintains:

- Version history
- Decisions
- Updates

---

# Human Approval Points

Approval is required before:

- New systems are added
- Scope changes
- Architecture changes

---

# Canonical Build Versioning

## Purpose

Every distributed Android APK or AAB must be uniquely identifiable and historically traceable.

Repository merges and application releases are different events. A merge does not automatically create a new APK. A release version is assigned only when a defined build scope is prepared for device validation or public distribution.

## Semantic version

DROPi Tycoon uses numeric semantic versioning:

```
MAJOR.MINOR.PATCH
```

The controlled installed-mobile release line starts at:

```
0.0.0
```

The already-installed Android evaluation APK created on 2026-09-05 used legacy metadata `0.1.0` / Android versionCode `1`. It remains historically traceable as a pre-canonical evaluation build and does not redefine the controlled version line.

### PATCH

Increment PATCH for bounded corrections that preserve the current release capability, including:

- bug fixes;
- layout corrections;
- navigation fixes;
- compatibility corrections;
- small polish that does not materially expand gameplay capability.

Examples:

```
0.0.0 → 0.0.1 → 0.0.2
0.1.0 → 0.1.1
```

### MINOR

Increment MINOR for meaningful additions to the player experience or product capability, including:

- a new gameplay system;
- a new progression capability;
- substantial visual or audio experience work;
- a new management surface;
- a material expansion of the installed application experience.

When MINOR increases, PATCH resets to zero.

Examples:

```
0.0.4 → 0.1.0
0.1.7 → 0.2.0
```

### MAJOR

Increment MAJOR only for a major product-maturity or compatibility transition. `1.0.0` is reserved for the first fully promoted public release line and must not be assigned merely because an internal APK exists.

When MAJOR increases, MINOR and PATCH reset to zero.

## Android versionCode

Android `versionCode` is independent from the semantic version and must increase monotonically for every EAS Android build artifact.

The EAS project owns Android build numbers remotely through:

```json
"cli": {
  "appVersionSource": "remote"
}
```

Every Android build profile must use:

```json
"autoIncrement": true
```

This applies to development APKs, preview APKs and production AABs. A previously used Android versionCode must never be reset or reused.

## Version synchronization

`game-mobile/app.json` `expo.version` and `game-mobile/package.json` `version` must always contain the same semantic version.

Mobile CI must fail if:

- either value is not numeric `MAJOR.MINOR.PATCH`;
- the two values differ;
- EAS remote version ownership is removed;
- any Android build profile disables automatic build-number incrementing;
- a local `android.versionCode` is introduced while remote version ownership is active.

## Release ledger

Every actual Android build artifact must be recorded in `game-mobile/README.md` with:

- semantic version;
- Android versionCode;
- build date;
- exact source commit;
- EAS build ID or URL;
- release scope;
- owner/device validation result;
- discovered defects or hold state.

The ledger records build artifacts, not ordinary commits.

## Lockfile release gate

A deterministic dependency lockfile is mandatory before an EAS build is submitted.

The normal release path must not bypass EAS lockfile validation with `EAS_BUILD_SKIP_LOCKFILE_CHECK=1`.

If the lockfile is missing or stale, fix and commit it before building.

## Build authorization rule

Do not build merely because a PR was merged. Build when the intended release scope is coherent enough to justify physical-device owner review.

Before submission:

1. decide the semantic increment from the actual release scope;
2. synchronize `app.json` and `package.json`;
3. update the mobile release ledger planned row;
4. ensure the lockfile is committed and current;
5. pass mobile CI and Expo Doctor;
6. submit the EAS build;
7. after completion, record the actual versionCode, build ID and source commit;
8. perform owner review on the installed artifact and record PASS/HOLD plus defects.

---

# Prototype Build Rules

The pipeline must prioritize:

- Simple implementation
- Stable gameplay
- Fast iteration

Avoid:

- Overengineering
- Unnecessary features
- Complex systems too early

---

# Final Goal

The pipeline should transform:

An idea

↓

Into documentation

↓

Into an implementation

↓

Into a playable installed mobile game

---

# Canonical Rule

Every build must move the project closer to a playable experience, and every distributed Android artifact must be uniquely versioned and historically traceable.

---

End of Document