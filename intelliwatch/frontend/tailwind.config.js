/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    { pattern: /^text-(teal|amber|coral|blue|purple|green|pink|indigo|ink-primary|ink-secondary|ink-tertiary)$/ },
    { pattern: /^bg-(teal|amber|coral|blue|purple|green|pink|indigo|surface-[0-5])(\/(5|8|10|12|15|20|25|30|35|40|50|75))?$/ },
    { pattern: /^border-(teal|amber|coral|blue|purple|green|pink|indigo)(\/(10|15|20|25|30|35|40))?$/ },
    { pattern: /^shadow-glow-(teal|amber|coral|blue|purple|green|indigo)$/ },
    { pattern: /^from-(teal|amber|coral|blue|purple|green|pink|indigo)$/ },
    { pattern: /^to-(teal|amber|coral|blue|purple|green|pink|indigo)$/ },
    'animate-pulse-dot',
    'animate-glow-pulse',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Cal Sans', 'Inter var', 'sans-serif'],
      },
      colors: {
        // ── Surface stack (deep navy-indigo, inspired by Behance references) ──
        surface: {
          0: '#060A14',   // deepest bg — true dark navy
          1: '#090E1C',   // page bg
          2: '#0D1528',   // card base (glassmorphism layer)
          3: '#121D35',   // elevated card
          4: '#192540',   // nested / input field
          5: '#1F2E4E',   // hover / selected state
        },
        // ── Borders — subtle translucent white ────────────────────────────────
        border: {
          subtle:  'rgba(148,163,184,0.07)',
          default: 'rgba(148,163,184,0.13)',
          strong:  'rgba(148,163,184,0.22)',
        },
        // ── Text — cool white ─────────────────────────────────────────────────
        ink: {
          primary:   '#E6EDFF',    // cool almost-white
          secondary: '#7E94BA',
          tertiary:  '#45607E',
          disabled:  '#283A55',
        },
        // ── Accent palette — vivid, luminous ──────────────────────────────────
        teal:   { DEFAULT: '#00DFB8', dim: 'rgba(0,223,184,0.10)',   ring: 'rgba(0,223,184,0.28)'   },
        amber:  { DEFAULT: '#FFB020', dim: 'rgba(255,176,32,0.10)',  ring: 'rgba(255,176,32,0.28)'  },
        coral:  { DEFAULT: '#FF4F6A', dim: 'rgba(255,79,106,0.10)',  ring: 'rgba(255,79,106,0.24)'  },
        blue:   { DEFAULT: '#4B9FFF', dim: 'rgba(75,159,255,0.10)',  ring: 'rgba(75,159,255,0.28)'  },
        purple: { DEFAULT: '#A466F5', dim: 'rgba(164,102,245,0.10)', ring: 'rgba(164,102,245,0.28)' },
        green:  { DEFAULT: '#2DD898', dim: 'rgba(45,216,152,0.10)',  ring: 'rgba(45,216,152,0.28)'  },
        pink:   { DEFAULT: '#F472B6', dim: 'rgba(244,114,182,0.10)' },
        indigo: { DEFAULT: '#6366F1', dim: 'rgba(99,102,241,0.10)',  ring: 'rgba(99,102,241,0.28)'  },
      },

      backgroundImage: {
        // Page background nebula
        'page-gradient': `
          radial-gradient(ellipse 80% 40% at 15% -5%, rgba(0,223,184,0.055) 0%, transparent 60%),
          radial-gradient(ellipse 60% 30% at 85% -5%, rgba(75,159,255,0.055) 0%, transparent 60%),
          radial-gradient(ellipse 40% 20% at 50% 100%, rgba(164,102,245,0.04) 0%, transparent 60%)
        `,
        // Card glass surface
        'glass-card': 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.01) 100%)',
        // Accent gradient bars
        'grad-teal':   'linear-gradient(90deg, #00DFB8 0%, rgba(0,223,184,0) 100%)',
        'grad-blue':   'linear-gradient(90deg, #4B9FFF 0%, rgba(75,159,255,0) 100%)',
        'grad-amber':  'linear-gradient(90deg, #FFB020 0%, rgba(255,176,32,0) 100%)',
        'grad-coral':  'linear-gradient(90deg, #FF4F6A 0%, rgba(255,79,106,0) 100%)',
        'grad-purple': 'linear-gradient(90deg, #A466F5 0%, rgba(164,102,245,0) 100%)',
        'grad-green':  'linear-gradient(90deg, #2DD898 0%, rgba(45,216,152,0) 100%)',
        // Chart gradient fills
        'chart-teal':   'linear-gradient(180deg, rgba(0,223,184,0.22) 0%, rgba(0,223,184,0) 100%)',
        'chart-blue':   'linear-gradient(180deg, rgba(75,159,255,0.22) 0%, rgba(75,159,255,0) 100%)',
        'chart-amber':  'linear-gradient(180deg, rgba(255,176,32,0.22) 0%, rgba(255,176,32,0) 100%)',
        'chart-coral':  'linear-gradient(180deg, rgba(255,79,106,0.22) 0%, rgba(255,79,106,0) 100%)',
        'chart-purple': 'linear-gradient(180deg, rgba(164,102,245,0.22) 0%, rgba(164,102,245,0) 100%)',
        'dot-grid': `radial-gradient(circle, rgba(148,163,184,0.10) 1px, transparent 1px)`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },

      boxShadow: {
        'card':       '0 1px 2px rgba(0,0,0,0.5), 0 8px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-lg':    '0 4px 16px rgba(0,0,0,0.55), 0 24px 64px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.09)',
        'glow-teal':   '0 0 24px rgba(0,223,184,0.22),  0 0 64px rgba(0,223,184,0.08)',
        'glow-amber':  '0 0 24px rgba(255,176,32,0.22),  0 0 64px rgba(255,176,32,0.08)',
        'glow-coral':  '0 0 24px rgba(255,79,106,0.22),  0 0 64px rgba(255,79,106,0.08)',
        'glow-blue':   '0 0 24px rgba(75,159,255,0.22),  0 0 64px rgba(75,159,255,0.08)',
        'glow-purple': '0 0 24px rgba(164,102,245,0.22), 0 0 64px rgba(164,102,245,0.08)',
        'glow-green':  '0 0 24px rgba(45,216,152,0.22),  0 0 64px rgba(45,216,152,0.08)',
        'glow-indigo': '0 0 24px rgba(99,102,241,0.22),  0 0 64px rgba(99,102,241,0.08)',
        'inner-top':   'inset 0 1px 0 rgba(255,255,255,0.08)',
        'inner-border':'inset 0 0 0 1px rgba(255,255,255,0.06)',
      },

      borderRadius: {
        xl2: '16px',
        xl3: '20px',
        xl4: '24px',
      },

      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
      },

      animation: {
        'pulse-dot':   'pulse-dot 1.8s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 2.4s ease-in-out infinite',
        'slide-in':    'slide-in 0.25s cubic-bezier(0.16,1,0.3,1)',
        'fade-up':     'fade-up 0.28s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':     'shimmer 2.2s linear infinite',
        'spin-slow':   'spin 8s linear infinite',
        'float':       'float 4s ease-in-out infinite',
      },

      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%':      { opacity: 0.3, transform: 'scale(0.85)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,223,184,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(0,223,184,0.6)' },
        },
        'slide-in': {
          '0%':   { opacity: 0, transform: 'translateX(-10px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%':   { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
