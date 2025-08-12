// tailwind.config.js
// This config overrides the default blue palette with a custom color for the entire app.
// You can change the hex code below to update the primary blue color everywhere.

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50:  '#0000FF',
          100: '#0000FF',
          200: '#0000FF',
          300: '#0000FF',
          400: '#0000FF',
          500: '#0000FF',
          600: '#0000FF',
          700: '#0000FF',
          800: '#0000FF',
          900: '#0000FF',
        },
        gray: {
          600: '#4B5563', // Tailwind's default gray-600
        },
        mathematics: '#38bdf8', // sky blue
        physics: '#fb923c', // orange
        chemistry: '#22c55e', // green
      },
      fontFamily: {
        raleway: 'var(--font-raleway)',
      },
    },
  },
  plugins: [],
}; 