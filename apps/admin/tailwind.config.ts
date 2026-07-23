import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#121212',
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#c4c4c4',
          300: '#9a9a9a',
          400: '#6b6b6b',
          500: '#4a4a4a',
          600: '#333333',
          700: '#242424',
          800: '#1a1a1a',
          900: '#121212',
        },
        signal: {
          DEFAULT: '#C8102E',
          hover: '#a50d26',
          muted: '#fce8eb',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(18, 18, 18, 0.08), 0 4px 12px rgba(18, 18, 18, 0.04)',
        lift: '0 8px 24px rgba(18, 18, 18, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
