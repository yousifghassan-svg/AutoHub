# @autohub/mobile-ui

AutoHub **Mobile Design System** (Sprint 7) — React Native + Expo reusable UI.

No API wiring. Tokens + components only.

## Install

Workspace dependency from `apps/mobile`:

```json
"@autohub/mobile-ui": "workspace:*"
```

Peer deps: `expo`, `react`, `react-native`, `react-native-safe-area-context`.  
Icons: `@expo/vector-icons` (bundled with Expo).

## Usage

```tsx
import {
  ThemeProvider,
  DesignSystemGallery,
  Button,
  Text,
} from '@autohub/mobile-ui';

export default function App() {
  return (
    <ThemeProvider initialLocale="ar" initialScheme="system">
      <DesignSystemGallery />
    </ThemeProvider>
  );
}
```

Load Outfit + IBM Plex Sans Arabic in the app shell (see `apps/mobile/app/_layout.tsx`).

## Tokens

| Area | Export |
| --- | --- |
| Colors | `palette`, `lightColors`, `darkColors` |
| Spacing / radii | `spacing`, `radii`, `breakpoints`, `getLayout` |
| Typography | `fontFamilies`, `textVariants` |
| Theme | `ThemeProvider`, `useTheme` |
| i18n | `useI18n`, `t`, locales `ar` / `ku` / `en` |

## Components

Button, Card, Input, Text, Icon, Badge, Chip, AppBar, BottomNavigation, Loading, Skeleton / SkeletonCard, Dialog, BottomSheet, EmptyState, ErrorState, Screen.

## Storybook

CSF stories live under `src/stories/*.stories.tsx`. Use `withTheme` from `src/stories/meta.ts` as a decorator. Point Storybook (or `@storybook/react-native`) at this package when you add a Storybook app shell — files are CSF3-shaped and ready.

On-device preview: `DesignSystemGallery` (Home tab in `apps/mobile`).

## Scripts

```bash
pnpm --filter @autohub/mobile-ui typecheck
```
