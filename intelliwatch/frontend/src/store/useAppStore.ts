import { create } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────
export type SensorKey = 'rpm'|'temp'|'current'|'voltage'|'power'|'vibx'|'viby'|'vibz'|'pf'|'energy';
export interface Sensor { val: number; unit: string; nom: number; min: number; max: number; threshold?: number; warnPct?: number; }
export interface Worker { id: string; name: string; role: string; status: 'SAFE'|'ALERT'|'WATCH'; prod: number; }
export interface Machine { id: string; type: string; status: 'RUNNING'|'STOPPED'; rpm: number; temp: number; vib: number; }
export interface Alert { id: string; level: 'critical'|'warning'|'info'; icon: string; title: string; sub: string; confidence: string; time: string; acked: boolean; }
export interface OEE { availability: number; performance: number; quality: number; }
export interface Production { completed: number; target: number; qcPass: number; qcFail: number; runtime: number; setup: number; downtime: number; fpy: number; scrap: number; }

export type Tab = 'operator' | 'supervisor' | 'owner' | 'nodebuilder' | 'workspace';

export interface AppState {
  // Connection
  connected: boolean;
  setConnected: (v: boolean) => void;

  // Active tab
  activeTab: Tab;
  setTab: (t: Tab) => void;

  // Live data
  sensors: Record<SensorKey, Sensor>;
  production: Production;
  oee: OEE;
  safety: { nearMiss: number; accidents: number };
  alerts: Alert[];
  workers: Worker[];
  machines: Machine[];
  thresholds: { temp: number; vibration: number; current: number; rpmDevPct: number };
  history: { vibx: number[]; rpm: number[]; temp: number[] };
  shiftStart: number;

  // Actions
  patchTick: (payload: {
    sensors?: Partial<Record<SensorKey, Sensor>>;
    history?: AppState['history'];
    oee?: Partial<AppState['oee']>;
    production?: Partial<AppState['production']>;
    safety?: Partial<AppState['safety']>;
  }) => void;
  fullSync: (state: Omit<AppState, 'connected'|'setConnected'|'activeTab'|'setTab'|'patchSensors'|'fullSync'|'ackAlert'|'setThresholds'>) => void;
  ackAlert: (id: string) => void;
  setThresholds: (t: Partial<AppState['thresholds']>) => void;
}

const SENSOR_DEFAULTS: Record<SensorKey, Sensor> = {
  rpm:     { val: 1420, nom: 1420, min: 0,   max: 1600, unit: 'RPM' },
  temp:    { val: 62,   nom: 62,   min: 0,   max: 100,  unit: '°C',    threshold: 75 },
  current: { val: 12.4, nom: 12.4, min: 0,   max: 22,   unit: 'A',     threshold: 20 },
  voltage: { val: 236,  nom: 236,  min: 210, max: 250,  unit: 'V' },
  power:   { val: 2920, nom: 2920, min: 0,   max: 5000, unit: 'W' },
  vibx:    { val: 1.2,  nom: 1.2,  min: 0,   max: 5,    unit: 'g',     threshold: 2.5 },
  viby:    { val: 0.9,  nom: 0.9,  min: 0,   max: 5,    unit: 'g',     threshold: 2.5 },
  vibz:    { val: 0.4,  nom: 0.4,  min: 0,   max: 5,    unit: 'g',     threshold: 2.5 },
  pf:      { val: 0.87, nom: 0.87, min: 0.7, max: 1.0,  unit: '' },
  energy:  { val: 0.42, nom: 0.42, min: 0,   max: 2,    unit: 'kWh/u', threshold: 0.8 },
};

export const useAppStore = create<AppState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  activeTab: 'operator',
  setTab: (activeTab) => set({ activeTab }),

  sensors: SENSOR_DEFAULTS,
  production: { completed: 97, target: 200, qcPass: 91, qcFail: 6, runtime: 214, setup: 110, downtime: 90, fpy: 93.8, scrap: 14.0 },
  oee: { availability: 85.4, performance: 76, quality: 20 },
  safety: { nearMiss: 1, accidents: 0 },
  alerts: [],
  workers: [],
  machines: [],
  thresholds: { temp: 75, vibration: 2.5, current: 20, rpmDevPct: 15 },
  history: { vibx: [], rpm: [], temp: [] },
  shiftStart: Date.now() - 214 * 60 * 1000,

  patchTick: ({ sensors: s, history: h, oee: o, production: p, safety: sf }) => set((st) => ({
    ...(s ? { sensors: { ...st.sensors, ...s } as Record<SensorKey, Sensor> } : {}),
    ...(h  ? { history:    h                          } : {}),
    ...(o  ? { oee:        { ...st.oee,        ...o  } } : {}),
    ...(p  ? { production: { ...st.production, ...p  } } : {}),
    ...(sf ? { safety:     { ...st.safety,     ...sf } } : {}),
  })),

  fullSync: (state) => set((st) => ({
    sensors: state.sensors ?? st.sensors,
    production: state.production ?? st.production,
    oee: state.oee ?? st.oee,
    safety: state.safety ?? st.safety,
    alerts: state.alerts ?? st.alerts,
    workers: state.workers ?? st.workers,
    machines: state.machines ?? st.machines,
    thresholds: state.thresholds ?? st.thresholds,
    history: state.history ?? st.history,
    shiftStart: state.shiftStart ?? st.shiftStart,
  })),

  ackAlert: (id) => set((st) => ({
    alerts: st.alerts.map((a) => a.id === id ? { ...a, acked: true } : a),
  })),

  setThresholds: (t) => set((st) => ({ thresholds: { ...st.thresholds, ...t } })),
}));
