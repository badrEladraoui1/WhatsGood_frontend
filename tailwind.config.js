/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#001427',
          DEFAULT: '#708D81',
        },
        accent: '#F4D58D',
        danger: {
          DEFAULT: '#BF0603',
          dark: '#8D0801',
        },
      },
    },
  },
  plugins: [],
}