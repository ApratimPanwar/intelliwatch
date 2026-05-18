import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Node, type Edge } from '@xyflow/react';

// ── Types ─────────────────────────────────────────────────────────────────────
export type RoleKey = 'operator' | 'supervisor' | 'owner';

interface RoleGraph {
  nodes: Node[];
  edges: Edge[];
}

// ── Edge helper ───────────────────────────────────────────────────────────────
const ed = (id: string, source: string, sourceHandle: string, target: string, stroke: string): Edge => ({
  id, source, sourceHandle, target, targetHandle: 'value',
  animated: true, style: { stroke, strokeWidth: 1.5, opacity: 0.6 },
});

// ── Default presets (mirroring the actual dashboard cards 1:1) ────────────────
// OPERATOR — every card from the Operator Dashboard, wired source → viz:
//   KPI strip:   Completed · Machine RPM · Current · Temperature · Near Misses · Runtime
//   Machine:     Voltage · Power · Vibration X · Power Factor · Vibration X 60s history
//   Time dist:   Setup Time · Downtime
//   Quality:     QC Passed · QC Failed · First Pass Yield · Scrap Rate
export const OPERATOR_NODES: Node[] = [
  // ── Sources (left column) ──────────────────────────────────────────────────
  { id:'src-rpm',    type:'sensorNode', position:{x:40, y:20},   data:{nodeType:'rpm-sensor',     label:'RPM Sensor'    } },
  { id:'src-temp',   type:'sensorNode', position:{x:40, y:130},  data:{nodeType:'temp-sensor',    label:'Temp Sensor'   } },
  { id:'src-cur',    type:'sensorNode', position:{x:40, y:240},  data:{nodeType:'current-sensor', label:'Current Sensor'} },
  { id:'src-vib',    type:'sensorNode', position:{x:40, y:350},  data:{nodeType:'vibration',      label:'Vibration'     } },
  { id:'src-power',  type:'sensorNode', position:{x:40, y:520},  data:{nodeType:'energy-meter',   label:'Power Meter'   } },
  { id:'src-prod',   type:'sensorNode', position:{x:40, y:700},  data:{nodeType:'production',     label:'Production'    } },
  { id:'src-safety', type:'sensorNode', position:{x:40, y:1020}, data:{nodeType:'safety-events',  label:'Safety Events' } },

  // ── VIZ widgets — 3-col grid, one card per Operator Dashboard element ───────
  // Row 0 — KPI strip
  { id:'v-completed', type:'sensorNode', position:{x:360, y:20},  data:{nodeType:'kpi-card',     label:'Completed',        settings:{color:'teal',  unit:'pcs', max:200 }} },
  { id:'v-rpm',       type:'sensorNode', position:{x:620, y:20},  data:{nodeType:'kpi-card',     label:'Machine RPM',      settings:{color:'blue',  unit:'RPM', max:1600}} },
  { id:'v-current',   type:'sensorNode', position:{x:880, y:20},  data:{nodeType:'kpi-card',     label:'Current',          settings:{color:'coral', unit:'A',   max:22  }} },
  // Row 1 — KPI strip
  { id:'v-temp',      type:'sensorNode', position:{x:360, y:180}, data:{nodeType:'kpi-card',     label:'Temperature',      settings:{color:'amber', unit:'°C',  max:100 }} },
  { id:'v-nearmiss',  type:'sensorNode', position:{x:620, y:180}, data:{nodeType:'kpi-card',     label:'Near Misses',      settings:{color:'coral', unit:'',    max:10  }} },
  { id:'v-runtime',   type:'sensorNode', position:{x:880, y:180}, data:{nodeType:'kpi-card',     label:'Runtime',          settings:{color:'green', unit:'min', max:480 }} },
  // Row 2 — Machine parameters
  { id:'v-voltage',   type:'sensorNode', position:{x:360, y:340}, data:{nodeType:'kpi-card',     label:'Voltage',          settings:{color:'blue',  unit:'V',   max:250 }} },
  { id:'v-power',     type:'sensorNode', position:{x:620, y:340}, data:{nodeType:'kpi-card',     label:'Power',            settings:{color:'amber', unit:'W',   max:5000}} },
  { id:'v-vibx',      type:'sensorNode', position:{x:880, y:340}, data:{nodeType:'kpi-card',     label:'Vibration X-Axis', settings:{color:'teal',  unit:'g',   max:5   }} },
  // Row 3 — Machine parameters + time distribution
  { id:'v-pf',        type:'sensorNode', position:{x:360, y:500}, data:{nodeType:'kpi-card',     label:'Power Factor',     settings:{color:'teal',  unit:'',    max:1   }} },
  { id:'v-vibhist',   type:'sensorNode', position:{x:620, y:500}, data:{nodeType:'sparkline',    label:'Vibration X — 60s',settings:{color:'teal',  unit:'g'            }} },
  { id:'v-setup',     type:'sensorNode', position:{x:880, y:500}, data:{nodeType:'kpi-card',     label:'Setup Time',       settings:{color:'amber', unit:'min', max:480 }} },
  // Row 4 — time distribution + quality
  { id:'v-downtime',  type:'sensorNode', position:{x:360, y:660}, data:{nodeType:'kpi-card',     label:'Downtime',         settings:{color:'coral', unit:'min', max:480 }} },
  { id:'v-qcpass',    type:'sensorNode', position:{x:620, y:660}, data:{nodeType:'kpi-card',     label:'QC Passed',        settings:{color:'green', unit:'pcs', max:200 }} },
  { id:'v-qcfail',    type:'sensorNode', position:{x:880, y:660}, data:{nodeType:'kpi-card',     label:'QC Failed',        settings:{color:'coral', unit:'pcs', max:50  }} },
  // Row 5 — quality
  { id:'v-fpy',       type:'sensorNode', position:{x:360, y:820}, data:{nodeType:'progress-bar', label:'First Pass Yield', settings:{color:'green', unit:'%',   max:100 }} },
  { id:'v-scrap',     type:'sensorNode', position:{x:620, y:820}, data:{nodeType:'kpi-card',     label:'Scrap Rate',       settings:{color:'coral', unit:'%',   max:100 }} },
];
export const OPERATOR_EDGES: Edge[] = [
  ed('oe-completed', 'src-prod',   'completed', 'v-completed', '#00DFB8'),
  ed('oe-rpm',       'src-rpm',    'value',     'v-rpm',       '#4B9FFF'),
  ed('oe-current',   'src-cur',    'value',     'v-current',   '#FF4F6A'),
  ed('oe-temp',      'src-temp',   'value',     'v-temp',      '#FFB020'),
  ed('oe-nearmiss',  'src-safety', 'nearMiss',  'v-nearmiss',  '#FF4F6A'),
  ed('oe-runtime',   'src-prod',   'runtime',   'v-runtime',   '#2DD898'),
  ed('oe-voltage',   'src-power',  'voltage',   'v-voltage',   '#4B9FFF'),
  ed('oe-power',     'src-power',  'power',     'v-power',     '#FFB020'),
  ed('oe-vibx',      'src-vib',    'x',         'v-vibx',      '#00DFB8'),
  ed('oe-pf',        'src-power',  'pf',        'v-pf',        '#00DFB8'),
  ed('oe-vibhist',   'src-vib',    'x',         'v-vibhist',   '#00DFB8'),
  ed('oe-setup',     'src-prod',   'setup',     'v-setup',     '#FFB020'),
  ed('oe-downtime',  'src-prod',   'downtime',  'v-downtime',  '#FF4F6A'),
  ed('oe-qcpass',    'src-prod',   'qcPass',    'v-qcpass',    '#2DD898'),
  ed('oe-qcfail',    'src-prod',   'qcFail',    'v-qcfail',    '#FF4F6A'),
  ed('oe-fpy',       'src-prod',   'fpy',       'v-fpy',       '#2DD898'),
  ed('oe-scrap',     'src-prod',   'scrap',     'v-scrap',     '#FF4F6A'),
];

