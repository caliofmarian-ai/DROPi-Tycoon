# Document Information

Document: VISUAL_DESIGN_SYSTEM.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-04

---

# Visual Design System

## Purpose

This document defines the visual and interaction direction of DROPi Tycoon. It converts the project's long-term visual-quality goal into concrete UI rules that can evolve without changing core simulation logic.

---

# Experience Target

DROPi Tycoon should feel like a living logistics company, not a collection of debug panels.

The interface must be:

- attractive;
- clear;
- consistent;
- compact enough for mobile;
- comfortable for touch;
- rich enough to support immersion;
- scalable as company complexity grows.

Prototype simplicity is temporary implementation scope, not a permanent visual target.

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

Visual identity should persist after hiring so the player can recognize and develop relationships with recurring characters.

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

Similar concepts should use consistent patterns across Employees, Vehicles, Reviews, Finance, Warehouses, Drones, and future systems.

The reusable language should include:

- screen header;
- status chips;
- person cards;
- vehicle cards;
- summary metrics;
- primary and secondary actions;
- empty states;
- warnings;
- success feedback;
- pagination or progressive lists;
- modal or detail surfaces when complexity requires them.

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

# Visual Feedback

Important changes should feel consequential.

Examples include:

- first employee hired;
- onboarding completed;
- first vehicle purchased;
- promotion;
- major customer review;
- financial milestone;
- expansion unlocked.

Feedback can use restrained animation, character reaction, sound, iconography, or short narrative copy. Effects must support comprehension rather than distract from gameplay.

---

# Art Direction Boundary

This document establishes interaction and presentation principles but does not permanently lock the game to one rendering technology or final art style.

High-fidelity portraits, characters, vehicles, buildings, animation, lighting, and interface art may evolve as production quality increases.

Temporary assets must be replaceable without changing simulation state or gameplay rules.

---

# Owner Visual Gate

Any merged change that materially affects player-visible UI should be checked on the deployed game.

Owner verification should state:

- where to navigate;
- what changed;
- what to test;
- portrait and landscape expectations when relevant;
- whether the result is functionally accepted and visually accepted.

A system may be functionally correct while remaining on visual hold.

---

# Canonical Rule

DROPi Tycoon UI must make complex company systems understandable while making the company and its people feel alive.

Clarity and usability are mandatory; visual richness and immersion should increase over time rather than remain at prototype-panel quality.

---

End of Document
