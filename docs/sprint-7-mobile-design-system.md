# Sprint 7 — Mobile Design System

Status: **approved**

Roadmap note: **Dealer Platform is deferred.** This sprint replaces it.

## Goal

Reusable React Native + Expo design system for AutoHub mobile. No API connections.

## Package

`packages/mobile-ui` → `@autohub/mobile-ui`

## Delivered

### Tokens

- Colors (light / dark) — charcoal neutrals + signal red `#E31937`
- Spacing scale + radii + responsive breakpoints / gutters
- Typography variants + Outfit / IBM Plex Sans Arabic font roles

### Components

Buttons · Cards · Inputs · Typography · Icons · Badges · Chips · Bottom Navigation · App Bar · Loading · Skeletons · Dialogs · Bottom Sheets · Empty States · Error States · Screen (responsive layout)

### Cross-cutting

- Light / dark theme (`ThemeProvider`, system follow)
- RTL via locale (`ar`, `ku`) + LTR (`en`)
- Message catalog for UI chrome strings
- Storybook-ready CSF stories under `packages/mobile-ui/src/stories/`
- On-device gallery: `DesignSystemGallery` (wired to mobile Home)

### App wiring

`apps/mobile` depends on `@autohub/mobile-ui`, wraps root with `ThemeProvider`, loads brand fonts, shows the design-system gallery. Tabs remain a shell — **no backend calls**.

## Docs

- This file
- [`docs/mobile-design-system.md`](./mobile-design-system.md)
- Package README: `packages/mobile-ui/README.md`

## Out of scope

- API / auth / listings clients
- Dealer Platform
- Full Storybook CI host (stories are CSF-ready for when Storybook is added)
