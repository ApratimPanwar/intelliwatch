import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';

interface TopbarProps { onSettings: () => void; }

export function Topbar({ onSettings }: TopbarProps) {
  const { connected } = useAppStore();
  const { isDark } = useTheme();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-12 flex items-center gap-3 px-5 topbar-surface transition-theme"
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mr-1 select-none">
        {/* Hexagon icon */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <svg viewBox="0 0 28 28" className="absolute inset-0" fill="none">
            <path
              d="M14 2L25.26 8.5v13L14 28 2.74 21.5v-13L14 2z"
              fill="url(#logo-grad)"
              fillOpacity={isDark ? 0.15 : 0.12}
              stroke="url(#logo-grad)"
              strokeWidth="1.2"
            />
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00DFB8" />
                <stop offset="100%" stopColor="#4B9FFF" />
              </linearGradient>
            </defs>
          </svg>
          <span className="relative text-[10px] font-bold text-gradient-teal">IW</span>
        </div>
        <span className="font-mono font-bold tracking-[2px] text-[12px] text-gradient-teal">
          INTELLIWATCH
        </span>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="w-px h-4" style={{ background: 'var(--border-default)' }} />

      {/* ── Facility badge ────────────────────────────────────────────────── */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span
          className="text-[9px] font-semibold tracking-[0.8px] uppercase"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Unit
        </span>
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Machining Shop A · Bengaluru
        </span>
      </div>

      {/* ── LIVE badge ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{
          background: 'rgba(0,223,184,0.08)',
          border: '1px solid rgba(0,223,184,0.20)',
          boxShadow: '0 0 12px rgba(0,223,184,0.08)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot"
          style={{ boxShadow: '0 0 6px rgba(0,223,184,0.8)' }}
        />
        <span className="font-mono text-[10px] font-semibold text-teal tracking-wider">LIVE</span>
      </div>

      {/* ── Connection status ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-500"
        style={{
          background: connected ? 'rgba(45,216,152,0.08)' : 'rgba(255,79,106,0.08)',
          border: connected ? '1px solid rgba(45,216,152,0.22)' : '1px solid rgba(255,79,106,0.25)',
        }}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${!connected ? 'animate-pulse-dot' : ''}`}
          style={{
            background: connected ? '#2DD898' : '#FF4F6A',
            boxShadow: connected ? '0 0 6px rgba(45,216,152,0.7)' : '0 0 6px rgba(255,79,106,0.7)',
          }}
        />
        <span
          className="font-mono text-[10px] font-medium"
          style={{ color: connected ? '#2DD898' : '#FF4F6A' }}
        >
          {connected ? 'Connected' : 'Offline'}
        </span>
      </div>

      {/* ── Right side ────────────────────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-2.5">

        {/* Shift label */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
            Shift
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Morning 06:00–14:00
          </span>
        </div>

        {/* Clock */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span className="text-[9px] font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            IST
          </span>
          <span
            className="font-mono font-semibold text-[13px] tabular-nums"
            style={{ color: 'var(--text-primary)' }}
          >
            {clock}
          </span>
        </div>
      </div>
    </header>
  );
}
