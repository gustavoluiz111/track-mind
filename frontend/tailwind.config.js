/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                base:       'var(--bg-base)',
                surface:    'var(--bg-surface)',
                elevated:   'var(--bg-elevated)',
                card:       'var(--bg-card)',
                accent:     'var(--accent)',
                'accent-2': 'var(--accent-2)',
                success:    'var(--success)',
                warning:    'var(--warning)',
                danger:     'var(--danger)',
                info:       'var(--info)',
                primary:    'var(--text-primary)',
                muted:      'var(--text-muted)',
                subtle:     'var(--text-subtle)',
                border:     'var(--border)',
                'border-b': 'var(--border-bright)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            keyframes: {
                fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
                slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 8px var(--accent-glow)' },
                    '50%':      { boxShadow: '0 0 22px var(--accent-glow)' },
                },
                shimmer: {
                    '0%':   { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition:  '200% 0' },
                }
            },
            animation: {
                'fade-in':    'fadeIn 0.4s ease both',
                'slide-up':   'slideUp 0.4s ease both',
                'scale-in':   'scaleIn 0.3s ease both',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shimmer':    'shimmer 2.5s linear infinite',
            },
            boxShadow: {
                'glow':       '0 0 20px var(--accent-glow), 0 4px 30px rgba(0,0,0,0.4)',
                'glow-sm':    '0 0 10px var(--accent-glow)',
                'card':       '0 4px 24px rgba(0,0,0,0.35)',
                'inset-top':  'inset 0 1px 0 rgba(255,255,255,0.06)',
            },
            borderRadius: {
                'xl2': '14px',
            }
        },
    },
    plugins: [],
}
