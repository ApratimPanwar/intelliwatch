/**
 * Generic custom node component for React Flow.
 * Handles all node types — SOURCE, TRANSFORM, VIZ.
 */
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { NODE_TYPES_DEF, PORT_COLOR, type PortDef } from './nodeTypes';

export interface SensorNodeData {
  nodeType: string;
  label?: string;
  color?: string;
  settings?: Record<string, unknown>;
  [key: string]: unknown;
}

function SensorNodeComponent({ data, selected }: NodeProps) {
  const d = data as SensorNodeData;
  const def = NODE_TYPES_DEF[d.nodeType];
  if (!def) return null;

  const accentColor = d.color || def.color;
  const categoryColors: Record<string, string> = {
    SOURCE: 'text-blue', TRANSFORM: 'text-amber', VIZ: 'text-teal',
  };

  return (
    <div className={cn(
      'relative rounded-xl border min-w-[180px] shadow-card transition-all duration-150',
      'bg-surface-3 border-border-default',
      selected && 'border-teal shadow-glow-teal',
    )}>
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl" style={{ background: accentColor }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-4 rounded-t-xl mt-0.5">
        <span className="text-[13px]">{def.icon}</span>
        <span className="text-[11px] font-medium text-ink-primary flex-1 truncate">
          {typeof d.label === 'string' ? d.label : def.label}
        </span>
        <span className={cn('text-[8px] font-medium uppercase tracking-wider px-1 rounded bg-surface-5', categoryColors[def.category])}>
          {def.category}
        </span>
      </div>

      {/* Body — ports */}
      <div className="px-2 py-2">
        <div className="flex gap-2">
          {/* Inputs */}
          <div className="flex flex-col gap-1.5 flex-1">
            {def.inputs.map((p: PortDef) => (
              <div key={p.id} className="relative flex items-center gap-1.5">
                <Handle
                  type="target" position={Position.Left} id={p.id}
                  style={{ width: 10, height: 10, background: PORT_COLOR[p.type], border: '2px solid #1A2234', left: -14 }}
                />
                <span className="font-mono text-[9px] text-ink-tertiary">{p.label}</span>
              </div>
            ))}
          </div>

          {/* Outputs */}
          <div className="flex flex-col gap-1.5 items-end flex-1">
            {def.outputs.map((p: PortDef) => (
              <div key={p.id} className="relative flex items-center gap-1.5">
                <span className="font-mono text-[9px] text-ink-tertiary">{p.label}</span>
                <Handle
                  type="source" position={Position.Right} id={p.id}
                  style={{ width: 10, height: 10, background: PORT_COLOR[p.type], border: '2px solid #1A2234', right: -14 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Settings display */}
        {d.settings && Object.keys(d.settings).length > 0 && (
          <div className="mt-2 pt-2 border-t border-border-subtle">
            {Object.entries(d.settings).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[9px]">
                <span className="text-ink-tertiary uppercase tracking-wider">{k}</span>
                <span className="font-mono text-ink-secondary">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const SensorNode = memo(SensorNodeComponent);
