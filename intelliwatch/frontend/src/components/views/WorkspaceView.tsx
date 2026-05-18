/**
 * WorkspaceView — the live dashboard, rendered straight from the node graph.
 *
 * SINGLE SOURCE OF TRUTH: useNodeStore.
 *  • Every VIZ node in the Node Editor renders here as a card (via <WidgetCard>,
 *    the exact same component the Node Editor's preview uses → guaranteed match).
 *  • Editing a node's label/color/unit or its connections in the Node Editor
 *    updates here instantly — same store, live + persisted.
 *  • Drag-to-reorder a card here snaps the matching VIZ nodes into a tidy grid
 *    on the Node Editor canvas — you literally see them move. Fully bidirectional.
 */
import { useState } from 'react';
import { type Node } from '@xyflow/react';
import { useNodeStore, type RoleKey } from '../../store/useNodeStore';
import { useAppStore } from '../../store/useAppStore';
import { NODE_TYPES_DEF } from '../nodebuilder/nodeTypes';
import { type SensorNodeData } from '../nodebuilder/SensorNode';
import { WidgetCard } from '../nodebuilder/WidgetCard';
import { cn } from '../../lib/utils';

const ROLE_TABS = [
  { key: 'operator'   as RoleKey, label: 'Operator',   icon: '🔧', color: '#4B9FFF', border: '#4B9FFF55' },
  { key: 'supervisor' as RoleKey, label: 'Supervisor', icon: '📋', color: '#A466F5', border: '#A466F555' },
  { key: 'owner'      as RoleKey, label: 'Owner',      icon: '👔', color: '#00DFB8', border: '#00DFB855' },
];

// Canvas grid geometry used when reorder snaps VIZ nodes back onto the canvas
const GRID_COLS = 3;
const COL_W = 300;
const ROW_H = 210;

const isViz = (n: Node) =>
  NODE_TYPES_DEF[(n.data as SensorNodeData).nodeType]?.category === 'VIZ';

// Canvas reading order: top-to-bottom, then left-to-right
const byPosition = (a: Node, b: Node) =>
  a.position.y - b.position.y || a.position.x - b.position.x;

export function WorkspaceView() {
  const { nodes, edges, activeRole, switchRole, setNodes } = useNodeStore();
  const setTab = useAppStore(s => s.setTab);

  const vizNodes = nodes.filter(isViz).sort(byPosition);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const tab = ROLE_TABS.find(t => t.key === activeRole)!;

  // ── Drag-to-reorder → snap ALL VIZ nodes into a tidy grid on the canvas ──────
  const commitReorder = (from: number, to: number) => {
    if (from === to) return;
    const ordered = [...vizNodes];
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);

    // Anchor the grid at the current top-left of the VIZ cluster so the
    // nodes stay roughly where the user left them on the canvas.
    const originX = vizNodes.length ? Math.min(...vizNodes.map(n => n.position.x)) : 360;
    const originY = vizNodes.length ? Math.min(...vizNodes.map(n => n.position.y)) : 40;

    const posById = new Map<string, { x: number; y: number }>();
    ordered.forEach((n, i) => {
      posById.set(n.id, {
        x: originX + (i % GRID_COLS) * COL_W,
        y: originY + Math.floor(i / GRID_COLS) * ROW_H,
      });
    });

    setNodes(prev => prev.map(n =>
      posById.has(n.id) ? { ...n, position: posById.get(n.id)! } : n,
    ));
  };

  const clearDrag = () => { setDragIdx(null); setOverIdx(null); };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-1 px-4 py-2"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-0)' }}
      >
        {ROLE_TABS.map(t => {
          const active = activeRole === t.key;
          return (
            <button
              key={t.key}
              onClick={() => switchRole(t.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={active
                ? { background: `${t.color}20`, border: `1px solid ${t.border}`, color: t.color }
                : { background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}

        {/* Live + auto-sync indicators */}
        <div className="ml-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00DFB8' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Live</span>
        </div>
        <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full"
             style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
          <span className="text-[10px]">⬡</span>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            Auto-synced with Node Editor
          </span>
        </div>

        {/* Node Builder shortcut */}
        <button
          onClick={() => setTab('nodebuilder')}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          ⬡ Open Node Builder
        </button>
      </div>

      {/* ── Role label strip ─────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-5 py-1.5 flex items-center"
        style={{ background: `${tab.color}08`, borderBottom: `1px solid ${tab.border}` }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[1.2px]" style={{ color: tab.color }}>
          {tab.icon} {tab.label} Dashboard
        </span>
        <span className="ml-auto text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {vizNodes.length} widget{vizNodes.length !== 1 ? 's' : ''} · drag a card to rearrange
        </span>
      </div>

      {/* ── Dashboard content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {vizNodes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-5xl opacity-10 select-none">◈</span>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                No widgets in this dashboard yet
              </p>
              <p className="font-mono text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Open the Node Builder and add visualization nodes —<br />
                they appear here automatically.
              </p>
            </div>
            <button
              onClick={() => setTab('nodebuilder')}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: `${tab.color}20`, border: `1px solid ${tab.border}`, color: tab.color }}
            >
              ⬡ Open Node Builder
            </button>
          </div>
        ) : (
          <div
            className="grid gap-3 max-w-[1600px] mx-auto"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
          >
            {vizNodes.map((node, i) => {
              const isDragging = dragIdx === i;
              const isDropTarget = overIdx === i && dragIdx !== null && dragIdx !== i;
              return (
                <div
                  key={node.id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragEnter={() => setOverIdx(i)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (dragIdx !== null) commitReorder(dragIdx, i); clearDrag(); }}
                  onDragEnd={clearDrag}
                  className={cn(
                    'relative group cursor-grab active:cursor-grabbing transition-all duration-150 rounded-xl',
                    isDragging && 'opacity-40 scale-[0.98]',
                  )}
                  style={isDropTarget
                    ? { boxShadow: `0 0 0 2px ${tab.color}`, transform: 'translateY(-2px)' }
                    : undefined}
                >
                  {/* Drag-handle hint — appears on hover */}
                  <div
                    className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md text-[10px] leading-none
                               opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none"
                    style={{ background: 'var(--surface-3)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}
                  >
                    ⠿ drag
                  </div>
                  <WidgetCard node={node} edges={edges} allNodes={nodes} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
