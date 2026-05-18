/**
 * WidgetCard — the canonical "VIZ node → dashboard card" renderer.
 *
 * This is the SINGLE source of truth for how a node renders as a widget.
 * Both the Node Builder's PreviewPanel and the Workspace import this exact
 * component, so a card in the Workspace is guaranteed to match the Node Editor.
 *
 * Value resolution priority:
 *   1. live value from a wired source edge  (resolveValue)
 *   2. static value from node settings      (settings.value)
 *   3. 0
 * Chart widgets additionally read static settings.series / settings.segments.
 */
import { useState, useEffect } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { useAppStore } from '../../store/useAppStore';
import { NODE_TYPES_DEF } from './nodeTypes';
import { type SensorNodeData } from './SensorNode';
import { fmt, COLOR_MAP } from '../../lib/utils';
import { Sparkline, GaugeArc, BarWidget, DonutChart, TrendLine } from '../widgets/Charts';
import { resolveValue, getSparklineData, toSemanticColor, VIZ_TYPES } from '../../lib/nodeValues';
import { KPICard } from '../widgets/KPICard';
import { Card } from '../widgets/Card';

interface WidgetCardProps {
  node:     Node;
  edges:    Edge[];
  allNodes: Node[];
}

type Series = { label: string; value: number }[];
type Segments = { label: string; value: number; color: string }[];

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[1.3px]"
     style={{ color: 'var(--text-tertiary)' }}>{children}</p>
);

