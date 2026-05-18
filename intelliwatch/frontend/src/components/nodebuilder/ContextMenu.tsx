import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface MenuItem {
  label: string;
  icon: string;
  action: () => void;
  danger?: boolean;
  separator?: false;
}
interface Separator { separator: true }
type MenuEntry = MenuItem | Separator;

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuEntry[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Adjust position so menu stays on screen
  const menuW = 192, menuH = items.length * 32;
  const adjX = x + menuW > window.innerWidth  ? x - menuW : x;
  const adjY = y + menuH > window.innerHeight ? y - menuH : y;

  return (
    <div
      ref={ref}
      className="fixed z-[500] w-48 rounded-xl border border-border-strong bg-surface-3
                 shadow-card-lg py-1 animate-fade-up"
      style={{ left: adjX, top: adjY }}
    >
      {items.map((item, i) => {
        if ('separator' in item && item.separator) {
          return <div key={i} className="my-1 h-px bg-border-subtle mx-2" />;
        }
        const m = item as MenuItem;
        return (
          <button
            key={i}
            onClick={() => { m.action(); onClose(); }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-1.5 text-[11px] rounded-lg mx-auto',
              'transition-colors duration-100 text-left',
              m.danger
                ? 'text-coral hover:bg-coral/10'
                : 'text-ink-secondary hover:bg-surface-4 hover:text-ink-primary',
            )}
            style={{ width: 'calc(100% - 8px)', marginLeft: 4 }}
          >
            <span className="text-[13px] w-4 text-center flex-shrink-0">{m.icon}</span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
