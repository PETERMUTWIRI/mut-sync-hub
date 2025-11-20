/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: { 
        'dark-bg': '#1E2A44', // Keep your existing color
        // Add cockpit theme colors
        cockpit: {
          bg: '#0B1120',
          panel: '#1E2A44',
          cyan: '#00D4FF',
          teal: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444'
        }
      },
      animation: { 
        'fade-in': 'fade-in 0.2s ease-out',
        // Add new animations
        'heartbeat': 'heartbeat 2s infinite',
        'glow': 'glow 2s infinite alternate'
      },
      keyframes: { 
        'fade-in': { 
          from: { opacity: '0', transform: 'translateY(-10px)' }, 
          to: { opacity: '1', transform: 'translateY(0)' } 
        },
        // Add new keyframes
        heartbeat: {
          '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        },
        glow: {
          '0%': { filter: 'brightness(1)' },
          '100%': { filter: 'brightness(1.2)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}