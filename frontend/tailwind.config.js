
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0d14',
          surface: '#111726',
          card: '#161f33',
          border: '#1f2b47',
          hover: '#1a243b',
        },
        brand: {
          violet: '#7c3aed',
          cyan: '#0891b2',
          accent: '#6366f1',
          success: '#059669',
          warning: '#d97706',
          danger: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 23, 42, 0.05)',
        card: '0 2px 8px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
