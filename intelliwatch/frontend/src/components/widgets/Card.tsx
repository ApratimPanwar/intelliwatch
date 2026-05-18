import { cn } from '../../lib/utils';

export type AccentColor = 'teal'|'amber'|'coral'|'blue'|'purple'|'green'|'pink'|'indigo'|'orange';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Colored 2px gradient accent bar at the top */
  accent?: AccentColor;
  /**
   * Industrial "cockpit" treatment — 8px L-shaped corner ticks.
   * Borrowed from the INTELLIWATCH warm-paper design system, where the
   * corner ticks are the stated visual signature. Opt-in, theme-aware.
   */
  cockpit?: boolean;
  /** Extra inline style overrides */
  style?: React.CSSProperties;
  onClick?: () => void;
}

/** L-shaped precision corner marks for the `cockpit` card variant. */
function CockpitTicks() {
  const T = '1.5px solid var(--text-secondary)';
  const base = 'absolute w-2 h-2 pointer-events-none';
  return (
    <>
      <span className={base} style={{ top: 6,    left: 6,  borderLeft: T,  borderTop: T }} />
      <span className={base} style={{ top: 6,    right: 6, borderRight: T, borderTop: T }} />
      <span className={base} style={{ bottom: 6, left: 6,  borderLeft: T,  borderBottom: T }} />
      <span className={base} style={{ bottom: 6, right: 6, borderRight: T, borderBottom: T }} />
    </>
  );
}

const ACCENT_COLOR: Record<AccentColor, string> = {
  teal:   '#00DFB8',
  amber:  '#FFB020',
  coral:  '#FF4F6A',
  blue:   '#4B9FFF',
  purple: '#A466F5',
  green:  '#2DD898',
  orange: '#F97316',
  pink:   '#F472B6',
  indigo: '#6366F1',
};

export function Card({ children, className, accent, cockpit, style, onClick }: CardProps) {
  return (
    <div
      className={cn('rounded-xl relative overflow-hidden transition-theme', className)}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        ...style,
      }}
      onClick={onClick}
    >
      {/* Subtle top highlight shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, var(--card-highlight), transparent)' }}
      />

      {/* Accent color bar */}
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-[3px] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${ACCENT_COLOR[accent]} 0%, ${ACCENT_COLOR[accent]}55 50%, transparent 100%)`,
          }}
        />
      )}

      {/* Industrial cockpit corner ticks */}
      {cockpit && <CockpitTicks />}

      {children}
    </div>
  );
}

export function CardHeader({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-between px-4 py-3', className)}
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[1.4px] font-sans"
      style={{ color: 'var(--text-tertiary)' }}
    >
      {children}
    </span>
  );
}

export { ACCENT_COLOR };
