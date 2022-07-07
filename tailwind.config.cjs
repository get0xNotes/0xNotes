/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f2333',
        primarylight: '#384b5d',
        primarydark: '#00000c',
        accent: '#8075ff',
      },
    },
  },
  plugins: [],
}
