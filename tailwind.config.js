/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark UI palette
        bg:      '#0D0F14',          // deepest background
        surface: '#141720',          // card/panel background
        surfaceHover: '#1A1E2A',
        border:  '#232838',          // subtle borders
        border2: '#2D3347',          // stronger border
        // Text
        text:    '#F0F2F8',
        textSub: '#8B92A8',
        textMuted: '#525972',
        // Accent — electric blue
        accent:  { DEFAULT: '#4F7EF7', hover: '#3D6DE6', light: '#1A2540' },
        // Status
        green:  { DEFAULT: '#34C97B', bg: '#0D2A1C' },
        yellow: { DEFAULT: '#F5A623', bg: '#291E08' },
        red:    { DEFAULT: '#F5544A', bg: '#2A0F0D' },
        purple: { DEFAULT: '#A78BFA', bg: '#1E1630' },
      },
      borderRadius: {
        card: '14px',
        btn:  '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 20px rgba(79,126,247,0.2)',
      },
      animation: {
        'fade-up': 'fadeUp 0.25s ease forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
      }
    },
  },
  plugins: [],
}
