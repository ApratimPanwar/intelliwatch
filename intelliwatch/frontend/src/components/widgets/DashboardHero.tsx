/**
 * DashboardHero — the refined "hero" card that anchors each role dashboard.
 *
 * Layout pattern borrowed from the INTELLIWATCH design handoff (split card:
 * content on the left, a tinted illustration panel on the right), rebuilt in
 * our own theme system + colour palette + MachiningArt illustrations.
 *
 * Flexible: render live stat pills (operator / supervisor style) OR a big
 * display number with a delta pill (owner / strategic style).
 */
import type { ReactNode } from 'react';
import { Card } from './Card';

export interface HeroStat {
  label: string;
  value: string;
  /** hex colour for the leading indicator dot */
  dot: string;
}

interface DashboardHeroProps {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  /** Live stat pills — operator / supervisor style. */
  stats?: HeroStat[];
  /** Big display number — owner / strategic style. */
  bigValue?: {
    value: string;
    unit?: string;
    delta?: string;
    deltaPositive?: boolean;
    caption?: string;
  };
  /** Illustration node (e.g. <MachineArt …/>). Rendered on the tinted panel. */
  illustration: ReactNode;
  /** Accent hex — tints the illustration panel. */
  accent: string;
}

export function DashboardHero({
  eyebrow, title, sub, stats, bigValue, illustration, accent,
}: DashboardHeroProps) {
  return (
    <Card cockpit className="overflow-hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)' }}
      >
        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="p-5 flex flex-col gap-3 min-w-0">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.4px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {eyebrow}
            </p>
            <h2
              className="font-bold leading-tight mt-1"
              style={{ color: 'var(--text-primary)', fontSize: 22, letterSpacing: '-0.02em' }}
            >
              {title}
            </h2>
            {sub && (
              <p className="text-[11px] font-mono mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {sub}
              </p>
            )}
          </div>

          {/* Big display number (owner / strategic) */}
          {bigValue && (
            <div className="flex items-end gap-3 mt-auto">
              <span
                className="font-bold leading-none tabular-nums"
                style={{ color: 'var(--text-primary)', fontSize: 60, letterSpacing: '-0.04em' }}
              >
                {bigValue.value}
                {bigValue.unit && (
                  <span style={{ fontSize: 24, color: 'var(--text-tertiary)' }}>{bigValue.unit}</span>
                )}
              </span>
              <div className="flex flex-col gap-1 pb-1.5">
                {bigValue.delta && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono w-fit"
                    style={{
                      background: bigValue.deltaPositive ? 'rgba(45,216,152,0.14)' : 'rgba(255,79,106,0.14)',
                      color: bigValue.deltaPositive ? '#2DD898' : '#FF4F6A',
                    }}
                  >
                    {bigValue.delta}
                  </span>
                )}
                {bigValue.caption && (
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {bigValue.caption}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Live stat pills (operator / supervisor) */}
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {stats.map((s, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-theme"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                  <span className="font-mono font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {s.value}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>{s.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Illustration panel ───────────────────────────────────────── */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            borderLeft: '1px solid var(--border-subtle)',
            backgroundColor: `${accent}0E`,
            backgroundImage: 'radial-gradient(var(--border-default) 0.6px, transparent 0.6px)',
            backgroundSize: '9px 9px',
            minHeight: 150,
          }}
        >
          {/* corner annotation — technical-drawing detail */}
          <span
            className="absolute top-2 left-2.5 text-[8px] font-mono uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Live · Elevation
          </span>
          {illustration}
        </div>
      </div>
    </Card>
  );
}
