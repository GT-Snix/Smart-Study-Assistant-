/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:       '#0e0f14',
        surface:  '#16181f',
        surface2: '#1d2028',
        border:   '#2e3040',
        accent:   '#f5c842',
        purple:   '#8b7cf8',
        teal:     '#3dcfb4',
        danger:   '#f26b6b',
        success:  '#5dd97a',
        blue:     '#5baef5',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f5c842 0%, #e6a817 100%)',
        'surface-gradient': 'linear-gradient(135deg, #16181f 0%, #1d2028 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(245, 200, 66, 0.15)',
        'glow-lg': '0 0 40px rgba(245, 200, 66, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
};
