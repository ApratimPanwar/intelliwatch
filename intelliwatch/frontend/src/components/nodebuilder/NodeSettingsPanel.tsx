/**
 * Appears in the Preview sidebar when a node is selected.
 * Lets users edit node-specific settings (label, color, thresholds, etc.)
 */
import { type Node } from '@xyflow/react';
import { NODE_TYPES_DEF } from './nodeTypes';
import { type SensorNodeData } from './SensorNode';

interface Props {
  node: Node;
  onChange: (id: string, data: Partial<SensorNodeData>) => void;
}

const COLORS = ['teal', 'amber', 'coral', 'blue', 'purple', 'green'] as const;
const COLOR_HEX: Record<string, string> = {
  teal: '#00D4A8', amber: '#F5A623', coral: '#FF5F5F',
  blue: '#3D8EFF', purple: '#9B72F5', green: '#2DCE89',
};

export function NodeSettingsPanel({ node, onChange }: Props) {
  const d = node.data as SensorNodeData;
  const def = NODE_TYPES_DEF[d.nodeType];
  if (!def) return null;

  const set = (key: string, value: unknown) => {
    onChange(node.id, {
      ...d,
      settings: { ...(d.settings ?? {}), [key]: value },
      ...(key === 'label' ? { label: value as string } : {}),
    });
  };

  return (
    <div className="mt-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <p className="text-[9px] font-medium uppercase tracking-[1.2px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
        Node Settings
      </p>

      {/* Label */}
      <div className="mb-3">
        <p className="text-[9px] text-ink-tertiary mb-1">Label</p>
        <input
          value={typeof d.label === 'string' ? d.label : def.label}
          onChange={e => set('label', e.target.value)}
          className="w-full rounded-md px-2 py-1.5 font-sans text-[11px] focus:outline-none focus:border-teal"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Color (viz nodes) */}
      {def.category === 'VIZ' && (
        <div className="mb-3">
          <p className="text-[9px] text-ink-tertiary mb-1.5">Color</p>
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                className="w-5 h-5 rounded-full border-2 transition-all"
                style={{
                  background: COLOR_HEX[c],
                  borderColor: d.settings?.color === c ? '#fff' : 'transparent',
                  transform: d.settings?.color === c ? 'scale(1.2)' : 'scale(1)',
                }} />
            ))}
          </div>
        </div>
      )}

      {/* Static value + max — viz nodes that show a single number.
          Static value is used as a fallback when no source edge is wired. */}
      {['kpi-card','gauge','bullet-gauge','heat-level','progress-bar','stat-trend','status-badge','alert-badge'].includes(d.nodeType) && (
        <>
          <SettingInput
            label="Static value (used when no source wired)"
            value={d.settings?.value as number ?? ''}
            onChange={v => set('value', v === '' ? '' : +v)}
            type="number"
          />
          <SettingInput
            label="Max / target"
            value={d.settings?.max as number ?? ''}
            onChange={v => set('max', v === '' ? '' : +v)}
            type="number"
          />
        </>
      )}

      {/* Text label content */}
      {d.nodeType === 'text-label' && (
        <SettingInput
          label="Text"
          value={d.settings?.text as string ?? ''}
          onChange={v => set('text', v)}
        />
      )}

      {/* Threshold node */}
      {d.nodeType === 'threshold' && (
        <>
          <SettingInput label="Max value" value={d.settings?.max as number ?? 100} onChange={v => set('max', +v)} type="number" />
          <SettingInput label="Warn %" value={d.settings?.warn as number ?? 80} onChange={v => set('warn', +v)} type="number" />
        </>
      )}

      {/* Compute node */}
      {d.nodeType === 'compute' && (
        <div className="mb-3">
          <p className="text-[9px] text-ink-tertiary mb-1">Formula</p>
          <select value={d.settings?.formula as string ?? 'A+B'}
            onChange={e => set('formula', e.target.value)}
            className="w-full bg-surface-4 border border-border-strong rounded-md px-2 py-1.5
                       font-mono text-[11px] text-ink-primary focus:outline-none focus:border-teal">
            {['A+B','A-B','A×B','A÷B','A/B×100'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      )}

      {/* Aggregate */}
      {d.nodeType === 'aggregate' && (
        <div className="mb-3">
          <p className="text-[9px] text-ink-tertiary mb-1">Method</p>
          <select value={d.settings?.method as string ?? 'avg'}
            onChange={e => set('method', e.target.value)}
            className="w-full bg-surface-4 border border-border-strong rounded-md px-2 py-1.5
                       font-mono text-[11px] text-ink-primary focus:outline-none focus:border-teal">
            {['avg','sum','min','max','last'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      )}

      {/* Alert badge */}
      {d.nodeType === 'alert-badge' && (
        <div className="mb-3">
          <p className="text-[9px] text-ink-tertiary mb-1">Level</p>
          <select value={d.settings?.level as string ?? 'warning'}
            onChange={e => set('level', e.target.value)}
            className="w-full bg-surface-4 border border-border-strong rounded-md px-2 py-1.5
                       font-mono text-[11px] text-ink-primary focus:outline-none focus:border-teal">
            {['critical','warning','info'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      )}

      {/* Status badge */}
      {d.nodeType === 'status-badge' && (
        <>
          <SettingInput label="On text"  value={d.settings?.onText  as string ?? 'RUNNING'} onChange={v => set('onText', v)} />
          <SettingInput label="Off text" value={d.settings?.offText as string ?? 'STOPPED'} onChange={v => set('offText', v)} />
        </>
      )}

      {/* Unit (kpi-card, gauge, progress-bar) */}
      {['kpi-card','gauge','progress-bar'].includes(d.nodeType) && (
        <SettingInput label="Unit" value={d.settings?.unit as string ?? ''} onChange={v => set('unit', v)} />
      )}
    </div>
  );
}

function SettingInput({ label, value, onChange, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="mb-3">
      <p className="text-[9px] text-ink-tertiary mb-1">{label}</p>
      <input type={type} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface-4 border border-border-strong rounded-md px-2 py-1.5
                   font-mono text-[11px] text-ink-primary focus:outline-none focus:border-teal" />
    </div>
  );
}
