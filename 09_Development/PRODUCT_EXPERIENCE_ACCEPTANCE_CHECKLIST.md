# Product Experience Acceptance Checklist

Use this checklist for player-visible management UI work introduced after the Product Experience Foundation.

## Functional

- Existing authoritative game logic remains unchanged unless the implementation scope explicitly changes it.
- Save compatibility is preserved where relevant.
- Primary actions remain reachable and deterministic.
- Empty states remain understandable.

## Mobile

- No clipped titles.
- No summary text outside the viewport.
- Portrait layout reflows instead of compressing dense rows.
- Landscape layout uses available width without creating oversized empty panels.
- Touch targets remain comfortable.

## Visual

- The screen has a clear visual hierarchy.
- Cards are sized by useful content.
- Repeated concepts use consistent patterns.
- People are visually recognizable when identity matters and assets exist.
- The interface looks like a game management surface rather than a debug screen.

## Human context

- Important decisions expose the relevant person, role, status, and consequences.
- The UI does not invent attributes unsupported by game state.
- Narrative or emotional feedback is tied to actual events.

## Owner review

- Deployed navigation path is documented.
- What changed is stated explicitly.
- Portrait and landscape checks are requested when relevant.
- Functional PASS/HOLD is recorded separately from Visual PASS/HOLD.