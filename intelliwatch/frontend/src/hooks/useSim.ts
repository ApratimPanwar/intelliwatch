/**
 * Local sensor simulation — runs when no backend is connected.
 * Ticks every second: jitters sensors, drifts OEE metrics, increments production.
 */
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

const HISTORY_CAP = 80;

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function jitter(v: number, pct = 0.025) { return v * (1 + (Math.random() - 0.5) * pct); }
function push(arr: number[], v: number) {
  const n = [...arr, v];
  return n.length > HISTORY_CAP ? n.slice(n.length - HISTORY_CAP) : n;
}

// Slow drift — moves toward a target, with noise
function drift(cur: number, target: number, speed = 0.003, noise = 0.005) {
  return cur + (target - cur) * speed + cur * (Math.random() - 0.5) * noise;
}

let tickCount = 0;

export function useSim() {
  useEffect(() => {
    // Slow drift targets — vary over time
    let availTarget  = 85 + Math.random() * 10;
    let perfTarget   = 74 + Math.random() * 10;
    let qualTarget   = 18 + Math.random() * 8;

    const interval = setInterval(() => {
      const st = useAppStore.getState();
      if (st.connected) return; // real backend handles it
      tickCount++;

      // ── Sensors ────────────────────────────────────────────────────────────
      const s = st.sensors;
      const newRpm    = clamp(Math.round(jitter(s.rpm.val,    0.03)),  800, 1600);
      const newTemp   = clamp(+jitter(s.temp.val,   0.015).toFixed(1), 20,  95);
      const newCur    = clamp(+jitter(s.current.val, 0.02).toFixed(1),  4,  22);
      const newVibx   = clamp(+jitter(s.vibx.val,  0.08).toFixed(2),   0,   5);
      const newViby   = clamp(+jitter(s.viby.val,  0.08).toFixed(2),   0,   5);
      const newVibz   = clamp(+jitter(s.vibz.val,  0.08).toFixed(2),   0,   5);
      const newVolt   = clamp(+jitter(s.voltage.val, 0.004).toFixed(1),210, 250);
      const newPower  = clamp(Math.round(jitter(s.power.val, 0.03)),    0, 5000);
      const newEnergy = clamp(+jitter(s.energy.val,  0.01).toFixed(2),  0,   2);
      const newPf     = clamp(+jitter(s.pf.val,     0.004).toFixed(3), 0.7, 1.0);

      // ── History ────────────────────────────────────────────────────────────
      const h = st.history;
      const newHistory = {
        rpm:  push(h.rpm,  newRpm),
        temp: push(h.temp, newTemp),
        vibx: push(h.vibx, newVibx),
      };

      // ── OEE — slow drift every tick ────────────────────────────────────────
      // Occasionally shift the drift targets
      if (tickCount % 60 === 0) {
        availTarget = clamp(availTarget + (Math.random() - 0.5) * 8, 70, 98);
        perfTarget  = clamp(perfTarget  + (Math.random() - 0.5) * 10, 60, 96);
        qualTarget  = clamp(qualTarget  + (Math.random() - 0.5) * 6,  10, 30);
      }
      const newAvail  = clamp(+drift(st.oee.availability, availTarget, 0.004, 0.003).toFixed(1), 60, 99);
      const newPerf   = clamp(+drift(st.oee.performance,  perfTarget,  0.004, 0.004).toFixed(1), 50, 99);
      const newQual   = clamp(+drift(st.oee.quality,      qualTarget,  0.003, 0.003).toFixed(1),  5, 35);

      // ── Production — increment every ~10s ──────────────────────────────────
      const p = st.production;
      const shouldIncrement = tickCount % 10 === 0 && p.completed < p.target;
      const newCompleted = shouldIncrement ? p.completed + 1 : p.completed;
      const newQcPass    = shouldIncrement ? p.qcPass + (Math.random() > 0.06 ? 1 : 0) : p.qcPass;
      const newQcFail    = shouldIncrement ? p.qcFail + (Math.random() < 0.06 ? 1 : 0) : p.qcFail;
      const newFpy       = newCompleted > 0 ? +(newQcPass / newCompleted * 100).toFixed(1) : p.fpy;
      const newScrap     = newCompleted > 0 ? +(newQcFail / newCompleted * 100).toFixed(1) : p.scrap;
      const newRuntime   = Math.round((Date.now() - st.shiftStart) / 60000);

      st.patchTick({
        sensors: {
          rpm:     { ...s.rpm,     val: newRpm    },
          temp:    { ...s.temp,    val: newTemp   },
          current: { ...s.current, val: newCur    },
          vibx:    { ...s.vibx,    val: newVibx   },
          viby:    { ...s.viby,    val: newViby   },
          vibz:    { ...s.vibz,    val: newVibz   },
          voltage: { ...s.voltage, val: newVolt   },
          power:   { ...s.power,   val: newPower  },
          energy:  { ...s.energy,  val: newEnergy },
          pf:      { ...s.pf,      val: newPf     },
        },
        history: newHistory,
        oee: { availability: newAvail, performance: newPerf, quality: newQual },
        production: {
          completed: newCompleted,
          qcPass:    newQcPass,
          qcFail:    newQcFail,
          fpy:       newFpy,
          scrap:     newScrap,
          runtime:   newRuntime,
        },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
}
