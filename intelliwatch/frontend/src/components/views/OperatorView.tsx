import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fmt, sensorStatus, COLOR_MAP } from '../../lib/utils';
import { Card, CardHeader, CardTitle } from '../widgets/Card';
import { KPICard } from '../widgets/KPICard';
import { StatusBadge } from '../widgets/StatusBadge';
import { Sparkline, DonutChart } from '../widgets/Charts';
import { DashboardHero } from '../widgets/DashboardHero';
import { MachineArt } from '../illustrations/MachiningArt';

export function OperatorView() {
  const { sensors, production, safety, history } = useAppStore();
  const [target, setTarget] = useState(production.target);

  const rpmStatus  = sensorStatus(sensors.rpm.val, sensors.rpm.nom, undefined, sensors.rpm.warnPct);
  const tempStatus = sensorStatus(sensors.temp.val, sensors.temp.nom, sensors.temp.threshold);
  const curStatus  = sensorStatus(sensors.current.val, sensors.current.nom, sensors.current.threshold);
  const vibStatus  = sensorStatus(sensors.vibx.val, sensors.vibx.nom, sensors.vibx.threshold);

  const completedPct = Math.round((production.completed / target) * 100);
  const total = production.runtime + production.setup + production.downtime;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Hero — assigned machine, live ───────────────────────────────── */}
      <DashboardHero
        eyebrow="My Machine · Live"
        title="CNC Lathe — Station 3"
        sub="CNC-01 · Bay A · Machining Shop A"
        accent="#00DFB8"
        stats={[
          { label: 'RPM', value: fmt.int(sensors.rpm.val),     dot: '#4B9FFF' },
          { label: '°C',  value: fmt.dec1(sensors.temp.val),   dot: sensors.temp.val > 70 ? '#FFB020' : '#2DD898' },
          { label: 'A',   value: fmt.dec1(sensors.current.val),dot: '#FF4F6A' },
          { label: 'W',   value: fmt.int(sensors.power.val),   dot: '#FFB020' },
        ]}
        illustration={
          <MachineArt type="cnc" size={170} detail strokeWidth={1.5}
            style={{ color: 'var(--text-secondary)' }} accent="#00DFB8" />
        }
      />

      {/* ── Role header ─────────────────────────────────────────────────── */}
      <Card cockpit className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👷</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                Mr. Prabhu
              </span>
              <span className="text-[13px] font-light" style={{ color: 'var(--text-tertiary)' }}>
                / EMP-OPR-01-17
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              Machine Operator · CNC Lathe Station 3
            </p>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Shift Duration
              </p>
              <ShiftClock start={useAppStore.getState().shiftStart} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Target
              </p>
              <input
                type="number"
                value={target}
                onChange={e => setTarget(+e.target.value)}
                className="w-16 rounded-md px-2 py-1 font-mono text-[12px] text-center focus:outline-none transition-theme"
                style={{
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── 6-col KPI strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-3">
        <KPICard label="Completed"    value={production.completed} color="teal"
          progress={completedPct} sub={`${completedPct}% of target`} />
        <KPICard label="Machine RPM"  value={fmt.int(sensors.rpm.val)} unit="RPM" color={rpmStatus}
          progress={(sensors.rpm.val / sensors.rpm.max) * 100}
          sub={rpmStatus === 'teal' ? 'Nominal' : '⚠ Out of range'} />
        <KPICard label="Current"      value={fmt.dec1(sensors.current.val)} unit="A" color={curStatus}
          progress={(sensors.current.val / sensors.current.max) * 100}
          sub={curStatus === 'teal' ? 'Normal' : '⚠ Overload'} />
        <KPICard label="Temperature"  value={fmt.dec1(sensors.temp.val)} unit="°C" color={tempStatus}
          progress={(sensors.temp.val / sensors.temp.max) * 100}
          sub={`Threshold ${sensors.temp.threshold}°C`} />
        <KPICard label="Near Misses"  value={safety.nearMiss} color="coral" noBar sub="This shift" />
        <KPICard label="Runtime"      value={production.runtime} unit="min" color="green" size="sm"
          progress={(production.runtime / 480) * 100} sub="of 480 min shift" />
      </div>

      {/* ── Main 3fr/2fr grid ───────────────────────────────────────────── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '3fr 2fr' }}>

        {/* Left — machine params */}
        <Card>
          <CardHeader>
            <CardTitle>Machine Parameters — Live</CardTitle>
            <StatusBadge status="RUNNING" />
          </CardHeader>
          <div className="p-4 flex flex-col gap-4">
            {/* 2×2 sensor grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Voltage',      val: fmt.dec1(sensors.voltage.val), unit: 'V',  color: 'blue',    pct: (sensors.voltage.val - 210) / 40 },
                { label: 'Power',        val: fmt.int(sensors.power.val),    unit: 'W',  color: 'amber',   pct: sensors.power.val / 5000 },
                { label: 'Vib X-Axis',   val: fmt.dec2(sensors.vibx.val),    unit: 'g',  color: vibStatus, pct: sensors.vibx.val / 5 },
                { label: 'Power Factor', val: fmt.dec2(sensors.pf.val),      unit: '',   color: 'teal',    pct: (sensors.pf.val - 0.7) / 0.3 },
              ].map(({ label, val, unit, color, pct }) => {
                const c = COLOR_MAP[color as keyof typeof COLOR_MAP];
                return (
                  <div
                    key={label}
                    className="rounded-xl p-3 relative overflow-hidden transition-theme"
                    style={{
                      background: `linear-gradient(135deg, ${c.hex}0A 0%, ${c.hex}04 100%)`,
                      border: `1px solid ${c.hex}22`,
                    }}
                  >
                    {/* Accent top bar */}
                    <div
                      className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl"
                      style={{ background: `linear-gradient(90deg, ${c.hex}, ${c.hex}44, transparent)` }}
                    />
                    <p
                      className="text-[9px] font-semibold uppercase tracking-[1.1px] mb-1"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {label}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`font-mono font-bold text-[22px] ${c.text}`}>{val}</span>
                      {unit && (
                        <span className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                          {unit}
                        </span>
                      )}
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-4)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, pct * 100)}%`,
                          background: c.hex,
                          boxShadow: `0 0 6px ${c.hex}80`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sparkline */}
            <div>
              <p
                className="text-[9px] uppercase tracking-[1px] mb-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Vibration X — 60s History
              </p>
              <div
                className="rounded-xl px-2 py-1"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Sparkline
                  data={history.vibx.length ? history.vibx : [1.2]}
                  color="teal"
                  threshold={sensors.vibx.threshold}
                  height={52}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Right — Donut + Quality */}
        <div className="flex flex-col gap-3">
          {/* Machine Time Distribution */}
          <Card>
            <CardHeader><CardTitle>Time Distribution</CardTitle></CardHeader>
            <div className="p-4 flex items-center gap-4">
              <DonutChart
                segments={[
                  { label: 'Runtime',  value: production.runtime,  color: 'teal'  },
                  { label: 'Setup',    value: production.setup,    color: 'amber' },
                  { label: 'Downtime', value: production.downtime, color: 'coral' },
                ]}
                centerValue={`${Math.round((production.runtime / total) * 100)}%`}
                centerLabel="runtime"
              />
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { label: 'Runtime',  val: production.runtime,  color: 'teal'  as const },
                  { label: 'Setup',    val: production.setup,    color: 'amber' as const },
                  { label: 'Downtime', val: production.downtime, color: 'coral' as const },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLOR_MAP[color].hex }} />
                    <span className="text-[11px] flex-1" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{val}m</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Product Quality */}
          <Card>
            <CardHeader><CardTitle>Product Quality</CardTitle></CardHeader>
            <div className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-xl p-3 text-center relative overflow-hidden"
                  style={{
                    background: 'rgba(0,223,184,0.07)',
                    border: '1px solid rgba(0,223,184,0.20)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-teal to-transparent" />
                  <p className="text-[9px] font-semibold text-teal/70 uppercase tracking-[1px] mb-1">QC Passed</p>
                  <span className="font-mono font-bold text-[22px] text-teal">{production.qcPass}</span>
                </div>
                <div
                  className="rounded-xl p-3 text-center relative overflow-hidden"
                  style={{
                    background: 'rgba(255,79,106,0.07)',
                    border: '1px solid rgba(255,79,106,0.20)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-coral to-transparent" />
                  <p className="text-[9px] font-semibold text-coral/70 uppercase tracking-[1px] mb-1">QC Failed</p>
                  <span className="font-mono font-bold text-[22px] text-coral">{production.qcFail}</span>
                </div>
              </div>

              {/* FPY */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>First Pass Yield</span>
                  <span className="font-mono text-[11px] text-green">{production.fpy}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${production.fpy}%`,
                      background: 'linear-gradient(90deg, #2DD898, #00DFB8)',
                      boxShadow: '0 0 8px rgba(45,216,152,0.5)',
                    }}
                  />
                </div>
              </div>

              {/* Weight row */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'Initial', val: '2.84', unit: 'kg',  textColor: 'var(--text-primary)' },
                  { label: 'Final',   val: '2.71', unit: 'kg',  textColor: 'var(--text-primary)' },
                  { label: 'Scrap',   val: fmt.dec1(production.scrap), unit: '%', textColor: '#FF4F6A' },
                ].map(({ label, val, unit, textColor }) => (
                  <div key={label}>
                    <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                    <span className="font-mono font-semibold text-[14px]" style={{ color: textColor }}>
                      {val} <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ShiftClock({ start }: { start: number }) {
  const [elapsed, setElapsed] = useState(() => fmt.duration(Date.now() - start));
  useEffect(() => {
    const id = setInterval(() => setElapsed(fmt.duration(Date.now() - start)), 1000);
    return () => clearInterval(id);
  }, [start]);
  return <span className="font-mono font-semibold text-[16px] text-teal tabular-nums">{elapsed}</span>;
}
