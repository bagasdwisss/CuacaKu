/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        // Animasi untuk pergerakan awan
        'slide-across-slow': 'slide-across 75s linear infinite',
        'slide-across-medium': 'slide-across 50s linear infinite',
        'slide-across-fast': 'slide-across 35s linear infinite',
        // Animasi untuk notifikasi pop-up (toast)
        'toast-in': 'toast-in 0.5s ease-out forwards',
      },
      keyframes: {
        // Logika pergerakan awan
        'slide-across': {
          'from': { left: '-50%' },
          'to': { left: '100%' },
        },
        // Logika kemunculan pop-up
        'toast-in': {
          'from': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
