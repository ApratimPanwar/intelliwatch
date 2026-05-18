/**
 * Recharts-based chart wrappers — theme-aware via useTheme hook.
 */
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { COLOR_MAP, type SemanticColor } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

function useChartTheme() {
  const { isDark } = useTheme();
  return {
    gridColor:    isDark ? 'rgba(148,163,184,0.06)' : 'rgba(20,30,55,0.06)',
    axisColor:    isDark ? '#45607E' : '#6888A8',
    tooltipBg:    isDark ? 'rgba(9,14,28,0.95)' : 'rgba(255,255,255,0.97)',
    tooltipBorder:isDark ? 'rgba(148,163,184,0.14)' : 'rgba(20,30,55,0.10)',
    tooltipColor: isDark ? '#E6EDFF' : '#131B2E',
    tooltipLabel: isDark ? '#7E94BA' : '#6888A8',
    gaugeTrack:   isDark ? 'rgba(148,163,184,0.10)' : 'rgba(20,30,55,0.10)',
    gaugeText:    isDark ? '#E6EDFF' : '#131B2E',
    centerText:   isDark ? '#E6EDFF' : '#131B2E',
    centerSub:    isDark ? '#45607E' : '#6888A8',
  };
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  color?: SemanticColor;
  threshold?: number;
  height?: number;
}
export function Sparkline({ data, color = 'teal', threshold, height = 52 }: SparklineProps) {
  const hex = COLOR_MAP[color].hex;
  const { gridColor } = useChartTheme();
  const pts = data.map((v) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={pts} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={hex} stopOpacity={0.35} />
            <stop offset="75%"  stopColor={hex} stopOpacity={0.05} />
            <stop offset="100%" stopColor={hex} stopOpacity={0}    />
          </linearGradient>
        </defs>
        {threshold && (
          <CartesianGrid
            horizontal={false} vertical={false}
            horizontalPoints={[threshold]}
            stroke={COLOR_MAP.amber.hex} strokeDasharray="3 3" strokeOpacity={0.5}
          />
        )}
        <Area type="monotone" dataKey="v" stroke={hex} strokeWidth={1.8}
              fill={`url(#sg-${color})`} dot={false} isAnimationActive={false}
              strokeLinecap="round" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── TrendLine (with axes + tooltip) ──────────────────────────────────────────
interface TrendLineProps {
  data: { label: string; value: number }[];
  color?: SemanticColor;
  unit?: string;
  height?: number;
}
export function TrendLine({ data, color = 'teal', unit = '', height = 140 }: TrendLineProps) {
  const hex = COLOR_MAP[color].hex;
  const { gridColor, axisColor, tooltipBg, tooltipBorder, tooltipColor, tooltipLabel } = useChartTheme();
  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: 10,
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
    color: tooltipColor,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(12px)',
  };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id={`tl-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={hex} stopOpacity={0.28} />
            <stop offset="80%"  stopColor={hex} stopOpacity={0.03} />
            <stop offset="100%" stopColor={hex} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="label"
               tick={{ fill: axisColor, fontSize: 9, fontFamily: 'Inter, system-ui' }}
               axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: axisColor, fontSize: 9, fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [`${v}${unit}`, '']}
          labelStyle={{ color: tooltipLabel }}
          cursor={{ stroke: hex, strokeWidth: 1, strokeOpacity: 0.3 }}
        />
        <Area type="monotone" dataKey="value" stroke={hex} strokeWidth={2}
              fill={`url(#tl-${color})`}
              dot={false}
              activeDot={{ fill: hex, r: 4, strokeWidth: 2, stroke: 'rgba(0,0,0,0.3)' }}
              isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── BarChartWidget ─────────────────────────────────────────────────────────────
interface BarWidgetProps {
  data: { label: string; value: number }[];
  color?: SemanticColor;
  unit?: string;
  height?: number;
}
export function BarWidget({ data, color = 'green', unit = '', height = 140 }: BarWidgetProps) {
  const hex = COLOR_MAP[color].hex;
  const { gridColor, axisColor, tooltipBg, tooltipBorder, tooltipColor } = useChartTheme();
  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: 10,
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
    color: tooltipColor,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: axisColor, fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}${unit}`, '']} />
        <Bar dataKey="value" radius={[5, 5, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={hex} fillOpacity={0.55 + 0.45 * (i / Math.max(1, data.length - 1))} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── DonutChart ────────────────────────────────────────────────────────────────
interface DonutProps {
  segments: { label: string; value: number; color: SemanticColor }[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}
export function DonutChart({ segments, centerLabel, centerValue, size = 120 }: DonutProps) {
  const { tooltipBg, tooltipBorder, tooltipColor, centerText, centerSub } = useChartTheme();
  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: 10,
    fontSize: 11,
    color: tooltipColor,
  };
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie data={segments} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
             dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
          {segments.map((s, i) => (
            <Cell key={i} fill={COLOR_MAP[s.color].hex} opacity={0.9} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="font-mono font-semibold text-sm leading-none" style={{ color: centerText }}>
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[9px] mt-0.5" style={{ color: centerSub }}>
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── GaugeArc (SVG semicircle gauge) ───────────────────────────────────────────
interface GaugeProps { value: number; max: number; color?: SemanticColor; label?: string; size?: number; }
export function GaugeArc({ value, max, color = 'teal', label, size = 110 }: GaugeProps) {
  const hex = COLOR_MAP[color].hex;
  const { gaugeTrack, gaugeText, centerSub } = useChartTheme();
  const pct = Math.min(1, value / max);
  const r = 36; const cx = 55; const cy = 50;
  const arcLen = Math.PI * r;
  const fill = pct * arcLen;
  const angle = -180 + pct * 180;
  const rad = (angle * Math.PI) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 110 65" width={size} height={size * 0.6}>
        <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
              fill="none" stroke={gaugeTrack} strokeWidth="7" strokeLinecap="round" />
        <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
              fill="none" stroke={hex} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${fill} ${arcLen}`} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={hex} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3.5" fill={hex} />
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10"
              fill={gaugeText} fontFamily="JetBrains Mono" fontWeight="700">
          {Math.round(value)}
        </text>
      </svg>
      {label && (
        <span className="text-[9px] -mt-1" style={{ color: centerSub }}>{label}</span>
      )}
    </div>
  );
}