// SUPERVISOR — every card from the Supervisor Dashboard, varied viz types:
//   OEE strip:   OEE (gauge) · Availability (kpi) · Performance (bullet) · Quality (bullet)
//   Alerts:      Active Alerts (alert-badge) · Near Misses (stat-trend)
//   Cameras:     4× Camera coverage (heat-level)
//   Status:      Worker Productivity (bar-chart) · Machine Status (donut)
//   Breakdown:   Productivity Breakdown (donut) · SDLR Diagnostic (kpi)
export const SUPERVISOR_NODES: Node[] = [
  // ── Sources ────────────────────────────────────────────────────────────────
  { id:'sp-src-oee',    type:'sensorNode', position:{x:40, y:60},  data:{nodeType:'oee-metrics',   label:'OEE Metrics'  } },
  { id:'sp-src-safety', type:'sensorNode', position:{x:40, y:280}, data:{nodeType:'safety-events', label:'Safety Events'} },

  // ── VIZ widgets — 3-col grid, one card per Supervisor Dashboard element ─────
  // Row 0 — OEE strip
  { id:'sp-oee',     type:'sensorNode', position:{x:360, y:20},  data:{nodeType:'gauge',       label:'OEE Score',    settings:{color:'amber',  unit:'%', max:100}} },
  { id:'sp-avail',   type:'sensorNode', position:{x:620, y:20},  data:{nodeType:'kpi-card',    label:'Availability', settings:{color:'blue',   unit:'%', max:100}} },
  { id:'sp-perf',    type:'sensorNode', position:{x:880, y:20},  data:{nodeType:'bullet-gauge',label:'Performance',  settings:{color:'purple', unit:'%', max:100}} },
  // Row 1 — OEE strip + alerts
  { id:'sp-qual',    type:'sensorNode', position:{x:360, y:190}, data:{nodeType:'bullet-gauge',label:'Quality',      settings:{color:'green',  unit:'%', max:100}} },
  { id:'sp-alerts',  type:'sensorNode', position:{x:620, y:190}, data:{nodeType:'alert-badge', label:'Active Alerts'                                          }} ,
  { id:'sp-cam1',    type:'sensorNode', position:{x:880, y:190}, data:{nodeType:'heat-level',  label:'Cam 1 Zone A', settings:{color:'teal',   unit:'%', value:92, max:100}} },
  // Row 2 — cameras
  { id:'sp-cam2',    type:'sensorNode', position:{x:360, y:360}, data:{nodeType:'heat-level',  label:'Cam 2 Zone B', settings:{color:'amber',  unit:'%', value:78, max:100}} },
  { id:'sp-cam3',    type:'sensorNode', position:{x:620, y:360}, data:{nodeType:'heat-level',  label:'Cam 3 Zone C', settings:{color:'coral',  unit:'%', value:55, max:100}} },
  { id:'sp-cam4',    type:'sensorNode', position:{x:880, y:360}, data:{nodeType:'heat-level',  label:'Cam 4 Zone D', settings:{color:'teal',   unit:'%', value:88, max:100}} },
  // Row 3 — worker / machine status
  { id:'sp-workers', type:'sensorNode', position:{x:360, y:530}, data:{nodeType:'bar-chart',   label:'Worker Productivity', settings:{color:'blue', unit:'%', series:[
    {label:'Prabhu',value:91},{label:'Ravi',value:38},{label:'Suresh',value:62},{label:'Anil',value:79},
    {label:'Deepak',value:57},{label:'Mohan',value:84},{label:'Vikram',value:78},{label:'Ganesh',value:88},
  ]}} },
  { id:'sp-machines',type:'sensorNode', position:{x:620, y:530}, data:{nodeType:'donut-chart', label:'Machine Status', settings:{color:'teal', segments:[
    {label:'Running',value:4,color:'teal'},{label:'Stopped',value:1,color:'coral'},
  ]}} },
  { id:'sp-nearmiss',type:'sensorNode', position:{x:880, y:530}, data:{nodeType:'stat-trend',  label:'Near Misses',  settings:{color:'coral'}} },
  // Row 4 — productivity breakdown
  { id:'sp-prodbrk', type:'sensorNode', position:{x:360, y:700}, data:{nodeType:'donut-chart', label:'Productivity Breakdown', settings:{color:'teal', segments:[
    {label:'Machining',value:48,color:'teal'},{label:'Setup',value:26,color:'blue'},
    {label:'Idle',value:14,color:'amber'},{label:'Movement loss',value:12,color:'coral'},
  ]}} },
  { id:'sp-sdlr',    type:'sensorNode', position:{x:620, y:700}, data:{nodeType:'kpi-card',    label:'SDLR Diagnostic', settings:{color:'amber', value:14.5, max:30}} },
];
export const SUPERVISOR_EDGES: Edge[] = [
  ed('se-oee',      'sp-src-oee',    'oee',          'sp-oee',     '#FFB020'),
  ed('se-avail',    'sp-src-oee',    'avail',        'sp-avail',   '#4B9FFF'),
  ed('se-perf',     'sp-src-oee',    'perf',         'sp-perf',    '#A466F5'),
  ed('se-qual',     'sp-src-oee',    'qual',         'sp-qual',    '#2DD898'),
  ed('se-alerts',   'sp-src-safety', 'activeAlerts', 'sp-alerts',  '#FF4F6A'),
  ed('se-nearmiss', 'sp-src-safety', 'nearMiss',     'sp-nearmiss','#FF4F6A'),
];

