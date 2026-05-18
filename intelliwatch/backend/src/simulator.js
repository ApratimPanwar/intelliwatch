/**
 * Fake sensor simulator.
 * Later: replace createSimulator() with a PostgreSQL / MQTT adapter
 * by exporting a different factory from adapters/postgres.js etc.
 */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const jitter = (val, pct = 0.04) => val + (Math.random() - 0.5) * 2 * val * pct;
const uid = () => Math.random().toString(36).slice(2, 9);

export function createSimulator() {
  // ── Sensor definitions ─────────────────────────────────────────────────────
  const sensors = {
    rpm:     { val: 1420, nom: 1420, min: 0,   max: 1600, unit: 'RPM',    warnPct: 15 },
    temp:    { val: 62,   nom: 62,   min: 0,   max: 100,  unit: '°C',     threshold: 75 },
    current: { val: 12.4, nom: 12.4, min: 0,   max: 22,   unit: 'A',      threshold: 20 },
    voltage: { val: 236,  nom: 236,  min: 210, max: 250,  unit: 'V',      threshold: 250 },
    power:   { val: 2920, nom: 2920, min: 0,   max: 5000, unit: 'W' },
    vibx:    { val: 1.2,  nom: 1.2,  min: 0,   max: 5,    unit: 'g',      threshold: 2.5 },
    viby:    { val: 0.9,  nom: 0.9,  min: 0,   max: 5,    unit: 'g',      threshold: 2.5 },
    vibz:    { val: 0.4,  nom: 0.4,  min: 0,   max: 5,    unit: 'g',      threshold: 2.5 },
    pf:      { val: 0.87, nom: 0.87, min: 0.7, max: 1.0,  unit: '' },
    energy:  { val: 0.42, nom: 0.42, min: 0,   max: 2,    unit: 'kWh/u',  threshold: 0.8 },
  };

  // ── Production ─────────────────────────────────────────────────────────────
  const production = {
    completed: 97, target: 200,
    qcPass: 91, qcFail: 6,
    runtime: 214, setup: 110, downtime: 90,
    fpy: 93.8, scrap: 14.0,
  };

  // ── OEE ────────────────────────────────────────────────────────────────────
  const oee = { availability: 85.4, performance: 76, quality: 20 };

  // ── Safety ─────────────────────────────────────────────────────────────────
  const safety = { nearMiss: 1, accidents: 0 };

  // ── Thresholds (editable at runtime) ──────────────────────────────────────
  let thresholds = {
    temp: 75, vibration: 2.5, current: 20, rpmDevPct: 15,
  };

  // ── Alerts ─────────────────────────────────────────────────────────────────
  const alerts = [
    { id: uid(), level: 'critical', icon: '⚠', title: 'PPE Violation — W-02', sub: 'Helmet not detected · Camera 3 · 09:38', confidence: 'confirmed', time: '09:38', acked: false },
    { id: uid(), level: 'warning',  icon: '↕', title: 'Unsafe posture — W-03', sub: 'Overhead reach sustained 4s · 09:27',     confidence: 'probable',  time: '09:27', acked: false },
    { id: uid(), level: 'warning',  icon: '⏱', title: 'Idle time — W-02',      sub: 'No activity for 18 min · 09:15',          confidence: 'confirmed', time: '09:15', acked: false },
    { id: uid(), level: 'warning',  icon: '🌡', title: 'Temp elevated — MILL-01',sub: '71°C · threshold 75°C · 08:54',         confidence: 'confirmed', time: '08:54', acked: false },
    { id: uid(), level: 'info',     icon: 'ℹ', title: 'Cam 3 quality degraded', sub: 'Detection quality 55% · check lens · 08:40',confidence:'confirmed',time: '08:40', acked: false },
  ];

  // ── Workers ────────────────────────────────────────────────────────────────
  const workers = [
    { id: 'W-01', name: 'Prabhu',  role: 'CNC Operator', status: 'SAFE',  prod: 91 },
    { id: 'W-02', name: 'Ravi',    role: 'Assembly',      status: 'ALERT', prod: 38 },
    { id: 'W-03', name: 'Suresh',  role: 'Lathe',         status: 'WATCH', prod: 62 },
    { id: 'W-04', name: 'Anil',    role: 'Material',      status: 'SAFE',  prod: 79 },
    { id: 'W-05', name: 'Deepak',  role: 'Fabrication',   status: 'WATCH', prod: 57 },
    { id: 'W-06', name: 'Mohan',   role: 'CNC Op.',       status: 'SAFE',  prod: 84 },
    { id: 'W-07', name: 'Vikram',  role: 'Assembly',      status: 'SAFE',  prod: 78 },
    { id: 'W-08', name: 'Ganesh',  role: 'QC',            status: 'SAFE',  prod: 88 },
  ];

  // ── Machines ───────────────────────────────────────────────────────────────
  const machines = [
    { id: 'CNC-01',   type: 'CNC Lathe', status: 'RUNNING', rpm: 1420, temp: 62,  vib: 1.2 },
    { id: 'CNC-02',   type: 'CNC Lathe', status: 'RUNNING', rpm: 1380, temp: 58,  vib: 0.9 },
    { id: 'MILL-01',  type: 'Milling',   status: 'RUNNING', rpm: 920,  temp: 71,  vib: 1.8 },
    { id: 'MILL-02',  type: 'Milling',   status: 'STOPPED', rpm: 0,    temp: 34,  vib: 0.1 },
    { id: 'LATHE-01', type: 'Lathe',     status: 'RUNNING', rpm: 780,  temp: 55,  vib: 0.7 },
  ];

  // ── History buffers (for sparklines / trends) ──────────────────────────────
  const history = { vibx: [], rpm: [], temp: [] };
  const MAX_HISTORY = 60;

  // ── Shift start time ───────────────────────────────────────────────────────
  const shiftStart = Date.now() - 214 * 60 * 1000; // pretend 214 min elapsed

  // ── Internal tick ──────────────────────────────────────────────────────────
  function tick() {
    // Jitter sensors
    for (const [key, s] of Object.entries(sensors)) {
      if (key === 'power') continue;
      s.val = clamp(jitter(s.nom), s.min, s.max);
    }
    sensors.power.val = Math.round(sensors.voltage.val * sensors.current.val * sensors.pf.val);

    // Accumulate history
    for (const key of Object.keys(history)) {
      history[key].push(+(sensors[key].val.toFixed(3)));
      if (history[key].length > MAX_HISTORY) history[key].shift();
    }

    // Return sensors + latest history slice (last 60 pts)
    return { sensors: getSensors(), history };
  }

  function getSensors() {
    const out = {};
    for (const [k, s] of Object.entries(sensors)) {
      out[k] = { val: +s.val.toFixed(3), unit: s.unit, nom: s.nom, min: s.min, max: s.max };
      if (s.threshold !== undefined) out[k].threshold = s.threshold;
      if (s.warnPct   !== undefined) out[k].warnPct = s.warnPct;
    }
    return out;
  }

  function getState() {
    return {
      sensors: getSensors(),
      production,
      oee,
      safety,
      alerts,
      workers,
      machines,
      thresholds,
      history,
      shiftStart,
      ts: Date.now(),
    };
  }

  function setThresholds(t) {
    Object.assign(thresholds, t);
    // Sync back into sensor definitions
    if (t.temp)      sensors.temp.threshold    = t.temp;
    if (t.vibration) { sensors.vibx.threshold = sensors.viby.threshold = sensors.vibz.threshold = t.vibration; }
    if (t.current)   sensors.current.threshold = t.current;
  }

  function getThresholds() { return { ...thresholds }; }

  function ackAlert(id) {
    const a = alerts.find(a => a.id === id);
    if (a) { a.acked = true; return true; }
    return false;
  }

  return { tick, getState, getSensors, setThresholds, getThresholds, ackAlert };
}
