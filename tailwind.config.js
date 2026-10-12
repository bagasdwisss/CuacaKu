import scrollbarPlugin from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

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
        'toast-in': 'toast-in 0.5s ease-out forwards',
        'loading-bar': 'loading-bar 1.2s ease-in-out infinite',
      },

      keyframes: {
        'slide-across': {
          from: { left: '-50%' },
          to: { left: '100%' },
        },

        'toast-in': {
          from: {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },

        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
    },
  },

  plugins: [
    scrollbarPlugin,
  ],
};