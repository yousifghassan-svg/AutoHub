import type { Config } from 'tailwindcss';
import { tokens } from '@autohub/ui';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: tokens.colors.accent,
          pressed: tokens.colors.accentHover,
          soft: 'var(--color-primary-soft)',
        },
        ink: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
        },
        border: 'var(--color-border)',
        background: 'var(--color-background)',
        success: { DEFAULT: '#1F9D6A', soft: '#E8F7F0' },
        error: { DEFAULT: '#E31937', soft: '#FFE8EC' },
        warning: { DEFAULT: '#D97706', soft: '#FEF3C7' },
        skeleton: 'var(--color-skeleton)',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(14, 14, 17, 0.08), 0 4px 12px rgba(14, 14, 17, 0.04)',
        lift: '0 8px 24px rgba(14, 14, 17, 0.12)',
      },
      borderRadius: {
        md: tokens.radii.md,
      },
    },
  },
  plugins: [],
};

export default config;
