/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4500',
        secondary: '#DC143C',
        dark: '#0a0a0a',
      },
    },
  },
  plugins: [],
}
