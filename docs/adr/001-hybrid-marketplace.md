# ADR 001: Hybrid Marketplace

## Status

Accepted

## Context

AutoHub needs classifieds for Iraq launch, but must support payments, escrow, commissions, subscriptions, and auctions later.

## Decision

Ship v1 as classifieds. Model commerce as separate aggregates (`Order`, `Escrow`, `Auction`, `Subscription`) linked to `Listing`, not as a rewrite of listings.

## Consequences

Slightly larger initial schema; no painful migrations when monetization launches.
