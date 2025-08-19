// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'slide-across-slow': 'slide-across 75s linear infinite',
        'slide-across-medium': 'slide-across 50s linear infinite',
        'slide-across-fast': 'slide-across 35s linear infinite',
      },
      keyframes: {
        'slide-across': {
          'from': { left: '-50%' },
          'to': { left: '100%' },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}