/**
 * MachiningArt — detailed, theme-aware line-art illustrations for the
 * hardcoded dashboards (Factory Floor, Supervisor, etc.).
 *
 * Design language (inspired by technical / blueprint reference art):
 *  • Pure line-art — every stroke is `currentColor`, so the illustration
 *    inherits the parent's text colour and works in BOTH light & dark mode.
 *  • An optional `accent` colour highlights a few key elements (status, etc.).
 *  • `vectorEffect="non-scaling-stroke"` keeps lines crisp at any size.
 *  • Construction lines, dimension ticks and dotted detail give the
 *    "technical drawing" feel — used mindfully, not everywhere.
 *
 * Everything here is presentational and self-contained — safe to drop into
 * any card. Customisable via props (size, accent, strokeWidth, detail).
 */
import type { CSSProperties } from 'react';

export type MachineType =
  | 'cnc' | 'lathe' | 'drill' | 'welder'
  | 'assembly' | 'conveyor' | 'qc' | 'robot';

interface ArtProps {
  /** Render width in px (height derived from the art's aspect ratio). */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Accent colour for key elements (spindle, tool, alert). Defaults to currentColor. */
  accent?: string;
  /** Base stroke width. Default 1.6. */
  strokeWidth?: number;
  /** Show dashed construction lines / dimension ticks. Default true. */
  detail?: boolean;
}

/* ── shared svg helpers ──────────────────────────────────────────────────── */
const VE = 'non-scaling-stroke' as const;

