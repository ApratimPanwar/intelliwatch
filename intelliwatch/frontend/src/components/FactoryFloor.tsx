import { useState, useRef, useCallback } from 'react';
import { X, LayoutGrid, ZoomIn, ZoomOut, RefreshCw, PenTool, Box } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { MachineArt, type MachineType } from './illustrations/MachiningArt';

/* ── Machine type definitions ──────────────────────────────────────────────── */
type MachineStatus = 'running' | 'idle' | 'warning' | 'down';

interface Machine {
  id: string;
  label: string;
  type: MachineType;
  status: MachineStatus;
  x: number;
  y: number;
  utilization?: number;
  cycleTime?: number;   // seconds / part
  output?: number;      // parts today
}

const STATUS_COLOR: Record<MachineStatus, string> = {
  running: '#2DD898',
  idle:    '#6888A8',
  warning: '#FFB020',
  down:    '#FF4F6A',
};

const STATUS_LABEL: Record<MachineStatus, string> = {
  running: 'Running',
  idle:    'Idle',
  warning: 'Warning',
  down:    'Down',
};

const TYPE_LABEL: Record<MachineType, string> = {
  cnc: 'CNC Machining Centre', lathe: 'CNC Lathe', drill: 'Drill Press',
  welder: 'Welding Station', assembly: 'Assembly Cell', conveyor: 'Conveyor Line',
  qc: 'CMM Inspection', robot: 'Articulated Robot',
};

/* ── Default machine layout ─────────────────────────────────────────────────── */
const DEFAULT_MACHINES: Machine[] = [
  { id: 'm1',  label: 'CNC-01',   type: 'cnc',      status: 'running', x:  40, y:  40, utilization: 87, cycleTime: 42, output: 312 },
  { id: 'm2',  label: 'CNC-02',   type: 'cnc',      status: 'running', x: 150, y:  40, utilization: 74, cycleTime: 48, output: 268 },
  { id: 'm3',  label: 'DRILL-01', type: 'drill',    status: 'idle',    x: 260, y:  40, utilization: 0,  cycleTime: 18, output: 0   },
  { id: 'm4',  label: 'DRILL-02', type: 'drill',    status: 'warning', x: 370, y:  40, utilization: 51, cycleTime: 21, output: 144 },
  { id: 'm5',  label: 'LATHE-01', type: 'lathe',    status: 'running', x:  40, y: 150, utilization: 92, cycleTime: 56, output: 401 },
  { id: 'm6',  label: 'LATHE-02', type: 'lathe',    status: 'down',    x: 150, y: 150, utilization: 0,  cycleTime: 60, output: 0   },
  { id: 'm7',  label: 'WELD-01',  type: 'welder',   status: 'running', x: 260, y: 150, utilization: 68, cycleTime: 95, output: 88  },
  { id: 'm8',  label: 'ASSM-01',  type: 'assembly', status: 'running', x: 370, y: 150, utilization: 83, cycleTime: 73, output: 156 },
  { id: 'm9',  label: 'CONV-01',  type: 'conveyor', status: 'running', x:  40, y: 250, utilization: 95, cycleTime: 8,  output: 980 },
  { id: 'm10', label: 'CONV-02',  type: 'conveyor', status: 'idle',    x: 205, y: 250, utilization: 0,  cycleTime: 8,  output: 0   },
  { id: 'm11', label: 'QC-01',    type: 'qc',       status: 'running', x: 370, y: 250, utilization: 61, cycleTime: 33, output: 214 },
  { id: 'm12', label: 'ROBOT-01', type: 'robot',    status: 'warning', x: 480, y:  95, utilization: 44, cycleTime: 27, output: 119 },
];

type ViewMode = 'schematic' | 'blueprint';

/* ── Main FactoryFloor Component ─────────────────────────────────────────────── */
interface FactoryFloorProps {
  onClose?: () => void;
}

