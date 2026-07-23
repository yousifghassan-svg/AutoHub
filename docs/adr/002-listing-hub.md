# ADR 002: Listing Hub + Category Details

## Status

Accepted

## Context

Multiple vehicle verticals (cars, plates, trucks, etc.) share search, media, messaging, and moderation.

## Decision

Use a single `Listing` table with class-table inheritance detail models per category.

## Consequences

Shared pipelines stay simple; category-specific validation lives in Nest modules.
