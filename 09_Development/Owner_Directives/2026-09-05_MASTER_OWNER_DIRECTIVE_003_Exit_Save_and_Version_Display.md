# MASTER OWNER DIRECTIVE
## Exit Save and Canonical Version Display

**Document ID:** MOD-003

**Project:** DROPi Tycoon

**Date:** 2026-09-05

**Status:** Owner Approved

---

# 1. Canonical visible version

The player-facing version shown by DROPi Tycoon must represent the canonical controlled release version and must not drift because of stale deployment environment variables.

The first controlled release line is `0.0.0`.

The authoritative web-runtime visible version must be sourced from the committed project package version used for that runtime build.

---

# 2. Exit Game

The Main Menu must include an explicit `Exit Game` action.

When selected in the installed Android application:

1. if an active game session exists, save the current session through the canonical save system;
2. only after a successful save, request the native shell to close the application;
3. if save fails, do not exit and show a player-facing error;
4. if no active session exists, exit without creating artificial game progress;
5. in non-native browser environments, do not pretend the browser can be programmatically closed; preserve data and tell the player it is safe to close the page.

This behavior must not bypass or duplicate the canonical save serializer/storage contract.
