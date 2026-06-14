/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#06080f',
          surface: '#0c1020',
          card: '#111628',
          border: '#1a2340',
          accent: '#3b82f6',
          green: '#00ff88',
          purple: '#a855f7',
          cyan: '#00e5ff',
          orange: '#ff9100',
          red: '#ff3d71',
          pink: '#f472b6',
          text: '#e2e8f0',
          muted: '#7a8baa',
          dim: '#3a4565',
          neonblue: '#0066ff',
          neongreen: '#00ff88',
          neonpurple: '#b14dff',
          neonglow: '#00e5ff',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-strong': 'glowStrong 1.5s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'matrix-fall': 'matrixFall linear infinite',
        'particle-drift': 'particleDrift linear infinite',
        'ring-progress': 'ringProgress 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'counter-tick': 'counterTick 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 4s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'typing-dot': 'typingDot 1.4s infinite ease-in-out',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'message-in': 'messageIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'hash-scroll': 'hashScroll 3s linear infinite',
        'neural-pulse': 'neuralPulse 3s ease-in-out infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'data-stream': 'dataStream 1.5s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.2), 0 0 10px rgba(0, 229, 255, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.2)' },
        },
        glowStrong: {
          '0%': { boxShadow: '0 0 10px rgba(0, 229, 255, 0.3), 0 0 20px rgba(0, 229, 255, 0.15), inset 0 0 10px rgba(0, 229, 255, 0.1)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 229, 255, 0.5), 0 0 60px rgba(0, 229, 255, 0.25), inset 0 0 20px rgba(0, 229, 255, 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(4px) rotate(-1deg)' },
        },
        matrixFall: {
          '0%': { transform: 'translateY(-100%)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        particleDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(var(--drift-x, 100px), var(--drift-y, -200px)) scale(0)', opacity: '0' },
        },
        ringProgress: {
          '0%': { strokeDashoffset: '251.2' },
          '100%': { strokeDashoffset: 'var(--ring-offset, 0)' },
        },
        counterTick: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(59, 130, 246, 0.3)' },
          '50%': { borderColor: 'rgba(0, 229, 255, 0.6)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '5%': { opacity: '0.8' },
          '10%': { opacity: '1' },
          '15%': { opacity: '0.6' },
          '20%': { opacity: '1' },
          '50%': { opacity: '1' },
          '55%': { opacity: '0.9' },
          '60%': { opacity: '1' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.5)' },
        },
        typingDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        messageIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        hashScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        neuralPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        scanLine: {
          '0%': { top: '-5%' },
          '100%': { top: '105%' },
        },
        dataStream: {
          '0%': { opacity: '0.3', transform: 'translateX(-10px)' },
          '50%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0.3', transform: 'translateX(10px)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #0066ff, #00e5ff, #a855f7)',
        'gradient-cyber': 'linear-gradient(135deg, #0c1020, #111628, #1a0a2e)',
        'gradient-glow': 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(168, 85, 247, 0.1))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      },
      boxShadow: {
        'neon': '0 0 5px rgba(0, 229, 255, 0.3), 0 0 20px rgba(0, 229, 255, 0.15)',
        'neon-lg': '0 0 10px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.2), 0 0 80px rgba(0, 229, 255, 0.1)',
        'neon-purple': '0 0 10px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'neon-green': '0 0 10px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        'glass-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
