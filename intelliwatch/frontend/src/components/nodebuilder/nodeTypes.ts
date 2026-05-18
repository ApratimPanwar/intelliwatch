/** Registry of all node types available in the builder. */
export type PortType = 'num'|'arr'|'bool'|'str'|'any';
export type Category = 'SOURCE'|'TRANSFORM'|'VIZ';

export interface PortDef { id: string; type: PortType; label: string; }
export interface NodeTypeDef {
  label: string; icon: string; color: string;
  category: Category; desc: string;
  inputs: PortDef[]; outputs: PortDef[];
}

export const PORT_COLOR: Record<PortType, string> = {
  num: '#3D8EFF', arr: '#00D4A8', bool: '#F5A623', str: '#9B72F5', any: '#8B98B0',
};

export const NODE_TYPES_DEF: Record<string, NodeTypeDef> = {
  // ── Sources ─────────────────────────────────────────────────────────────
  'rpm-sensor':    { label:'RPM Sensor',    icon:'⚙',  color:'#3D8EFF', category:'SOURCE', desc:'A3144 Hall effect',        inputs:[], outputs:[{id:'value',type:'num',label:'value'}] },
  'temp-sensor':   { label:'Temperature',   icon:'🌡', color:'#9B72F5', category:'SOURCE', desc:'K-type thermocouple',      inputs:[], outputs:[{id:'value',type:'num',label:'value'}] },
  'current-sensor':{ label:'Current',       icon:'⚡', color:'#F5A623', category:'SOURCE', desc:'SCT-013-000',             inputs:[], outputs:[{id:'value',type:'num',label:'value'}] },
  'vibration':     { label:'Vibration',     icon:'〜', color:'#00D4A8', category:'SOURCE', desc:'ADXL335 3-axis',          inputs:[], outputs:[{id:'x',type:'num',label:'x'},{id:'y',type:'num',label:'y'},{id:'z',type:'num',label:'z'}] },
  'energy-meter':  { label:'Power Meter',   icon:'🔋', color:'#2DCE89', category:'SOURCE', desc:'PZEM-004T — V/A/W/PF',    inputs:[], outputs:[{id:'value',type:'num',label:'energy'},{id:'voltage',type:'num',label:'voltage'},{id:'current',type:'num',label:'current'},{id:'power',type:'num',label:'power'},{id:'pf',type:'num',label:'pf'}] },
  'proximity':     { label:'Proximity',     icon:'👁', color:'#F5A623', category:'SOURCE', desc:'HW-201 IR sensor',        inputs:[], outputs:[{id:'active',type:'bool',label:'active'}] },
  'production':    { label:'Production',    icon:'📦', color:'#00D4A8', category:'SOURCE', desc:'Parts / QC / time',       inputs:[], outputs:[{id:'completed',type:'num',label:'completed'},{id:'target',type:'num',label:'target'},{id:'runtime',type:'num',label:'runtime'},{id:'setup',type:'num',label:'setup'},{id:'downtime',type:'num',label:'downtime'},{id:'fpy',type:'num',label:'fpy'},{id:'scrap',type:'num',label:'scrap'},{id:'qcPass',type:'num',label:'qcPass'},{id:'qcFail',type:'num',label:'qcFail'}] },
  'operator-data': { label:'Operator Data', icon:'👷', color:'#9B72F5', category:'SOURCE', desc:'ID / name / shift',       inputs:[], outputs:[{id:'name',type:'str',label:'name'},{id:'runtime',type:'num',label:'runtime'}] },
  'oee-metrics':   { label:'OEE Metrics',   icon:'📊', color:'#F5A623', category:'SOURCE', desc:'Avail × Perf × Quality',  inputs:[], outputs:[{id:'oee',type:'num',label:'oee'},{id:'avail',type:'num',label:'avail'},{id:'perf',type:'num',label:'perf'},{id:'qual',type:'num',label:'qual'}] },
  'safety-events': { label:'Safety Events', icon:'⚠', color:'#FF5F5F', category:'SOURCE', desc:'Alerts / near miss',      inputs:[], outputs:[{id:'nearMiss',type:'num',label:'nearMiss'},{id:'accidents',type:'num',label:'accidents'},{id:'activeAlerts',type:'num',label:'activeAlerts'}] },
  // ── Transform ───────────────────────────────────────────────────────────
  'threshold':  { label:'Threshold', icon:'⊘', color:'#F5A623', category:'TRANSFORM', desc:'Threshold check',  inputs:[{id:'value',type:'num',label:'value'}],                         outputs:[{id:'alert',type:'bool',label:'alert'},{id:'ratio',type:'num',label:'ratio'}] },
  'compute':    { label:'Compute',   icon:'ƒ', color:'#3D8EFF', category:'TRANSFORM', desc:'Math operation',   inputs:[{id:'a',type:'num',label:'a'},{id:'b',type:'num',label:'b'}],   outputs:[{id:'result',type:'num',label:'result'}] },
  'aggregate':  { label:'Aggregate', icon:'Σ', color:'#2DCE89', category:'TRANSFORM', desc:'Aggregate values', inputs:[{id:'values',type:'arr',label:'values'}],                        outputs:[{id:'result',type:'num',label:'result'}] },
  'compare':    { label:'Compare',   icon:'Δ', color:'#F06292', category:'TRANSFORM', desc:'Delta comparison', inputs:[{id:'current',type:'num',label:'current'},{id:'baseline',type:'num',label:'baseline'}], outputs:[{id:'delta',type:'num',label:'delta%'}] },
  'filter':     { label:'Filter',    icon:'⊓', color:'#00D4A8', category:'TRANSFORM', desc:'Filter data',      inputs:[{id:'data',type:'any',label:'data'}],                           outputs:[{id:'filtered',type:'any',label:'filtered'}] },
  // ── Visualize ────────────────────────────────────────────────────────────
  'kpi-card':     { label:'KPI Card',     icon:'◈', color:'#00D4A8', category:'VIZ', desc:'Big number',      inputs:[{id:'value',type:'num',label:'value'},{id:'max',type:'num',label:'max'}], outputs:[] },
  'line-chart':   { label:'Line Chart',   icon:'∿', color:'#3D8EFF', category:'VIZ', desc:'Trend line',      inputs:[{id:'value',type:'num',label:'value'}], outputs:[] },
  'bar-chart':    { label:'Bar Chart',    icon:'▐', color:'#2DCE89', category:'VIZ', desc:'Bar chart',       inputs:[{id:'values',type:'arr',label:'values'}], outputs:[] },
  'donut-chart':  { label:'Donut Chart',  icon:'◎', color:'#9B72F5', category:'VIZ', desc:'Donut chart',     inputs:[{id:'values',type:'arr',label:'values'}], outputs:[] },
  'gauge':        { label:'Gauge',        icon:'◷', color:'#F5A623', category:'VIZ', desc:'Gauge meter',     inputs:[{id:'value',type:'num',label:'value'},{id:'max',type:'num',label:'max'}], outputs:[] },
  'sparkline':    { label:'Sparkline',    icon:'⌇', color:'#00D4A8', category:'VIZ', desc:'Mini trend',      inputs:[{id:'value',type:'num',label:'value'}], outputs:[] },
  'alert-badge':  { label:'Alert Badge',  icon:'🔔', color:'#FF5F5F', category:'VIZ', desc:'Alert display',   inputs:[{id:'value',type:'num',label:'value'}], outputs:[] },
  'progress-bar': { label:'Progress Bar', icon:'▬', color:'#2DCE89', category:'VIZ', desc:'Progress bar',    inputs:[{id:'value',type:'num',label:'value'},{id:'max',type:'num',label:'max'}], outputs:[] },
  'data-table':   { label:'Data Table',   icon:'⊞', color:'#3D8EFF', category:'VIZ', desc:'Data table',      inputs:[{id:'data',type:'any',label:'data'}], outputs:[] },
  'status-badge': { label:'Status Badge', icon:'◉', color:'#00D4A8', category:'VIZ', desc:'Status indicator', inputs:[{id:'value',type:'num',label:'value'},{id:'threshold',type:'num',label:'threshold'}], outputs:[] },
  // ── New VIZ types ────────────────────────────────────────────────────────
  'stat-trend':   { label:'Stat + Trend',  icon:'📈', color:'#00DFB8', category:'VIZ',    desc:'Number with sparkline',        inputs:[{id:'value',type:'num',label:'value'}], outputs:[] },
  'bullet-gauge': { label:'Bullet Gauge',  icon:'▶',  color:'#4B9FFF', category:'VIZ',    desc:'Value vs target bullet',       inputs:[{id:'value',type:'num',label:'value'},{id:'max',type:'num',label:'max'}], outputs:[] },
  'heat-level':   { label:'Heat Level',    icon:'🌡', color:'#FF4F6A', category:'VIZ',    desc:'Color-coded level bar',        inputs:[{id:'value',type:'num',label:'value'},{id:'max',type:'num',label:'max'}], outputs:[] },
  'text-label':   { label:'Text Label',    icon:'T',  color:'#9B72F5', category:'VIZ',    desc:'Static label/heading',         inputs:[], outputs:[] },
  'live-clock':   { label:'Live Clock',    icon:'⏱', color:'#6888A8', category:'VIZ',    desc:'Live clock display',           inputs:[], outputs:[] },
  // ── New SOURCE types ─────────────────────────────────────────────────────
  'connection-sensor': { label:'Connection', icon:'🔌', color:'#2DD898', category:'SOURCE', desc:'Server connection status', inputs:[], outputs:[{id:'connected',type:'bool',label:'connected'},{id:'latency',type:'num',label:'latency'}] },
};

export const PALETTE_SECTIONS: { label: string; keys: string[] }[] = [
  { label: 'Data Sources', keys: ['rpm-sensor','temp-sensor','current-sensor','vibration','energy-meter','proximity','production','operator-data','oee-metrics','safety-events','connection-sensor'] },
  { label: 'Transform',    keys: ['threshold','compute','aggregate','compare','filter'] },
  { label: 'Visualize',    keys: ['kpi-card','line-chart','bar-chart','donut-chart','gauge','sparkline','alert-badge','progress-bar','data-table','status-badge','stat-trend','bullet-gauge','heat-level','text-label','live-clock'] },
];
