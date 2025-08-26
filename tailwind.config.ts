import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#CA2227',
          50:'#fff0f1',100:'#ffe1e2',200:'#ffc6c8',300:'#ff9fa2',
          400:'#ff6d71',500:'#e63b40',600:'#d1272c',700:'#B01E23',
          800:'#8c171b',900:'#5e0f12',
        },
      },
      boxShadow: {
        brand: '0 10px 35px rgba(202,34,39,0.45)',
        soft:  '0 8px 30px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}

export default config
