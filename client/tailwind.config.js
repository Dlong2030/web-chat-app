/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand colors (Dreamy Lavender - #C8B5FF)
        brand: {
          50: '#fcfaff',
          100: '#f7f2ff',
          200: '#efe5ff',
          300: '#e3d1ff',
          400: '#c8b5ff', // Main brand color - dreamy lavender
          500: '#b399ff',
          600: '#9d7dff',
          700: '#8661ff',
          800: '#6f45e6',
          900: '#5829cc',
        },

        // Secondary/accent colors (Cotton Candy Pink - #FFB3E6)
        accent: {
          50: '#fffafc',
          100: '#fff4f9',
          200: '#ffe9f3',
          300: '#ffd9ea',
          400: '#ffb3e6', // Cotton candy pink - sweet and soft
          500: '#ff8dd9',
          600: '#ff66cc',
          700: '#ff3fbf',
          800: '#e61aa6',
          900: '#cc0088',
        },

        // Tertiary colors (Coral Dream - #FFB8A3)
        coral: {
          50: '#fff9f7',
          100: '#fff2ee',
          200: '#ffe5dc',
          300: '#ffd2c1',
          400: '#ffb8a3', // Coral dream - warm and friendly
          500: '#ff9d85',
          600: '#ff8267',
          700: '#ff6749',
          800: '#e6442a',
          900: '#cc2200',
        },

        // Quaternary colors (Sunshine Glow - #FFE066)
        sunshine: {
          50: '#fffef5',
          100: '#fffceb',
          200: '#fff9d6',
          300: '#fff4b8',
          400: '#ffe066', // Sunshine glow - bright and cheerful
          500: '#ffd633',
          600: '#ffcc00',
          700: '#e6b800',
          800: '#cc9900',
          900: '#b38600',
        },

        // New: Sky Blue for trust and calm
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8', // Sky blue - trustworthy
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },

        // Warm neutrals with personality
        warm: {
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#f8f8f8',
          300: '#f0f0f0',
          400: '#e8e8e8',
          500: '#d0d0d0',
          600: '#a8a8a8',
          700: '#808080',
          800: '#606060',
          900: '#404040',
        },
      },

      backgroundImage: {
        // Main gradients - vibrant and youthful
        'gradient-brand': 'linear-gradient(135deg, #c8b5ff 0%, #ffb3e6 50%, #ffb8a3 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #ffb8a3 0%, #ffb3e6 50%, #c8b5ff 100%)',
        'gradient-soft': 'linear-gradient(135deg, #fcfaff 0%, #fffafc 50%, #fff9f7 100%)',

        // Button gradients - eye-catching
        'gradient-button': 'linear-gradient(90deg, #c8b5ff 0%, #ffb3e6 100%)',
        'gradient-button-hover': 'linear-gradient(90deg, #b399ff 0%, #ff8dd9 100%)',
        'gradient-cta': 'linear-gradient(135deg, #ffe066 0%, #ffb8a3 100%)',

        // Chat bubble gradients - personality-driven
        'gradient-chat-user': 'linear-gradient(135deg, #c8b5ff 0%, #38bdf8 100%)',
        'gradient-chat-friend': 'linear-gradient(135deg, #ffe066 0%, #ffb8a3 100%)',
        'gradient-chat-group': 'linear-gradient(135deg, #ffb3e6 0%, #c8b5ff 100%)',

        // Special effects - magical touches
        'gradient-rainbow': 'linear-gradient(90deg, #c8b5ff 0%, #ffb3e6 20%, #ffb8a3 40%, #ffe066 60%, #38bdf8 80%, #c8b5ff 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
        'gradient-bubble': 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 60%)',
      },

      boxShadow: {
        // Dreamy, soft shadows
        'brand': '0 8px 32px 0 rgba(200, 181, 255, 0.25)',
        'brand-lg': '0 16px 48px 0 rgba(200, 181, 255, 0.3)',
        'accent': '0 8px 32px 0 rgba(255, 179, 230, 0.25)',
        'coral': '0 8px 32px 0 rgba(255, 184, 163, 0.25)',
        'sunshine': '0 8px 32px 0 rgba(255, 224, 102, 0.25)',
        'sky': '0 8px 32px 0 rgba(56, 189, 248, 0.25)',

        // Chat-specific shadows
        'chat-bubble': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'chat-bubble-hover': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
        'floating': '0 12px 40px 0 rgba(200, 181, 255, 0.2)',
        'glow': '0 0 20px 0 rgba(200, 181, 255, 0.4)',

        // Utility shadows
        'soft': '0 2px 12px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
      },

      animation: {
        // Basic animations
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-out': 'fadeOut 0.4s ease-in',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',

        // Chat-specific animations
        'message-pop': 'messagePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'typing-dots': 'typingDots 1.4s infinite ease-in-out',
        'message-read': 'messageRead 0.5s ease-out',

        // Playful animations
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'bounce-once': 'bounceOnce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',

        // Attention-grabbing
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },

      keyframes: {
        // Basic keyframes
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },

        // Chat-specific keyframes
        messagePop: {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '50%': { transform: 'scale(1.05) translateY(-5px)', opacity: '0.8' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        typingDots: {
          '0%, 60%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '30%': { opacity: '1', transform: 'scale(1)' },
        },
        messageRead: {
          '0%': { opacity: '0.5', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },

        // Playful keyframes
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        bounceOnce: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.15)' },
          '50%': { transform: 'scale(0.95)' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(2deg)' },
          '75%': { transform: 'rotate(-2deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },

        // Attention-grabbing keyframes
        pulseSoft: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(200, 181, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(200, 181, 255, 0.6)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
