import { useAppStore } from '../../store/useAppStore';
import { cn, COLOR_MAP } from '../../lib/utils';
import { Card, CardHeader, CardTitle } from '../widgets/Card';
import { KPICard } from '../widgets/KPICard';
import { StatusBadge } from '../widgets/StatusBadge';
import { emitAck } from '../../hooks/useSocket';
import { toast } from '../Toast';
import { IncidentArt, MachineArt } from '../illustrations/MachiningArt';
import { DashboardHero } from '../widgets/DashboardHero';

const CAMERAS = [
  { id: 'Cam 1 Zone A', status: 'LIVE'     as const, quality: 92, color: 'teal'  as const },
  { id: 'Cam 2 Zone B', status: 'LIVE'     as const, quality: 78, color: 'amber' as const },
  { id: 'Cam 3 Zone C', status: 'DEGRADED' as const, quality: 55, color: 'coral' as const },
  { id: 'Cam 4 Zone D', status: 'LIVE'     as const, quality: 88, color: 'teal'  as const },
];

const EVENTS = [
  { color: 'coral',  icon: '⚠', msg: 'PPE violation detected — W-02 · Camera 3',    time: '09:38' },
  { color: 'amber',  icon: '↕', msg: 'Unsafe posture flagged — W-03',                time: '09:27' },
  { color: 'amber',  icon: '⏱', msg: 'Idle time alert — W-02 · 18 min no activity', time: '09:15' },
  { color: 'blue',   icon: 'ℹ', msg: 'Camera 3 quality dropped to 55%',              time: '08:40' },
  { color: 'teal',   icon: '✓', msg: 'Shift started — 8 operators clocked in',       time: '06:00' },
  { color: 'teal',   icon: '✓', msg: 'All machines passed pre-shift check',           time: '05:55' },
];

