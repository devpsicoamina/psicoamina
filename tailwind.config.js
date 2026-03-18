/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FAF1FF',
          100: '#EEDEF8',
          200: '#DFC4F0',
          300: '#C49EE2',
          400: '#A76FCC',
          500: '#8B45B5',
          600: '#762E9F',
          700: '#5B2380',
          800: '#4A1D68',
          900: '#3A1752',
        },
        secondary: '#947DA9',
        accent: {
          gold: '#F6AE3F',
          teal: '#249689',
          warning: '#F9CF58',
          error: '#FF5963',
        },
        bg: {
          main: '#F1F4F8',
          sidebar: '#FFFFFF',
          chat: '#EEDEF8',
          card: '#FFFFFF',
          alternate: '#FAF1FF',
        },
        text: {
          primary: '#15161E',
          secondary: '#606A85',
        }
      },
      boxShadow: {
        'card': '0 4px 24px rgba(118, 46, 159, 0.08)',
        'card-hover': '0 8px 32px rgba(118, 46, 159, 0.12)',
        'button': '0 4px 12px rgba(118, 46, 159, 0.25)',
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
