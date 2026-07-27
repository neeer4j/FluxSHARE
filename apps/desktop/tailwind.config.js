/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Arc / Linear inspired sleek dark palette
        flux: {
          bg: '#0B0D11',
          surface: '#12161E',
          card: '#181E29',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.05)',
          accent: '#00D1FF',
          accentHover: '#33DBFF',
          accentGlow: 'rgba(0, 209, 255, 0.25)',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        glow: '0 0 24px -4px rgba(0, 209, 255, 0.4)'
      },
      backdropBlur: {
        glass: '16px'
      }
    }
  },
  plugins: []
};
