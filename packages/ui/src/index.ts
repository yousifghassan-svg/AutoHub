/** Shared design tokens for web/admin (no React components in Sprint 1). */

export const tokens = {
  colors: {
    charcoal: '#1A1A1A',
    ink: '#111111',
    surface: '#FFFFFF',
    muted: '#F3F4F6',
    border: '#E5E7EB',
    accent: '#C8102E',
    accentHover: '#A50D25',
  },
  radii: {
    sm: '6px',
    md: '10px',
  },
  fonts: {
    arabic: 'IBM Plex Sans Arabic',
    latin: 'Outfit',
  },
} as const;

export type DesignTokens = typeof tokens;
