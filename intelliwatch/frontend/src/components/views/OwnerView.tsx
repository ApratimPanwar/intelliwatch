import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle } from '../widgets/Card';
import { KPICard } from '../widgets/KPICard';
import { TrendLine, BarWidget } from '../widgets/Charts';
import { cn, COLOR_MAP } from '../../lib/utils';
import { DashboardHero } from '../widgets/DashboardHero';
import { MachineArt } from '../illustrations/MachiningArt';

const OEE_TREND    = [11.2, 12.1, 10.8, 13.4, 12.9, 14.1, 12.9].map((v, i) => ({ label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v }));
const ENERGY_TREND = [0.48, 0.45, 0.47, 0.43, 0.42, 0.44, 0.42].map((v, i) => ({ label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v }));
const QUALITY_DATA = [87, 83, 89, 85, 88, 84, 87].map((v, i) => ({ label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v }));

const OPERATORS = [
  { name: 'Ganesh', att: '100%', prod: 88, miss: 0, rank: 'A' },
  { name: 'Prabhu', att: '100%', prod: 91, miss: 1, rank: 'A' },
  { name: 'Mohan',  att: '97%',  prod: 84, miss: 0, rank: 'A' },
  { name: 'Anil',   att: '95%',  prod: 79, miss: 0, rank: 'B' },
  { name: 'Vikram', att: '93%',  prod: 78, miss: 0, rank: 'B' },
  { name: 'Suresh', att: '90%',  prod: 62, miss: 1, rank: 'C' },
  { name: 'Deepak', att: '88%',  prod: 57, miss: 1, rank: 'C' },
  { name: 'Ravi',   att: '82%',  prod: 38, miss: 2, rank: 'D' },
];

const RANK_COLOR: Record<string, string> = { A: 'text-teal', B: 'text-blue', C: 'text-amber', D: 'text-coral' };
const RANK_BG:    Record<string, string> = { A: 'bg-teal/10', B: 'bg-blue/10', C: 'bg-amber/10', D: 'bg-coral/10' };

const COMPLIANCE = [
  { name: 'Safety log retention',  val: '✓ 3 years',    color: 'text-teal'  },
  { name: 'PPE compliance',        val: '83%',           color: 'text-amber' },
  { name: 'DGFASLI export',        val: '✓ CSV ready',  color: 'text-teal'  },
  { name: 'DPDP privacy',          val: '✓ Posted',     color: 'text-teal'  },
  { name: 'Insurance report',      val: 'Due in 3 days', color: 'text-amber' },
  { name: 'Worker consent',        val: '✓ 8/8',        color: 'text-teal'  },
];

const INCIDENTS = [
  { date: '2024-01-15', type: 'PPE Violation',  worker: 'W-02',   status: 'Logged'   },
  { date: '2024-01-14', type: 'Near Miss',       worker: 'W-05',   status: 'Resolved' },
  { date: '2024-01-12', type: 'Unsafe Posture', worker: 'W-03',   status: 'Noted'    },
  { date: '2024-01-10', type: 'Equipment fault', worker: 'CNC-02', status: 'Resolved' },
];
const INC_COLOR: Record<string, string> = { Logged: 'text-coral', Resolved: 'text-teal', Noted: 'text-amber' };

