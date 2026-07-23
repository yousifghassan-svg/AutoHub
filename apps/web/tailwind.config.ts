import type { Config } from 'tailwindcss';
import { tokens } from '@autohub/ui';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: tokens.colors.accent,
          pressed: tokens.colors.accentHover,
          soft: '#FFF1F3',
        },
        ink: {
          DEFAULT: tokens.colors.ink,
          secondary: '#5C5C6A',
        },
        surface: {
          DEFAULT: tokens.colors.surface,
          muted: tokens.colors.muted,
        },
        border: tokens.colors.border,
        background: '#F7F7F8',
        success: { DEFAULT: '#1F9D6A', soft: '#E8F7F0' },
        error: { DEFAULT: '#E31937', soft: '#FFE8EC' },
        skeleton: '#DCDCE0',
        charcoal: {
          DEFAULT: '#121212',
          300: '#9a9a9a',
          900: '#121212',
        },
        signal: {
          DEFAULT: tokens.colors.accent,
          hover: tokens.colors.accentHover,
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-ibm-plex-arabic)', 'var(--font-outfit)', 'sans-serif'],
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
