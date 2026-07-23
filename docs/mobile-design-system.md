# Mobile Design System Architecture

## Placement

| Package | Role |
| --- | --- |
| `@autohub/mobile-ui` | RN/Expo design system (tokens + components) |
| `@autohub/ui` | Web token stub (unchanged) |
| `apps/mobile` | Expo Router shell consuming the DS |

## Theme model

```
ThemeProvider
  ├─ scheme: light | dark | system
  ├─ locale: ar | ku | en  → isRTL
  ├─ colors / spacing / radii / fonts / textVariants
  └─ layout: gutter, contentMaxWidth, columns (from width)
```

`useTheme()` for styling; `useI18n()` for `t(key)` and locale switches.

Native `I18nManager.forceRTL` is toggled when locale RTL changes. Production builds may require a reload for full native layout flip; component-level `row-reverse` / `textAlign` still apply immediately.

## Fonts

| Script | Family |
| --- | --- |
| Latin | Outfit |
| Arabic / Kurdish | IBM Plex Sans Arabic |

Loaded once in `apps/mobile` via `@expo-google-fonts/*`. Components pick family from `theme.isRTL`.

## Component rules

1. No network / storage / domain imports inside `@autohub/mobile-ui`.
2. Prefer theme tokens over hard-coded colors/spacing.
3. Interactive chrome respects `isRTL` (flex direction, text align).
4. Overlays (`Dialog`, `BottomSheet`) use RN `Modal` — no navigation coupling.

## Storybook

Stories are CSF3 modules with a shared `withTheme` decorator (`scheme` + `locale` controls). Attach `@storybook/react-native` (or a web RN renderer) later without rewriting components.

## Responsive layout

`Screen` centers content up to `layout.contentMaxWidth` and applies breakpoint gutters. Tablet (≥768) uses larger gutters and a wider max width.
