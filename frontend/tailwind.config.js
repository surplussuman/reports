/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#0f0a2a',
          hover: '#1a1340',
          active: '#6c3fff',
        },
        brand: {
          purple: '#7c3aed',
          violet: '#8b5cf6',
          indigo: '#6366f1',
          light: '#ede9fe',
        },
        card: {
          bg: '#ffffff',
          border: '#e5e7eb',
        },
        status: {
          green: '#10b981',
          orange: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
