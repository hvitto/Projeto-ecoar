/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ecoar': {
          // Cores principais
          'dark': '#505050',
          'magenta': '#b663a9',
          'teal': '#7bb7bb',
          'light': '#f5f5f5',
          
          // Variações mais escuras (para melhor contraste)
          'dark-900': '#2a2a2a',
          'dark-800': '#3a3a3a',
          'dark-700': '#404040',
          'dark-600': '#505050',
          
          // Variações mais claras (para backgrounds sutis)
          'dark-500': '#606060',
          'dark-400': '#707070',
          'dark-300': '#808080',
          
          // Magenta variations
          'magenta-900': '#7a3d6f',
          'magenta-800': '#8a4d7f',
          'magenta-700': '#9a5d8f',
          'magenta-600': '#b663a9',
          'magenta-500': '#c673b9',
          'magenta-400': '#d683c9',
          'magenta-300': '#e693d9',
          'magenta-200': '#f6a3e9',
          'magenta-100': '#fff3fc',
          'magenta-50': '#fffafd',
          
          // Teal variations
          'teal-900': '#4b7b7f',
          'teal-800': '#5b8b8f',
          'teal-700': '#6b9b9f',
          'teal-600': '#7bb7bb',
          'teal-500': '#8bc7cb',
          'teal-400': '#9bd7db',
          'teal-300': '#abe7eb',
          'teal-200': '#bbf7fb',
          'teal-100': '#e6f7f9',
          'teal-50': '#f0fafb',
          
          // Light variations
          'light-900': '#f5f5f5',
          'light-800': '#fafafa',
          'light-700': '#ffffff',
          
          // Cores complementares sutis (baseadas na paleta)
          'slate': {
            '50': '#f8f9fa',
            '100': '#e9ecef',
            '200': '#dee2e6',
            '300': '#ced4da',
            '400': '#adb5bd',
            '500': '#6c757d',
            '600': '#495057',
            '700': '#343a40',
            '800': '#212529',
            '900': '#1a1d21',
          },
          
          // Cores de acento complementares
          'amber': {
            '50': '#fff8e1',
            '100': '#ffecb3',
            '200': '#ffe082',
            '300': '#ffd54f',
            '400': '#ffca28',
            '500': '#ffc107',
            '600': '#ffb300',
            '700': '#ffa000',
            '800': '#ff8f00',
            '900': '#ff6f00',
          },
          
          // Cores de sucesso/info
          'indigo': {
            '50': '#e8eaf6',
            '100': '#c5cae9',
            '200': '#9fa8da',
            '300': '#7986cb',
            '400': '#5c6bc0',
            '500': '#3f51b5',
            '600': '#3949ab',
            '700': '#303f9f',
            '800': '#283593',
            '900': '#1a237e',
          },
        },
      },
      fontFamily: {
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        'ecoar': ['var(--font-body)', 'system-ui', 'sans-serif'],
        'ecoar-display': ['var(--font-display)', 'Georgia', 'serif'],
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        smooth: '400ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        'out': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 10s ease-in-out 1s infinite',
      },
    },
  },
  plugins: [],
}
