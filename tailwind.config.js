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
        'spin-slow': 'spin 45s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'twinkle-fast': 'twinkle 2s ease-in-out infinite',
        'twinkle-slow': 'twinkle 3.5s ease-in-out infinite',
        'lightning-flash': 'lightning 7s ease-in-out infinite',
        'mist-drift-1': 'mist-drift 24s ease-in-out infinite alternate',
        'mist-drift-2': 'mist-drift 32s ease-in-out infinite alternate-reverse',
        'shooting-star': 'shooting-star 8s ease-in-out infinite',
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

        'twinkle': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },

        'lightning': {
          '0%, 88%, 94%, 100%': { opacity: '0' },
          '89%, 91%': { opacity: '0.85' },
          '90%': { opacity: '0.2' },
          '92%, 93%': { opacity: '1' },
        },

        'mist-drift': {
          '0%': { transform: 'translateX(-15%)' },
          '100%': { transform: 'translateX(15%)' },
        },

        'shooting-star': {
          '0%': { transform: 'translateX(0) translateY(0) scale(0)', opacity: '0' },
          '10%': { transform: 'translateX(-40px) translateY(40px) scale(1)', opacity: '1' },
          '25%': { transform: 'translateX(-120px) translateY(120px) scale(0.2)', opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
    },
  },

  plugins: [
    scrollbarPlugin,
  ],
};