/** @type {import('next').NextConfig} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── DARK (default) ──────────────────────────────
        // Real blacks — Instagram/YouTube palette, zero blues
        bg:           'var(--bg)',
        surface:      'var(--surface)',
        surfaceHover: 'var(--surface-hover)',
        border:       'var(--border)',
        border2:      'var(--border2)',
        text:         'var(--text)',
        textSub:      'var(--text-sub)',
        textMuted:    'var(--text-muted)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          light:   'var(--accent-light)',
        },
        green:  { DEFAULT: '#4ADE80', bg: '#0A1F12' },
        yellow: { DEFAULT: '#FACC15', bg: '#1C1700' },
        red:    { DEFAULT: '#F87171', bg: '#200A0A' },
        purple: { DEFAULT: '#C084FC', bg: '#180D24' },
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(255,255,255,0.06)',
        notion: '0 2px 8px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-up':  'fadeUp 0.22s ease forwards',
        'fade-in':  'fadeIn 0.15s ease forwards',
      },
      keyframes: {
        fadeUp:  { from: { opacity:'0', transform:'translateY(5px)' }, to: { opacity:'1', transform:'none' } },
        fadeIn:  { from: { opacity:'0' },                              to: { opacity:'1' } },
      }
    },
  },
  plugins: [],
}
