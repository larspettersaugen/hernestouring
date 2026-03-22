import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        stage: {
          page: 'rgb(var(--stage-page) / <alpha-value>)',
          surface: 'rgb(var(--stage-surface) / <alpha-value>)',
          card: 'rgb(var(--stage-card) / <alpha-value>)',
          border: 'rgb(var(--stage-border) / <alpha-value>)',
          muted: 'rgb(var(--stage-muted) / <alpha-value>)',
          accent: 'rgb(var(--stage-accent) / <alpha-value>)',
          accentHover: 'rgb(var(--stage-accent-hover) / <alpha-value>)',
          fg: 'rgb(var(--stage-fg) / <alpha-value>)',
          /** Text on amber accent buttons (high contrast in both themes) */
          accentFg: 'rgb(var(--stage-accent-fg) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
export default config;
