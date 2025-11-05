/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dnd-brown': '#6B4423',
        'dnd-tan': '#F4E5C2',
        'dnd-gold': '#D4AF37',
        'dnd-dark': '#1a1a1a',
        'dnd-light': '#f5f5f5',
        'ecoar': {
          'dark': '#505050',
          'magenta': '#b663a9',
          'teal': '#7bb7bb',
          'light': '#f5f5f5',
        },
      },
      fontFamily: {
        'dnd': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
