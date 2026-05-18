import { useEffect, useState } from 'react';
import { cn, fmt } from '../lib/utils';
import { useAppStore, type Tab } from '../store/useAppStore';

const TABS: { id: Tab; label: string; icon: string; }[] = [
  { id: 'operator',    label: 'Operator',    icon: '🔧' },
  { id: 'supervisor',  label: 'Supervisor',  icon: '📋' },
  { id: 'owner',       label: 'Owner',       icon: '👔' },
  { id: 'nodebuilder', label: 'Node Builder',icon: '⬡'  },
];

interface TabbarProps { onTabChange?: (tab: Tab) => void; }

export function Tabbar({ onTabChange }: TabbarProps) {
  const { activeTab, setTab, shiftStart } = useAppStore();
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const tick = () => setElapsed(fmt.duration(Date.now() - shiftStart));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [shiftStart]);

  const handleTab = (t: Tab) => { setTab(t); onTabChange?.(t); };

  return (
    <nav
      className="fixed inset-x-0 top-12 z-40 h-11 flex items-center px-3 gap-1"
      style={{
        background: 'rgba(9,14,28,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148,163,184,0.07)',
      }}
    >
      {/* ── Tab buttons ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 h-full">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          const isBuilder = t.id === 'nodebuilder';
          return (
            <button
              key={t.id}
              onClick={() => handleTab(t.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg',
                'text-[11px] font-medium transition-all duration-200 whitespace-nowrap',
                active
                  ? isBuilder
                    ? 'text-teal bg-teal/10 border border-teal/25'
                    : 'text-ink-primary bg-white/[0.07] border border-white/[0.10]'
                  : 'text-ink-tertiary hover:text-ink-secondary hover:bg-white/[0.04] border border-transparent',
              )}
              style={active ? {
                boxShadow: isBuilder
                  ? '0 0 16px rgba(0,223,184,0.12), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.09), 0 1px 8px rgba(0,0,0,0.3)',
              } : undefined}
            >
              {/* Active indicator stripe */}
              {active && (
                <span
                  className="absolute inset-x-3 bottom-0 h-[1.5px] rounded-full"
                  style={{
                    background: isBuilder
                      ? 'linear-gradient(90deg, #00DFB8, rgba(0,223,184,0))'
                      : 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0))',
                  }}
                />
              )}
              <span className={cn('text-[12px]', active && isBuilder && 'text-teal')}>
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Right info strip ──────────────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-2 pr-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md
                        bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[9px] text-ink-tertiary tracking-[0.6px] font-medium">SHIFT</span>
          <span className="font-mono text-[10px] text-ink-secondary">Morning 06:00–14:00</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md
                        bg-amber/[0.05] border border-amber/[0.18]">
          <span className="text-[9px] text-amber/70 tracking-[0.6px] font-medium">ELAPSED</span>
          <span className="font-mono text-[10px] text-amber tabular-nums font-semibold">{elapsed}</span>
        </div>
      </div>
    </nav>
  );
}
