/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          blue: '#2563EB',
          purple: '#7C3AED',
          teal: '#0F766E',
          amber: '#B45309',
          pink: '#BE185D',
          green: '#15803D',
          red: '#B91C1C',
          offwhite: '#F8FAFC',
          white: '#FFFFFF',
          slate: '#475569',
        },
        dept: {
          computer: '#2563EB',
          mechanical: '#7C3AED',
          civil: '#0F766E',
          electrical: '#D97706',
          commerce: '#BE185D',
          management: '#475569',
        },
        status: {
          yes: '#15803D',
          partly: '#B45309',
          no: '#B91C1C',
          unknown: '#64748B',
        }
      },
    },
  },
  plugins: [],
}
