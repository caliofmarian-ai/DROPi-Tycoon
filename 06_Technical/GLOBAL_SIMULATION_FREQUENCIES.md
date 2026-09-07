# Global Simulation Frequencies

Status: Canonical technical specialization
Last Updated: 2026-09-08

DROPi Tycoon must scale by changing simulation frequency with world scope.

## Responsibility bands

### Frame / local-real-time
Used only for the active detailed scene and immediate player interaction:
- movement;
- collisions;
- local traffic actors;
- current parcel/custody interactions;
- camera/UI response.

### Route / operational
Used for active delivery legs, nearby hubs and current logistics operations:
- ETA/progress;
- transfer state;
- vehicle assignment;
- active contract fulfillment.

### Economic tick
Used for inactive locality, production and inventory state:
- production cycles;
- inventory movement;
- local supply/demand;
- routine wages/costs;
- recurring contract volume.

### Strategic tick
Used for country/global state:
- inter-regional trade;
- global freight summaries;
- infrastructure utilization;
- national economy indicators;
- broad migration pressure.

### Slow world cycle
Used for structural evolution:
- demographics;
- city construction;
- industrial expansion/closure;
- new settlement founding;
- long-term environmental change;
- advanced geopolitical state transitions.

## Catch-up

Inactive areas may advance through deterministic summarized catch-up rather than replaying every missed local frame.

## Client/server boundary

The mobile client renders only the active view and receives summarized strategic state. Shared multiplayer world truth must be server-authoritative when activated.

## Canonical rule

**Scale comes from hierarchical simulation frequency, not from simulating the whole planet at local-frame fidelity.**