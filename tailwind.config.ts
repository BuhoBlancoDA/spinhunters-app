// tailwind.config.ts
import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#CA2227',
          600: '#CA2227',
          700: '#b01e22',
          800: '#90191c'
        },
      },
      boxShadow: {
        brand: '0 8px 30px rgba(202,34,39,0.35)',
        soft: '0 10px 40px rgba(0,0,0,0.35)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
}
export default config