export function FactoryFloor({ onClose }: FactoryFloorProps) {
  const { isDark } = useTheme();
  const [machines, setMachines] = useState<Machine[]>(DEFAULT_MACHINES);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('blueprint');
  const canvasRef = useRef<HTMLDivElement>(null);

  const blueprint = viewMode === 'blueprint';

  /* ── Drag handlers ──────────────────────────────────────────────────────── */
  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragging(id);
    setSelected(id);
    setDragOffset({
      x: e.clientX - rect.left - 44,
      y: e.clientY - rect.top - 44,
    });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const canvas = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min((e.clientX - canvas.left) / zoom - dragOffset.x - 44, canvas.width / zoom - 88));
    const newY = Math.max(0, Math.min((e.clientY - canvas.top)  / zoom - dragOffset.y - 44, 360 - 88));
    setMachines(ms => ms.map(m => m.id === dragging ? { ...m, x: newX, y: newY } : m));
  }, [dragging, dragOffset, zoom]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  const resetLayout = () => setMachines(DEFAULT_MACHINES);

  const selectedMachine = machines.find(m => m.id === selected);

  /* ── Status summary ─────────────────────────────────────────────────────── */
  const summary = {
    running: machines.filter(m => m.status === 'running').length,
    idle:    machines.filter(m => m.status === 'idle').length,
    warning: machines.filter(m => m.status === 'warning').length,
    down:    machines.filter(m => m.status === 'down').length,
  };

  return (
    <div
      className="rounded-xl overflow-hidden animate-fade-up"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow-lg)',
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <LayoutGrid size={14} style={{ color: '#F97316' }} />
        <span className="text-[12px] font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          FACTORY FLOOR — Machining Shop A
        </span>

        {/* Status pills */}
        <div className="flex items-center gap-1.5 ml-2">
          {(Object.entries(summary) as [MachineStatus, number][]).map(([s, n]) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                background: `rgba(${statusRgb(s)}, 0.12)`,
                color: STATUS_COLOR[s],
                border: `1px solid rgba(${statusRgb(s)}, 0.25)`,
              }}
            >
              {n} {s}
            </span>
          ))}
        </div>

        {/* Controls */}
        <div className="ml-auto flex items-center gap-1.5">
          {/* View mode toggle — the customisable illustration knob */}
          <div
            className="flex items-center rounded-md overflow-hidden mr-1"
            style={{ border: '1px solid var(--border-default)' }}
          >
            {([
              { id: 'schematic' as const, Icon: PenTool, label: 'Schematic' },
              { id: 'blueprint' as const, Icon: Box,     label: 'Blueprint' },
            ]).map(({ id, Icon, label }) => {
              const active = viewMode === id;
              return (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  title={`${label} view`}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all"
                  style={{
                    background: active ? 'rgba(249,115,22,0.14)' : 'transparent',
                    color: active ? '#F97316' : 'var(--text-tertiary)',
                  }}
                >
                  <Icon size={11} />
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setZoom(z => Math.min(1.6, +(z + 0.1).toFixed(1)))}
            className="w-6 h-6 rounded flex items-center justify-center transition-all"
            style={{ color: 'var(--text-tertiary)', background: 'var(--surface-2)' }}
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, +(z - 0.1).toFixed(1)))}
            className="w-6 h-6 rounded flex items-center justify-center transition-all"
            style={{ color: 'var(--text-tertiary)', background: 'var(--surface-2)' }}
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={resetLayout}
            className="w-6 h-6 rounded flex items-center justify-center transition-all"
            style={{ color: 'var(--text-tertiary)', background: 'var(--surface-2)' }}
            title="Reset layout"
          >
            <RefreshCw size={11} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center transition-all ml-1"
              style={{ color: 'var(--text-tertiary)', background: 'var(--surface-2)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Canvas + Detail panel ──────────────────────────────────────────── */}
      <div className="flex" style={{ height: 360 }}>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="factory-floor-canvas flex-1 relative overflow-hidden"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
        >
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100/zoom}%`, height: `${100/zoom}%` }}>
            {machines.map(machine => {
              const color = STATUS_COLOR[machine.status];
              const isSelected = selected === machine.id;
              const rgb = statusRgb(machine.status);
              // schematic → whole illustration tinted by status
              // blueprint → neutral line-art with a status accent (more technical)
              const artColor   = blueprint ? 'var(--text-secondary)' : color;
              const artAccent  = color;
              return (
                <div
                  key={machine.id}
                  className="machine-icon absolute flex flex-col items-center gap-1.5"
                  style={{ left: machine.x, top: machine.y, width: 88 }}
                  onMouseDown={e => onMouseDown(e, machine.id)}
                  onClick={() => setSelected(s => s === machine.id ? null : machine.id)}
                >
                  {/* Machine illustration tile */}
                  <div
                    className="w-[88px] h-[72px] rounded-xl flex items-center justify-center relative transition-all duration-150 overflow-hidden"
                    style={{
                      backgroundColor: isSelected
                        ? `rgba(${rgb}, ${isDark ? 0.14 : 0.10})`
                        : `rgba(${rgb}, ${isDark ? 0.06 : 0.05})`,
                      border: isSelected
                        ? `1.5px solid ${color}`
                        : `1px solid rgba(${rgb}, 0.28)`,
                      boxShadow: isSelected
                        ? `0 0 18px rgba(${rgb}, 0.30)`
                        : undefined,
                      backgroundImage: blueprint
                        ? `radial-gradient(currentColor 0.6px, transparent 0.6px)`
                        : undefined,
                      backgroundSize: blueprint ? '7px 7px' : undefined,
                      color: `rgba(${rgb}, ${isDark ? 0.16 : 0.13})`,
                    }}
                  >
                    {/* blueprint corner ticks */}
                    {blueprint && (
                      <>
                        <span className="absolute top-1 left-1 w-1.5 h-1.5 border-l border-t" style={{ borderColor: `rgba(${rgb},0.5)` }} />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 border-r border-t" style={{ borderColor: `rgba(${rgb},0.5)` }} />
                        <span className="absolute bottom-1 left-1 w-1.5 h-1.5 border-l border-b" style={{ borderColor: `rgba(${rgb},0.5)` }} />
                        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-r border-b" style={{ borderColor: `rgba(${rgb},0.5)` }} />
                      </>
                    )}
                    <MachineArt
                      type={machine.type}
                      size={66}
                      detail={blueprint}
                      strokeWidth={1.5}
                      style={{ color: artColor }}
                      accent={artAccent}
                    />
                    {/* Status dot */}
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{
                        background: color,
                        boxShadow: machine.status === 'running' ? `0 0 6px ${color}` : undefined,
                      }}
                    />
                  </div>
                  {/* Label */}
                  <span
                    className="text-[9px] font-mono font-semibold text-center leading-tight tracking-wide"
                    style={{ color: isSelected ? color : 'var(--text-tertiary)' }}
                  >
                    {machine.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel — blueprint showcase ─────────────────────────────── */}
        {selectedMachine && (
          <div
            className="w-60 flex-shrink-0 flex flex-col"
            style={{ borderLeft: '1px solid var(--border-subtle)', background: 'var(--surface-1)' }}
          >
            {/* Heading */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    background: `rgba(${statusRgb(selectedMachine.status)}, 0.14)`,
                    color: STATUS_COLOR[selectedMachine.status],
                  }}
                >
                  {STATUS_LABEL[selectedMachine.status]}
                </span>
                <span className="text-[9px] font-mono ml-auto" style={{ color: 'var(--text-tertiary)' }}>
                  {selectedMachine.id.toUpperCase()}
                </span>
              </div>
              <h3
                className="font-bold leading-none mt-2"
                style={{ color: 'var(--text-primary)', fontSize: 26, letterSpacing: '-0.02em' }}
              >
                {selectedMachine.label}
              </h3>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {TYPE_LABEL[selectedMachine.type]}
              </p>
            </div>

            {/* Large blueprint illustration */}
            <div
              className="mx-4 rounded-lg relative flex items-center justify-center overflow-hidden"
              style={{
                height: 116,
                border: `1px solid rgba(${statusRgb(selectedMachine.status)}, 0.25)`,
                backgroundColor: `rgba(${statusRgb(selectedMachine.status)}, ${isDark ? 0.05 : 0.04})`,
                backgroundImage: 'radial-gradient(currentColor 0.6px, transparent 0.6px)',
                backgroundSize: '8px 8px',
                color: `rgba(${statusRgb(selectedMachine.status)}, ${isDark ? 0.14 : 0.12})`,
              }}
            >
              <span className="absolute top-1.5 left-2 text-[8px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Fig. 01 — Elevation
              </span>
              <MachineArt
                type={selectedMachine.type}
                size={170}
                detail
                strokeWidth={1.5}
                style={{ color: 'var(--text-secondary)' }}
                accent={STATUS_COLOR[selectedMachine.status]}
              />
            </div>

            {/* Technical spec rows */}
            <div className="px-4 py-3 flex flex-col gap-2.5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Utilization</span>
                  <span className="text-[10px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedMachine.utilization ?? 0}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${selectedMachine.utilization ?? 0}%`,
                      background: STATUS_COLOR[selectedMachine.status],
                      boxShadow: `0 0 6px ${STATUS_COLOR[selectedMachine.status]}`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-0.5">
                <SpecCell label="Cycle Time" value={`${selectedMachine.cycleTime ?? '—'} s`} />
                <SpecCell label="Output Today" value={`${selectedMachine.output ?? 0}`} />
                <SpecCell label="Type Code" value={selectedMachine.type.toUpperCase()} />
                <SpecCell label="Position" value={`${Math.round(selectedMachine.x)},${Math.round(selectedMachine.y)}`} />
              </div>
            </div>

            <div
              className="mt-auto mx-4 mb-4 text-[9px] leading-relaxed rounded-lg p-2"
              style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)' }}
            >
              Drag machines to rearrange the floor. Toggle <span style={{ color: '#F97316' }}>Schematic / Blueprint</span> in the header to change the illustration style.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="text-[12px] font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>{value}</p>
    </div>
  );
}

function statusRgb(status: MachineStatus): string {
  const map: Record<MachineStatus, string> = {
    running: '45, 216, 152',
    idle:    '104, 136, 168',
    warning: '255, 176, 32',
    down:    '255, 79, 106',
  };
  return map[status];
}
