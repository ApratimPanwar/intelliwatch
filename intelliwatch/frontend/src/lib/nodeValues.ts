/**
 * Shared node-graph value resolution.
 * Used by both PreviewPanel and WorkspaceView so they show identical data.
 */
import { type Node, type Edge } from '@xyflow/react';
import { type AppState } from '../store/useAppStore';
import { type SensorNodeData } from '../components/nodebuilder/SensorNode';
import { type SemanticColor } from './utils';

// ── VIZ node types ─────────────────────────────────────────────────────────────
export const VIZ_TYPES = new Set([
  'kpi-card', 'gauge', 'sparkline', 'line-chart', 'progress-bar',
  'stat-trend', 'heat-level', 'live-clock', 'alert-badge', 'status-badge',
  'bullet-gauge', 'text-label', 'bar-chart', 'donut-chart',
]);

// ── OEE port name aliases (edges use short names, store uses full names) ────────
const OEE_FIELD: Record<string, 'availability' | 'performance' | 'quality'> = {
  avail: 'availability', availability: 'availability',
  perf:  'performance',  performance:  'performance',
  qual:  'quality',      quality:      'quality',
};

// ── resolveValue ──────────────────────────────────────────────────────────────
export function resolveValue(
  nodeId: string,
  portId: string,
  edges: Edge[],
  allNodes: Node[],
  store: AppState,
): unknown {
  const edge = edges.find(e => e.target === nodeId && e.targetHandle === portId);
  if (!edge) return null;
  const src = allNodes.find(n => n.id === edge.source);
  if (!src) return null;
  const d   = src.data as SensorNodeData;
  const pid = edge.sourceHandle ?? 'value';

  switch (d.nodeType) {
    case 'rpm-sensor':     return Math.round(store.sensors.rpm.val);
    case 'temp-sensor':    return +store.sensors.temp.val.toFixed(1);
    case 'current-sensor': return +store.sensors.current.val.toFixed(1);
    case 'energy-meter':
      return pid === 'voltage' ? +store.sensors.voltage.val.toFixed(1)
           : pid === 'current' ? +store.sensors.current.val.toFixed(1)
           : pid === 'power'   ? Math.round(store.sensors.power.val)
           : pid === 'pf'      ? +store.sensors.pf.val.toFixed(2)
           : +store.sensors.energy.val.toFixed(2);
    case 'vibration':
      return pid === 'y' ? store.sensors.viby.val
           : pid === 'z' ? store.sensors.vibz.val
           : store.sensors.vibx.val;
    case 'production':
      return (store.production as unknown as Record<string, number>)[pid] ?? 0;
    case 'oee-metrics': {
      const o = store.oee;
      if (pid === 'oee') return +(o.availability * o.performance * o.quality / 10000).toFixed(1);
      const field = OEE_FIELD[pid];
      return field ? o[field] : 0;
    }
    case 'safety-events':
      if (pid === 'activeAlerts') return store.alerts.filter(a => !a.acked).length;
      return (store.safety as Record<string, number>)[pid] ?? 0;
    case 'connection-sensor':
      return pid === 'connected' ? (store.connected ? 1 : 0) : 0;
    default:
      // TRANSFORM or unknown — recurse one hop up
      return resolveValue(src.id, pid, edges, allNodes, store);
  }
}

// ── getSparklineData ──────────────────────────────────────────────────────────
// Returns the right history array for a sparkline/stat-trend VIZ node.
export function getSparklineData(
  nodeId: string,
  edges: Edge[],
  allNodes: Node[],
  store: AppState,
  currentVal: number,
): number[] {
  const edge = edges.find(e => e.target === nodeId && e.targetHandle === 'value');
  if (edge) {
    const src = allNodes.find(n => n.id === edge.source);
    if (src) {
      const d = src.data as SensorNodeData;
      switch (d.nodeType) {
        case 'rpm-sensor':  return store.history.rpm.length  ? store.history.rpm  : [currentVal];
        case 'temp-sensor': return store.history.temp.length ? store.history.temp : [currentVal];
        case 'vibration':   return store.history.vibx.length ? store.history.vibx : [currentVal];
      }
    }
  }
  // Fallback — use vibx history if populated, else synthesise from current value
  if (store.history.vibx.length) return store.history.vibx;
  return [currentVal, currentVal * 1.01, currentVal * 0.99, currentVal * 1.02, currentVal * 0.98];
}

// ── colorKey helper ───────────────────────────────────────────────────────────
const VALID_COLORS = new Set(['teal','amber','coral','blue','purple','green','pink']);
export function toSemanticColor(c: unknown): SemanticColor {
  return VALID_COLORS.has(c as string) ? (c as SemanticColor) : 'teal';
}