export function WidgetCard({ node, edges, allNodes }: WidgetCardProps) {
  const store    = useAppStore();
  const d        = node.data as SensorNodeData;
  const label    = typeof d.label === 'string' ? d.label : '';
  const colorKey = toSemanticColor((d.settings?.color as string) || 'teal');
  const unit     = (d.settings?.unit as string) || '';
  const hex      = COLOR_MAP[colorKey]?.hex ?? '#00DFB8';

  // ── Value resolution: wired source → static setting → 0 ─────────────────────
  const value       = resolveValue(node.id, 'value', edges, allNodes, store);
  const maxVal      = resolveValue(node.id, 'max',   edges, allNodes, store);
  const settingsMax = typeof d.settings?.max   === 'number' ? (d.settings.max   as number) : undefined;
  const staticVal   = typeof d.settings?.value === 'number' ? (d.settings.value as number) : undefined;
  const n           = typeof value === 'number' ? value : (staticVal ?? 0);
  const max         = typeof maxVal === 'number' && maxVal > 0 ? maxVal
                    : settingsMax && settingsMax > 0 ? settingsMax
                    : 100;
  const pct         = Math.min(100, (n / max) * 100);
  const maxLabel    = Number.isInteger(max) ? fmt.int(max) : String(max);
  const sparkData   = getSparklineData(node.id, edges, allNodes, store, n);

  // Static chart data
  const series   = Array.isArray(d.settings?.series)   ? (d.settings.series   as Series)   : null;
  const segments = Array.isArray(d.settings?.segments) ? (d.settings.segments as Segments) : null;

  const [time, setTime] = useState(() => new Date().toLocaleTimeString());
  useEffect(() => {
    if (d.nodeType !== 'live-clock') return;
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, [d.nodeType]);

  // SOURCE / TRANSFORM nodes — not a VIZ widget, show info instead
  if (!VIZ_TYPES.has(d.nodeType)) {
    const def = NODE_TYPES_DEF[d.nodeType];
    return (
      <div className="rounded-xl p-4 flex flex-col gap-2"
           style={{ background:'var(--surface-2)', border:'1px solid var(--border-subtle)' }}>
        <Label>Source Node</Label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{def?.icon ?? '⚙'}</span>
          <div>
            <p className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{label || def?.label}</p>
            <p className="text-[10px]" style={{ color:'var(--text-tertiary)' }}>{def?.desc ?? 'Connect to a VIZ node to preview output'}</p>
          </div>
        </div>
        <p className="text-[10px] mt-1" style={{ color:'var(--text-secondary)' }}>
          Connect an output port to a visualization node to see a live preview here.
        </p>
      </div>
    );
  }

  switch (d.nodeType) {
    case 'kpi-card':
      return (
        <KPICard
          label={label}
          value={n}
          unit={unit}
          color={colorKey}
          progress={pct}
          decimals={Number.isInteger(n) ? 0 : 1}
          sub={`${pct.toFixed(0)}% of ${fmt.int(max)}`}
        />
      );

    case 'gauge':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col items-center gap-2">
          <Label>{label}</Label>
          <GaugeArc value={n} max={max} color={colorKey} size={120} />
          <p className="font-mono text-sm" style={{ color:'var(--text-tertiary)' }}>
            {Number.isInteger(n) ? n : n.toFixed(1)} {unit}
          </p>
        </Card>
      );

    case 'line-chart':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          {series ? (
            <TrendLine data={series} color={colorKey} unit={unit} height={132} />
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold tabular-nums text-[28px] leading-none" style={{ color:hex }}>
                  {Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)}
                </span>
                {unit && <span className="font-mono text-xs" style={{ color:'var(--text-tertiary)' }}>{unit}</span>}
              </div>
              <div className="rounded-lg overflow-hidden" style={{ background:'var(--surface-2)' }}>
                <Sparkline data={sparkData.length ? sparkData : [n]} height={70} color={colorKey} />
              </div>
            </>
          )}
        </Card>
      );

    case 'sparkline':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold tabular-nums text-[28px] leading-none" style={{ color:hex }}>
              {Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)}
            </span>
            {unit && <span className="font-mono text-xs" style={{ color:'var(--text-tertiary)' }}>{unit}</span>}
          </div>
          <div className="rounded-lg overflow-hidden" style={{ background:'var(--surface-2)' }}>
            <Sparkline data={sparkData.length ? sparkData : [n]} height={70} color={colorKey} />
          </div>
        </Card>
      );

    case 'bar-chart':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <BarWidget
            data={series ?? sparkData.map((v, i) => ({ label: String(i + 1), value: v }))}
            color={colorKey} unit={unit} height={132}
          />
        </Card>
      );

    case 'donut-chart': {
      const segs = (segments ?? [{ label: label || 'Value', value: n, color: colorKey }])
        .map(s => ({ label: s.label, value: s.value, color: toSemanticColor(s.color) }));
      const total = segs.reduce((a, s) => a + s.value, 0);
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-center gap-3">
            <DonutChart
              segments={segs}
              size={108}
              centerValue={segs.length > 1 ? fmt.int(total) : fmt.int(n)}
              centerLabel={segs.length > 1 ? 'total' : unit}
            />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {segs.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLOR_MAP[s.color].hex }} />
                  <span className="text-[10px] truncate flex-1" style={{ color:'var(--text-secondary)' }}>{s.label}</span>
                  <span className="font-mono text-[10px]" style={{ color:'var(--text-tertiary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      );
    }

    case 'stat-trend':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold tabular-nums text-[32px] leading-none" style={{ color:hex }}>
              {Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1)}
            </span>
            {unit && <span className="font-mono text-xs" style={{ color:'var(--text-tertiary)' }}>{unit}</span>}
          </div>
          <div className="rounded-lg overflow-hidden" style={{ background:'var(--surface-2)' }}>
            <Sparkline data={sparkData.length ? sparkData : [n]} height={50} color={colorKey} />
          </div>
        </Card>
      );

    case 'progress-bar':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-bold text-[32px] leading-none tabular-nums" style={{ color:hex }}>
              {Number.isInteger(n) ? fmt.int(n) : n.toFixed(1)}
            </span>
            <span className="text-sm" style={{ color:'var(--text-tertiary)' }}>/ {maxLabel}{unit}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--surface-3)' }}>
            <div className="h-full rounded-full transition-all duration-700"
                 style={{ width:`${pct}%`, background:hex, boxShadow:`0 0 8px ${hex}80` }} />
          </div>
          <p className="text-[10px] font-mono" style={{ color:'var(--text-tertiary)' }}>{pct.toFixed(0)}% complete</p>
        </Card>
      );

    case 'bullet-gauge':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold tabular-nums text-[30px] leading-none" style={{ color:hex }}>
              {Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)}
            </span>
            {unit && <span className="font-mono text-xs" style={{ color:'var(--text-tertiary)' }}>{unit}</span>}
            <span className="ml-auto text-[10px] font-mono" style={{ color:'var(--text-tertiary)' }}>
              target {maxLabel}
            </span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background:'var(--surface-3)' }}>
            <div className="h-full rounded-full transition-all duration-700"
                 style={{ width:`${pct}%`, background:hex, boxShadow:`0 0 8px ${hex}80` }} />
            <div className="absolute top-0 bottom-0 right-0 w-[2px]" style={{ background:'var(--text-secondary)' }} />
          </div>
          <p className="text-[10px] font-mono" style={{ color:'var(--text-tertiary)' }}>{pct.toFixed(0)}% of target</p>
        </Card>
      );

    case 'heat-level': {
      const heatKey = pct >= 66 ? 'green' : pct >= 33 ? 'amber' : 'coral';
      const heatHex = COLOR_MAP[heatKey].hex;
      const lit     = Math.round(pct / 5);
      return (
        <Card accent={heatKey} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold tabular-nums text-[30px] leading-none" style={{ color:heatHex }}>
              {Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1)}
            </span>
            {unit && <span className="font-mono text-xs" style={{ color:'var(--text-tertiary)' }}>{unit}</span>}
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 h-2.5 rounded-sm transition-colors"
                   style={{
                     background: i < lit ? heatHex : 'var(--surface-3)',
                     opacity:    i < lit ? 0.35 + 0.65 * (i / 20) : 1,
                   }} />
            ))}
          </div>
          <p className="text-[10px] font-mono" style={{ color:'var(--text-tertiary)' }}>{pct.toFixed(0)}% level</p>
        </Card>
      );
    }

    case 'alert-badge': {
      const isAlert = n > 0;
      return (
        <Card accent={isAlert?'coral':'teal'} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
               style={{
                 background: isAlert?'rgba(255,79,106,0.08)':'rgba(0,223,184,0.08)',
                 borderColor: isAlert?'rgba(255,79,106,0.3)':'rgba(0,223,184,0.3)',
               }}>
            <span className="text-xl">{isAlert?'🔔':'✅'}</span>
            <span className="text-sm font-semibold" style={{ color:isAlert?'#FF4F6A':'#00DFB8' }}>
              {isAlert ? `${fmt.int(n)} alert${n!==1?'s':''} active` : 'All clear'}
            </span>
          </div>
        </Card>
      );
    }

    case 'status-badge': {
      const on      = n > 0;
      const onText  = (d.settings?.onText  as string) || 'ACTIVE';
      const offText = (d.settings?.offText as string) || 'INACTIVE';
      return (
        <Card accent={on?'teal':'coral'} className="p-4 flex flex-col gap-2">
          <Label>{label}</Label>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl border"
               style={{
                 background: on?'rgba(0,223,184,0.08)':'rgba(255,79,106,0.08)',
                 borderColor: on?'rgba(0,223,184,0.3)':'rgba(255,79,106,0.3)',
               }}>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background:on?'#00DFB8':'#FF4F6A', boxShadow:`0 0 8px ${on?'#00DFB8':'#FF4F6A'}` }} />
            <span className="text-base font-semibold" style={{ color:on?'#00DFB8':'#FF4F6A' }}>
              {on ? onText : offText}
            </span>
          </div>
        </Card>
      );
    }

    case 'text-label':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-1.5">
          <Label>{label}</Label>
          <span className="text-lg font-semibold" style={{ color:'var(--text-primary)' }}>
            {(d.settings?.text as string) ?? '—'}
          </span>
        </Card>
      );

    case 'live-clock':
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-2">
          <Label>{label || 'Live Clock'}</Label>
          <div className="flex items-center justify-center py-3">
            <span className="font-mono font-bold tabular-nums text-3xl" style={{ color:hex }}>{time}</span>
          </div>
        </Card>
      );

    default:
      return (
        <Card accent={colorKey} className="p-4 flex flex-col gap-1.5">
          <Label>{label}</Label>
          <span className="font-mono font-bold text-[28px] tabular-nums" style={{ color:hex }}>
            {Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)}
            {unit && <span className="text-xs ml-1" style={{ color:'var(--text-tertiary)' }}>{unit}</span>}
          </span>
        </Card>
      );
  }
}