// OWNER — every card from the Factory Owner Dashboard, varied viz types:
//   KPI strip:   OEE (gauge) · Total Output (kpi) · Energy/Unit (bullet) · Scrap (bullet) · Incidents (kpi) · Cost Saved (kpi)
//   Trends:      OEE Trend (line) · Energy Consumption (line) · 7-Day FPY (bar)
//   Strategic:   Operator Productivity (bar) · Compliance Status (donut) · PPE Compliance (progress)
export const OWNER_NODES: Node[] = [
  // ── Source ─────────────────────────────────────────────────────────────────
  { id:'ow-src-oee', type:'sensorNode', position:{x:40, y:60}, data:{nodeType:'oee-metrics', label:'OEE Metrics'} },

  // ── VIZ widgets — 3-col grid, one card per Owner Dashboard element ──────────
  // Row 0 — KPI strip
  { id:'ow-oee',       type:'sensorNode', position:{x:360, y:20},  data:{nodeType:'gauge',       label:'OEE',           settings:{color:'amber', unit:'%',   max:100 }} },
  { id:'ow-output',    type:'sensorNode', position:{x:620, y:20},  data:{nodeType:'kpi-card',    label:'Total Output',  settings:{color:'teal',  unit:'pcs', value:1847, max:2500}} },
  { id:'ow-energy',    type:'sensorNode', position:{x:880, y:20},  data:{nodeType:'bullet-gauge',label:'Energy / Unit', settings:{color:'blue',  unit:'kWh', value:0.42, max:0.6}} },
  // Row 1 — KPI strip
  { id:'ow-scrap',     type:'sensorNode', position:{x:360, y:190}, data:{nodeType:'bullet-gauge',label:'Scrap Rate',    settings:{color:'coral', unit:'%',   value:3.8,  max:10 }} },
  { id:'ow-incidents', type:'sensorNode', position:{x:620, y:190}, data:{nodeType:'kpi-card',    label:'Incidents',     settings:{color:'coral', unit:'',    value:2,    max:10 }} },
  { id:'ow-cost',      type:'sensorNode', position:{x:880, y:190}, data:{nodeType:'kpi-card',    label:'Cost Saved',    settings:{color:'green', unit:'₹k',  value:14.2, max:30 }} },
  // Row 2 — trend charts
  { id:'ow-oeetrend',  type:'sensorNode', position:{x:360, y:360}, data:{nodeType:'line-chart',  label:'OEE Trend — 7 Days', settings:{color:'amber', unit:'%', series:[
    {label:'Mon',value:11.2},{label:'Tue',value:12.1},{label:'Wed',value:10.8},{label:'Thu',value:13.4},
    {label:'Fri',value:12.9},{label:'Sat',value:14.1},{label:'Sun',value:12.9},
  ]}} },
  { id:'ow-energytrend',type:'sensorNode',position:{x:620, y:360}, data:{nodeType:'line-chart',  label:'Energy — 7 Days', settings:{color:'blue', unit:' kWh/u', series:[
    {label:'Mon',value:0.48},{label:'Tue',value:0.45},{label:'Wed',value:0.47},{label:'Thu',value:0.43},
    {label:'Fri',value:0.42},{label:'Sat',value:0.44},{label:'Sun',value:0.42},
  ]}} },
  { id:'ow-fpy',       type:'sensorNode', position:{x:880, y:360}, data:{nodeType:'bar-chart',   label:'7-Day First Pass Yield', settings:{color:'green', unit:'%', series:[
    {label:'Mon',value:87},{label:'Tue',value:83},{label:'Wed',value:89},{label:'Thu',value:85},
    {label:'Fri',value:88},{label:'Sat',value:84},{label:'Sun',value:87},
  ]}} },
  // Row 3 — strategic
  { id:'ow-operators', type:'sensorNode', position:{x:360, y:530}, data:{nodeType:'bar-chart',   label:'Operator Productivity', settings:{color:'blue', unit:'%', series:[
    {label:'Ganesh',value:88},{label:'Prabhu',value:91},{label:'Mohan',value:84},{label:'Anil',value:79},
    {label:'Vikram',value:78},{label:'Suresh',value:62},{label:'Deepak',value:57},{label:'Ravi',value:38},
  ]}} },
  { id:'ow-compliance',type:'sensorNode', position:{x:620, y:530}, data:{nodeType:'donut-chart', label:'Compliance Status', settings:{color:'teal', segments:[
    {label:'Compliant',value:4,color:'teal'},{label:'Pending',value:2,color:'amber'},
  ]}} },
  { id:'ow-ppe',       type:'sensorNode', position:{x:880, y:530}, data:{nodeType:'progress-bar',label:'PPE Compliance', settings:{color:'amber', unit:'%', value:83, max:100}} },
];
export const OWNER_EDGES: Edge[] = [
  ed('owe-oee', 'ow-src-oee', 'oee', 'ow-oee', '#FFB020'),
];

