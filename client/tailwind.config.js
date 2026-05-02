/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#D4AF37', light: '#F0D060', dark: '#A8861A' },
        'dark-2': '#111118',
        'dark-3': '#1A1A24',
        'dark-4': '#22222E',
        'dark-5': '#2C2C3A',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
