/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef9e7',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#face0a',
          500: '#d7a53c',
          600: '#69080b',
          700: '#520608',
          800: '#3b0506',
          900: '#2a0304',
        },
        secondary: '#8a7560',
        accent: {
          yellow: '#face0a',
          orange: '#bf782e',
          'orange-light': '#d7a53c',
          blue: '#a7d4e6',
          teal: '#249689',
          warning: '#d7a53c',
          error: '#FF5963',
        },
        bg: {
          main: '#fffdf0',
          sidebar: '#fef3c7',
          chat: '#fffef8',
          card: '#FFFFFF',
          alternate: '#fef9e7',
        },
        text: {
          primary: '#4a3520',
          secondary: '#8a7560',
        }
      },
      boxShadow: {
        'card': '0 4px 24px rgba(105, 8, 11, 0.06)',
        'card-hover': '0 8px 32px rgba(105, 8, 11, 0.10)',
        'button': '0 4px 12px rgba(105, 8, 11, 0.20)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
