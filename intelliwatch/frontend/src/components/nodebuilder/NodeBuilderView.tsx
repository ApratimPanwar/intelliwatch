import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, applyNodeChanges, applyEdgeChanges,
  type Connection, type Edge, type Node, type NodeChange, type EdgeChange,
  BackgroundVariant, Panel, type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SensorNode, type SensorNodeData } from './SensorNode';
import { NODE_TYPES_DEF, PALETTE_SECTIONS, PORT_COLOR } from './nodeTypes';
import { PreviewPanel } from './PreviewPanel';
import { ContextMenu } from './ContextMenu';
import { cn } from '../../lib/utils';
import { useNodeStore, type RoleKey,
  OPERATOR_NODES, OPERATOR_EDGES,
  SUPERVISOR_NODES, SUPERVISOR_EDGES,
  OWNER_NODES, OWNER_EDGES,
} from '../../store/useNodeStore';

const nodeTypes = { sensorNode: SensorNode };

let nodeId = 1;
const newId = () => `n${nodeId++}`;

// Presets are imported from useNodeStore

export function NodeBuilderView() {
  const { nodes, edges, setNodes, setEdges, activeRole, switchRole, resetRole } = useNodeStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds: Node[]) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const [rfInstance, setRfInstance]     = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu]   = useState<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Connect ports ────────────────────────────────────────────────────────
  const onConnect = useCallback((params: Connection) => {
    const srcNode = nodes.find(n => n.id === params.source);
    const tgtNode = nodes.find(n => n.id === params.target);
    if (!srcNode || !tgtNode) return;
    const srcDef = NODE_TYPES_DEF[(srcNode.data as SensorNodeData).nodeType];
    const tgtDef = NODE_TYPES_DEF[(tgtNode.data as SensorNodeData).nodeType];
    const srcPort = srcDef?.outputs.find(p => p.id === params.sourceHandle);
    const tgtPort = tgtDef?.inputs.find(p  => p.id === params.targetHandle);
    if (!srcPort || !tgtPort) return;
    if (srcPort.type !== tgtPort.type && srcPort.type !== 'any' && tgtPort.type !== 'any') return;
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: PORT_COLOR[srcPort.type], strokeWidth: 1.5, opacity: 0.7 },
    }, eds));
  }, [nodes, setEdges]);

  // ── Palette drop ─────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type || !rfInstance) return;
    const bounds = wrapperRef.current!.getBoundingClientRect();
    const pos = rfInstance.screenToFlowPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    const def = NODE_TYPES_DEF[type];
    const newNode: Node = {
      id: newId(), type: 'sensorNode', position: pos,
      data: { nodeType: type, label: def.label, settings: {} },
    };
    setNodes(nds => [...nds, newNode]);
  }, [rfInstance, setNodes]);

  // ── Node selection ───────────────────────────────────────────────────────
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => { setSelectedNode(null); setContextMenu(null); }, []);

  // ── Settings update ──────────────────────────────────────────────────────
  const onSettingsChange = useCallback((id: string, data: Partial<SensorNodeData>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
    setSelectedNode(prev => prev?.id === id ? { ...prev, data: { ...prev.data, ...data } } : prev);
  }, [setNodes]);

  // ── Role switcher — saves current graph automatically ────────────────────
  const handleSwitchRole = (role: RoleKey) => {
    switchRole(role);
    setSelectedNode(null);
  };

  // ── Add node at screen position (used by context menu) ───────────────────
  const addNodeAt = useCallback((type: string, screenPos: { x: number; y: number }) => {
    if (!rfInstance || !wrapperRef.current) return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const pos = rfInstance.screenToFlowPosition({
      x: screenPos.x - bounds.left,
      y: screenPos.y - bounds.top,
    });
    const def = NODE_TYPES_DEF[type];
    const newNode: Node = {
      id: newId(), type: 'sensorNode', position: pos,
      data: { nodeType: type, label: def.label, settings: {} },
    };
    setNodes(nds => [...nds, newNode]);
  }, [rfInstance, setNodes]);

  // ── Canvas right-click ───────────────────────────────────────────────────
  const onPaneContextMenu = useCallback((e: MouseEvent | React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // ── Viz nodes with connections (for preview) ─────────────────────────────
  const connectedTargets = new Set(edges.map(e => e.target));
  const vizNodes = nodes.filter(n => {
    const def = NODE_TYPES_DEF[(n.data as SensorNodeData).nodeType];
    return def?.category === 'VIZ' && connectedTargets.has(n.id);
  });

  return (
    <div className="flex h-full w-full" style={{ height: 'calc(100vh - 48px)' }}>
      {/* ── Palette ──────────────────────────────────────────────────────── */}
      <Palette />

      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <div ref={wrapperRef} className="flex-1 relative">
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border-default)" />
          <Controls />
          <MiniMap />
          <Panel position="bottom-center">
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px]"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-tertiary)',
                backdropFilter: 'blur(12px)',
              }}
            >
              Drag from palette · Right-click canvas to add · Connect ports · Click node to configure · Delete key removes selected
            </div>
          </Panel>
          <Panel position="top-right">
            <div className="flex items-center gap-1.5">
              {/* Role tabs — switching saves current graph, loads new role's graph */}
              {(['operator','supervisor','owner'] as const).map(role => (
                <button key={role}
                  onClick={() => handleSwitchRole(role)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all',
                    activeRole === role
                      ? 'text-white'
                      : 'border text-[10px]',
                  )}
                  style={activeRole === role ? {
                    background: role === 'operator' ? '#4B9FFF33' : role === 'supervisor' ? '#A466F533' : '#00DFB833',
                    border: `1px solid ${role === 'operator' ? '#4B9FFF66' : role === 'supervisor' ? '#A466F566' : '#00DFB866'}`,
                    color:  role === 'operator' ? '#4B9FFF' : role === 'supervisor' ? '#A466F5' : '#00DFB8',
                  } : {
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {role === 'operator' ? '🔧' : role === 'supervisor' ? '📋' : '👔'} {role}
                </button>
              ))}
              <div className="w-px h-5 mx-0.5" style={{ background: 'var(--border-subtle)' }} />
              {/* Reset current role to default preset */}
              <button
                onClick={() => { resetRole(activeRole); setSelectedNode(null); }}
                title={`Reset ${activeRole} graph to default`}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
              >
                ↺ reset
              </button>
              <button
                onClick={() => { useNodeStore.getState().setNodes([]); useNodeStore.getState().setEdges([]); setSelectedNode(null); }}
                title="Clear canvas"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
              >
                🗑
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* ── Canvas right-click context menu ──────────────────────────────── */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: 'Add RPM Sensor',   icon: '⚙', action: () => addNodeAt('rpm-sensor',   contextMenu) },
            { label: 'Add Temperature',  icon: '🌡', action: () => addNodeAt('temp-sensor',  contextMenu) },
            { label: 'Add Vibration',    icon: '〜', action: () => addNodeAt('vibration',    contextMenu) },
            { label: 'Add Production',   icon: '📦', action: () => addNodeAt('production',   contextMenu) },
            { separator: true },
            { label: 'Add KPI Card',     icon: '◈', action: () => addNodeAt('kpi-card',     contextMenu) },
            { label: 'Add Line Chart',   icon: '∿', action: () => addNodeAt('line-chart',   contextMenu) },
            { label: 'Add Gauge',        icon: '◎', action: () => addNodeAt('gauge',        contextMenu) },
            { label: 'Add Alert Badge',  icon: '⚠', action: () => addNodeAt('alert-badge',  contextMenu) },
            { separator: true },
            { label: 'Reset to Default',  icon: '↺', action: () => { resetRole(activeRole); setSelectedNode(null); } },
            { label: 'Clear All',        icon: '🗑', action: () => { useNodeStore.getState().setNodes([]); useNodeStore.getState().setEdges([]); setSelectedNode(null); }, danger: true },
          ]}
        />
      )}

      {/* ── Preview + settings sidebar ────────────────────────────────────── */}
      <PreviewPanel
        vizNodes={vizNodes}
        edges={edges}
        allNodes={nodes}
        selectedNode={selectedNode}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}

// ── Palette sidebar ──────────────────────────────────────────────────────────
function Palette() {
  return (
    <div
      className="w-48 flex-shrink-0 overflow-y-auto"
      style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border-subtle)' }}
    >
      <div className="p-2 flex flex-col gap-3">
        {PALETTE_SECTIONS.map(section => (
          <div key={section.label}>
            <p
              className="text-[9px] font-medium uppercase tracking-[1.2px] px-1 mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {section.label}
            </p>
            {section.keys.map(key => {
              const def = NODE_TYPES_DEF[key];
              return (
                <div key={key} draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('application/reactflow', key);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="flex items-center gap-2 p-2 mb-1 rounded-lg cursor-grab active:cursor-grabbing border-l-2 transition-all duration-100"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderLeftColor: def.color,
                    borderLeftWidth: 2,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                >
                  <span className="text-[12px] w-5 text-center flex-shrink-0">{def.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>{def.label}</p>
                    <p className="text-[8px] truncate" style={{ color: 'var(--text-tertiary)' }}>{def.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
