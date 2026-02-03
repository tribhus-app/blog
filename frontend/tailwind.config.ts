import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores Tribhus (baseado em tribhus_web)
        primary: {
          DEFAULT: '#914100',
          hover: '#e55a00',
          light: '#FF8C00',
          lighter: '#FFB84D',
        },
        dark: {
          DEFAULT: '#151922',
          card: '#1E2233',
          input: '#0f1419',
          header: '#1a1a1a',
        },
        border: {
          DEFAULT: '#333333',
          light: '#444444',
        },
        text: {
          DEFAULT: '#FFFFFF',
          secondary: '#CCCCCC',
          muted: '#9CA3AF', // Melhorado para contraste WCAG AA (era #888888)
        },
        accent: {
          green: '#4CAF50',
          blue: '#2196F3',
          yellow: '#FFC107',
          purple: '#9C27B0',
          red: '#e74c3c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
