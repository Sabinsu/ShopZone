/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#f97316', light: '#fed7aa', dark: '#ea580c' },
      },
    },
  },
  plugins: [],
}
