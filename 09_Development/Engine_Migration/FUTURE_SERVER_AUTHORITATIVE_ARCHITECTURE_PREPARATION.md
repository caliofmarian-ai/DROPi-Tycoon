# Document Information

Document: FUTURE_SERVER_AUTHORITATIVE_ARCHITECTURE_PREPARATION.md
Project: DROPi Tycoon
Version: 0.1.0
Status: Non-Canonical Preparation Note
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-15

---

# Non-Canonical Notice

This document is a future architecture-preparation note only.

It is not an active implementation.

It does not activate a backend, marketplace, PostgreSQL database, payments flow, or wallet system in the current milestone.

---

# Purpose

Prepare a future server-authoritative direction for:

- player accounts;
- PostgreSQL;
- Money wallet;
- DROPiCoins wallet;
- immutable wallet ledger;
- inventory;
- item ownership;
- marketplace listings;
- player-to-player trades;
- escrow;
- transactions;
- Google Play purchase receipts;
- entitlements;
- audit logs.

---

# Canonical Currency Terms

- Money = standard canonical in-game currency
- DROPiCoins = approved premium currency

DROPiCoins purchasing is planned for a future Android flow using Google Play Billing.

No Money wallet backend is active yet.

No DROPiCoins wallet backend is active yet.

No premium purchasing is active yet.

---

# Future High-Level Model

## 1. Identity

Each player should have a server-authoritative account record with:

- internal player ID;
- platform identity links;
- device/session metadata;
- account status and audit fields.

## 2. PostgreSQL

PostgreSQL should become the primary system of record for:

- player accounts;
- wallets;
- inventory;
- item ownership;
- listings;
- trades;
- receipts;
- entitlements;
- audit logs.

## 3. Wallets

Money and DROPiCoins should be represented as separate wallets.

Wallet balances should be derived from an immutable ledger, not treated as editable free-form numbers.

## 4. Immutable Ledger

Every balance-affecting event should write an append-only ledger entry with:

- entry ID;
- player ID;
- currency type;
- signed delta;
- source event type;
- source entity reference;
- timestamp;
- operator/system actor;
- integrity/audit metadata.

## 5. Inventory and Ownership

Player inventory and item ownership should be server-authoritative.

Ownership records should support:

- acquisition source;
- current owner;
- transfer history;
- lifecycle state.

## 6. Marketplace and Trades

Future marketplace features should be backed by:

- listing records;
- reservation/escrow state;
- trade execution records;
- cancellation and dispute audit trail.

Player-to-player trades should not directly mutate balances or ownership without validated server-side transaction handling.

## 7. Receipts and Entitlements

Google Play purchase receipts should be verified server-side.

Entitlements should be granted only after verified receipt processing.

## 8. Audit Logs

Security-sensitive actions should write durable audit logs for:

- wallet changes;
- ownership transfers;
- listing changes;
- escrow releases;
- receipt verification;
- entitlement grants or revocations;
- administrative interventions.

---

# Secret and Frontend Rules

Real-money secrets, Google Play verification secrets, and Android signing material must never be stored:

- in the frontend bundle;
- in public `VITE_*` variables;
- in client-side local configuration checked into Git.

Future secrets must live only in secure secret managers such as Railway encrypted variables or GitHub encrypted secrets where appropriate.

---

# Current Milestone Boundary

The current web runtime milestone includes none of the following:

- PostgreSQL;
- backend services;
- server-authoritative accounts;
- wallet balances;
- ledger writes;
- marketplace listings;
- trades;
- escrow;
- transactions;
- receipt validation;
- Google Play Billing implementation.
