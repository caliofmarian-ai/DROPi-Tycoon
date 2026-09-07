# Document Information

Document: VISUAL_DESIGN_SYSTEM.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Visual Design System

## Purpose

This document defines the visual and interaction direction of DROPi Tycoon UI/UX. It converts the project's long-term visual-quality goal into concrete interface rules that can evolve without changing core simulation logic.

World-art identity, asset-family diversity and production rules are owned by `08_Assets/WORLD_ASSET_BIBLE.md`.

---

# Experience Target

DROPi Tycoon should feel like a living logistics company and society, not a collection of debug panels.

The interface must be:

- attractive;
- clear;
- consistent;
- compact enough for mobile;
- comfortable for touch;
- rich enough to support immersion;
- scalable as company/world complexity grows;
- visually compatible with the canonical world art.

Prototype simplicity is temporary implementation scope, not a permanent visual target.

---

# Canonical Art Relationship — 2026-09-07

The Project Owner has explicitly approved the current candidate-asset direction and its improvement toward a richer three-dimensional presentation.

The canonical world style is:

**Stylized 3D Pre-Rendered Mobile World — premium mobile tycoon presentation, soft-isometric / elevated 3/4 perspective, readable forms, controlled color, clear materials and consistent lighting.**

UI does not need to mimic a three-dimensional world object literally, but its icons, cards, illustrations, depth, materials and color language must feel like part of the same product.

UI may remain technically vector/text/Phaser/HTML-driven where that improves readability and responsiveness.

The art direction may be materially changed only by a later explicit Project Owner decision and canonical reconciliation.

---

# Human-Centered Presentation

People should be visually represented where their identity matters.

Candidate and employee surfaces should support:

- portrait or avatar;
- name;
- role;
- current status;
- a concise set of meaningful attributes;
- salary or hiring implications where relevant;
- performance or progression information after hiring.

A candidate must not be reduced to a name and a purchase button when the game already models that person as an employee.

Visual identity should persist after hiring so the player can recognize recurring characters.

Human portraits/avatars must use the diversity and identity-continuity rules in `WORLD_ASSET_BIBLE.md`; the interface must not present the same generic face for unrelated people merely for convenience.

---

# Information Hierarchy

Each management screen should prioritize:

1. identity and current state;
2. the decision the player can make now;
3. the most important consequences;
4. secondary details;
5. advanced information on demand.

Do not fill large panels with empty space merely to preserve a desktop-style layout.

---

# Mobile-First Layout

The active UI must work on real Android portrait and landscape screens.

Rules:

- no title or statistic may render outside the viewport;
- dense summary information must wrap, reflow, or stack;
- important controls must remain comfortably tappable;
- card height should be driven by content rather than unused space;
- portrait layouts should prefer vertical hierarchy over compressed horizontal rows;
- landscape may use columns when useful;
- the center of the map must remain available for world interaction where persistent HUD is present.

Automated responsive tests do not replace real-device owner review.

---

# Reusable Visual Language

Similar concepts should use consistent patterns across Employees, Vehicles, Reviews, Finance, Warehouses, Products, Drones, Rail, Aviation, Ports and future systems.

The reusable language should include:

- screen header;
- status chips;
- person cards;
- vehicle cards;
- product/cargo cards;
- company/industry cards;
- summary metrics;
- primary and secondary actions;
- empty states;
- warnings;
- success feedback;
- pagination or progressive lists;
- modal/detail surfaces when complexity requires them.

---

# Character Card Standard

A person card should normally contain:

- visual identity;
- name and role;
- status;
- 3 to 6 decision-relevant attributes at most in the first view;
- relevant financial commitment;
- one clear primary action;
- optional path to deeper details.

Attributes may include experience, reliability, navigation, customer service, availability, onboarding progress, performance, or morale when those systems exist.

Do not invent unsupported attributes merely to decorate a card.

---

# Product and Cargo Presentation

When products/cargo are visible in UI, presentation should help the player identify:

- product/category;
- packaging/cargo form;
- quantity/capacity where authoritative;
- handling status where modeled;
- pickup/source;
- destination/customer or transfer point where relevant.

UI must use real modeled product/cargo truth and must not fabricate unsupported stock or demand merely to fill cards.

---

# Visual Feedback

Important changes should feel consequential.

Examples include:

- first employee hired;
- onboarding completed;
- first vehicle purchased;
- promotion;
- major customer review;
- financial milestone;
- expansion unlocked;
- construction completed;
- product/cargo transferred;
- new transport gateway unlocked.

Feedback can use restrained animation, character reaction, sound, iconography or short narrative copy. Effects must support comprehension rather than distract from gameplay.

---

# Art Direction and Rendering Technology Boundary

The art style is now canonically constrained by `WORLD_ASSET_BIBLE.md`.

The rendering technology is not permanently locked.

High-fidelity portraits, characters, vehicles, buildings, animation, lighting and interface art may improve over time **inside the approved visual language**.

Temporary/runtime-procedural assets must remain replaceable without changing simulation state or gameplay rules.

A future real-time 3D rendering migration, if ever considered, is a Technical/Product decision and may not be inferred merely from the three-dimensional appearance of pre-rendered art.

---

# Owner Visual Gate

Any merged change that materially affects player-visible UI should be checked on the deployed/installed game.

Owner verification should state:

- where to navigate;
- what changed;
- what to test;
- portrait and landscape expectations when relevant;
- whether the result is functionally accepted and visually accepted.

A system may be functionally correct while remaining on visual hold.

---

# Canonical Rule

**DROPi Tycoon UI must make complex company/world systems understandable while making the company, products and people feel alive. It must remain mobile-first and functionally clear while visually belonging to the same canonical stylized 3D pre-rendered DROPi Tycoon world.**

---

End of Document
