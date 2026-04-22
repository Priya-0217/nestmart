import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        primary:    'rgb(var(--color-primary)    / <alpha-value>)',
        secondary:  'rgb(var(--color-secondary)  / <alpha-value>)',
        muted:      'rgb(var(--color-muted)      / <alpha-value>)',
        card:       'rgb(var(--color-card)       / <alpha-value>)',
        border:     'rgb(var(--color-border)     / <alpha-value>)',
        trust:  '#1A56DB',
        accent: '#F59E0B',
        bgSoft: '#F8FAFC'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif']
      },
      boxShadow: {
        glow: '0 18px 35px -18px rgba(15, 122, 95, 0.45)',
        card: '0 14px 30px -20px rgba(22, 31, 29, 0.35)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 8% 0%, rgba(15,122,95,.25), transparent 42%), radial-gradient(circle at 90% 12%, rgba(244,185,66,.24), transparent 37%), linear-gradient(142deg, #f6f4ee 0%, #f0ebe0 100%)',
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23161f1d' fill-opacity='.05'%3E%3Cpath d='M36 12h4v4h-4zm40 8h4v4h-4zm24 20h4v4h-4zm72 28h4v4h-4zM16 72h4v4h-4zm60 32h4v4h-4zm84 16h4v4h-4zm24 56h4v4h-4zm-92 8h4v4h-4zm-56-44h4v4h-4zm12-96h4v4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
};

export default config;
