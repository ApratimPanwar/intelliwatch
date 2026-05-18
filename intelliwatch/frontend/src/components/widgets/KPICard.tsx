import { cn, COLOR_MAP, type SemanticColor } from '../../lib/utils';
import { Card } from './Card';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  color?: SemanticColor;
  progress?: number;      // 0–100
  size?: 'sm' | 'md' | 'lg';
  noBar?: boolean;
  decimals?: number;
  trend?: { value: string; positive: boolean };
  className?: string;
}

const SIZE = { sm: 'text-[24px]', md: 'text-[30px]', lg: 'text-[38px]' };

const PROGRESS_GRADIENT: Record<SemanticColor, string> = {
  teal:   'linear-gradient(90deg, #00DFB8, #4B9FFF)',
  amber:  'linear-gradient(90deg, #FFB020, #FF8C42)',
  coral:  'linear-gradient(90deg, #FF4F6A, #FF7A45)',
  blue:   'linear-gradient(90deg, #4B9FFF, #A466F5)',
  purple: 'linear-gradient(90deg, #A466F5, #F472B6)',
  green:  'linear-gradient(90deg, #2DD898, #00DFB8)',
  pink:   'linear-gradient(90deg, #F472B6, #A466F5)',
};

const PROGRESS_GLOW: Record<SemanticColor, string> = {
  teal:   '0 0 8px rgba(0,223,184,0.5)',
  amber:  '0 0 8px rgba(255,176,32,0.5)',
  coral:  '0 0 8px rgba(255,79,106,0.5)',
  blue:   '0 0 8px rgba(75,159,255,0.5)',
  purple: '0 0 8px rgba(164,102,245,0.5)',
  green:  '0 0 8px rgba(45,216,152,0.5)',
  pink:   '0 0 8px rgba(244,114,182,0.5)',
};

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const animated = useAnimatedValue(value);
  return <>{decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toLocaleString()}</>;
}

export function KPICard({
  label, value, unit, sub, color = 'teal',
  progress, size = 'md', noBar, decimals, trend, className,
}: KPICardProps) {
  const c = COLOR_MAP[color];
  const numVal = typeof value === 'number' ? value : null;
  const animProg = useAnimatedValue(progress ?? 0);

  return (
    <Card accent={color} className={cn('p-4 flex flex-col gap-1.5', className)}>
      {/* Label */}
      <p
        className="text-[10px] font-semibold uppercase tracking-[1.3px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </p>

      {/* Value row */}
      <div className="flex items-end gap-1.5 mt-0.5">
        <span className={cn('font-mono font-bold leading-none tabular-nums', SIZE[size], c.text)}>
          {numVal !== null
            ? <AnimatedNumber value={numVal} decimals={decimals} />
            : value}
        </span>
        {unit && (
          <span
            className="font-mono text-[11px] mb-0.5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!noBar && (
        <div
          className="h-1 rounded-full overflow-visible mt-0.5"
          style={{ background: 'var(--surface-3)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, animProg)}%`,
              background: PROGRESS_GRADIENT[color],
              boxShadow: animProg > 5 ? PROGRESS_GLOW[color] : 'none',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}

      {/* Sub + trend */}
      <div className="flex items-center justify-between mt-0.5">
        {sub && (
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
        )}
        {trend && (
          <span className={cn(
            'text-[10px] font-mono ml-auto font-medium',
            trend.positive ? 'text-green' : 'text-coral',
          )}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
}
