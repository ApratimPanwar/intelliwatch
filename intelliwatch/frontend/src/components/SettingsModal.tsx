import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { emitThresholds } from '../hooks/useSocket';

interface SettingsModalProps { onClose: () => void; }

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { thresholds, setThresholds } = useAppStore();
  const [local, setLocal] = useState({ ...thresholds });

  const save = () => {
    setThresholds(local);
    emitThresholds(local);
    onClose();
  };

  const inputCls = "w-full rounded-lg px-3 py-2 font-mono text-[13px] focus:outline-none transition-theme";
  const inputStyle = {
    background: 'var(--surface-3)',
    border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)',
  };

  const field = (label: string, key: keyof typeof local, step = 1) => (
    <div className="mb-4">
      <label className="block text-[11px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input
        type="number" step={step} value={local[key]}
        onChange={e => setLocal(l => ({ ...l, [key]: +e.target.value }))}
        className={inputCls}
        style={inputStyle}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="w-[480px] max-h-[80vh] overflow-y-auto rounded-2xl p-6 transition-theme"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow-lg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            ⚙ System Settings
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Alert thresholds */}
        <p className="text-[10px] font-medium uppercase tracking-[1.2px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Alert Thresholds
        </p>
        {field('Temperature warning (°C)', 'temp', 1)}
        {field('Vibration warning (g)', 'vibration', 0.1)}
        {field('Current overload (A)', 'current', 0.5)}
        {field('RPM deviation (%)', 'rpmDevPct', 1)}

        {/* Notifications */}
        <p className="text-[10px] font-medium uppercase tracking-[1.2px] mb-3 mt-5" style={{ color: 'var(--text-tertiary)' }}>
          Notifications
        </p>
        <div className="mb-4">
          <label className="block text-[11px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>Escalation SMS</label>
          <input defaultValue="+91 98765 43210" className={inputCls} style={inputStyle} />
        </div>
        <div className="mb-4">
          <label className="block text-[11px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>Alert email</label>
          <input defaultValue="owner@factory.in" className={inputCls} style={inputStyle} />
        </div>

        {/* Display */}
        <p className="text-[10px] font-medium uppercase tracking-[1.2px] mb-3 mt-5" style={{ color: 'var(--text-tertiary)' }}>
          Display
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>Shift start time</label>
            <input defaultValue="06:00" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>Shift duration (hours)</label>
            <input type="number" defaultValue={8} className={inputCls} style={inputStyle} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded-lg text-[12px] font-medium bg-teal/20 border border-teal/35 text-teal hover:bg-teal/30 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
