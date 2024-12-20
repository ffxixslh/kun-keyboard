/** @type {import('tailwindcss').Config} */
export default {
  content: ['/index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'grlxs': "url('/src/assets/images/bg.jpg')",
        'chick': "url('/src/assets/images/chick.png')",
      }
    },
  },
  plugins: [],
}