export function SupervisorView() {
  const { oee, alerts, workers, machines } = useAppStore();

  const oeeValue = (oee.availability * oee.performance * oee.quality / 10000).toFixed(1);
  const activeAlerts = alerts.filter(a => !a.acked).length;
  const barColor = (v: number) => v >= 80 ? 'teal' : v >= 50 ? 'amber' : 'coral';

  return (
    <div className="flex flex-col gap-3">
      {/* ── Hero — shift overview ───────────────────────────────────────── */}
      <DashboardHero
        eyebrow="Today's Shift · Oversight"
        title="Morning Shift — At a Glance"
        sub="Auto-refresh 5s · Machining Shop A · Bengaluru"
        accent="#4B9FFF"
        stats={[
          { label: 'OEE',      value: `${oeeValue}%`, dot: '#FFB020' },
          { label: 'running',  value: `${machines.filter(m => m.status === 'RUNNING').length}/${machines.length}`, dot: '#2DD898' },
          { label: 'alerts',   value: `${activeAlerts}`, dot: '#FF4F6A' },
          { label: 'on shift', value: `${workers.length}`, dot: '#4B9FFF' },
        ]}
        illustration={
          <MachineArt type="assembly" size={170} detail strokeWidth={1.5}
            style={{ color: 'var(--text-secondary)' }} accent="#4B9FFF" />
        }
      />

      {/* Role header */}
      <Card cockpit className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔧</span>
          <div className="flex-1">
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
              Supervisor Dashboard
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              Morning shift · 8 operators active · All machines online
            </p>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Shift Progress</span>
              <div className="w-36 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-4)' }}>
                <div className="h-full rounded-full" style={{ width: '44.7%', background: 'linear-gradient(90deg, #00D4A8, #3D8EFF)' }} />
              </div>
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>3.6 / 8 hrs</span>
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
            >
              Configure Alerts
            </button>
          </div>
        </div>
      </Card>

      {/* OEE KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="OEE"           value={`${oeeValue}%`}          color="amber"                progress={+oeeValue}          sub="Target 80%" />
        <KPICard label="Availability"  value={`${oee.availability}%`}  color={barColor(oee.availability)} progress={oee.availability} sub="Machine uptime" />
        <KPICard label="Performance"   value={`${oee.performance}%`}   color={barColor(oee.performance)}  progress={oee.performance}  sub="Speed efficiency" />
        <KPICard label="Quality"       value={`${oee.quality}%`}       color={barColor(oee.quality)}      progress={oee.quality}      sub="First-pass yield" />
      </div>

      {/* ── Incident Overview — featured machining incident ───────────────── */}
      <Card cockpit className="overflow-hidden">
        <div className="flex items-stretch flex-col sm:flex-row">
          {/* Left — details */}
          <div className="flex-1 p-5 flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold"
                style={{ background: '#FF4F6A', color: '#fff' }}
              >
                ↑ 6.1%
              </span>
              <span className="text-[10px] uppercase tracking-[1.5px]" style={{ color: 'var(--text-tertiary)' }}>
                Machining · Last 24h
              </span>
            </div>
            <h2
              className="font-bold leading-none"
              style={{ color: 'var(--text-primary)', fontSize: 30, letterSpacing: '-0.02em' }}
            >
              Incident Overview
            </h2>
            <div className="mt-auto pt-5">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                MILL-01 · Spindle Overload
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Tool breakage · Cycle aborted · 08:54
              </p>
              <button
                className="text-[12px] font-medium mt-3 underline underline-offset-4 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => toast.success('Opening incident reconstruction…')}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
              >
                View Reconstruction →
              </button>
            </div>
          </div>
          {/* Right — line-art illustration */}
          <div
            className="flex items-center justify-center px-6 py-6"
            style={{
              borderLeft: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface-1)',
              backgroundImage: 'radial-gradient(var(--border-default) 0.6px, transparent 0.6px)',
              backgroundSize: '9px 9px',
              minWidth: 280,
            }}
          >
            <IncidentArt size={244} style={{ color: 'var(--text-secondary)' }} accent="#FF4F6A" />
          </div>
        </div>
      </Card>

      {/* Alerts + Cameras */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Live Alerts</CardTitle>
              <span className="px-1.5 py-0.5 rounded-full bg-coral text-white text-[10px] font-mono font-semibold">
                {activeAlerts} active
              </span>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                color: 'var(--text-tertiary)',
                background: 'var(--surface-3)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              5s refresh
            </span>
          </CardHeader>
          <div className="p-3 flex flex-col gap-2">
            {alerts.map((alert) => {
              const level = alert.level as 'critical'|'warning'|'info';
              const colors = { critical: 'coral', warning: 'amber', info: 'blue' } as const;
              const c = colors[level];
              const C = COLOR_MAP[c];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-xl border-l-[3px] transition-all duration-200"
                  style={!alert.acked ? {
                    background: `${C.hex}0D`,
                    borderColor: `${C.hex}50`,
                  } : {
                    background: 'var(--surface-2)',
                    borderColor: 'rgba(0,223,184,0.20)',
                  }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-sm flex-shrink-0"
                    style={{ background: `${C.hex}18` }}
                  >
                    {alert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {alert.title}
                      </span>
                      <ConfBadge conf={alert.confidence} />
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{alert.sub}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{alert.time}</span>
                    <button
                      disabled={alert.acked}
                      onClick={() => { emitAck(alert.id); toast.success('Alert acknowledged'); }}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all duration-200',
                        alert.acked ? 'bg-teal/10 border-teal/25 text-teal cursor-default' : '',
                      )}
                      style={!alert.acked ? {
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-secondary)',
                      } : undefined}
                    >
                      {alert.acked ? '✓ Acked' : 'Acknowledge'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Cameras */}
        <Card>
          <CardHeader><CardTitle>Camera Coverage</CardTitle></CardHeader>
          <div className="p-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {CAMERAS.map((cam) => (
                <div
                  key={cam.id}
                  className="rounded-lg p-2.5"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <p className="text-[9px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{cam.id}</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] font-medium text-${cam.color}`}>{cam.status}</span>
                    <span className={`font-mono text-[10px] text-${cam.color}`}>{cam.quality}%</span>
                  </div>
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-4)' }}>
                    <div className="h-full rounded-full" style={{ width: `${cam.quality}%`, background: COLOR_MAP[cam.color].hex }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg p-2.5 text-[11px] text-coral" style={{ background: 'rgba(255,79,106,0.06)', border: '1px solid rgba(255,79,106,0.20)' }}>
              ⚠ Cam 3 quality degraded — check lens occlusion
            </div>
          </div>
        </Card>
      </div>

      {/* Workers + Machines */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Worker Status</CardTitle></CardHeader>
          <div className="p-3 grid grid-cols-2 gap-2">
            {workers.map((w) => {
              const statusColor = ({ SAFE: 'teal', ALERT: 'coral', WATCH: 'amber' } as const)[w.status];
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-semibold text-[12px]"
                    style={{
                      background: 'var(--surface-3)',
                      border: `2px solid ${COLOR_MAP[statusColor].hex}`,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {w.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{w.name}</p>
                    <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{w.role}</p>
                    <div className="h-1 rounded-full overflow-hidden mt-1" style={{ background: 'var(--surface-4)' }}>
                      <div className="h-full rounded-full" style={{ width: `${w.prod}%`, background: COLOR_MAP[statusColor].hex }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={w.status} showDot={false} className="text-[8px] px-1.5 py-0.5" />
                    <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{w.prod}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Machine Health</CardTitle></CardHeader>
          <div className="p-3 flex flex-col">
            {machines.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 py-2.5"
                style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}
              >
                <div className="flex-1">
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{m.id}</span>
                  <span className="text-[10px] ml-2" style={{ color: 'var(--text-tertiary)' }}>{m.type}</span>
                </div>
                <div className="font-mono text-[10px] hidden lg:block" style={{ color: 'var(--text-secondary)' }}>
                  {m.rpm}rpm · {m.temp}°C · {m.vib}g
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Event log + Productivity */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Shift Event Log</CardTitle></CardHeader>
          <div className="p-4 flex flex-col gap-0">
            {EVENTS.map((e, i) => (
              <div key={i} className="flex gap-3 pb-3 relative">
                {i < EVENTS.length - 1 && (
                  <div
                    className="absolute left-[10px] top-6 bottom-0 w-px"
                    style={{ background: 'var(--border-subtle)' }}
                  />
                )}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 z-10"
                  style={{
                    background: `${COLOR_MAP[e.color as keyof typeof COLOR_MAP].hex}20`,
                    color: COLOR_MAP[e.color as keyof typeof COLOR_MAP].hex,
                  }}
                >
                  {e.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{e.msg}</p>
                  <p className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Productivity Breakdown</CardTitle></CardHeader>
          <div className="p-4 flex flex-col gap-2">
            {[
              { label: 'Machining',     pct: 48, color: 'teal'  as const },
              { label: 'Setup',         pct: 26, color: 'blue'  as const },
              { label: 'Idle',          pct: 14, color: 'amber' as const },
              { label: 'Movement loss', pct: 12, color: 'coral' as const },
            ].map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[11px] w-28" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-4)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLOR_MAP[color].hex }} />
                </div>
                <span className="font-mono text-[10px] w-8 text-right" style={{ color: 'var(--text-tertiary)' }}>{pct}%</span>
              </div>
            ))}
            <div
              className="mt-3 p-3 rounded-xl"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                SDLR Diagnostic
              </p>
              <span className="font-mono font-semibold text-[18px] text-amber">14.5</span>
              <p className="text-[11px] italic mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Mixed cause: process + safety. Investigate machine downtime.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ConfBadge({ conf }: { conf: string }) {
  const s = conf === 'confirmed' ? { bg: 'bg-teal/10', border: 'border-teal/25', text: 'text-teal' }
           : conf === 'probable'  ? { bg: 'bg-amber/10', border: 'border-amber/25', text: 'text-amber' }
           : { bg: 'bg-coral/10', border: 'border-coral/25', text: 'text-coral' };
  return (
    <span className={cn('px-1.5 py-0.5 rounded font-mono text-[9px] border', s.bg, s.border, s.text)}>
      {conf}
    </span>
  );
}
