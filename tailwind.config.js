/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.8125rem',
        'base': '0.875rem',
        'lg': '1rem',
        'xl': '1.125rem',
        '2xl': '1.375rem',
        '3xl': '1.75rem',
        '4xl': '2.125rem',
        '5xl': '2.75rem',
        '6xl': '3.5rem',
        '7xl': '4.375rem',
      },
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      },
    },
  },
  plugins: [],
}