const DEFAULT_GRAPHS: Record<RoleKey, RoleGraph> = {
  operator:   { nodes: OPERATOR_NODES,   edges: OPERATOR_EDGES },
  supervisor: { nodes: SUPERVISOR_NODES, edges: SUPERVISOR_EDGES },
  owner:      { nodes: OWNER_NODES,      edges: OWNER_EDGES },
};

// ── Store interface ───────────────────────────────────────────────────────────
interface NodeStoreState {
  graphs:      Record<RoleKey, RoleGraph>;
  activeRole:  RoleKey;

  // Mirrors graphs[activeRole] — updated atomically with every role switch / edit
  nodes:      Node[];
  edges:      Edge[];

  setNodes:   (n: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges:   (e: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  switchRole: (role: RoleKey) => void;
  resetRole:  (role: RoleKey) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useNodeStore = create<NodeStoreState>()(
  persist(
    (set) => ({
      graphs:     DEFAULT_GRAPHS,
      activeRole: 'operator',
      nodes:      OPERATOR_NODES,
      edges:      OPERATOR_EDGES,

      setNodes: (n) => set((st) => {
        const next = typeof n === 'function' ? n(st.nodes) : n;
        return {
          nodes:  next,
          graphs: { ...st.graphs, [st.activeRole]: { ...st.graphs[st.activeRole], nodes: next } },
        };
      }),

      setEdges: (e) => set((st) => {
        const next = typeof e === 'function' ? e(st.edges) : e;
        return {
          edges:  next,
          graphs: { ...st.graphs, [st.activeRole]: { ...st.graphs[st.activeRole], edges: next } },
        };
      }),

      switchRole: (role) => set((st) => {
        const g = st.graphs[role];
        return {
          activeRole: role,
          nodes:      g.nodes,
          edges:      g.edges,
        };
      }),

      resetRole: (role) => set((st) => {
        const def = DEFAULT_GRAPHS[role];
        const graphs = { ...st.graphs, [role]: def };
        if (st.activeRole !== role) return { graphs };
        return {
          graphs,
          nodes: def.nodes,
          edges: def.edges,
        };
      }),
    }),
    {
      name: 'intelliwatch-nodes',
      version: 6,
      migrate: (_old: unknown, _ver) => {
        // v6: supervisor + owner graphs rebuilt to mirror their dashboards 1:1
        return {
          graphs:     DEFAULT_GRAPHS,
          activeRole: 'operator',
          nodes:      DEFAULT_GRAPHS.operator.nodes,
          edges:      DEFAULT_GRAPHS.operator.edges,
        };
      },
    },
  ),
);
