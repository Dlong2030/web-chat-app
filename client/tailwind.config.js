/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand colors (Purple - #B7B1F2)
        brand: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4dcff',
          300: '#d1c4ff',
          400: '#b7b1f2', // Main brand color
          500: '#9b8fed',
          600: '#7c6ce8',
          700: '#5d4de0',
          800: '#4a3bb8',
          900: '#3d3194',
        },

        // Secondary/accent colors (Pink - #FDB7EA)
        accent: {
          50: '#fff8f5',
          100: '#fff0eb',
          200: '#ffe0d6',
          300: '#ffcab8',
          400: '#fdb7ea', // Pink accent
          500: '#f79bd9',
          600: '#e67cc8',
          700: '#d15bb7',
          800: '#b83fa6',
          900: '#9e2895',
        },

        // Tertiary colors (Peach - #FFDCCC)
        peach: {
          50: '#fffcf5',
          100: '#fff8eb',
          200: '#fff0d6',
          300: '#ffe4b8',
          400: '#ffdccc', // Peach
          500: '#ffcc9a',
          600: '#ffb968',
          700: '#ffa336',
          800: '#ff8d04',
          900: '#d16900',
        },

        // Quaternary colors (Light Yellow - #FBF3B9)
        sunshine: {
          50: '#fefef9',
          100: '#fdfdf3',
          200: '#fcfce6',
          300: '#fafad9',
          400: '#fbf3b9', // Light yellow
          500: '#f9eb8c',
          600: '#f7e35f',
          700: '#f5db32',
          800: '#f3d305',
          900: '#c6af04',
        },
      },

      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #b7b1f2 0%, #fdb7ea 50%, #ffdccc 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #ffdccc 0%, #fdb7ea 50%, #b7b1f2 100%)',
        'gradient-soft': 'linear-gradient(135deg, #f8f7ff 0%, #fff8f5 50%, #fffcf5 100%)',
        'gradient-button': 'linear-gradient(90deg, #b7b1f2 0%, #fdb7ea 100%)',
        'gradient-button-hover': 'linear-gradient(90deg, #9b8fed 0%, #f79bd9 100%)',
      },

      boxShadow: {
        'brand': '0 4px 14px 0 rgba(183, 177, 242, 0.25)',
        'brand-lg': '0 10px 25px 0 rgba(183, 177, 242, 0.3)',
        'accent': '0 4px 14px 0 rgba(253, 183, 234, 0.25)',
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
