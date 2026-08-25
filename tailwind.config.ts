import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 品牌绿，以 #2F5D3A (500) 为基准
        primary: {
          50: '#f3f7f4',
          100: '#e0ece3',
          200: '#c2d9c9',
          300: '#96bda2',
          400: '#649c76',
          500: '#2F5D3A',
          600: '#2a5234',
          700: '#23432b',
          800: '#1d3624',
          900: '#182c1e',
        },
      },
    },
  },
  plugins: [],
}

export default config
