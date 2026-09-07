# World Instance Technical Acceptance

Status: Executable planning specialization
Last Updated: 2026-09-08

A future World Instance implementation is acceptable only when:

- a logical world has a stable `worldInstanceId` and baseline version;
- its map/economy/event history is isolated from other worlds;
- new-world launch does not reset older worlds;
- mature-world money/assets cannot silently enter a fresh world;
- one logical world can span multiple physical services/shards;
- shared contested economy is server-authoritative when multiplayer becomes live;
- inactive areas can use summarized catch-up rather than per-frame replay;
- world history survives country/locality status changes;
- versioned geography/baseline changes do not rewrite existing world history;
- client rendering remains bounded to the active map/detail context.