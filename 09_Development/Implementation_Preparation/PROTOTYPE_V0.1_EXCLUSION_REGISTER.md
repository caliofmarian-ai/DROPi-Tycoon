# Document Information

Document: PROTOTYPE_V0.1_EXCLUSION_REGISTER.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057)
Language: English
Last Updated: 2026-07-14

---

# Prototype v0.1 Exclusion Register (Corrected)

## Purpose

Track features explicitly excluded from Prototype v0.1 and prevent scope regression.

---

## Canonical Exclusions

| Exclusion ID | Feature | Canonical Evidence |
|---|---|---|
| EXC-001 | DronePorts | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-002 | Drone delivery / drones | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-003 | Vehicles beyond Bicycle (vans, trucks, etc.) | `PROTOTYPE_V0.1.md` Transportation System |
| EXC-004 | Multiplayer | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-005 | Online backend / server APIs | `SAVE_SYSTEM.md` GDevelop Implementation Boundary |
| EXC-006 | Cloud save / cross-device sync | `SAVE_SYSTEM.md` Save Slot Policy |
| EXC-007 | Multiple save slots | `SAVE_SYSTEM.md` Save Slot Policy |
| EXC-008 | Advanced AI automation / fleet AI | `PROTOTYPE_V0.1.md` + `AI_SYSTEM.md` MVP scope |
| EXC-009 | Employee hiring/management | `PROGRESSION.md` Stage-based scope |
| EXC-010 | Route optimization systems | `CORE_GAMEPLAY_SYSTEMS.md` MVP exclusions |
| EXC-011 | Complex economy systems (loans, taxes, stock, etc.) | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-012 | Multiple cities / expansion worlds | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-013 | Warehouses / distribution hubs | `PROGRESSION.md` post-prototype scope |
| EXC-014 | Advanced weather/traffic simulation | `CORE_GAMEPLAY_SYSTEMS.md` MVP exclusions |
| EXC-015 | Multi-package active orders | `CORE_GAMEPLAY_SYSTEMS.md` MVP one-active-order rule |
| EXC-016 | Contract bidding systems | `ORDERS.md` future systems context |
| EXC-017 | Advanced vehicle mechanics (fuel, damage, maintenance) | `PROTOTYPE_V0.1.md` Transportation System |
| EXC-018 | Extended in-game AI agents | `AI_SYSTEM.md` MVP AI scope |
| EXC-019 | Building-upgrade/city-development simulation | `BUILDINGS.md` future scope |
| EXC-020 | Production services/build infrastructure beyond prototype docs | `PROTOTYPE_V0.1.md` + `PROJECT_STATUS.md` scope limits |

---

## Reference Integrity and Regression Check

- Broken `REQ-EXC-*` references: **removed**.
- Each exclusion now maps directly to canonical evidence.
- Exclusions are **not** counted as implementation requirements.
- Verified excluded features are absent from:
  - requirements inventory;
  - implementation architecture;
  - traceability matrix;
  - implementation batch plan;
  - first implementation batch.

---

## Mandatory Feature Spot-Checks (Report 057)

- DronePorts: excluded and absent from implementation work.
- Drones: excluded and absent from implementation work.
- Vans/extra vehicles: excluded and absent from implementation work.
- Multiplayer: excluded and absent from implementation work.
- Online backend: excluded and absent from implementation work.
- Cloud save: excluded and absent from implementation work.
- Advanced AI: excluded and absent from implementation work.
- Later-stage progression systems: excluded and absent from implementation work.
- Production services: excluded and absent from implementation work.

---

End of Document
