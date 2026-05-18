import { type ClassValue, clsx } from 'clsx';
export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const fmt = {
  int:  (v: number) => Math.round(v).toLocaleString(),
  dec1: (v: number) => v.toFixed(1),
  dec2: (v: number) => v.toFixed(2),
  pct:  (v: number) => `${v.toFixed(1)}%`,
  pad2: (n: number) => String(n).padStart(2, '0'),
  duration: (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${fmt.pad2(Math.floor(s / 3600))}:${fmt.pad2(Math.floor((s % 3600) / 60))}:${fmt.pad2(s % 60)}`;
  },
};

export type SemanticColor = 'teal'|'amber'|'coral'|'blue'|'purple'|'green'|'pink';

export const COLOR_MAP: Record<SemanticColor, { text: string; bg: string; border: string; fill: string; hex: string }> = {
  teal:   { text: 'text-teal',   bg: 'bg-teal/10',   border: 'border-teal/25',   fill: '#00DFB8', hex: '#00DFB8' },
  amber:  { text: 'text-amber',  bg: 'bg-amber/10',  border: 'border-amber/25',  fill: '#FFB020', hex: '#FFB020' },
  coral:  { text: 'text-coral',  bg: 'bg-coral/10',  border: 'border-coral/25',  fill: '#FF4F6A', hex: '#FF4F6A' },
  blue:   { text: 'text-blue',   bg: 'bg-blue/10',   border: 'border-blue/25',   fill: '#4B9FFF', hex: '#4B9FFF' },
  purple: { text: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/25', fill: '#A466F5', hex: '#A466F5' },
  green:  { text: 'text-green',  bg: 'bg-green/10',  border: 'border-green/25',  fill: '#2DD898', hex: '#2DD898' },
  pink:   { text: 'text-pink',   bg: 'bg-pink/10',   border: 'border-pink/25',   fill: '#F472B6', hex: '#F472B6' },
};

export function sensorStatus(val: number, nom: number, threshold?: number, warnPct?: number): SemanticColor {
  if (threshold !== undefined && val >= threshold) return 'coral';
  if (warnPct    !== undefined) {
    const dev = Math.abs(val - nom) / nom * 100;
    if (dev > warnPct) return 'amber';
  }
  return 'teal';
}
