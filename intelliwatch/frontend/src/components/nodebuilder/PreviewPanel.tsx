/**
 * PreviewPanel — right sidebar of Node Builder.
 * Click any node on the canvas → see the exact widget card it will produce
 * in the Workspace, rendered live with real sensor data.
 * Also shows the node's settings editor below.
 *
 * The card is rendered by <WidgetCard> — the SAME component the Workspace
 * uses — so the preview here is guaranteed to match the Workspace exactly.
 */
import { type Node, type Edge } from '@xyflow/react';
import { useNodeStore } from '../../store/useNodeStore';
import { NODE_TYPES_DEF } from './nodeTypes';
import { type SensorNodeData } from './SensorNode';
import { NodeSettingsPanel } from './NodeSettingsPanel';
import { COLOR_MAP } from '../../lib/utils';
import { toSemanticColor } from '../../lib/nodeValues';
import { WidgetCard } from './WidgetCard';

interface PreviewPanelProps {
  vizNodes:         Node[];
  edges:            Edge[];
  allNodes:         Node[];
  selectedNode:     Node | null;
  onSettingsChange: (id: string, data: Partial<SensorNodeData>) => void;
}

// ── PreviewPanel ──────────────────────────────────────────────────────────────
export function PreviewPanel({ vizNodes, edges, allNodes, selectedNode, onSettingsChange }: PreviewPanelProps) {
  const activeRole = useNodeStore(s => s.activeRole);

  const roleColor =
    activeRole === 'operator'   ? '#4B9FFF' :
    activeRole === 'supervisor' ? '#A466F5' : '#00DFB8';
  const roleBg =
    activeRole === 'operator'   ? '#4B9FFF22' :
    activeRole === 'supervisor' ? '#A466F522' : '#00DFB822';
  const roleIcon =
    activeRole === 'operator' ? '🔧' : activeRole === 'supervisor' ? '📋' : '👔';

  return (
    <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
         style={{ background:'var(--surface-1)', borderLeft:'1px solid var(--border-subtle)' }}>

      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 px-3 py-2.5 flex items-center gap-2"
           style={{ background:'var(--surface-1)', borderBottom:'1px solid var(--border-subtle)' }}>
        <span className="text-[11px] font-semibold" style={{ color:'var(--text-primary)' }}>
          Node Preview
        </span>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize"
              style={{ background:roleBg, color:roleColor, border:`1px solid ${roleColor}44` }}>
          {roleIcon} {activeRole}
        </span>
        <span className="ml-auto font-mono text-[10px]" style={{ color:'var(--text-tertiary)' }}>
          {vizNodes.length} viz
        </span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Widget preview for selected node */}
        {selectedNode ? (
          <>
            {/* Node type label */}
            <div className="px-3 pt-3 pb-1.5 flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[1.1px] font-medium"
                    style={{ color:'var(--text-tertiary)' }}>
                {NODE_TYPES_DEF[(selectedNode.data as SensorNodeData).nodeType]?.label ?? 'Node'} preview
              </span>
              <span className="ml-auto font-mono text-[9px]" style={{ color:'var(--text-tertiary)' }}>
                {selectedNode.id}
              </span>
            </div>

            {/* The actual card preview — identical component used by the Workspace */}
            <div className="px-3 pb-3">
              <WidgetCard node={selectedNode} edges={edges} allNodes={allNodes} />
            </div>

            {/* Settings */}
            <div className="border-t" style={{ borderColor:'var(--border-subtle)' }}>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[9px] uppercase tracking-[1.1px] font-medium"
                      style={{ color:'var(--text-tertiary)' }}>Settings</span>
              </div>
              <div className="px-3 pb-4">
                <NodeSettingsPanel node={selectedNode} onChange={onSettingsChange} />
              </div>
            </div>
          </>
        ) : (
          /* No node selected — show empty state */
          <div className="flex flex-col items-center justify-center flex-1 gap-4 px-4 py-10 text-center">
            <span className="text-4xl opacity-10 select-none">◈</span>
            <div>
              <p className="text-[12px] font-medium mb-1" style={{ color:'var(--text-secondary)' }}>
                Click a node to preview
              </p>
              <p className="font-mono text-[10px]" style={{ color:'var(--text-tertiary)' }}>
                VIZ nodes show the exact card<br />that appears in the Workspace
              </p>
            </div>
            {vizNodes.length > 0 && (
              <div className="w-full mt-2">
                <p className="text-[9px] uppercase tracking-[1px] mb-2 text-left"
                   style={{ color:'var(--text-tertiary)' }}>
                  Connected panels ({vizNodes.length})
                </p>
                <div className="flex flex-col gap-1">
                  {vizNodes.map(n => {
                    const d = n.data as SensorNodeData;
                    const def = NODE_TYPES_DEF[d.nodeType];
                    const colorKey = toSemanticColor((d.settings?.color as string) || 'teal');
                    const hex = COLOR_MAP[colorKey]?.hex ?? '#00DFB8';
                    return (
                      <div key={n.id}
                           className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                           style={{ background:'var(--surface-2)', border:'1px solid var(--border-subtle)' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:hex }} />
                        <span className="text-[10px] font-medium truncate"
                              style={{ color:'var(--text-secondary)' }}>
                          {typeof d.label==='string' ? d.label : def?.label}
                        </span>
                        <span className="ml-auto text-[9px]" style={{ color:'var(--text-tertiary)' }}>
                          {def?.icon}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
