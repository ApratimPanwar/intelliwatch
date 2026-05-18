import { cn } from '../../lib/utils';

type Status = 'RUNNING'|'STOPPED'|'SAFE'|'ALERT'|'WATCH'|'LIVE'|'DEGRADED'|'OFFLINE';

const CONFIG: Record<Status, {
  label: string; dot: string; text: string;
  bg: string; border: string; glow: string;
}> = {
  RUNNING:  { label:'Running',  dot:'bg-teal animate-pulse-dot',  text:'text-teal',   bg:'bg-teal/[0.08]',   border:'border-teal/25',   glow:'0 0 8px rgba(0,223,184,0.6)'  },
  STOPPED:  { label:'Stopped',  dot:'bg-coral',                   text:'text-coral',  bg:'bg-coral/[0.08]',  border:'border-coral/25',  glow:'0 0 8px rgba(255,79,106,0.5)' },
  SAFE:     { label:'Safe',     dot:'bg-teal animate-pulse-dot',  text:'text-teal',   bg:'bg-teal/[0.08]',   border:'border-teal/25',   glow:'0 0 8px rgba(0,223,184,0.6)'  },
  ALERT:    { label:'Alert',    dot:'bg-coral animate-pulse-dot', text:'text-coral',  bg:'bg-coral/[0.08]',  border:'border-coral/25',  glow:'0 0 8px rgba(255,79,106,0.7)' },
  WATCH:    { label:'Watch',    dot:'bg-amber animate-pulse-dot', text:'text-amber',  bg:'bg-amber/[0.08]',  border:'border-amber/25',  glow:'0 0 8px rgba(255,176,32,0.6)' },
  LIVE:     { label:'Live',     dot:'bg-teal animate-pulse-dot',  text:'text-teal',   bg:'bg-teal/[0.08]',   border:'border-teal/25',   glow:'0 0 8px rgba(0,223,184,0.6)'  },
  DEGRADED: { label:'Degraded', dot:'bg-amber',                   text:'text-amber',  bg:'bg-amber/[0.08]',  border:'border-amber/25',  glow:'0 0 8px rgba(255,176,32,0.4)' },
  OFFLINE:  { label:'Offline',  dot:'bg-coral',                   text:'text-coral',  bg:'bg-coral/[0.08]',  border:'border-coral/25',  glow:'0 0 8px rgba(255,79,106,0.4)' },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const c = CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full',
      'border text-[10px] font-mono font-semibold tracking-[0.4px]',
      c.bg, c.border, c.text, className,
    )}>
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)}
          style={{ boxShadow: c.glow }}
        />
      )}
      {c.label}
    </span>
  );
}