export function OwnerView() {
  const { oee } = useAppStore();
  const oeeVal = (oee.availability * oee.performance * oee.quality / 10000).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Hero — portfolio OEE ────────────────────────────────────────── */}
      <DashboardHero
        eyebrow="Overall Equipment Effectiveness"
        title="Pavithra Industries — Bengaluru Unit"
        sub="12-month rolling window · strategic view"
        accent="#A466F5"
        bigValue={{
          value: oeeVal,
          unit: '%',
          delta: '↑ +8.2% YoY',
          deltaPositive: true,
          caption: 'vs 71.2% last year',
        }}
        illustration={
          <MachineArt type="lathe" size={170} detail strokeWidth={1.5}
            style={{ color: 'var(--text-secondary)' }} accent="#A466F5" />
        }
      />

      {/* Role header */}
      <Card cockpit className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏭</span>
          <div className="flex-1">
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
              Factory Owner Dashboard
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              Strategic view · Multi-shift history · Compliance tracking
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select
              className="rounded-lg text-[12px] px-3 py-1.5 focus:outline-none transition-theme"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <option>Today</option>
              <option>This week</option>
              <option>This month</option>
            </select>
            <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-teal/15 border border-teal/30 text-teal hover:bg-teal/25 transition-colors">
              ⬇ Export PDF
            </button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3">
        <KPICard label="OEE"           value={`${oeeVal}%`}  color="amber" trend={{ value: '2.1% vs last wk', positive: true }} noBar />
        <KPICard label="Total Output"  value="1,847"          color="teal"  sub="parts today"              noBar />
        <KPICard label="Energy / Unit" value="0.42"  unit="kWh" color="blue"  sub="▼ 0.03 vs target"      noBar />
        <KPICard label="Scrap Rate"    value="3.8%"           color="coral" sub="Above 3% threshold"       noBar />
        <KPICard label="Incidents"     value="2"              color="coral" sub="near misses today"         noBar />
        <KPICard label="Cost Saved"    value="₹14.2k"         color="green" sub="vs unmonitored baseline"  noBar />
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>OEE Trend — 7 Days</CardTitle></CardHeader>
          <div className="px-3 pb-3"><TrendLine data={OEE_TREND} color="amber" unit="%" /></div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Energy Consumption — 7 Days</CardTitle></CardHeader>
          <div className="px-3 pb-3"><TrendLine data={ENERGY_TREND} color="blue" unit=" kWh/u" /></div>
        </Card>
      </div>

      {/* Operator ranking + Compliance */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Operator Performance Ranking</CardTitle></CardHeader>
          <div className="p-3">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  <th className="text-left pb-2 font-medium">Operator</th>
                  <th className="text-left pb-2 font-medium">Attend.</th>
                  <th className="text-left pb-2 font-medium">Productivity</th>
                  <th className="text-center pb-2 font-medium">Misses</th>
                  <th className="text-center pb-2 font-medium">Rank</th>
                </tr>
              </thead>
              <tbody>
                {OPERATORS.map((op, i) => (
                  <tr
                    key={op.name}
                    style={{
                      color: 'var(--text-secondary)',
                      borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <td className="py-1.5 font-medium" style={{ color: 'var(--text-primary)' }}>{op.name}</td>
                    <td className="py-1.5 font-mono">{op.att}</td>
                    <td className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-4)' }}>
                          <div className="h-full rounded-full bg-teal" style={{ width: `${op.prod}%` }} />
                        </div>
                        <span className="font-mono text-[10px]">{op.prod}%</span>
                      </div>
                    </td>
                    <td className="py-1.5 text-center font-mono">{op.miss}</td>
                    <td className="py-1.5 text-center">
                      <span className={cn('font-mono font-semibold text-[12px] px-1.5 py-0.5 rounded', RANK_COLOR[op.rank], RANK_BG[op.rank])}>
                        {op.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Compliance Status</CardTitle></CardHeader>
          <div className="p-3 flex flex-col">
            {COMPLIANCE.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center justify-between py-2.5"
                style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}
              >
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                <span className={cn('font-mono font-semibold text-[12px]', c.color)}>{c.val}</span>
              </div>
            ))}
          </div>
          <div className="px-3 pb-3 flex gap-2">
            <button
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)',
              }}
            >
              ⬇ Incident log CSV
            </button>
            <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-teal/15 border border-teal/30 text-teal hover:bg-teal/25 transition-colors">
              Insurance report
            </button>
          </div>
        </Card>
      </div>

      {/* Quality chart + Incidents */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>7-Day First Pass Yield</CardTitle></CardHeader>
          <div className="px-3 pb-3"><BarWidget data={QUALITY_DATA} color="green" unit="%" /></div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Incident Log</CardTitle></CardHeader>
          <div className="p-3">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Type</th>
                  <th className="text-left pb-2 font-medium">Worker</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {INCIDENTS.map((inc, i) => (
                  <tr
                    key={i}
                    style={{
                      color: 'var(--text-secondary)',
                      borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <td className="py-2 font-mono text-[10px]">{inc.date}</td>
                    <td className="py-2">{inc.type}</td>
                    <td className="py-2 font-mono">{inc.worker}</td>
                    <td className={cn('py-2 font-medium', INC_COLOR[inc.status])}>{inc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
