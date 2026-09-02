/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#fdf8f0',
          100: '#f5edd6',
          200: '#ebd9ab',
          300: '#dfc078',
          400: '#d5a84f',
          500: '#c99535',
          600: '#b17a2a',
          700: '#8f5d24',
          800: '#754c23',
          900: '#624020',
        },
        leaf: {
          50: '#f0fdf0',
          100: '#dcfcdc',
          200: '#bbf7bb',
          300: '#86ef86',
          400: '#4ade4a',
          500: '#22c522',
          600: '#16a316',
          700: '#0f7f0f',
          800: '#116411',
          900: '#105310',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
