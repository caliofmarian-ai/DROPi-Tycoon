# Global World Data Rules

Status: Canonical specialization
Last Updated: 2026-09-08

## Geography data

- Use a versioned low-resolution global geography dataset suitable for mobile rendering.
- Preserve recognizable country shapes and approximate positions.
- Capital and representative locality positions should be based on real geography.
- Administrative divisions are country-specific data, not globally hardcoded terminology.
- Existing World Instances retain their map dataset version unless a governed migration is explicitly performed.

## Economy seed data

Initial country/region economic profiles may be inspired by broad real-world patterns such as agriculture, manufacturing, resources, services, tourism and transport geography.

They must not be represented as live official statistics.

## Simulation-owned values

After a World Instance starts, the following are game-world state and may diverge substantially from reality:

- population;
- prices;
- company ownership;
- production volumes;
- city growth/decline;
- infrastructure;
- migration;
- national prosperity;
- currency state;
- political/world events.

## Data refresh

A newer baseline may use newer geography/economy seed data, but it must not silently rewrite an older world's historical state.

## Canonical rule

**Real geography seeds the world; simulation owns its future.**