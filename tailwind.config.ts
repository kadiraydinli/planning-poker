import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F8F7FF',
          dark: '#0F172A'
        },
        foreground: {
          light: '#1E293B',
          dark: '#E2E8F0'
        }
      }
    },
  },
  plugins: [],
}
export default config 