function Svg({
  vb, w, h, size, className, style, children,
}: {
  vb: string; w: number; h: number; size: number;
  className?: string; style?: CSSProperties; children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={vb}
      width={size}
      height={(size * h) / w}
      fill="none"
      className={className}
      style={style}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MACHINE ILLUSTRATIONS — 8 types, uniform 128×100 viewBox, "on the floor"
   ════════════════════════════════════════════════════════════════════════ */
export function MachineArt({
  type, size = 96, className, style, accent, strokeWidth = 1.6, detail = true,
}: ArtProps & { type: MachineType }) {
  const sw = strokeWidth;
  const thin = Math.max(0.75, sw * 0.62);
  const a = accent ?? 'currentColor';
  const C = 'currentColor';

  // Common floor + dimension ticks shared by every machine
  const Floor = (
    <g stroke={C}>
      <line x1="8" y1="91" x2="120" y2="91" strokeWidth={sw} vectorEffect={VE} />
      {detail && (
        <g strokeWidth={thin} opacity={0.55} vectorEffect={VE}>
          <line x1="14" y1="91" x2="11" y2="96" />
          <line x1="30" y1="91" x2="27" y2="96" />
          <line x1="46" y1="91" x2="43" y2="96" />
          <line x1="98" y1="91" x2="95" y2="96" />
          <line x1="114" y1="91" x2="111" y2="96" />
        </g>
      )}
    </g>
  );

  const art: Record<MachineType, React.ReactNode> = {
    /* ── CNC machining centre ───────────────────────────────────────────── */
    cnc: (
      <g>
        {Floor}
        {/* enclosure body */}
        <path d="M22 86 V36 L34 24 H92 L104 36 V86" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <path d="M22 36 H104" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <path d="M34 24 V14 H92 V24" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* viewing window */}
        <rect x="30" y="44" width="38" height="30" rx="2" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="30" y1="52" x2="68" y2="52" stroke={C} strokeWidth={thin} opacity={0.5} vectorEffect={VE} />
        {/* spindle column + head + tool */}
        <rect x="74" y="40" width="12" height="22" rx="1.5" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="80" y1="62" x2="80" y2="73" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        <circle cx="80" cy="74.5" r="1.6" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        {/* work table */}
        <path d="M40 78 H72 V74 H40 Z" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <rect x="50" y="71" width="12" height="3.5" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        {/* control panel */}
        <rect x="106" y="48" width="14" height="24" rx="1.5" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <rect x="109" y="52" width="8" height="6" rx="0.5" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="110.5" cy="64" r="1.3" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="115" cy="64" r="1.3" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* feet */}
        <line x1="28" y1="86" x2="28" y2="91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="98" y1="86" x2="98" y2="91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {detail && (
          <path d="M80 44 Q 60 38 50 50" stroke={C} strokeWidth={thin} strokeDasharray="2 2.5" opacity={0.5} vectorEffect={VE} />
        )}
      </g>
    ),

    /* ── Lathe ──────────────────────────────────────────────────────────── */
    lathe: (
      <g>
        {Floor}
        {/* bed */}
        <path d="M12 70 H116 V80 H12 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="12" y1="80" x2="22" y2="91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="116" y1="80" x2="106" y2="91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="60" y1="80" x2="60" y2="91" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* headstock */}
        <path d="M16 70 V40 H40 V70" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <circle cx="28" cy="54" r="9" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <circle cx="28" cy="54" r="4" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        <line x1="28" y1="45" x2="28" y2="48" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="28" y1="60" x2="28" y2="63" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* workpiece + centerline */}
        <path d="M37 54 H92 V58 H37 Z" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        {detail && (
          <line x1="34" y1="56" x2="100" y2="56" stroke={C} strokeWidth={thin} strokeDasharray="6 2 2 2" opacity={0.55} vectorEffect={VE} />
        )}
        {/* tool post */}
        <path d="M60 70 V64 H68 V70" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="64" y1="64" x2="64" y2="60" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        {/* tailstock */}
        <path d="M96 70 V48 H110 V70" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="92" y1="56" x2="96" y2="56" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="104" cy="42" r="3" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      </g>
    ),

    /* ── Drill press ────────────────────────────────────────────────────── */
    drill: (
      <g>
        {Floor}
        {/* base */}
        <path d="M30 91 H86 L80 82 H36 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* column */}
        <rect x="54" y="20" width="8" height="62" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {detail && (
          <line x1="58" y1="24" x2="58" y2="78" stroke={C} strokeWidth={thin} strokeDasharray="2 3" opacity={0.5} vectorEffect={VE} />
        )}
        {/* table */}
        <path d="M38 64 H62 V69 H38 Z" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <rect x="46" y="60" width="9" height="4" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        {/* head + motor */}
        <path d="M40 14 H78 V32 H40 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <ellipse cx="68" cy="23" rx="8" ry="6" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* spindle + bit */}
        <rect x="46" y="32" width="6" height="14" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="49" y1="46" x2="49" y2="58" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        <path d="M47 54 L49 60 L51 54" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        {/* feed handle */}
        <line x1="78" y1="26" x2="90" y2="22" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="91" cy="21.5" r="2" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      </g>
    ),

    /* ── Welding station ────────────────────────────────────────────────── */
    welder: (
      <g>
        {Floor}
        {/* power cabinet */}
        <path d="M14 91 V44 H42 V91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <rect x="19" y="50" width="18" height="10" rx="1" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="23" cy="68" r="2.4" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="33" cy="68" r="2.4" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* arm */}
        <path d="M42 52 L70 46 L86 60" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <circle cx="70" cy="46" r="3" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* torch */}
        <path d="M86 60 L92 70" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* workpiece on bench */}
        <path d="M70 84 H112 V88 H70 Z" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="78" y1="88" x2="78" y2="91" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="104" y1="88" x2="104" y2="91" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <rect x="84" y="78" width="16" height="6" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* arc + sparks */}
        <line x1="92" y1="71" x2="92" y2="77" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        <g stroke={a} strokeWidth={thin} vectorEffect={VE}>
          <line x1="92" y1="77" x2="97" y2="74" />
          <line x1="92" y1="77" x2="98" y2="79" />
          <line x1="92" y1="77" x2="95" y2="82" />
          <line x1="92" y1="77" x2="88" y2="82" />
        </g>
        {/* cable */}
        {detail && (
          <path d="M42 58 Q 56 74 70 60 T 86 62" stroke={C} strokeWidth={thin} strokeDasharray="2 2.5" opacity={0.55} vectorEffect={VE} />
        )}
      </g>
    ),

    /* ── Assembly station ───────────────────────────────────────────────── */
    assembly: (
      <g>
        {Floor}
        {/* workbench */}
        <path d="M20 70 H108 V77 H20 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="28" y1="77" x2="28" y2="91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="100" y1="77" x2="100" y2="91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* overhead gantry */}
        <path d="M30 18 H98 M34 18 V12 M94 18 V12" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="30" y1="18" x2="30" y2="70" stroke={C} strokeWidth={thin} opacity={0.6} vectorEffect={VE} />
        <line x1="98" y1="18" x2="98" y2="70" stroke={C} strokeWidth={thin} opacity={0.6} vectorEffect={VE} />
        {/* tool head on rail */}
        <rect x="58" y="20" width="14" height="9" rx="1" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="65" y1="29" x2="65" y2="44" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        <circle cx="65" cy="46" r="2.4" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        {/* parts / jigs on bench */}
        <rect x="32" y="60" width="14" height="10" rx="1" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <rect x="52" y="62" width="11" height="8" rx="1" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        <path d="M72 70 V62 H88 V70" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {detail && (
          <line x1="46" y1="65" x2="52" y2="65" stroke={C} strokeWidth={thin} strokeDasharray="2 2" opacity={0.5} vectorEffect={VE} />
        )}
      </g>
    ),

    /* ── Conveyor ───────────────────────────────────────────────────────── */
    conveyor: (
      <g>
        {Floor}
        {/* belt */}
        <line x1="14" y1="58" x2="114" y2="58" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="14" y1="70" x2="114" y2="70" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <path d="M14 58 A6 6 0 0 0 14 70" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <path d="M114 58 A6 6 0 0 1 114 70" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* rollers */}
        <circle cx="14" cy="64" r="6" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="114" cy="64" r="6" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="46" cy="64" r="3" stroke={C} strokeWidth={thin} opacity={0.6} vectorEffect={VE} />
        <circle cx="82" cy="64" r="3" stroke={C} strokeWidth={thin} opacity={0.6} vectorEffect={VE} />
        {/* support legs */}
        <path d="M30 70 L24 91 M30 70 L36 91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <path d="M98 70 L92 91 M98 70 L104 91" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* parts on belt */}
        <rect x="34" y="46" width="14" height="12" rx="1" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <rect x="62" y="48" width="11" height="10" rx="1" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        <rect x="86" y="49" width="9" height="9" rx="1" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* direction arrows */}
        {detail && (
          <g stroke={C} strokeWidth={thin} opacity={0.55} vectorEffect={VE}>
            <path d="M50 64 H58 M55 61 L58 64 L55 67" />
            <path d="M70 64 H78 M75 61 L78 64 L75 67" />
          </g>
        )}
      </g>
    ),

    /* ── QC / inspection ────────────────────────────────────────────────── */
    qc: (
      <g>
        {Floor}
        {/* inspection stage */}
        <path d="M28 80 H100 V86 H28 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="38" y1="86" x2="38" y2="91" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <line x1="90" y1="86" x2="90" y2="91" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* part under inspection */}
        <path d="M52 80 L58 70 H72 L78 80 Z" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        {/* CMM gantry */}
        <path d="M26 24 H104" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="30" y1="24" x2="30" y2="80" stroke={C} strokeWidth={thin} opacity={0.6} vectorEffect={VE} />
        <line x1="100" y1="24" x2="100" y2="80" stroke={C} strokeWidth={thin} opacity={0.6} vectorEffect={VE} />
        {/* probe carriage + probe */}
        <rect x="56" y="26" width="16" height="8" rx="1" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <line x1="64" y1="34" x2="64" y2="62" stroke={C} strokeWidth={thin} vectorEffect={VE} />
        <circle cx="64" cy="64" r="2.6" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        {/* check mark badge */}
        <circle cx="92" cy="46" r="8" stroke={a} strokeWidth={thin} vectorEffect={VE} />
        <path d="M88 46 L91 49 L96 43" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        {detail && (
          <line x1="64" y1="36" x2="64" y2="62" stroke={C} strokeWidth={thin} strokeDasharray="2 2" opacity={0.4} vectorEffect={VE} />
        )}
      </g>
    ),

    /* ── Articulated robot arm ──────────────────────────────────────────── */
    robot: (
      <g>
        {Floor}
        {/* base */}
        <path d="M44 91 H84 L78 80 H50 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <rect x="56" y="68" width="16" height="12" rx="1.5" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* joint 1 */}
        <circle cx="64" cy="66" r="4" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* segment 1 */}
        <path d="M64 66 L48 40" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* joint 2 */}
        <circle cx="48" cy="40" r="4" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* segment 2 */}
        <path d="M48 40 L82 28" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* joint 3 */}
        <circle cx="82" cy="28" r="3.4" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        {/* wrist + gripper */}
        <path d="M82 28 L96 36" stroke={C} strokeWidth={sw} vectorEffect={VE} />
        <path d="M96 36 L100 32 M96 36 L100 41" stroke={a} strokeWidth={sw} vectorEffect={VE} />
        {/* reach arc */}
        {detail && (
          <path d="M30 56 A 40 40 0 0 1 104 24" stroke={C} strokeWidth={thin} strokeDasharray="3 3" opacity={0.45} vectorEffect={VE} />
        )}
      </g>
    ),
  };

  return (
    <Svg vb="0 0 128 100" w={128} h={100} size={size} className={className} style={style}>
      {art[type]}
    </Svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   INCIDENT — a machining incident scene (tool breakage / collision event).
   Analogous to the reference "Incident Overview" car-collision illustration,
   re-imagined for a machining context.
   ════════════════════════════════════════════════════════════════════════ */
export function IncidentArt({
  size = 200, className, style, accent, strokeWidth = 1.6, detail = true,
}: ArtProps) {
  const sw = strokeWidth;
  const thin = Math.max(0.75, sw * 0.62);
  const a = accent ?? 'currentColor';
  const C = 'currentColor';
  return (
    <Svg vb="0 0 220 130" w={220} h={130} size={size} className={className} style={style}>
      {/* floor */}
      <line x1="14" y1="112" x2="206" y2="112" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {detail && (
        <g stroke={C} strokeWidth={thin} opacity={0.5} vectorEffect={VE}>
          <line x1="26" y1="112" x2="22" y2="119" />
          <line x1="190" y1="112" x2="186" y2="119" />
        </g>
      )}
      {/* spindle column + head */}
      <rect x="40" y="22" width="14" height="46" rx="2" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      <rect x="34" y="64" width="26" height="14" rx="2" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {/* snapped end-mill — upper stub still in spindle */}
      <line x1="47" y1="78" x2="47" y2="88" stroke={a} strokeWidth={sw} vectorEffect={VE} />
      <path d="M44 88 L47 91 L50 87" stroke={a} strokeWidth={thin} vectorEffect={VE} />
      {/* workpiece + fixture on table */}
      <path d="M96 104 H188 V96 H96 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      <line x1="108" y1="104" x2="108" y2="112" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      <line x1="176" y1="104" x2="176" y2="112" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      <path d="M120 96 L130 80 H150 L160 96 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {/* gouge / damage on workpiece */}
      <path d="M134 88 L138 84 L141 89 L145 85" stroke={a} strokeWidth={sw} vectorEffect={VE} />
      {/* flying broken fragments */}
      <g stroke={a} strokeWidth={thin} vectorEffect={VE}>
        <path d="M64 74 L72 70 L70 78 Z" />
        <path d="M78 60 L86 58 L83 66 Z" />
        <path d="M88 80 L95 82 L90 87 Z" />
        <circle cx="76" cy="86" r="1.6" />
        <circle cx="100" cy="66" r="1.4" />
        <circle cx="66" cy="58" r="1.2" />
      </g>
      {/* motion / impact lines */}
      {detail && (
        <g stroke={C} strokeWidth={thin} opacity={0.55} vectorEffect={VE}>
          <line x1="58" y1="50" x2="68" y2="46" />
          <line x1="56" y1="58" x2="64" y2="55" />
          <path d="M104 74 q 6 -6 12 -2" />
          <path d="M108 82 q 7 -4 13 1" />
        </g>
      )}
      {/* burst marker at point of impact */}
      <g stroke={a} strokeWidth={sw} vectorEffect={VE}>
        <line x1="92" y1="74" x2="92" y2="66" />
        <line x1="92" y1="74" x2="100" y2="72" />
        <line x1="92" y1="74" x2="86" y2="68" />
        <line x1="92" y1="74" x2="99" y2="80" />
      </g>
    </Svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCRAP — rejected parts in a bin (for scrap-rate context).
   ════════════════════════════════════════════════════════════════════════ */
export function ScrapArt({
  size = 170, className, style, accent, strokeWidth = 1.6, detail = true,
}: ArtProps) {
  const sw = strokeWidth;
  const thin = Math.max(0.75, sw * 0.62);
  const a = accent ?? 'currentColor';
  const C = 'currentColor';
  return (
    <Svg vb="0 0 180 130" w={180} h={130} size={size} className={className} style={style}>
      {/* bin */}
      <path d="M34 56 L42 116 H138 L146 56 Z" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      <path d="M28 56 H152" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {detail && (
        <g stroke={C} strokeWidth={thin} opacity={0.45} vectorEffect={VE}>
          <line x1="40" y1="72" x2="140" y2="72" />
          <line x1="42" y1="92" x2="138" y2="92" />
        </g>
      )}
      {/* reject part — bracket with X */}
      <path d="M58 40 H86 V52 H72 V64 H58 Z" stroke={a} strokeWidth={sw} vectorEffect={VE} />
      <path d="M62 44 L80 60 M80 44 L62 60" stroke={a} strokeWidth={thin} vectorEffect={VE} />
      {/* gear part */}
      <circle cx="108" cy="44" r="13" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      <circle cx="108" cy="44" r="4.5" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      <g stroke={C} strokeWidth={thin} vectorEffect={VE}>
        <line x1="108" y1="31" x2="108" y2="27" />
        <line x1="108" y1="57" x2="108" y2="61" />
        <line x1="95" y1="44" x2="91" y2="44" />
        <line x1="121" y1="44" x2="125" y2="44" />
        <line x1="99" y1="35" x2="96" y2="32" />
        <line x1="117" y1="53" x2="120" y2="56" />
      </g>
      {/* bent rod */}
      <path d="M48 30 Q 70 18 84 30 T 122 24" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {/* small chips at bottom */}
      <g stroke={C} strokeWidth={thin} opacity={0.7} vectorEffect={VE}>
        <path d="M58 104 L66 100 L64 108 Z" />
        <path d="M88 106 L96 103 L93 110 Z" />
        <circle cx="112" cy="104" r="2" />
        <path d="M120 100 L127 104 L121 108 Z" />
      </g>
    </Svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ENERGY — an industrial drive motor with field/current lines & a meter.
   ════════════════════════════════════════════════════════════════════════ */
export function EnergyArt({
  size = 170, className, style, accent, strokeWidth = 1.6, detail = true,
}: ArtProps) {
  const sw = strokeWidth;
  const thin = Math.max(0.75, sw * 0.62);
  const a = accent ?? 'currentColor';
  const C = 'currentColor';
  return (
    <Svg vb="0 0 180 130" w={180} h={130} size={size} className={className} style={style}>
      {/* floor */}
      <line x1="16" y1="110" x2="164" y2="110" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {/* motor body */}
      <rect x="44" y="50" width="62" height="44" rx="6" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {/* cooling fins */}
      <g stroke={C} strokeWidth={thin} vectorEffect={VE}>
        <line x1="52" y1="50" x2="52" y2="94" />
        <line x1="60" y1="50" x2="60" y2="94" />
        <line x1="68" y1="50" x2="68" y2="94" />
        <line x1="76" y1="50" x2="76" y2="94" />
        <line x1="84" y1="50" x2="84" y2="94" />
        <line x1="92" y1="50" x2="92" y2="94" />
      </g>
      {/* terminal box */}
      <rect x="62" y="40" width="22" height="12" rx="1.5" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      {/* shaft + coupling */}
      <line x1="106" y1="72" x2="126" y2="72" stroke={a} strokeWidth={sw} vectorEffect={VE} />
      <circle cx="126" cy="72" r="7" stroke={a} strokeWidth={sw} vectorEffect={VE} />
      <circle cx="126" cy="72" r="2.4" stroke={a} strokeWidth={thin} vectorEffect={VE} />
      {/* mounting feet */}
      <path d="M48 94 V104 H58 V94 M92 94 V104 H102 V94" stroke={C} strokeWidth={sw} vectorEffect={VE} />
      {/* field / current lines radiating from coupling */}
      {detail && (
        <g stroke={a} strokeWidth={thin} vectorEffect={VE}>
          <path d="M126 58 A 14 14 0 0 1 140 72" strokeDasharray="2 2.5" />
          <path d="M126 86 A 14 14 0 0 0 140 72" strokeDasharray="2 2.5" />
          <path d="M126 52 A 20 20 0 0 1 146 72" strokeDasharray="2 3" opacity={0.6} />
        </g>
      )}
      {/* power lead */}
      <path d="M73 40 Q 70 26 84 22 H110" stroke={C} strokeWidth={thin} strokeDasharray="2 2.5" opacity={0.6} vectorEffect={VE} />
      {/* energy bolt mark */}
      <path d="M150 40 L142 58 H150 L144 74" stroke={a} strokeWidth={sw} vectorEffect={VE} />
      {/* gauge */}
      <circle cx="34" cy="78" r="13" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      <path d="M34 78 L41 71" stroke={a} strokeWidth={sw} vectorEffect={VE} />
      <circle cx="34" cy="78" r="1.6" stroke={C} strokeWidth={thin} vectorEffect={VE} />
      <g stroke={C} strokeWidth={thin} opacity={0.6} vectorEffect={VE}>
        <line x1="24" y1="70" x2="26" y2="72" />
        <line x1="34" y1="66" x2="34" y2="68" />
        <line x1="44" y1="70" x2="42" y2="72" />
      </g>
    </Svg>
  );
}
